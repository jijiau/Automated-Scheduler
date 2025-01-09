import React, { useState, useEffect } from "react";

const TaskCard = ({ task, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false); // State untuk mode edit
  const [editData, setEditData] = useState(task); // State untuk data yang sedang diedit
  const [showModal, setShowModal] = useState(false); // State untuk modal pembayaran
  const [paymentData, setPaymentData] = useState(null); // Data pembayaran yang diambil dari API
  const [loadingPayment, setLoadingPayment] = useState(false); // Loading state untuk pembayaran
  const [paymentError, setPaymentError] = useState(null); // Error state untuk pembayaran
  const API_BASE_URL = "https://api.taskly.web.id";

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

  // Fungsi untuk memulai pembayaran
  const handlePay = async () => {
    setLoadingPayment(true);
    setPaymentError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/tasks/payment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Payment initiation failed");
      }

      const data = await response.json();
      setPaymentData(data.paymentData);
      setShowModal(true); // Tampilkan modal dengan data pembayaran
    } catch (error) {
      setPaymentError(error.message);
    } finally {
      setLoadingPayment(false);
    }
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

          {/* Tombol Edit, Delete, dan Pay */}
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
            <button
              onClick={handlePay}
              className="bg-purple-600 text-white px-3 py-1 rounded"
            >
              {loadingPayment ? "Processing..." : "Pay"}
            </button>
          </div>

          {/* Modal untuk Pembayaran */}
          {showModal && paymentData && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
                <h3 className="text-lg font-bold mb-4">Payment Details</h3>
                <p>
                  <strong>Amount:</strong> {paymentData.amount} {paymentData.currency}
                </p>
                <p>
                  <strong>Wallet Address:</strong> {paymentData.walletAddress}
                </p>
                <p>
                  <strong>Expires At:</strong>{" "}
                  {new Date(paymentData.expireAt).toLocaleString()}
                </p>
                <p>
                  <a
                    href={paymentData.checkPaid}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Check Payment Status
                  </a>
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-600 text-white px-4 py-2 rounded mt-4"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Error handling */}
          {paymentError && (
            <p className="text-red-600 mt-4">{paymentError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
