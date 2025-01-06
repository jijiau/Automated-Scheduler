import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";

// Configure locale for the calendar
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const PRIORITY_COLORS = {
  1: "rgba(0, 120, 215, 0.5)", // Blue
  2: "rgba(255, 215, 0, 0.5)", // Yellow
  3: "rgba(255, 165, 0, 0.5)", // Orange
  default: "rgba(128, 128, 128, 0.5)", // Grey
};

const SchedulePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/schedule", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch schedules");
      const data = await response.json();

      const formattedEvents = data.schedules.map((schedule) => ({
        id: schedule.task_id, // Use this ID for editing
        title: schedule.tasks.task_name,
        start: new Date(schedule.start_time),
        end: new Date(schedule.end_time),
        priority: schedule.tasks.priority,
        deadline: schedule.tasks.deadline,
      }));
      setEvents(formattedEvents);
    } catch (error) {
      alert(error.message);
    }
  };

  const generateSchedule = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/schedule/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to generate schedule");
      const data = await response.json();
      alert("Schedule generated successfully");

      const formattedEvents = data.scheduledTasks.map((task) => ({
        id: task.task_id,
        title: task.task_name,
        start: new Date(task.start_time),
        end: new Date(task.end_time),
        priority: task.priority,
      }));
      setEvents(formattedEvents);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async () => {
    try {
      const updatedTask = {
        task_name: editData.title,
        priority: editData.priority,
        deadline: editData.deadline,
        duration: Math.round((new Date(editData.end) - new Date(editData.start)) / 60000), // Duration in minutes
      };

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/tasks/${editData.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) throw new Error("Failed to update task");

      alert("Task updated successfully");

      // Re-generate schedule after task update
      const scheduleResponse = await fetch("/api/schedule/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!scheduleResponse.ok) throw new Error("Failed to generate schedule after update");

      alert("Schedule re-generated successfully");

      setSelectedEvent(null); // Close modal
      fetchSchedules(); // Refresh calendar events
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const eventStyleGetter = (event) => {
    const backgroundColor =
      PRIORITY_COLORS[event.priority] || PRIORITY_COLORS.default;
    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.8,
        color: "black",
        border: "1px solid #ccc",
        display: "block",
      },
    };
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Hapus token dari localStorage
    navigate("/login"); // Redirect ke halaman login
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary-bluePrimary">
        Kalender Jadwal
      </h1>

      <div className="flex justify-between mb-8">
        {/* Tombol Back to Tasks */}
        <button
          onClick={() => navigate("/tasks")}
          className="px-6 py-3 text-white rounded-md shadow-lg bg-primary-bluePrimary hover:bg-primary-orangePrimary"
        >
          Back to Tasks
        </button>

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          className="px-6 py-3 text-white rounded-md shadow-lg bg-red-500 hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        defaultView="month"
        views={["month", "week", "day"]}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(event) => {
          setSelectedEvent(event);
          setEditData(event);
        }}
      />

      {selectedEvent && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Task</h2>
            <label>Task Name:</label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
            />
            <label>Priority:</label>
            <input
              type="number"
              value={editData.priority}
              onChange={(e) =>
                setEditData({ ...editData, priority: parseInt(e.target.value) })
              }
            />
            <label>Deadline:</label>
            <input
              type="datetime-local"
              value={editData.deadline}
              onChange={(e) =>
                setEditData({ ...editData, deadline: e.target.value })
              }
            />
            <label>Start Time:</label>
            <input
              type="datetime-local"
              value={editData.start.toISOString().slice(0, -1)} // Format for datetime-local
              onChange={(e) =>
                setEditData({ ...editData, start: new Date(e.target.value) })
              }
            />
            <label>End Time:</label>
            <input
              type="datetime-local"
              value={editData.end.toISOString().slice(0, -1)} // Format for datetime-local
              onChange={(e) =>
                setEditData({ ...editData, end: new Date(e.target.value) })
              }
            />
            <button onClick={handleEditTask} disabled={loading}>
              Save
            </button>
            <button onClick={() => setSelectedEvent(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
