import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskCard from "../components/TaskCard";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState([
    {
      task_name: "",
      date: "",
      time: "",
      duration: "",
      priority: "",
    },
  ]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [isAddTaskExpanded, setIsAddTaskExpanded] = useState(false); // State untuk dropdown
  const navigate = useNavigate();
  const API_BASE_URL = "https://api.taskly.web.id";


  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_BASE_URL}/tasks`, {
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

  // Add multiple tasks
  const addTasks = async () => {
    try {
      const formattedTasks = newTask.map(({ date, time, ...rest }) => ({
        ...rest,
        deadline: `${date}T${time}`,
      }));

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedTasks),
      });

      if (!response.ok) throw new Error("Failed to add tasks");
      alert("Tasks added successfully");

      // Reset form
      setNewTask([
        { task_name: "", date: "", time: "", duration: "", priority: "" },
      ]);

      // Refresh daftar tugas
      fetchTasks();
    } catch (error) {
      alert(error.message);
    }
  };

  // Edit a task
  const handleEditTask = async (updatedTask) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/tasks/${updatedTask.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task_name: updatedTask.task_name,
          deadline: updatedTask.deadline,
          duration: updatedTask.duration,
          priority: updatedTask.priority,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      // Update tasks state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );

      alert("Task updated successfully");
    } catch (error) {
      alert(error.message);
    }
  };

  // Delete a single task
  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: [id] }),
      });

      if (!response.ok) throw new Error("Failed to delete task");

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
      
      const response = await fetch(`${API_BASE_URL}/tasks/all`, {
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

  // Generate schedule
  const generateSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/schedule/generate`, {
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

  // Handle changes in a specific task field
  const handleTaskChange = (index, updates) => {
    setNewTask((prev) =>
      prev.map((task, i) => (i === index ? { ...task, ...updates } : task))
    );
  };

  // Add another task form
  const addAnotherTask = () => {
    setNewTask((prev) => [
      ...prev,
      { task_name: "", date: "", time: "", duration: "", priority: "" },
    ]);
  };

  const removeTask = (index) => {
    setNewTask((prev) => prev.filter((_, i) => i !== index)); // Hapus task berdasarkan index
  };  

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-primary-orangePrimary p-8">
      <div className="max-w-screen-lg mx-auto">
        <h1 className="text-7xl font-bold text-center mb-8 text-white">
          Manage Tasks
        </h1>

        {/* Add Task Form */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          {/* Header dengan Dropdown Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-primary-bluePrimary">
              Add Task
            </h2>
            <button
              onClick={() => setIsAddTaskExpanded((prev) => !prev)}
              className="text-primary-bluePrimary flex items-center"
            >
              {isAddTaskExpanded ? (
                <>
                  <span className="mr-1">Close</span>
                  <FaChevronUp />
                </>
              ) : (
                <>
                  <span className="mr-1">Add Task</span>
                  <FaChevronDown />
                </>
              )}
            </button>
          </div>

          {/* Form Add Task */}
          {isAddTaskExpanded && (
            <div className="mt-4 space-y-6">
              {newTask.map((task, index) => (
                <div
                  key={index}
                  className="space-y-4 border-b-2 pb-4 relative"
                >
                  {/* Tombol Cancel */}
                  <div className="flex justify-end items-center">
                    <span className="flex items-center text-red-600 hover:text-red-800 cursor-pointer"
                      onClick={() => removeTask(index)}>
                      Cancel
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  </div>

                  <div>
                    <label
                      htmlFor={`task_name_${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Task Name
                    </label>
                    <input
                      type="text"
                      placeholder="Task Name"
                      value={task.task_name}
                      onChange={(e) =>
                        handleTaskChange(index, { task_name: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`deadline_${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Deadline
                    </label>
                    <div className="flex space-x-4">
                      <input
                        type="date"
                        value={task.date}
                        onChange={(e) =>
                          handleTaskChange(index, { date: e.target.value })
                        }
                        className="flex-1 px-4 py-2 border rounded"
                      />
                      <input
                        type="time"
                        value={task.time}
                        onChange={(e) =>
                          handleTaskChange(index, { time: e.target.value })
                        }
                        className="flex-1 px-4 py-2 border rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`duration_${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      placeholder="Duration (minutes)"
                      value={task.duration}
                      onChange={(e) =>
                        handleTaskChange(index, { duration: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`priority_${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Priority
                    </label>
                    <input
                      type="number"
                      placeholder="Priority"
                      value={task.priority}
                      onChange={(e) =>
                        handleTaskChange(index, { priority: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                </div>
              ))}


              <button
                onClick={addAnotherTask}
                className="w-full bg-yellow-500 text-white py-2 rounded"
              >
                Add Another Task
              </button>

              <button
                onClick={addTasks}
                className="w-full bg-blue-600 text-white py-2 rounded"
              >
                Submit Tasks
              </button>
            </div>
          )}
        </div>


        {/* Generate Schedule Button */}
        <div className="flex justify-between mb-4">
          <button
            onClick={generateSchedule}
            disabled={loadingSchedule}
            className={`w-full mr-3 px-6 py-3 text-black rounded-md shadow-lg transition-all ${
              loadingSchedule
                ? "bg-primary-orangeDark cursor-not-allowed"
                : "bg-white border-2 border-primary-bluePrimary rounded-md p-4 hover:bg-blue-700 hover:text-white"
            }`}
          >
            {loadingSchedule ? "Generating..." : "Generate Schedule"}
          </button>
          <button
            onClick={() => navigate("/schedule")}
            className="w-full ml-3 px-6 py-3 text-white bg-primary-bluePrimary rounded-md shadow-lg hover:bg-blue-700"
          >
            View Schedule
          </button>
        </div>

        {/* Task List */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onSave={(updatedTask) => handleEditTask(updatedTask)}
              onDelete={(id) => deleteTask(id)}
            />
          ))}
        </div>

        {/* Delete All Tasks */}
        <button
          onClick={deleteAllTasks}
          className="mb-4 w-full bg-red-600 text-white py-2 rounded"
        >
          Delete All Tasks
        </button>
      </div>
    </div>
  );
};

export default TaskPage;
