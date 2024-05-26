package repository

import (
	"daily-calendar-app/internal/model"
	"database/sql"
	"log"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type SQLiteRepository struct {
	db *sql.DB
}

func NewSQLiteRepository() *SQLiteRepository {
	db, err := sql.Open("sqlite3", "./calendar.db")
	if err != nil {
		log.Fatal(err)
	}

	if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        start_time DATETIME NOT NULL,
		end_time DATETIME NOT NULL,
        duration INTEGER NOT NULL,
        attendees INTEGER NOT NULL,
		VERSION INTEGER DEFAULT 1
    )`); err != nil {
		log.Fatal(err)
	}

	return &SQLiteRepository{db: db}
}

type MeetingRepository interface {
	CreateMeeting(m *model.Meeting) error
	GetMeetings(date string) ([]*model.Meeting, error)
	GetMeetingById(id int) (*model.Meeting, error)
	UpdateMeeting(m *model.Meeting) error
	DeleteMeeting(id int) error
}

func (r *SQLiteRepository) CreateMeeting(m *model.Meeting) error {
	startTimeStr := m.StartTime.Format(time.RFC3339)
	endTimeStr := m.EndTime.Format(time.RFC3339)
	m.Duration = int(m.EndTime.Sub(m.StartTime).Seconds())
	result, err := r.db.Exec("INSERT INTO meetings (title, description, start_time, end_time, duration, attendees, version) VALUES (?, ?, ?, ?, ?, ?, ?)",
		m.Title, m.Description, startTimeStr, endTimeStr, m.Duration, m.Attendees, 1)

	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	m.ID = int(id)

	return nil
}

func (r *SQLiteRepository) GetMeetings(date string) ([]*model.Meeting, error) {
	var meetings []*model.Meeting

	// Assuming date is in the format "YYYY-MM-DD"
	dateToQuery, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, err
	}

	rows, err := r.db.Query("SELECT id, title, description, start_time, end_time, duration, attendees, version FROM meetings WHERE DATE(start_time) = ?", dateToQuery.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var meeting model.Meeting
		var startTimeStr, endTimeStr string
		if err := rows.Scan(&meeting.ID, &meeting.Title, &meeting.Description, &startTimeStr, &endTimeStr, &meeting.Duration, &meeting.Attendees, &meeting.Version); err != nil {
			return nil, err
		}
		meeting.StartTime, err = time.Parse(time.RFC3339, startTimeStr)
		if err != nil {
			return nil, err
		}
		meeting.EndTime, err = time.Parse(time.RFC3339, endTimeStr)
		if err != nil {
			return nil, err
		}
		meetings = append(meetings, &meeting)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return meetings, nil
}

func (r *SQLiteRepository) GetMeetingById(id int) (*model.Meeting, error) {
	var meeting model.Meeting
	var startTimeStr, endTimeStr string
	err := r.db.QueryRow("SELECT id, title, description, start_time, end_time, duration, attendees, version FROM meetings WHERE id = ?", id).Scan(&meeting.ID, &meeting.Title, &meeting.Description, &startTimeStr, &endTimeStr, &meeting.Duration, &meeting.Attendees, &meeting.Version)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Return nil if no meeting is found with the given ID
		}
		return nil, err
	}
	meeting.StartTime, err = time.Parse(time.RFC3339, startTimeStr)
	if err != nil {
		return nil, err
	}
	meeting.EndTime, err = time.Parse(time.RFC3339, endTimeStr)
	if err != nil {
		return nil, err
	}
	return &meeting, nil
}

func (r *SQLiteRepository) UpdateMeeting(m *model.Meeting) error {
	startTimeStr := m.StartTime.Format(time.RFC3339)
	endTimeStr := m.EndTime.Format(time.RFC3339)
	m.Duration = int(m.EndTime.Sub(m.StartTime).Seconds())
	_, err := r.db.Exec("UPDATE meetings SET title=?, description=?, start_time=?, end_time =?, duration=?, attendees=?, version=? WHERE id= ? ",
		m.Title, m.Description, startTimeStr, endTimeStr, m.Duration, m.Attendees, m.Version, m.ID)
	return err
}

func (r *SQLiteRepository) DeleteMeeting(id int) error {
	_, err := r.db.Exec("DELETE FROM meetings WHERE id=?", id)
	return err
}
