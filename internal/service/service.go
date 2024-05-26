package service

import (
	"daily-calendar-app/internal/model"
	"daily-calendar-app/internal/repository"
	"errors"
	"time"
)

type MeetingService struct {
	repo repository.MeetingRepository
}

func NewMeetingService(repo repository.MeetingRepository) *MeetingService {
	return &MeetingService{repo: repo}
}

func (s *MeetingService) CreateMeeting(m *model.Meeting) error {
	if err := s.validateMeeting(m); err != nil {
		return err
	}
	return s.repo.CreateMeeting(m)
}

func (s *MeetingService) GetMeetings(date string) ([]*model.Meeting, error) {
	return s.repo.GetMeetings(date)
}

func (s *MeetingService) GetMeetingById(id int) (*model.Meeting, error) {
	return s.repo.GetMeetingById(id)
}

func (s *MeetingService) UpdateMeeting(id int, m *model.Meeting) error {
	if err := s.validateMeeting(m); err != nil {
		return err
	}
	currentMeeting, err := s.repo.GetMeetingById(id)
	if err != nil {
		return err
	}

	if m.Version != currentMeeting.Version {
		return errors.New("version mismatch: the meeting has been updated by another user")
	}

	// Increment the version for the updated meeting
	m.Version++

	return s.repo.UpdateMeeting(m)
}

func (s *MeetingService) DeleteMeeting(id int) error {
	return s.repo.DeleteMeeting(id)
}

func (s *MeetingService) validateMeeting(m *model.Meeting) error {
	// Check if the time is valid
	if m.StartTime.IsZero() || m.EndTime.IsZero() {
		return errors.New("invalid time")
	}

	if m.EndTime.Before(m.StartTime) {
		return errors.New("end time cannot be earlier than start time")
	}

	// Calculate the time left in the current day
	endOfDay := time.Date(m.StartTime.Year(), m.StartTime.Month(), m.StartTime.Day(), 23, 59, 59, 0, m.StartTime.Location()).Sub(m.StartTime)

	// Check if the meeting duration exceeds the time left in the current day
	if m.EndTime.Sub(m.StartTime) > endOfDay {
		return errors.New("meetings cannot exceed the time left in the current day")
	}

	// Fetch all existing meetings for the same day
	existingMeetings, err := s.repo.GetMeetings(m.StartTime.Format("2006-01-02"))
	if err != nil {
		return err
	}

	for _, existingMeeting := range existingMeetings {
		if existingMeeting.ID != m.ID && s.isMeetingOverlap(m, existingMeeting) {
			return errors.New("meeting overlap not allowed")
		}
	}

	return nil
}

func (s *MeetingService) isMeetingOverlap(m1, m2 *model.Meeting) bool {
	start1 := m1.StartTime
	// end1 := start1.Add(time.Duration(m1.Duration) * time.Minute)
	end1 := m1.EndTime
	start2 := m2.StartTime
	end2 := m2.EndTime
	// end2 := start2.Add(time.Duration(m2.Duration) * time.Minute)

	return start1.Before(end2) && start2.Before(end1)
}
