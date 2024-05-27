import React from 'react';
import styled from 'styled-components';
import axios from 'axios';

const MeetingDetails = styled.div`
  display: flex;
  flex-direction: column;
  width: ${props => props.width}%;
  height: ${props => props.height}%;
  background-color: #cce0ff;
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

const MeetingWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  background-color: #f0f0f0;
  width: ${props => props.width}%;
  height: ${props => props.height}%;
  position: relative; // Add relative positioning to the wrapper
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

  // Format the start and end times to show only the hour and minute
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return `${localDate.getHours().toString().padStart(2, '0')}:${localDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const widthPercentage = (meeting.duration) / 60;
  const heightPercentage = (meeting.duration) / 3600;

  return (
    <MeetingWrapper> 
      <MeetingDetails height={heightPercentage} width={widthPercentage}>
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