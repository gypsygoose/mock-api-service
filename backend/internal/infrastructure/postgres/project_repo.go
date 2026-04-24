package postgres

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	domain "github.com/gypsygoose/mock-api-service/internal/domain/project"
)

type ProjectRepo struct {
	pool *pgxpool.Pool
}

func NewProjectRepo(pool *pgxpool.Pool) *ProjectRepo {
	return &ProjectRepo{pool: pool}
}

func (r *ProjectRepo) Create(ctx context.Context, p domain.Project) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO projects (id, user_id, name, created_at) VALUES ($1, $2, $3, $4)`,
		p.ID, p.UserID, p.Name, p.CreatedAt,
	)
	return err
}

func (r *ProjectRepo) FindByUserID(ctx context.Context, userID uuid.UUID) ([]domain.Project, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, user_id, name, created_at FROM projects WHERE user_id = $1 ORDER BY created_at DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []domain.Project
	for rows.Next() {
		var p domain.Project
		if err := rows.Scan(&p.ID, &p.UserID, &p.Name, &p.CreatedAt); err != nil {
			return nil, err
		}
		projects = append(projects, p)
	}
	return projects, rows.Err()
}

func (r *ProjectRepo) FindByName(ctx context.Context, userID uuid.UUID, name string) (domain.Project, error) {
	var p domain.Project
	err := r.pool.QueryRow(ctx,
		`SELECT id, user_id, name, created_at FROM projects WHERE user_id = $1 AND name = $2`,
		userID, name,
	).Scan(&p.ID, &p.UserID, &p.Name, &p.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Project{}, errors.New("not found")
	}
	return p, err
}

func (r *ProjectRepo) FindByNameGlobal(ctx context.Context, name string) (domain.Project, error) {
	var p domain.Project
	err := r.pool.QueryRow(ctx,
		`SELECT id, user_id, name, created_at FROM projects WHERE name = $1 LIMIT 1`,
		name,
	).Scan(&p.ID, &p.UserID, &p.Name, &p.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Project{}, errors.New("not found")
	}
	return p, err
}

func (r *ProjectRepo) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM projects WHERE id = $1`, id)
	return err
}
