package project

import (
	"time"

	"github.com/google/uuid"
)

type Project struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	Name      string
	CreatedAt time.Time
}

func New(userID uuid.UUID, name string) Project {
	return Project{
		ID:        uuid.New(),
		UserID:    userID,
		Name:      name,
		CreatedAt: time.Now().UTC(),
	}
}
