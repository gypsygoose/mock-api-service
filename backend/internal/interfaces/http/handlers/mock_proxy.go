package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	appmock "github.com/gypsygoose/mock-api-service/internal/application/mockendpoint"
	appproject "github.com/gypsygoose/mock-api-service/internal/application/project"
)

// MockProxyHandler serves actual mock HTTP responses.
// Registered on ANY /:projectName/*path — no auth required.
type MockProxyHandler struct {
	projectSvc *appproject.Service
	mockSvc    *appmock.Service
}

func NewMockProxyHandler(projectSvc *appproject.Service, mockSvc *appmock.Service) *MockProxyHandler {
	return &MockProxyHandler{projectSvc: projectSvc, mockSvc: mockSvc}
}

func (h *MockProxyHandler) Handle(c *gin.Context) {
	projectName := c.Param("projectName")
	path := c.Param("path")
	method := strings.ToUpper(c.Request.Method)

	project, err := h.projectSvc.GetByNameGlobal(c.Request.Context(), projectName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "project not found"})
		return
	}

	endpoint, err := h.mockSvc.FindByPathAndMethod(c.Request.Context(), project.ID, path, method)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no mock endpoint for this path and method"})
		return
	}

	c.Data(endpoint.StatusCode, "application/json; charset=utf-8", endpoint.ResponseData)
}
