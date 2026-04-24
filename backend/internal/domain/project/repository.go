package project

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	Create(ctx context.Context, p Project) error
	FindByUserID(ctx context.Context, userID uuid.UUID) ([]Project, error)
	FindByName(ctx context.Context, userID uuid.UUID, name string) (Project, error)
	FindByNameGlobal(ctx context.Context, name string) (Project, error)
	Delete(ctx context.Context, id uuid.UUID) error
}
