import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Function untuk menangani perubahan input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Redirect setelah OAuth Google login berhasil
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");

    if (accessToken) {
      localStorage.setItem("token", accessToken); // Simpan token di localStorage
      navigate("/schedule"); // Redirect ke halaman Schedule
    }
  }, [navigate]);

  // Fungsi untuk menghandle submit form signup biasa
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Signup failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      navigate("/schedule");
    } catch (err) {
      setError(err.message);
    }
  };

  // Fungsi untuk login/signup menggunakan Google OAuth
  const handleGoogleSignup = () => {
    window.location.href = "/api/auth/google"; // Redirect ke backend Google OAuth endpoint
  };

  return (
    <section className="bg-white">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
            <img
              alt="Background"
              src="https://images.unsplash.com/photo-1617195737496-bc30194e3a19?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
            <div className="hidden lg:relative lg:block lg:p-12">
              <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                Welcome to Taskly
              </h2>
              <p className="mt-4 leading-relaxed text-white/90">
                Manage your tasks efficiently with Taskly.
              </p>
            </div>
          </section>

        <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
          <div className="max-w-xl lg:max-w-3xl">
            <h1 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
              Sign Up
            </h1>
            <p className="mt-4 leading-relaxed text-gray-500">
              Create your account to start managing your tasks and schedule.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-6 gap-6">
              {error && <p className="col-span-6 text-red-500 text-sm">{error}</p>}

              <div className="col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-2 mt-2 border rounded-lg"
                />
              </div>

              <div className="col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-2 mt-2 border rounded-lg"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-2 mt-2 border rounded-lg"
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-2 mt-2 border rounded-lg"
                />
              </div>

              <div className="col-span-6">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg"
                >
                  Sign Up
                </button>
              </div>
            </form>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignup}
                className="flex items-center justify-center w-full px-4 py-2 text-gray-700 border rounded-lg"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                Sign up with Google
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-500 text-center">
              Already have an account?
              <Link to="/login" className="text-blue-600 ml-2 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </main>
      </div>
    </section>
  );
}

export default Signup;
