import React, { useState, useEffect } from 'react';
import '../styles/DigitalClock.css';

const DigitalClock = () => {
  const [times, setTimes] = useState({});

  const timezones = [
    { name: 'New York', zone: 'America/New_York' },
    { name: 'London', zone: 'Europe/London' },
    { name: 'Tokyo', zone: 'Asia/Tokyo' },
    { name: 'Sydney', zone: 'Australia/Sydney' },
    { name: 'Dubai', zone: 'Asia/Dubai' },
    { name: 'Singapore', zone: 'Asia/Singapore' },
    { name: 'Los Angeles', zone: 'America/Los_Angeles' },
    { name: 'Paris', zone: 'Europe/Paris' },
  ];

  useEffect(() => {
    const updateTime = () => {
      const newTimes = {};
      timezones.forEach((tz) => {
        const date = new Date().toLocaleString('en-US', {
          timeZone: tz.zone,
        });
        const timeObj = new Date(date);
        newTimes[tz.zone] = {
          time: timeObj.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }),
          date: timeObj.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
        };
      });
      setTimes(newTimes);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="digital-clock-container">
      <h1 className="clock-title">World Clock</h1>
      <div className="clocks-grid">
        {timezones.map((tz) => (
          <div key={tz.zone} className="clock-card">
            <div className="timezone-name">{tz.name}</div>
            <div className="time-display">{times[tz.zone]?.time || '--:--:--'}</div>
            <div className="date-display">{times[tz.zone]?.date || 'Loading...'}</div>
            <div className="timezone-code">{tz.zone}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DigitalClock;
