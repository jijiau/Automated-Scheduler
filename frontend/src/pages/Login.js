import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const schema = Yup.object().shape({
  email: Yup.string()
    .email("Email tidak valid")
    .required("Email wajib diisi")
    .matches(/^[^\s@]+@[^\s@]+\.(com|org|net|ac\.id|co\.uk)$/, "Email tidak valid"),
  password: Yup.string()
    .required("Password wajib diisi")
    .min(8, "Password minimal 8 karakter"),
});

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      toast.success("Login berhasil! Selamat datang!");
      localStorage.setItem("token", response.data.token);
      navigate("/home");
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Terjadi kesalahan saat login";
      toast.error(errorMessage);
    }
  };

  return (
    <div>
      {/* Tambahkan template UI yang sudah Anda buat */}
    </div>
  );
};

export default Login;