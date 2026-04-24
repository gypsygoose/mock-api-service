package mockendpoint

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/google/uuid"

	domain "github.com/gypsygoose/mock-api-service/internal/domain/mockendpoint"
	projectdomain "github.com/gypsygoose/mock-api-service/internal/domain/project"
)

var (
	ErrNotFound     = errors.New("endpoint not found")
	ErrPathTaken    = errors.New("endpoint with this path and method already exists")
)

type Service struct {
	repo        domain.Repository
	projectRepo projectdomain.Repository
}

func NewService(repo domain.Repository, projectRepo projectdomain.Repository) *Service {
	return &Service{repo: repo, projectRepo: projectRepo}
}

type CreateInput struct {
	ProjectID    uuid.UUID
	Path         string
	Method       string
	StatusCode   int
	ResponseData json.RawMessage
}

func (s *Service) Create(ctx context.Context, in CreateInput) (domain.MockEndpoint, error) {
	existing, err := s.repo.FindByPathAndMethod(ctx, in.ProjectID, in.Path, in.Method)
	if err == nil && existing.ID != uuid.Nil {
		return domain.MockEndpoint{}, ErrPathTaken
	}

	e := domain.New(in.ProjectID, in.Path, in.Method, in.StatusCode, in.ResponseData)
	if err := s.repo.Create(ctx, e); err != nil {
		return domain.MockEndpoint{}, err
	}
	return e, nil
}

func (s *Service) ListByProject(ctx context.Context, projectID uuid.UUID) ([]domain.MockEndpoint, error) {
	return s.repo.FindByProjectID(ctx, projectID)
}

func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (domain.MockEndpoint, error) {
	e, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return domain.MockEndpoint{}, ErrNotFound
	}
	return e, nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return ErrNotFound
	}
	return s.repo.Delete(ctx, id)
}

func (s *Service) FindByPathAndMethod(ctx context.Context, projectID uuid.UUID, path, method string) (domain.MockEndpoint, error) {
	e, err := s.repo.FindByPathAndMethod(ctx, projectID, path, method)
	if err != nil {
		return domain.MockEndpoint{}, ErrNotFound
	}
	return e, nil
}
