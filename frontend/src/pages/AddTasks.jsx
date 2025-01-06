import React, { useState } from "react";

const AddTasks = () => {
  const [tasks, setTasks] = useState([
    { task_name: "", date: "", time: "", duration: "", priority: "" },
  ]);

  const handleInputChange = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    setTasks(updatedTasks);
  };

  const addTaskField = () => {
    setTasks([
      ...tasks,
      { task_name: "", date: "", time: "", duration: "", priority: "" },
    ]);
  };

  const removeTaskField = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  const submitTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      // Gabungkan tanggal dan waktu menjadi satu `deadline`
      const formattedTasks = tasks.map((task) => ({
        ...task,
        deadline: `${task.date}T${task.time}`,
      }));

      const response = await fetch("/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedTasks),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menambahkan tugas");
      }

      alert("Tugas berhasil ditambahkan!");
      setTasks([{ task_name: "", date: "", time: "", duration: "", priority: "" }]);
    } catch (error) {
      alert(error.message || "Terjadi kesalahan saat menyimpan tugas");
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
              onChange={(e) =>
                handleInputChange(index, "task_name", e.target.value)
              }
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Tanggal</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded"
              value={task.date}
              onChange={(e) => handleInputChange(index, "date", e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Waktu</label>
            <input
              type="time"
              className="w-full px-3 py-2 border rounded"
              value={task.time}
              onChange={(e) => handleInputChange(index, "time", e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Durasi (menit)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded"
              value={task.duration}
              onChange={(e) =>
                handleInputChange(index, "duration", e.target.value)
              }
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Prioritas</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded"
              value={task.priority}
              onChange={(e) =>
                handleInputChange(index, "priority", e.target.value)
              }
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
