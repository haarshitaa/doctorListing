/** @type {import('tailwindcss').Config} */
export default {
	content: [
	  "./index.html",
	  "./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
	  extend: {
		colors: {
		  // <-- add your custom name here
		  background: "#F3F4F6",
		},
		width: {
		  custom: "350px",
		  xl: "48rem",
		},
	  },
	},
	plugins: [],
  };
  
