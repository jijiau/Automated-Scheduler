import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    task_name: "",
    date: "",
    time: "",
    duration: "",
    priority: "",
  });
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const navigate = useNavigate();
  const [editData, setEditData] = useState(null); // Untuk menyimpan data yang akan diedit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Status modal edit

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/tasks", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      alert(error.message);
    }
  };

  // Add a new task
  const addTask = async () => {
    try {
      const { date, time, ...rest } = newTask;
      const deadline = `${date}T${time}`;
      const token = localStorage.getItem("token");

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ ...rest, deadline }]),
      });

      if (!response.ok) throw new Error("Failed to add task");
      alert("Task added successfully");
      setNewTask({
        task_name: "",
        date: "",
        time: "",
        duration: "",
        priority: "",
      });
      fetchTasks();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditTask = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/tasks/${editData.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task_name: editData.task_name,
          priority: editData.priority,
          deadline: editData.deadline,
          duration: editData.duration,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to update task");
      alert("Task updated successfully");
      setIsEditModalOpen(false); // Tutup modal
      fetchTasks(); // Refresh daftar tugas
    } catch (error) {
      alert(error.message);
    }
  };  

  // Generate schedule
  const generateSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/schedule/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to generate schedule");
      alert("Schedule generated successfully");

      // Redirect to Schedule page
      navigate("/schedule");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Delete a single task
  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/tasks`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: [id] }), // Mengirimkan array `ids`
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete task");
      }
  
      alert("Task deleted successfully");
      fetchTasks();
    } catch (error) {
      alert(error.message);
    }
  };  

  // Delete all tasks
  const deleteAllTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/tasks/all", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete all tasks");
      alert("All tasks deleted successfully");
      setTasks([]);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary-bluePrimary">
        Manage Tasks
      </h1>
  
      {/* Add Task Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary-bluePrimary">
          Add Task
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="task_name" className="block text-sm font-medium text-gray-700">
              Task Name
            </label>
            <input
              type="text"
              placeholder="Task Name"
              value={newTask.task_name}
              onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
              className="w-full px-4 py-2 border rounded text-primary-bluePrimary"
            />
          </div>
  
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
              Deadline
            </label>
            <div className="flex space-x-4">
              <input
                type="date"
                value={newTask.date}
                onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                className="flex-1 px-4 py-2 border rounded text-primary-bluePrimary"
              />
              <input
                type="time"
                value={newTask.time}
                onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                className="flex-1 px-4 py-2 border rounded text-primary-bluePrimary"
              />
            </div>
          </div>
  
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Duration (Minutes)
            </label>
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={newTask.duration}
              onChange={(e) => setNewTask({ ...newTask, duration: e.target.value })}
              className="w-full px-4 py-2 border rounded text-primary-bluePrimary"
            />
          </div>
  
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <input
              type="number"
              placeholder="Priority"
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="w-full px-4 py-2 border rounded text-primary-bluePrimary"
            />
          </div>
        </div>
  
        <button
          onClick={addTask}
          className="mt-6 w-full bg-primary-bluePrimary text-white py-2 rounded"
        >
          Add Task
        </button>
      </div>
  
      {/* Generate Schedule Button */}
      <div className="flex justify-between mb-4">
        <button
          onClick={generateSchedule}
          disabled={loadingSchedule}
          className={`px-6 py-3 text-white rounded-md shadow-lg transition-all ${
            loadingSchedule
              ? "bg-primary-orangeDark cursor-not-allowed"
              : "bg-primary-yellowPrimary hover:bg-primary-orangePrimary"
          }`}
        >
          {loadingSchedule ? "Generating..." : "Generate Schedule"}
        </button>
        <button
          onClick={() => navigate("/schedule")}
          className="px-6 py-3 text-white bg-primary-bluePrimary rounded-md shadow-lg hover:bg-primary-orangePrimary"
        >
          View Schedule
        </button>
      </div>
  
      {/* Delete All Tasks */}
      <button
        onClick={deleteAllTasks}
        className="mb-4 w-full bg-primary-orangeDark text-white py-2 rounded"
      >
        Delete All Tasks
      </button>
  
      {/* Task List */}
      <div>
        {tasks.length === 0 ? (
          <p className="text-center text-primary-yellowPrimary">No tasks available</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 mb-4 bg-white shadow-md rounded-lg flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold text-primary-bluePrimary">
                  {task.task_name}
                </h2>
                <p>Deadline: {new Date(task.deadline).toLocaleString()}</p>
                <p>Duration: {task.duration} minutes</p>
                <p>Priority: {task.priority}</p>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setEditData(task);
                    setIsEditModalOpen(true);
                  }}
                  className="bg-primary-bluePrimary text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="bg-primary-yellowPrimary text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
  
      {/* Edit Task Modal */}
      {isEditModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Task</h2>
            <label>Task Name:</label>
            <input
              type="text"
              value={editData.task_name}
              onChange={(e) =>
                setEditData({ ...editData, task_name: e.target.value })
              }
            />
            <label>Priority:</label>
            <input
              type="number"
              value={editData.priority}
              onChange={(e) =>
                setEditData({ ...editData, priority: e.target.value })
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
            <label>Duration (Minutes):</label>
            <input
              type="number"
              value={editData.duration}
              onChange={(e) =>
                setEditData({ ...editData, duration: e.target.value })
              }
            />
            <div className="modal-actions">
              <button onClick={handleEditTask}>Save</button>
              <button onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default TaskPage;
