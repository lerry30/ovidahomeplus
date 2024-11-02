/** @type {import('tailwindcss').Config} */
export default {
	content: [
    	"./index.html",
    	"./src/**/*.{js,ts,jsx,tsx}",
  	],
  	theme: {
    	extend: {
			width: {
				'admin-sidebar': 'var(--admin-sidebar-width)'
			},
			inset: {
				'admin-sidebar': 'var(--admin-sidebar-width)'
			}
    	},
  	},
  	plugins: [],
}