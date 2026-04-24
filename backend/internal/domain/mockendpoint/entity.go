package mockendpoint

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type MockEndpoint struct {
	ID           uuid.UUID
	ProjectID    uuid.UUID
	Path         string
	Method       string
	StatusCode   int
	ResponseData json.RawMessage
	CreatedAt    time.Time
}

func New(projectID uuid.UUID, path, method string, statusCode int, responseData json.RawMessage) MockEndpoint {
	return MockEndpoint{
		ID:           uuid.New(),
		ProjectID:    projectID,
		Path:         path,
		Method:       method,
		StatusCode:   statusCode,
		ResponseData: responseData,
		CreatedAt:    time.Now().UTC(),
	}
}
