package main

import (
	"daily-calendar-app/internal/handler"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.Use(cors.Default())

	h := handler.NewHandler()
	r.GET("/api/meetings", h.GetMeetings)
	r.GET("/api/meeting/:id", h.GetMeetingById)
	r.POST("/api/meetings", h.CreateMeeting)
	r.PUT("/api/meetings/:id", h.UpdateMeeting)
	r.DELETE("/api/meetings/:id", h.DeleteMeeting)

	log.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal(err)
	}
}
