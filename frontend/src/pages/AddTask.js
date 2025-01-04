import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const AddTasks = () => {
  const [tasks, setTasks] = useState([
    { task_name: "", deadline: "", duration: "", priority: "" },
  ]);

  const handleInputChange = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    setTasks(updatedTasks);
  };

  const addTaskField = () => {
    setTasks([...tasks, { task_name: "", deadline: "", duration: "", priority: "" }]);
  };

  const removeTaskField = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  const submitTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/tasks", tasks, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("Tugas berhasil ditambahkan");
      setTasks([{ task_name: "", deadline: "", duration: "", priority: "" }]);
    } catch (error) {
      toast.error(error.response?.data?.error || "Gagal menambahkan tugas");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Tambah Tugas</h1>
      {tasks.map((task, index) => (
        <div key={index} className="mt-4 p-4 bg-white shadow-md rounded-lg">
          <div className="mb-2">
            <label className="block text-sm">Nama Tugas</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={task.task_name}
              onChange={(e) => handleInputChange(index, "task_name", e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Deadline</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border rounded"
              value={task.deadline}
              onChange={(e) => handleInputChange(index, "deadline", e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Durasi (menit)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded"
              value={task.duration}
              onChange={(e) => handleInputChange(index, "duration", e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Prioritas</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded"
              value={task.priority}
              onChange={(e) => handleInputChange(index, "priority", e.target.value)}
            />
          </div>
          {tasks.length > 1 && (
            <button
              className="bg-red-500 text-white px-3 py-1 rounded"
              onClick={() => removeTaskField(index)}
            >
              Hapus
            </button>
          )}
        </div>
      ))}
      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={addTaskField}
      >
        Tambah Tugas Lain
      </button>
      <button
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded ml-4"
        onClick={submitTasks}
      >
        Simpan Tugas
      </button>
    </div>
  );
};

export default AddTasks;