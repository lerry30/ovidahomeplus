/** @type {import('tailwindcss').Config} */
export default {
	content: [
    	"./index.html",
    	"./src/**/*.{js,ts,jsx,tsx}",
  	],
  	theme: {
    	extend: {
			width: {
				'admin-sidebar-sm': 'var(--admin-sidebar-width-sm)',
				'admin-sidebar-lg': 'var(--admin-sidebar-width-lg)'
			},
			inset: {
				'admin-sidebar-sm': 'var(--admin-sidebar-width-sm)',
				'admin-sidebar-lg': 'var(--admin-sidebar-width-lg)'
			}
    	},
  	},
  	plugins: [],
}