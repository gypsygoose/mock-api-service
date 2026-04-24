package project

import (
	"context"
	"errors"

	"github.com/google/uuid"

	domain "github.com/gypsygoose/mock-api-service/internal/domain/project"
)

var (
	ErrNotFound      = errors.New("project not found")
	ErrNameTaken     = errors.New("project name already taken")
	ErrUnauthorized  = errors.New("unauthorized")
)

type Service struct {
	repo domain.Repository
}

func NewService(repo domain.Repository) *Service {
	return &Service{repo: repo}
}

type CreateInput struct {
	UserID uuid.UUID
	Name   string
}

func (s *Service) Create(ctx context.Context, in CreateInput) (domain.Project, error) {
	existing, err := s.repo.FindByName(ctx, in.UserID, in.Name)
	if err == nil && existing.ID != uuid.Nil {
		return domain.Project{}, ErrNameTaken
	}

	p := domain.New(in.UserID, in.Name)
	if err := s.repo.Create(ctx, p); err != nil {
		return domain.Project{}, err
	}
	return p, nil
}

func (s *Service) ListByUser(ctx context.Context, userID uuid.UUID) ([]domain.Project, error) {
	return s.repo.FindByUserID(ctx, userID)
}

func (s *Service) GetByName(ctx context.Context, userID uuid.UUID, name string) (domain.Project, error) {
	p, err := s.repo.FindByName(ctx, userID, name)
	if err != nil {
		return domain.Project{}, ErrNotFound
	}
	return p, nil
}

func (s *Service) GetByNameGlobal(ctx context.Context, name string) (domain.Project, error) {
	p, err := s.repo.FindByNameGlobal(ctx, name)
	if err != nil {
		return domain.Project{}, ErrNotFound
	}
	return p, nil
}

func (s *Service) Delete(ctx context.Context, userID uuid.UUID, name string) error {
	p, err := s.repo.FindByName(ctx, userID, name)
	if err != nil {
		return ErrNotFound
	}
	if p.UserID != userID {
		return ErrUnauthorized
	}
	return s.repo.Delete(ctx, p.ID)
}
