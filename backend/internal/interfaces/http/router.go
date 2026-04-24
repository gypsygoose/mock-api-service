package http

import (
	"github.com/gin-gonic/gin"

	appuser "github.com/gypsygoose/mock-api-service/internal/application/user"
	"github.com/gypsygoose/mock-api-service/internal/interfaces/http/handlers"
	"github.com/gypsygoose/mock-api-service/internal/interfaces/http/middleware"
)

func NewRouter(
	userSvc *appuser.Service,
	authH *handlers.AuthHandler,
	projectH *handlers.ProjectHandler,
	endpointH *handlers.MockEndpointHandler,
	proxyH *handlers.MockProxyHandler,
) *gin.Engine {
	r := gin.Default()

	r.Use(corsMiddleware())

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authH.Register)
			auth.POST("/login", authH.Login)
		}

		protected := api.Group("/projects")
		protected.Use(middleware.Auth(userSvc))
		{
			protected.GET("", projectH.List)
			protected.POST("", projectH.Create)
			protected.GET("/:name", projectH.Get)
			protected.DELETE("/:name", projectH.Delete)
			protected.GET("/:name/endpoints", endpointH.List)
			protected.POST("/:name/endpoints", endpointH.Create)
			protected.GET("/:name/endpoints/:id", endpointH.Get)
			protected.DELETE("/:name/endpoints/:id", endpointH.Delete)
		}
	}

	// Public mock proxy — must be last to avoid conflicting with /api routes
	r.Any("/mock/:projectName/*path", proxyH.Handle)

	return r
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
