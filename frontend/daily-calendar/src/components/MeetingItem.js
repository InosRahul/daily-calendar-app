import React from 'react';
import styled from 'styled-components';
import axios from 'axios';

const MeetingWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  background-color: #f0f0f0;
`;

const MeetingDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const DeleteButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0;
`;

const EditButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0;
`;

const MeetingItem = ({ meeting, onDelete, onEdit }) => {
  const handleDelete = () => {
    axios.delete(`http://localhost:8080/api/meetings/${meeting.id}`)
      .then(() => {
        onDelete(meeting.id);
      })
      .catch((error) => {
        console.error('Error deleting meeting:', error);
      });
  };

  const handleEdit = () => {
    onEdit(meeting);
  };

  // Convert UTC time to local time and format it to show only the hour and minute
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return `${localDate.getHours().toString().padStart(2, '0')}:${localDate.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <MeetingWrapper>
      <MeetingDetails>
        <h3>{meeting.title}</h3>
        <p>{meeting.description}</p>
        <p>Start Time: {formatTime(meeting.start_time)}</p>
        <p>End Time: {formatTime(meeting.end_time)}</p>
      </MeetingDetails>
      <DeleteButton onClick={handleDelete}>×</DeleteButton>
      <EditButton onClick={handleEdit}>✎</EditButton>
    </MeetingWrapper>
  );
};

export default MeetingItem;