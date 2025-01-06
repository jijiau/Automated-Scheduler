import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { IoEye, IoEyeOff } from "react-icons/io5";
import axios from "axios";
import { toast } from "sonner";

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
      const response = await axios.post(
        "https://api-motoran.faizath.com/login",
        {
          email: data.email,
          password: data.password,
        }
      );
      console.log(response.data)
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("email", data.email);

      toast.success("Login berhasil! Selamat datang!");
      console.log(response.data);
      navigate("/home");
    } catch (error) {
      // Cek status error 400
      if (error.response?.status === 400) {
        toast.error("Akun ini sudah terdaftar. Gunakan email yang lain");
      } else {
        // Pesan default untuk error lain
        toast.error(
          error.response?.data?.message || "Terjadi kesalahan saat login"
        );
      }
    }
  };

  return (
    <div>
      <div className="bg-white">
        <div className="flex justify-center h-screen">
          <div
            className="hidden lg:block lg:w-3/5 bg-cover bg-black bg-opacity-50 bg-blend-darken"
            style={{
              backgroundImage: `url('https://images.pexels.com/photos/3599586/pexels-photo-3599586.jpeg')`,
            }}
          >
            <div className="flex items-center h-full px-20 text-white">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">Motoran</h2>
                <p className="max-w-xl mt-3">
                  Layanan sewa motor digital yang praktis, cepat, dan aman.
                  Pilih, pesan, dan nikmati transportasi tanpa ribet kapan saja!
                  🚀
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center w-full max-w-md px-6 mx-auto lg:w-2/6">
            <div className="flex-1">
              <div className="text-center">
                <div className="flex justify-left mx-auto h-11 mb-5">
                  <img
                    className="w-auto h-16 sm:h-16"
                    src="/favicon.svg"
                    alt=""
                  />
                </div>

                <h1 className="text-left text-black text-2xl font-bold">Selamat datang di Motoran!</h1>
                <p className="mt-1 text-gray-500 text-left pr-12">
                  Silahkan masuk ke akun Anda untuk melakukan penyewaan motor.
                </p>
              </div>

              <div className="mt-7">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm text-gray-600 "
                    >
                      Alamat Email <strong className="text-red-500">*</strong>
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="example@example.com"
                      {...register("email")}
                      className={`"block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg  focus:border-blue-400  focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      onBlur={() => trigger("email")}
                    />
                    {errors.email && (
                      <p className="text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="mt-6 relative">
                    <div className="flex justify-between mb-2">
                      <label
                        htmlFor="password"
                        className="text-sm text-gray-600 "
                      >
                        Kata Sandi <strong className="text-red-500">*</strong>
                      </label>
                      <a
                        href="#"
                        className="text-sm text-gray-400 focus:text-blue-500 hover:text-blue-500 hover:underline"
                      >
                        Lupa Password?
                      </a>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      placeholder="Your Password"
                      {...register("password")}
                      className={`"block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg  focus:border-blue-400  focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      onBlur={() => trigger("password")}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-12 text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <IoEyeOff /> : <IoEye />}
                    </button>
                    {errors.password && (
                      <p className="text-red-500">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="mt-6">
                    <button className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-300 transform bg-secondary rounded-lg hover:bg-primary-dark focus:outline-none focus:bg-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50">
                      Masuk
                    </button>
                  </div>
                </form>

                <p className="mt-6 text-sm text-center text-gray-400">
                  Don&#x27;t have an account yet?{" "}
                  <Link
                    to="/signup"
                    className="text-primary-dark focus:outline-none focus:underline hover:underline"
                  >
                    Registrasi
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
