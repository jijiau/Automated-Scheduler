import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Sesuai dokumentasi
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token); // Simpan JWT token di localStorage
      navigate("/schedule"); // Redirect ke halaman schedule
    } catch (err) {
      setError(err.message); // Tampilkan pesan error
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google"; // Redirect to Google OAuth
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
            <img
              src={Logo}  // Using the imported Logo image
              alt="Logo"
              className="w-20 h-20 object-contain"  // Adjust the size as needed
            />
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
              Login
            </h1>
            <p className="mt-4 leading-relaxed text-gray-500">
              Sign in to access your tasks and schedule.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-6 gap-6">
              {error && (
                <p className="col-span-6 text-red-500 text-sm">{error}</p>
              )}

              <div className="col-span-6">
                <label
                  htmlFor="Email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="Email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring focus:ring-blue-400 focus:outline-none focus:ring-opacity-40"
                />
              </div>

              <div className="col-span-6">
                <label
                  htmlFor="Password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="Password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-blue-400 focus:ring focus:ring-blue-400 focus:outline-none focus:ring-opacity-40"
                />
              </div>

              <div className="col-span-6">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg"
                >
                  Login
                </button>
              </div>
            </form>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
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

            <p className="mt-4 text-sm text-gray-500 sm:mt-0">
              Don’t have an account?
              <Link
                to="/signup"
                className="ml-2 text-blue-600 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </main>
      </div>
    </section>
  );
}

export default Login;