/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'], // Existing font family
        sfpro: ['sfprobold', 'sfpromed'], // Add your custom font here
      },
      colors: {
        "custom-bg": "#E3EDF7",
        "custom-blue": "#007bff",
      },
    },
  },
  plugins: [
    require("rippleui"),
  ],
};
