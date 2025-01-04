import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Gagal mengambil tugas");
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Tugas berhasil dihapus");
      fetchTasks(); // Refresh tasks
    } catch (error) {
      toast.error(error.response?.data?.error || "Gagal menghapus tugas");
    }
  };

  const deleteAllTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("/tasks/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Semua tugas berhasil dihapus");
      setTasks([]); // Kosongkan tugas
    } catch (error) {
      toast.error(error.response?.data?.error || "Gagal menghapus semua tugas");
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