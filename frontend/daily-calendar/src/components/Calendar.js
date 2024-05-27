import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const CalendarContainer = styled.div`
  width: 100%;
  border: 1px solid #ccc;
`;

const CalendarTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const CalendarHeader = styled.thead``;

const CalendarBody = styled.tbody``;

const CalendarDay = styled.td`
  width: 30px;
  height: 30px;
  text-align: center;
  cursor: pointer;
  &.selected {
    background-color: #f0f0f0;
  }
`;

const Calendar = ({ selectedDate, onDateChange, onMeetingsFetched }) => {
  const [currentDate, setCurrentDate] = React.useState(selectedDate);

  const handlePrevMonth = async () => {
    const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    onDateChange(prevMonthDate);
    await fetchMeetings(prevMonthDate)
  };

  const handleNextMonth = async () => {
    const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    onDateChange(nextMonthDate);
    await fetchMeetings(nextMonthDate)
  };

  const daysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const month = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const totalDays = daysInMonth(year, currentDate.getMonth());
  const firstDay = new Date(year, currentDate.getMonth(), 1).getDay();

  const handleDayClick = async (e) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), e.target.innerText);
    await fetchMeetings(date)
    onDateChange(date);
    
  };

  const fetchMeetings = useCallback(async (date) => {
    const dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
    try {
        const response = await axios.get(`http://localhost:8080/api/meetings?date=${dateString}`);
        onMeetingsFetched(response.data);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      }
  }, [onMeetingsFetched])

  useEffect(() => {
    setCurrentDate(selectedDate);
    fetchMeetings(selectedDate)
  }, [selectedDate, fetchMeetings]);

  const renderCalendar = () => {
    const calendar = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          week.push(<CalendarDay key={`empty-${j}`}></CalendarDay>);
        } else if (day > totalDays) {
          break;
        } else {
          week.push(
            <CalendarDay
              key={day}
              className={`day ${selectedDate.getDate() === day ? 'selected' : ''}`}
              onClick={(e) => handleDayClick(e)}
            >
              {day}
            </CalendarDay>
          );
          day++;
        }
      }
      calendar.push(<tr key={`week-${i}`}>{week}</tr>);
    }
    return calendar;
  };

  return (
    <CalendarContainer>
      <h2>{month} {year}</h2>
      <div>
        <button onClick={handlePrevMonth}>Prev</button>
        <button onClick={handleNextMonth}>Next</button>
      </div>
      <CalendarTable>
        <CalendarHeader>
          <tr>
            {days.map((day, index) => (
              <th key={index}>{day}</th>
            ))}
          </tr>
        </CalendarHeader>
        <CalendarBody>{renderCalendar()}</CalendarBody>
      </CalendarTable>
    </CalendarContainer>
  );
};

export default Calendar;