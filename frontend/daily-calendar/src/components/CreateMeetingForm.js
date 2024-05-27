import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const FormContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Form = styled.form`
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: 300px;
`;

const CreateMeetingForm = ({ onClose, onMeetingCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start_time, setStartTime] = useState('');
  const [end_time, setEndTime] = useState('');
  const [attendees, setAttendees] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const localDateStart = new Date(start_time);
    const localDateEnd = new Date(end_time);

  // Get the local timezone offset in minutes
    const timezoneOffsetStart = localDateStart.getTimezoneOffset();
    const timezoneOffsetEnd = localDateEnd.getTimezoneOffset();

  // Adjust the date by the timezone offset to convert it to UTC
    const utcDateStart = new Date(localDateStart.getTime() - (timezoneOffsetStart * 60000));
    const utcDateEnd = new Date(localDateEnd.getTime() - (timezoneOffsetEnd * 60000));

    const formattedStartTime = utcDateStart.toISOString();
    const formattedEndTime = utcDateEnd.toISOString();

    axios.post('http://localhost:8080/api/meetings', {
      title,
      description,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
      attendees: parseInt(attendees, 10),
    })
    .then((response) => {
      onMeetingCreated(response.data);
      onClose();
    })
    .catch((error) => {
      console.error('Error creating meeting:', error);
    });
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        <h3>Create Meeting</h3>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <label htmlFor="start_time">Start Time:</label>
        <input
          type="datetime-local"
          id="start_time"
          value={start_time}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <label htmlFor="end_time">End Time:</label>
        <input
          type="datetime-local"
          id="end_time"
          value={end_time}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
        <label htmlFor="attendees">Attendees:</label>
        <input
          type="number"
          id="attendees"
          value={attendees}
          onChange={(e) => setAttendees(e.target.value)}
          required
        />
        <button type="submit">Create</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </Form>
    </FormContainer>
  );
};

export default CreateMeetingForm;