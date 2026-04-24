package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	appproject "github.com/gypsygoose/mock-api-service/internal/application/project"
	"github.com/gypsygoose/mock-api-service/internal/interfaces/http/middleware"
)

type ProjectHandler struct {
	svc *appproject.Service
}

func NewProjectHandler(svc *appproject.Service) *ProjectHandler {
	return &ProjectHandler{svc: svc}
}

type createProjectRequest struct {
	Name string `json:"name" binding:"required,min=1,max=100,alphanum"`
}

func (h *ProjectHandler) Create(c *gin.Context) {
	var req createProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := middleware.GetUserID(c)
	p, err := h.svc.Create(c.Request.Context(), appproject.CreateInput{
		UserID: userID,
		Name:   req.Name,
	})
	if err != nil {
		if err == appproject.ErrNameTaken {
			c.JSON(http.StatusConflict, gin.H{"error": "project name already taken"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":         p.ID,
		"name":       p.Name,
		"created_at": p.CreatedAt,
	})
}

func (h *ProjectHandler) List(c *gin.Context) {
	userID := middleware.GetUserID(c)
	projects, err := h.svc.ListByUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	type item struct {
		ID        string `json:"id"`
		Name      string `json:"name"`
		CreatedAt string `json:"created_at"`
	}
	result := make([]item, 0, len(projects))
	for _, p := range projects {
		result = append(result, item{
			ID:        p.ID.String(),
			Name:      p.Name,
			CreatedAt: p.CreatedAt.String(),
		})
	}
	c.JSON(http.StatusOK, result)
}

func (h *ProjectHandler) Get(c *gin.Context) {
	userID := middleware.GetUserID(c)
	name := c.Param("name")

	p, err := h.svc.GetByName(c.Request.Context(), userID, name)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "project not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         p.ID,
		"name":       p.Name,
		"created_at": p.CreatedAt,
	})
}

func (h *ProjectHandler) Delete(c *gin.Context) {
	userID := middleware.GetUserID(c)
	name := c.Param("name")

	if err := h.svc.Delete(c.Request.Context(), userID, name); err != nil {
		if err == appproject.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		return
	}

	c.Status(http.StatusNoContent)
}
