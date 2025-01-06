import React, { useEffect, useState } from "react";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/tasks", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengambil tugas");
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      alert(error.message || "Terjadi kesalahan saat mengambil data tugas");
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghapus tugas");
      }

      alert("Tugas berhasil dihapus");
      fetchTasks(); // Refresh daftar tugas
    } catch (error) {
      alert(error.message || "Terjadi kesalahan saat menghapus tugas");
    }
  };

  const deleteAllTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/tasks/all", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghapus semua tugas");
      }

      alert("Semua tugas berhasil dihapus");
      setTasks([]); // Kosongkan daftar tugas
    } catch (error) {
      alert(error.message || "Terjadi kesalahan saat menghapus semua tugas");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) return <p className="text-center mt-4">Memuat data...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center">Daftar Tugas</h1>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
        onClick={deleteAllTasks}
      >
        Hapus Semua Tugas
      </button>
      <div className="mt-4">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500">Tidak ada tugas</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 mb-4 bg-white shadow-md rounded-lg flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">{task.task_name}</h2>
                <p>Deadline: {new Date(task.deadline).toLocaleString()}</p>
                <p>Durasi: {task.duration} menit</p>
                <p>Prioritas: {task.priority}</p>
              </div>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => deleteTask(task.id)}
              >
                Hapus
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
