"use client";
import React, { useState, useCallback } from 'react';
import Calendar from '../components/Calendar';
import HourlyBreakdown from '../components/HourlyBreakdown';

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetings, setMeetings] = useState([]);

  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  const handleMeetingsFetched = useCallback((meetingsData) => {
    setMeetings(meetingsData);
  }, []);

  const handleDeleteMeeting = (meetingId) => {
    setMeetings((prevMeetings) => prevMeetings.filter((meeting) => meeting.id !== meetingId));
  };

  const handleMeetingCreated = (newMeeting) => {
    setMeetings((prevMeetings) => {
      if (Array.isArray(prevMeetings)) {
        return [...prevMeetings, newMeeting];
      } else {
        return [newMeeting];
      }
    });
  };

  const handleMeetingUpdated = (updatedMeeting) => {
    setMeetings((prevMeetings) =>
      prevMeetings?.map((meeting) => (meeting.id === updatedMeeting.id ? updatedMeeting : meeting))
    );
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%' }}>
        <Calendar selectedDate={selectedDate} onDateChange={handleDateChange} onMeetingsFetched={handleMeetingsFetched} />
      </div>
      <div style={{ width: '50%' }}>
        <HourlyBreakdown
          selectedDate={selectedDate}
          meetings={meetings}
          onDeleteMeeting={handleDeleteMeeting}
          onMeetingCreated={handleMeetingCreated}
          onMeetingUpdated={handleMeetingUpdated}
        />
      </div>
    </div>
  );
};

export default Home;