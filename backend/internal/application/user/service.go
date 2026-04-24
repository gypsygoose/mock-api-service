package user

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	domain "github.com/gypsygoose/mock-api-service/internal/domain/user"
)

var (
	ErrEmailTaken      = errors.New("email already taken")
	ErrInvalidPassword = errors.New("invalid password")
	ErrNotFound        = errors.New("user not found")
)

type Service struct {
	repo       domain.Repository
	jwtSecret  []byte
	jwtTTLHours int
}

func NewService(repo domain.Repository, jwtSecret string, jwtTTLHours int) *Service {
	return &Service{repo: repo, jwtSecret: []byte(jwtSecret), jwtTTLHours: jwtTTLHours}
}

type RegisterInput struct {
	Email    string
	Password string
}

type LoginInput struct {
	Email    string
	Password string
}

func (s *Service) Register(ctx context.Context, in RegisterInput) (domain.User, error) {
	existing, err := s.repo.FindByEmail(ctx, in.Email)
	if err == nil && existing.ID != uuid.Nil {
		return domain.User{}, ErrEmailTaken
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		return domain.User{}, err
	}

	u := domain.New(in.Email, string(hash))
	if err := s.repo.Create(ctx, u); err != nil {
		return domain.User{}, err
	}
	return u, nil
}

func (s *Service) Login(ctx context.Context, in LoginInput) (string, error) {
	u, err := s.repo.FindByEmail(ctx, in.Email)
	if err != nil {
		return "", ErrNotFound
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(in.Password)); err != nil {
		return "", ErrInvalidPassword
	}

	token, err := s.generateToken(u.ID)
	if err != nil {
		return "", err
	}
	return token, nil
}

func (s *Service) ValidateToken(tokenStr string) (uuid.UUID, error) {
	t, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return s.jwtSecret, nil
	})
	if err != nil || !t.Valid {
		return uuid.Nil, errors.New("invalid token")
	}

	claims, ok := t.Claims.(jwt.MapClaims)
	if !ok {
		return uuid.Nil, errors.New("invalid claims")
	}

	sub, ok := claims["sub"].(string)
	if !ok {
		return uuid.Nil, errors.New("invalid subject")
	}

	id, err := uuid.Parse(sub)
	if err != nil {
		return uuid.Nil, err
	}
	return id, nil
}

func (s *Service) generateToken(userID uuid.UUID) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID.String(),
		"exp": time.Now().Add(time.Duration(s.jwtTTLHours) * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(s.jwtSecret)
}
