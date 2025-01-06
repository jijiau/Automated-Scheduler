/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bluePrimary: "#0078D7", // Warna biru
          yellowPrimary: "#FFD700", // Warna kuning
          orangePrimary: "#FFA500", // Warna oranye muda
          orangeDark: "#FF8C00", // Warna oranye gelap
        }
      },
    },
  },
  plugins: [],
}