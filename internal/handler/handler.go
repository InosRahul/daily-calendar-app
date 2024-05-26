package handler

import (
	"daily-calendar-app/internal/model"
	"daily-calendar-app/internal/repository"
	"daily-calendar-app/internal/service"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *service.MeetingService
}

func NewHandler() *Handler {
	repo := repository.NewSQLiteRepository()
	return &Handler{
		service: service.NewMeetingService(repo),
	}
}

func (h *Handler) GetMeetings(c *gin.Context) {
	dateParam := c.Query("date")

	currentDate := time.Now().Format("2006-01-02")

	if dateParam == "" {
		dateParam = currentDate
	}

	meetings, err := h.service.GetMeetings(dateParam)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, meetings)
}

func (h *Handler) GetMeetingById(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid meeting ID"})
		return
	}

	meeting, err := h.service.GetMeetingById(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if meeting == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Meeting not found"})
		return
	}

	c.JSON(http.StatusOK, meeting)
}

func (h *Handler) CreateMeeting(c *gin.Context) {
	var meeting model.Meeting
	if err := c.ShouldBindJSON(&meeting); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	parsedStartTime, err := time.Parse(time.RFC3339, meeting.StartTime.Format(time.RFC3339))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid time format"})
		return
	}
	meeting.StartTime = parsedStartTime

	parsedEndTime, err := time.Parse(time.RFC3339, meeting.EndTime.Format(time.RFC3339))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid time format"})
		return
	}

	meeting.EndTime = parsedEndTime

	if err := h.service.CreateMeeting(&meeting); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, meeting)
}

func (h *Handler) UpdateMeeting(c *gin.Context) {
	var meeting model.Meeting
	if err := c.ShouldBindJSON(&meeting); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id := c.Param("id")
	meetingID, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid meeting ID"})
		return
	}

	meeting.ID = meetingID // Set the ID from the URL path

	if err := h.service.UpdateMeeting(meetingID, &meeting); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, meeting)
}

func (h *Handler) DeleteMeeting(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid meeting ID"})
		return
	}
	if err := h.service.DeleteMeeting(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Meeting deleted successfully"})
}
