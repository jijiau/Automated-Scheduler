import React, { useState, useEffect } from "react";
import QRCode from 'qrcode';

const TaskCard = ({ task, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false); // State untuk mode edit
  const [editData, setEditData] = useState(task); // State untuk data yang sedang diedit
  const [showModal, setShowModal] = useState(false); // State untuk modal pembayaran
  const [paymentData, setPaymentData] = useState(null); // Data pembayaran yang diambil dari API
  const [paymentURL, setPaymentURL] = useState(null); // QR Code URL
  const [loadingPayment, setLoadingPayment] = useState(false); // Loading state untuk pembayaran
  const [paymentError, setPaymentError] = useState(null); // Error state untuk pembayaran
  const [statusData, setStatusData] = useState(null); // Payment status data
  const [loadingStatus, setLoadingStatus] = useState(false); // Loading state untuk status
  const API_BASE_URL = "https://api.taskly.web.id";

  // Sync task data with props
  useEffect(() => {
    setEditData(task);
  }, [task]);

  // Save changes
  const handleSave = () => {
    onSave(editData);
    setIsEditing(false);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditData(task);
    setIsEditing(false);
  };

  // Initiate payment
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
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Payment initiation failed");
      }

      const data = await response.json();
      QRCode.toDataURL(`solana:${data.paymentData.walletAddress}?amount=${data.paymentData.amount}`, function (err, url) {
        setPaymentData(data.paymentData);
        setPaymentURL(url);
        setShowModal(true);
      });
    } catch (error) {
      setPaymentError(error.message);
    } finally {
      setLoadingPayment(false);
    }
  };

  // Check payment status
  const handleCheckStatus = async () => {
    setLoadingStatus(true);
    setPaymentError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/tasks/status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentID: paymentData.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch payment status");
      }

      const data = await response.json();
      setStatusData(data.paymentStatus);
    } catch (error) {
      setPaymentError(error.message);
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between">
      {isEditing ? (
        <div>
          <input
            type="text"
            value={editData.task_name}
            onChange={(e) =>
              setEditData({ ...editData, task_name: e.target.value })
            }
            className="w-full mb-2 px-2 py-1 border rounded"
            placeholder="Task Name"
          />

          <input
            type="datetime-local"
            value={editData.deadline}
            onChange={(e) =>
              setEditData({ ...editData, deadline: e.target.value })
            }
            className="w-full mb-2 px-2 py-1 border rounded"
          />

          <input
            type="number"
            value={editData.duration}
            onChange={(e) =>
              setEditData({ ...editData, duration: e.target.value })
            }
            className="w-full mb-2 px-2 py-1 border rounded"
            placeholder="Duration (minutes)"
          />

          <input
            type="number"
            value={editData.priority}
            onChange={(e) =>
              setEditData({ ...editData, priority: e.target.value })
            }
            className="w-full mb-2 px-2 py-1 border rounded"
            placeholder="Priority"
          />

          <div className="flex justify-between mt-4">
            <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
            <button onClick={handleCancel} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-primary-bluePrimary">{task.task_name}</h2>
          <p>Deadline: {new Date(task.deadline).toLocaleString()}</p>
          <p>Duration: {task.duration} minutes</p>
          <p>Priority: {task.priority}</p>

          <div className="flex justify-between mt-4">
            <button onClick={() => setIsEditing(true)} className="bg-primary-bluePrimary text-white px-3 py-1 rounded">Edit</button>
            <button onClick={() => onDelete(task.id)} className="bg-primary-yellowPrimary text-white px-3 py-1 rounded">Delete</button>
            <button onClick={handlePay} className="bg-purple-600 text-white px-3 py-1 rounded">
              {loadingPayment ? "Processing..." : "Pay"}
            </button>
          </div>

          {showModal && paymentData && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Payment Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img src={paymentURL} alt="QR Code for Wallet Address" className="w-32 h-32" />
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    <p>Scan this QR code to make your payment</p>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Amount:</strong> {paymentData.amount} {paymentData.currency}</p>
                    <p><strong>Wallet Address:</strong> <span className="break-words">{paymentData.walletAddress}</span></p>
                    <p><strong>Expires At:</strong> {new Date(paymentData.expireAt).toLocaleString()}</p>
                    <p>
                      <button onClick={handleCheckStatus} className="text-blue-500 underline">
                        {loadingStatus ? "Checking..." : "Check Payment Status"}
                      </button>
                    </p>
                  </div>
                  {statusData && (
                    <div className="mt-4 text-gray-800">
                      <p><strong>Status:</strong> {statusData.isPaid ? "Paid" : "Unpaid"}</p>
                      <p><strong>Expired:</strong> {statusData.isExpired ? "Yes" : "No"}</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded hover:bg-gray-700">Close</button>
                </div>
              </div>
            </div>
          )}

          {paymentError && <p className="text-red-600 mt-4">{paymentError}</p>}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
