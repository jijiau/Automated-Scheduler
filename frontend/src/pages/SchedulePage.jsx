import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";

// Konfigurasi lokal untuk kalender
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
  const API_BASE_URL = "http://103.127.139.237:3000";

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/schedule`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch schedules");
      const data = await response.json();

      const formattedEvents = data.schedules.map((schedule) => ({
        id: schedule.task_id,
        title: schedule.tasks.task_name,
        start: new Date(schedule.start_time),
        end: new Date(schedule.end_time),
        priority: schedule.tasks.priority,
        deadline: schedule.tasks.deadline,
        timeInfo: `${new Date(schedule.start_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${new Date(schedule.end_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`, // Waktu mulai dan selesai
      }));

      setEvents(formattedEvents);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditTask = async () => {
    try {
      const updatedTask = {
        task_name: editData.title,
        priority: editData.priority,
        deadline: editData.deadline,
        duration: Math.round(
          (new Date(editData.end) - new Date(editData.start)) / 60000
        ), // Duration in minutes
      };

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/tasks/${editData.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) throw new Error("Failed to update task");

      alert("Task updated successfully");

      // Re-generate schedule
      const scheduleResponse = await fetch(`${API_BASE_URL}/schedule/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!scheduleResponse.ok)
        throw new Error("Failed to generate schedule after update");

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
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-7xl font-bold text-center mb-8 text-primary-bluePrimary">
        Schedule Calendar
      </h1>

      <div className="flex justify-between mb-8">
        <button
          onClick={() => navigate("/tasks")}
          className="px-6 py-3 text-white rounded-md shadow-lg bg-primary-bluePrimary hover:bg-primary-orangePrimary"
        >
          Back to Tasks
        </button>

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

      {/* Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <h2 className="text-xl font-bold text-primary-bluePrimary mb-4">
              Edit Task
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Task Name
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <input
                  type="number"
                  value={editData.priority}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      priority: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Deadline
                </label>
                <input
                  type="datetime-local"
                  value={editData.deadline}
                  onChange={(e) =>
                    setEditData({ ...editData, deadline: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={editData.start.toISOString().slice(0, -1)}
                  onChange={(e) =>
                    setEditData({ ...editData, start: new Date(e.target.value) })
                  }
                  className="w-full px-4 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={editData.end.toISOString().slice(0, -1)}
                  onChange={(e) =>
                    setEditData({ ...editData, end: new Date(e.target.value) })
                  }
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={handleEditTask}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
