package postgres

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	domain "github.com/gypsygoose/mock-api-service/internal/domain/mockendpoint"
)

type MockEndpointRepo struct {
	pool *pgxpool.Pool
}

func NewMockEndpointRepo(pool *pgxpool.Pool) *MockEndpointRepo {
	return &MockEndpointRepo{pool: pool}
}

func (r *MockEndpointRepo) Create(ctx context.Context, e domain.MockEndpoint) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO mock_endpoints (id, project_id, path, method, status_code, response_data, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		e.ID, e.ProjectID, e.Path, e.Method, e.StatusCode, e.ResponseData, e.CreatedAt,
	)
	return err
}

func (r *MockEndpointRepo) FilterByProjectID(ctx context.Context, projectID uuid.UUID, method, pathSearch string) ([]domain.MockEndpoint, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, project_id, path, method, status_code, response_data, created_at
		 FROM mock_endpoints
		 WHERE project_id = $1
		   AND ($2 = '' OR method = $2)
		   AND ($3 = '' OR path ILIKE '%' || $3 || '%')
		 ORDER BY created_at DESC`,
		projectID, method, pathSearch,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var endpoints []domain.MockEndpoint
	for rows.Next() {
		var e domain.MockEndpoint
		if err := rows.Scan(&e.ID, &e.ProjectID, &e.Path, &e.Method, &e.StatusCode, &e.ResponseData, &e.CreatedAt); err != nil {
			return nil, err
		}
		endpoints = append(endpoints, e)
	}
	return endpoints, rows.Err()
}

func (r *MockEndpointRepo) FindByProjectID(ctx context.Context, projectID uuid.UUID) ([]domain.MockEndpoint, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, project_id, path, method, status_code, response_data, created_at
		 FROM mock_endpoints WHERE project_id = $1 ORDER BY created_at DESC`,
		projectID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var endpoints []domain.MockEndpoint
	for rows.Next() {
		var e domain.MockEndpoint
		if err := rows.Scan(&e.ID, &e.ProjectID, &e.Path, &e.Method, &e.StatusCode, &e.ResponseData, &e.CreatedAt); err != nil {
			return nil, err
		}
		endpoints = append(endpoints, e)
	}
	return endpoints, rows.Err()
}

func (r *MockEndpointRepo) FindByID(ctx context.Context, id uuid.UUID) (domain.MockEndpoint, error) {
	var e domain.MockEndpoint
	err := r.pool.QueryRow(ctx,
		`SELECT id, project_id, path, method, status_code, response_data, created_at
		 FROM mock_endpoints WHERE id = $1`,
		id,
	).Scan(&e.ID, &e.ProjectID, &e.Path, &e.Method, &e.StatusCode, &e.ResponseData, &e.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.MockEndpoint{}, errors.New("not found")
	}
	return e, err
}

func (r *MockEndpointRepo) FindByPathAndMethod(ctx context.Context, projectID uuid.UUID, path, method string) (domain.MockEndpoint, error) {
	var e domain.MockEndpoint
	err := r.pool.QueryRow(ctx,
		`SELECT id, project_id, path, method, status_code, response_data, created_at
		 FROM mock_endpoints WHERE project_id = $1 AND path = $2 AND method = $3`,
		projectID, path, method,
	).Scan(&e.ID, &e.ProjectID, &e.Path, &e.Method, &e.StatusCode, &e.ResponseData, &e.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.MockEndpoint{}, errors.New("not found")
	}
	return e, err
}

func (r *MockEndpointRepo) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM mock_endpoints WHERE id = $1`, id)
	return err
}
