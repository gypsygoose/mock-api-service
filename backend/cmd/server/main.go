package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	appuser "github.com/gypsygoose/mock-api-service/internal/application/user"
	appproject "github.com/gypsygoose/mock-api-service/internal/application/project"
	appmock "github.com/gypsygoose/mock-api-service/internal/application/mockendpoint"
	"github.com/gypsygoose/mock-api-service/internal/infrastructure/config"
	"github.com/gypsygoose/mock-api-service/internal/infrastructure/postgres"
	httphandlers "github.com/gypsygoose/mock-api-service/internal/interfaces/http"
	"github.com/gypsygoose/mock-api-service/internal/interfaces/http/handlers"
)

func main() {
	cfg := config.Load()

	if cfg.DatabaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}
	if cfg.JWTSecret == "" {
		log.Fatal("JWT_SECRET is required")
	}

	ctx := context.Background()

	pool, err := postgres.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()

	// Repositories
	userRepo := postgres.NewUserRepo(pool)
	projectRepo := postgres.NewProjectRepo(pool)
	mockRepo := postgres.NewMockEndpointRepo(pool)

	// Services
	userSvc := appuser.NewService(userRepo, cfg.JWTSecret, cfg.JWTTTLHours)
	projectSvc := appproject.NewService(projectRepo)
	mockSvc := appmock.NewService(mockRepo, projectRepo)

	// Handlers
	authH := handlers.NewAuthHandler(userSvc)
	projectH := handlers.NewProjectHandler(projectSvc)
	endpointH := handlers.NewMockEndpointHandler(mockSvc, projectSvc)
	proxyH := handlers.NewMockProxyHandler(projectSvc, mockSvc)

	router := httphandlers.NewRouter(userSvc, authH, projectH, endpointH, proxyH)

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	go func() {
		log.Printf("server listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("shutting down...")
	shutCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutCtx); err != nil {
		log.Printf("shutdown error: %v", err)
	}
}
