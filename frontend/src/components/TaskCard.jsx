import React, { useState, useEffect } from "react";

const TaskCard = ({ task, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false); // State untuk mode edit
  const [editData, setEditData] = useState(task); // State untuk data yang sedang diedit

  // Sinkronkan data dari prop `task` jika berubah
  useEffect(() => {
    setEditData(task);
  }, [task]);

  // Fungsi untuk menyimpan perubahan
  const handleSave = () => {
    onSave(editData); // Memanggil fungsi onSave dengan data terbaru
    setIsEditing(false); // Keluar dari mode edit
  };

  // Fungsi untuk membatalkan perubahan
  const handleCancel = () => {
    setEditData(task); // Reset data ke nilai awal
    setIsEditing(false); // Keluar dari mode edit
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between">
      {isEditing ? (
        <div>
          {/* Input untuk mengedit Task Name */}
          <input
            type="text"
            value={editData.task_name}
            onChange={(e) =>
              setEditData({ ...editData, task_name: e.target.value })
            }
            className="w-full mb-2 px-2 py-1 border rounded"
            placeholder="Task Name"
          />

          {/* Input untuk mengedit Deadline */}
          <input
            type="datetime-local"
            value={editData.deadline}
            onChange={(e) =>
              setEditData({ ...editData, deadline: e.target.value })
            }
            className="w-full mb-2 px-2 py-1 border rounded"
          />

          {/* Input untuk mengedit Duration */}
          <input
            type="number"
            value={editData.duration}
            onChange={(e) =>
              setEditData({ ...editData, duration: e.target.value })
            }
            className="w-full mb-2 px-2 py-1 border rounded"
            placeholder="Duration (minutes)"
          />

          {/* Input untuk mengedit Priority */}
          <input
            type="number"
            value={editData.priority}
            onChange={(e) =>
              setEditData({ ...editData, priority: e.target.value })
            }
            className="w-full mb-2 px-2 py-1 border rounded"
            placeholder="Priority"
          />

          {/* Tombol Save dan Cancel */}
          <div className="flex justify-between mt-4">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-400 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Tampilan Data Task */}
          <h2 className="text-lg font-semibold text-primary-bluePrimary">
            {task.task_name}
          </h2>
          <p>Deadline: {new Date(task.deadline).toLocaleString()}</p>
          <p>Duration: {task.duration} minutes</p>
          <p>Priority: {task.priority}</p>

          {/* Tombol Edit dan Delete */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-primary-bluePrimary text-white px-3 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="bg-primary-yellowPrimary text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
