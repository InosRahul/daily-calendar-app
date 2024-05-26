package model

import "time"

type Meeting struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
	Duration    int       `json:"duration"`
	Attendees   int       `json:"attendees"`
	Version     int       `json:"version"`
}
