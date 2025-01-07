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
  const [isAddTaskExpanded, setIsAddTaskExpanded] = useState(false);
  const navigate = useNavigate();

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

  const addTasks = async () => {
    try {
      const formattedTasks = newTask.map(({ date, time, ...rest }) => ({
        ...rest,
        deadline: `${date}T${time}`,
      }));

      const token = localStorage.getItem("token");

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedTasks),
      });

      if (!response.ok) throw new Error("Failed to add tasks");
      alert("Tasks added successfully");

      setNewTask([
        { task_name: "", date: "", time: "", duration: "", priority: "" },
      ]);

      fetchTasks();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleTaskChange = (index, updates) => {
    setNewTask((prev) =>
      prev.map((task, i) => (i === index ? { ...task, ...updates } : task))
    );
  };

  const addAnotherTask = () => {
    setNewTask((prev) => [
      ...prev,
      { task_name: "", date: "", time: "", duration: "", priority: "" },
    ]);
  };

  const removeTask = (index) => {
    setNewTask((prev) => prev.filter((_, i) => i !== index));
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

                  {/* Tombol Cancel */}
                  <button
                    onClick={() => removeTask(index)}
                    className="absolute top-0 right-0 text-red-600 hover:text-red-800"
                  >
                    Cancel
                  </button>
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
      </div>
    </div>
  );
};

export default TaskPage;
