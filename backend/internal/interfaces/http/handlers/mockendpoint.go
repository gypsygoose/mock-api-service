package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	appmock "github.com/gypsygoose/mock-api-service/internal/application/mockendpoint"
	appproject "github.com/gypsygoose/mock-api-service/internal/application/project"
	"github.com/gypsygoose/mock-api-service/internal/interfaces/http/middleware"
)

type MockEndpointHandler struct {
	svc        *appmock.Service
	projectSvc *appproject.Service
}

func NewMockEndpointHandler(svc *appmock.Service, projectSvc *appproject.Service) *MockEndpointHandler {
	return &MockEndpointHandler{svc: svc, projectSvc: projectSvc}
}

type createEndpointRequest struct {
	Path         string          `json:"path" binding:"required"`
	Method       string          `json:"method" binding:"required"`
	StatusCode   int             `json:"status_code" binding:"required,min=100,max=599"`
	ResponseData json.RawMessage `json:"response_data" binding:"required"`
}

func (h *MockEndpointHandler) Create(c *gin.Context) {
	userID := middleware.GetUserID(c)
	projectName := c.Param("name")

	project, err := h.projectSvc.GetByName(c.Request.Context(), userID, projectName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "project not found"})
		return
	}

	var req createEndpointRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.Method = strings.ToUpper(req.Method)
	if !validMethod(req.Method) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid HTTP method"})
		return
	}

	e, err := h.svc.Create(c.Request.Context(), appmock.CreateInput{
		ProjectID:    project.ID,
		Path:         req.Path,
		Method:       req.Method,
		StatusCode:   req.StatusCode,
		ResponseData: req.ResponseData,
	})
	if err != nil {
		if err == appmock.ErrPathTaken {
			c.JSON(http.StatusConflict, gin.H{"error": "endpoint already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	c.JSON(http.StatusCreated, endpointResponse(e.ID, e.ProjectID, e.Path, e.Method, e.StatusCode, e.ResponseData, e.CreatedAt.String()))
}

func (h *MockEndpointHandler) List(c *gin.Context) {
	userID := middleware.GetUserID(c)
	projectName := c.Param("name")

	project, err := h.projectSvc.GetByName(c.Request.Context(), userID, projectName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "project not found"})
		return
	}

	endpoints, err := h.svc.ListByProject(c.Request.Context(), project.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	result := make([]gin.H, 0, len(endpoints))
	for _, e := range endpoints {
		result = append(result, endpointResponse(e.ID, e.ProjectID, e.Path, e.Method, e.StatusCode, e.ResponseData, e.CreatedAt.String()))
	}
	c.JSON(http.StatusOK, result)
}

func (h *MockEndpointHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	e, err := h.svc.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "endpoint not found"})
		return
	}

	c.JSON(http.StatusOK, endpointResponse(e.ID, e.ProjectID, e.Path, e.Method, e.StatusCode, e.ResponseData, e.CreatedAt.String()))
}

func (h *MockEndpointHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.svc.Delete(c.Request.Context(), id); err != nil {
		if err == appmock.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "endpoint not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	c.Status(http.StatusNoContent)
}

func endpointResponse(id, projectID uuid.UUID, path, method string, statusCode int, responseData json.RawMessage, createdAt string) gin.H {
	return gin.H{
		"id":            id,
		"project_id":    projectID,
		"path":          path,
		"method":        method,
		"status_code":   statusCode,
		"response_data": responseData,
		"created_at":    createdAt,
	}
}

func validMethod(m string) bool {
	switch m {
	case "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS":
		return true
	}
	return false
}
