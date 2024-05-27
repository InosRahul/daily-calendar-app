import React, { useState } from 'react';
import styled from 'styled-components';
import MeetingItem from './MeetingItem';
import UpdateMeetingForm from './UpdateMeetingForm';
import CreateMeetingForm from './CreateMeetingForm';

const BreakdownContainer = styled.div`
  width: 100%;
  border: 1px solid #ccc;
  position: relative;
`;

const AddButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0;
`;

const HourContainer = styled.div`
  margin: 5px;
  padding: 10px;
  border: 1px solid #ddd;
  background-color: ${(props) => (props.hasMeeting ? '#f0f0f0' : 'transparent')};
`;

const HourlyBreakdown = ({ selectedDate, meetings, onDeleteMeeting, onMeetingUpdated }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setShowForm(true);
  };

  const handleUpdateMeeting = (updatedMeeting) => {
    onMeetingUpdated(updatedMeeting);
    setShowForm(false);
    setEditingMeeting(null);
  };

  const renderHourSlots = () => {
    return hours.map((hour) => {
      const meetingAtHour = meetings?.find(
        (meeting) => new Date(meeting.start_time).getUTCHours() === hour
      );

      return (
        <HourContainer key={hour} hasMeeting={!!meetingAtHour}>
          {hour.toString().padStart(2, '0')}:00
          {meetingAtHour && (
            <MeetingItem
              meeting={meetingAtHour}
              onDelete={onDeleteMeeting}
              onEdit={handleEditMeeting}
            />
          )}
        </HourContainer>
      );
    });
  };

  return (
    <BreakdownContainer>
      <AddButton onClick={() => setShowForm(true)}>+</AddButton>
      {showForm && !editingMeeting && (
        <CreateMeetingForm
          onClose={() => setShowForm(false)}
          onMeetingCreated={onMeetingUpdated}
        />
      )}
      {showForm && editingMeeting && (
        <UpdateMeetingForm
          onClose={() => {
            setShowForm(false);
            setEditingMeeting(null);
          }}
          onMeetingUpdated={handleUpdateMeeting}
          meeting={editingMeeting}
        />
      )}
      <h2>Breakdown for {selectedDate.toDateString()}</h2>
      <div>{renderHourSlots()}</div>
    </BreakdownContainer>
  );
};

export default HourlyBreakdown;