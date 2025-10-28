import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "react-hot-toast";
import DashboardLayout from "../components/common/DashboardLayout";

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Day view helpers
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function LiveClasses() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.profile);
  const { batchId: urlBatchId } = useParams();
  
  // Use a hardcoded batch ID for testing
  const TEST_BATCH_ID = "689f561b05ca720224de841f"; // Frontend development batch ID
  const [currentBatchId, setCurrentBatchId] = useState(urlBatchId || user?.batchId || TEST_BATCH_ID);
  const batchId = currentBatchId; // Use the state variable
  
  console.log('Using batch ID:', batchId); // Debug log
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [calendarView, setCalendarView] = useState("month"); // "month" | "day"
  const [calendarDate, setCalendarDate] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date(new Date().setHours(0,0,0,0)));
  const [now, setNow] = useState(() => new Date());
  const [rowHeight, setRowHeight] = useState(40);
  const [rowBaseOffset, setRowBaseOffset] = useState(0);
  const gridRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    
    async function load() {
      console.log('Starting to load live classes...');
      
      setLoading(true);
      setError("");
      
      try {
        // Get token from Redux store and local storage for debugging
        const token = user?.token || localStorage.getItem('token');
        console.log('Auth Debug:', { 
          hasUser: !!user,
          hasTokenInUser: !!user?.token,
          hasTokenInStorage: !!localStorage.getItem('token'),
          batchId 
        });
        
        if (!token) {
          const errorMsg = 'No authentication token found. Please log in again.';
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
        
        console.log('Making API request to fetch live classes...');
        const startTime = Date.now();
        
        // Fetch live classes for the student
        const response = await fetch(`http://localhost:4000/api/v1/profile/live-classes`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          mode: 'cors'
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`API Response received in ${responseTime}ms`, { 
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        
        if (response.status === 401) {
          console.log('Received 401 Unauthorized, redirecting to login...');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
            console.error('API Error Response:', errorData);
          } catch (e) {
            console.error('Failed to parse error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
          }
          throw new Error(errorData.message || `Failed to fetch live classes. Status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response Data:', result);
        
        if (result?.data && Array.isArray(result.data)) {
          const liveClasses = result.data
            .filter(lc => lc && (lc._id || lc.id)) // Filter out any invalid entries
            .map(lc => {
              try {
                const startTime = lc.startTime ? new Date(lc.startTime) : new Date();
                const event = {
                  ...lc,
                  id: lc._id || lc.id,
                  date: startTime, // Use 'date' for consistency with calendar component
                  start: startTime,
                  end: lc.endTime ? new Date(lc.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000), // Default 1 hour duration
                  title: lc.title || 'Untitled Class',
                  description: lc.description || '',
                  link: lc.link || lc.meetingUrl || '',
                  batchName: lc.batch?.name || 'Batch'
                };
                console.log('Processed event:', event);
                return event;
              } catch (error) {
                console.error('Error processing live class:', { lc, error });
                return null;
              }
            })
            .filter(Boolean); // Remove any null entries from mapping errors
          
          console.log(`Successfully processed ${liveClasses.length} live classes`);
          if (mounted) {
            setEvents(liveClasses);
            setLoading(false);
          }
        } else {
          console.log('No live classes found or invalid data format:', result);
          if (mounted) {
            setEvents([]);
            setLoading(false);
          }
        }
      } catch (e) {
        console.error('Error in load:', {
          message: e.message,
          stack: e.stack,
          response: e.response?.data
        });
        if (mounted) {
          setError(`Error: ${e.message || 'Failed to load live classes'}`);
          setLoading(false);
        }
      }
    }
    
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Tick every second for current time line
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Measure actual row height and base offset to position the time line accurately
  useEffect(() => {
    const measure = () => {
      if (!gridRef.current) return;
      const rows = gridRef.current.querySelectorAll('.time-row');
      if (!rows || rows.length === 0) return;
      const firstRow = rows[0];
      const rowRect = firstRow.getBoundingClientRect();
      const gridRect = gridRef.current.getBoundingClientRect();
      let computedHour = rowRect.height;
      if (rows.length > 1) {
        const secondRect = rows[1].getBoundingClientRect();
        const dy = secondRect.top - rowRect.top;
        if (dy > 0) computedHour = dy; // account for borders/margins
      }
      const base = Math.max(0, rowRect.top - gridRect.top);
      if (computedHour && Math.abs(computedHour - rowHeight) > 0.5) setRowHeight(computedHour);
      if (Math.abs(base - rowBaseOffset) > 0.5) setRowBaseOffset(base);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [rowHeight, rowBaseOffset]);

  const eventsByDate = useMemo(() => {
    console.log('Grouping events by date. Total events:', events.length);
    const groups = {};
    events.forEach((ev) => {
      try {
        if (!ev || !ev.date) {
          console.warn('Skipping invalid event (missing date):', ev);
          return;
        }
        const key = formatDateKey(ev.date);
        if (!groups[key]) groups[key] = [];
        groups[key].push(ev);
      } catch (error) {
        console.error('Error processing event:', { ev, error });
      }
    });
    console.log('Grouped events by date:', groups);
    return groups;
  }, [events]);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const openLink = (raw) => {
    if (!raw) return;
    
    try {
      let target = String(raw).trim();
      
      // If it's already a full URL, use it directly
      if (target.startsWith('http')) {
        window.open(target, "_blank", "noopener,noreferrer");
        return;
      }
      
      // Try to extract URL from text if it contains one
      const urlMatch = target.match(/(https?:\/\/[^\s]+)/i);
      if (urlMatch) {
        window.open(urlMatch[0], "_blank", "noopener,noreferrer");
        return;
      }
      
      // Check for Google Meet code pattern (abc-defg-hij)
      const meetCode = target.match(/\b([a-z]{3}-[a-z]{4}-[a-z]{3})\b/i);
      if (meetCode) {
        window.open(`https://meet.google.com/${meetCode[1]}`, "_blank", "noopener,noreferrer");
        return;
      }
      
      // If it's a partial URL (starts with meet.google.com/)
      if (target.startsWith('meet.google.com/')) {
        window.open(`https://${target}`, "_blank", "noopener,noreferrer");
        return;
      }
      
      // If we get here and it's not empty, try to open it as a URL
      if (target) {
        window.open(`https://${target}`, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error('Error opening link:', { raw, error });
      toast.error('Could not open the meeting link');
    }
  };

  const DayCell = ({ date }) => {
    const key = formatDateKey(date);
    const dayEvents = eventsByDate[key] || [];
    const maxShow = 2; // Max events to show in day cell
    const isToday = isSameDay(date, new Date());
    const isCurrentMonth = date.getMonth() === calendarDate.getMonth();
    
    const handleEventClick = (e, ev) => {
      e.stopPropagation();
      if (ev.link) {
        // Clean and validate the URL before opening
        let url = String(ev.link).trim();
        
        // If it's a Google Meet code (abc-defg-hij)
        const meetCode = url.match(/\b([a-z]{3}-[a-z]{4}-[a-z]{3})\b/i);
        if (meetCode) {
          url = `https://meet.google.com/${meetCode[1]}`;
        } 
        // If it's a partial URL (starts with meet.google.com/)
        else if (url.startsWith('meet.google.com/')) {
          url = `https://${url}`;
        }
        // If it's not a full URL, try to make it one
        else if (!url.startsWith('http')) {
          // Check if it's a URL without protocol
          if (url.includes('.') && !url.includes(' ')) {
            url = `https://${url}`;
          } else {
            // If it's not a valid URL, don't try to open it
            console.error('Invalid meeting URL format:', ev.link);
            toast.error('Invalid meeting link format');
            return;
          }
        }
        
        // Open the URL in a new tab
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    };
    
    return (
      <div
        className={`day-cell ${isToday ? 'today' : ''} ${
          !isCurrentMonth ? 'other-month' : ''
        }`}
        onClick={() => {
          setSelectedDate(date);
          setCalendarView('day');
        }}
      >
        <div className="day-number">
          {date.getDate()}
          {dayEvents.length > 0 && (
            <span className="event-count">{dayEvents.length}</span>
          )}
        </div>
        {dayEvents.length > 0 && (
          <div className="day-events">
            {dayEvents.slice(0, maxShow).map((ev) => {
              const isPast = ev.date.getTime() < Date.now() && !isSameDay(ev.date, new Date());
              return (
                <div
                  key={ev.id}
                  className={`event-preview ${isPast ? 'past' : ''}`}
                  onClick={(e) => handleEventClick(e, ev)}
                  title={`${ev.title || 'Live Class'} - ${ev.date.toLocaleTimeString()}`}
                >
                  <div className="event-title">{ev.title || 'Live Class'}</div>
                  <div className="event-time">
                    {ev.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {isPast ? (
                    <span className="status-badge done">Done</span>
                  ) : (
                    <span className="status-badge upcoming">Upcoming</span>
                  )}
                </div>
              );
            })}
            {dayEvents.length > maxShow && (
              <div
                className="more-events"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate(date);
                  setCalendarView("day");
                }}
                role="button"
                tabIndex={0}
              >
                +{dayEvents.length - maxShow} more
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const DayView = ({ date }) => {
    const key = formatDateKey(date);
    const list = (eventsByDate[key] || []).slice().sort((a,b) => a.date - b.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const formatMeetingLink = (link) => {
      if (!link) return null;
      
      // If it's a full URL, extract the meeting code if it's a Google Meet URL
      if (link.includes('meet.google.com/')) {
        const url = new URL(link.startsWith('http') ? link : `https://${link}`);
        const path = url.pathname.split('/').filter(Boolean).pop();
        return {
          display: `meet.google.com/${path}`,
          url: url.toString()
        };
      }
      
      // If it's just a meeting code (abc-defg-hij)
      const meetCode = link.match(/\b([a-z]{3}-[a-z]{4}-[a-z]{3})\b/i);
      if (meetCode) {
        return {
          display: `meet.google.com/${meetCode[1]}`,
          url: `https://meet.google.com/${meetCode[1]}`
        };
      }
      
      // Otherwise, return the original link
      return {
        display: link.length > 30 ? `${link.substring(0, 27)}...` : link,
        url: link.startsWith('http') ? link : `https://${link}`
      };
    };

    return (
      <div className="mt-4 border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="font-semibold text-gray-800">
            {date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <button 
            className="px-3 py-1 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setCalendarView("month")}
          >
            Back to Month
          </button>
        </div>
        
        {list.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500 bg-gray-50">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No live classes</h3>
            <p className="mt-1 text-sm text-gray-500">There are no classes scheduled for this day.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {list.map((ev) => {
              const isPast = ev.date.getTime() < Date.now() && !isSameDay(ev.date, today);
              const meetingLink = formatMeetingLink(ev.link);
              
              return (
                <div key={ev.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">{ev.title || "Live Class"}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {ev.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {ev.batchName}
                          </p>
                          {meetingLink && (
                            <div className="mt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openLink(ev.link);
                                }}
                                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                title={meetingLink.url}
                              >
                                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 22c-5.5 0-10-4.5-10-10S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10zm4.7-10.7l-4-4c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l2.3 2.3H7c-.6 0-1 .4-1 1s.4 1 1 1h6.6l-2.3 2.3c-.4.4-.4 1 0 1.4.2.2.5.3.7.3s.5-.1.7-.3l4-4c.4-.4.4-1 0-1.4z"/>
                                </svg>
                                {meetingLink.display}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-shrink-0">
                      {isPast ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => openLink(ev.link)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="-ml-0.5 mr-1.5 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Join Now
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {ev.description && (
                    <div className="mt-2 text-sm text-gray-600">
                      {ev.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Month helpers mirroring admin layout
  const monthInfo = useMemo(() => {
    const first = startOfMonth(calendarDate);
    const gridStart = startOfWeek(first);
    const days = [];
    for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i));
    return { days };
  }, [calendarDate]);

  const onCalendarToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setSelectedDate(now);
    setCalendarDate(new Date(now));
  };
  const onCalendarBack = () => {
    if (calendarView === "day") {
      setSelectedDate((prev) => addDays(prev, -1));
      setCalendarDate((prev) => addDays(prev, -1));
    } else {
      setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };
  const onCalendarNext = () => {
    if (calendarView === "day") {
      setSelectedDate((prev) => addDays(prev, 1));
      setCalendarDate((prev) => addDays(prev, 1));
    } else {
      setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  const monthLabel = (d) => d.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <DashboardLayout>
    <div className="page-wrap">
      <h1 className="text-2xl font-semibold mb-4 text-center "
      >Live Classes</h1>

      <div className="live-classes-section">
        {/* Toolbar */}
        <div className="calendar-toolbar">
          <div className="calendar-nav-buttons">
            <button onClick={onCalendarToday} className="secondary-button">Today</button>
            <button onClick={onCalendarBack} className="secondary-button">Back</button>
            <button onClick={onCalendarNext} className="secondary-button">Next</button>
          </div>
          <div className="calendar-view-controls">
            <div className="view-toggle">
              <button onClick={() => setCalendarView("month")} className={`secondary-button ${calendarView === "month" ? "active" : ""}`}>Month</button>
              <button onClick={() => setCalendarView("day")} className={`secondary-button ${calendarView === "day" ? "active" : ""}`}>Day</button>
            </div>
          </div>
        </div>

        {/* Month label */}
        {calendarView === "month" && (
          <div className="month-label">{monthLabel(calendarDate)}</div>
        )}

        {/* Calendar */}
        {!loading && calendarView === "month" && (
          <div className="month-calendar">
            <div className="week-header">
              {weekdays.map((w) => (
                <div key={w} className="weekday">{w}</div>
              ))}
            </div>
            <div className="days-grid">
              {monthInfo.days.map((d) => (
                <DayCell key={d.toISOString()} date={d} />
              ))}
            </div>
          </div>
        )}

        {!loading && calendarView === "day" && (
          <div className="day-view">
            <div className="day-header">
              <div className="day-title">
                {selectedDate.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
              <button onClick={() => setCalendarView("month")} className="secondary-button">Back to Month</button>
            </div>
            {(() => {
              const key = formatDateKey(selectedDate);
              const list = (eventsByDate[key] || []).slice().sort((a, b) => a.date - b.date);
              if (list.length === 0) return null;
              return (
                <div className="day-events-list">
                  {list.map((ev) => (
                    <div key={ev.id} className="event-item">
                      <span className="event-time">{ev.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                      <span className="event-title">{ev.title || "Live Class"}</span>
                      <button className="secondary-button small" onClick={() => openLink(ev.link)}>Join</button>
                    </div>
                  ))}
                </div>
              );
            })()}
            <div className="time-grid" ref={gridRef}>
              {isSameDay(selectedDate, now) && (
                (() => {
                  const midnight = new Date(now);
                  midnight.setHours(0, 0, 0, 0);
                  const elapsedMs = now.getTime() - midnight.getTime();
                  const hoursFloat = elapsedMs / 3600000; // hours since local midnight
                  const offset = rowBaseOffset + hoursFloat * rowHeight;
                  return <div className="current-time-line" style={{ top: `${offset}px` }}><span className="current-time-dot" /></div>;
                })()
              )}
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="time-row">
                  <div className="time-label">{`${String(h).padStart(2, "0")}:00`}</div>
                  <div className="time-slot" />
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && <div className="loading-state">Loading live classes...</div>}
        {error && <div className="error-state">{error}</div>}
      </div>

      <style jsx>{`
        .page-wrap { width: 100%; max-width: 100%; margin: 0 auto; padding: 20px; }
        .live-classes-section { 
          min-height: 70vh;
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }
        .calendar-toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
        .calendar-nav-buttons { display:flex; gap:8px; }
        .calendar-view-controls { display:flex; align-items:center; gap:8px; }
        .view-toggle { display:flex; gap:8px; }
        .month-label { background:#f3f4f6; border:1px solid #e5e7eb; border-radius:8px; padding:0.5rem; text-align:center; color:#1f2937; font-weight:600; margin-bottom:8px; }
        .month-calendar { border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; background:#fff; }
        .week-header { display:grid; grid-template-columns:repeat(7,1fr); background:#f3f4f6; border-bottom:1px solid #e5e7eb; }
        .weekday { padding:8px; font-weight:600; color:#1f2937; text-align:center; }
        .days-grid { display:grid; grid-template-columns:repeat(7,1fr); background:#fff; }
        .day-cell { border-bottom:1px solid #e5e7eb; border-right:1px solid #e5e7eb; height:96px; cursor:pointer; transition:background 120ms ease; }
        .days-grid .day-cell:nth-child(7n) { border-right:none; }
        .days-grid .day-cell:nth-last-child(-n+7) { border-bottom:none; }
        .day-cell.current-month { background:#fff; }
        .day-cell.other-month { background:#f3f4f6; }
        .day-cell.selected { background:#e0f2fe; }
        .day-number { padding:0.4rem; text-align:right; font-weight:600; }
        .day-cell.current-month .day-number { color:#1f2937; }
        .day-cell.other-month .day-number { color:#6b7280; }
        .day-events { padding:0 6px 8px; }
        .event-chip { font-size:12px; background:#eef2ff; color:#3730a3; border-radius:6px; padding:2px 6px; margin:4px 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:100%; text-align:left; border:none; }
        .event-chip:hover { filter:brightness(0.95); }
        .more-events { font-size:12px; color:#6b7280; padding-left:4px; }
        .status-badge { display:inline-block; margin-left:6px; font-size:10px; padding:1px 6px; border-radius:9999px; border:1px solid #e5e7eb; color:#374151; background:#f9fafb; }
        .status-badge.done { color:#065f46; border-color:#a7f3d0; background:#d1fae5; }
        .day-view { border:1px solid #e5e7eb; border-radius:8px; background:#fff; overflow:hidden; }
        .day-header { display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1rem; border-bottom:1px solid #e5e7eb; }
        .day-title { font-weight:700; color:#1f2937; }
        .day-events-list { padding:0.75rem 1rem; border-bottom:1px solid #e5e7eb; }
        .event-item { display:flex; gap:8px; align-items:center; margin-bottom:6px; }
        .event-time { font-size:12px; color:#6b7280; min-width:64px; }
        .event-title { font-size:14px; color:#1f2937; font-weight:600; flex:1; }
        .time-grid { border-top:1px solid #e5e7eb; }
        .time-grid { position:relative; }
        .time-row { display:grid; grid-template-columns:80px 1fr; }
        .time-label { padding:0.5rem; border-right:1px solid #e5e7eb; color:#6b7280; text-align:right; }
        .time-slot { min-height:40px; border-bottom:1px solid #e5e7eb; }
        .current-time-line { position:absolute; left:0; right:0; height:0; border-top:2px solid #22c55e; z-index:2; }
        .current-time-dot { position:absolute; left:80px; width:8px; height:8px; background:#22c55e; border-radius:9999px; top:-4px; }
        .loading-state { margin-top:12px; color:#6b7280; }
        .error-state { margin-top:12px; color:#ef4444; }
        button { padding:8px 16px; border-radius:6px; font-weight:500; cursor:pointer; transition:all 120ms ease; border:1px solid transparent; }
        .secondary-button { background:#fff; color:#1f2937; border-color:#e5e7eb; }
        .secondary-button:hover { background:#f3f4f6; }
        .secondary-button.active { background:#f3f4f6; }
        .small { padding:4px 8px; font-size:12px; }
      `}</style>
    </div>
    </DashboardLayout>
  );
}
