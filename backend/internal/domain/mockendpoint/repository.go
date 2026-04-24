package mockendpoint

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	Create(ctx context.Context, e MockEndpoint) error
	FindByProjectID(ctx context.Context, projectID uuid.UUID) ([]MockEndpoint, error)
	FindByID(ctx context.Context, id uuid.UUID) (MockEndpoint, error)
	FindByPathAndMethod(ctx context.Context, projectID uuid.UUID, path, method string) (MockEndpoint, error)
	Delete(ctx context.Context, id uuid.UUID) error
}
