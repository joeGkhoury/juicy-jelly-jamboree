import type { Config } from "tailwindcss";

export default {
	darkMode: "class",
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		fontFamily: {
			sans: ["Inter", "sans-serif"],
		},
		colors: {
			primaryBackground: "#F0F0F0",
			secondaryBackground: "#FFFFFF",
			interactiveHighlight: "#E0E0E0",
			textColorPrimary: "#333333",
			textColorSecondary: "#777777",
			iconColor: "#666666",
			border: "#DDDDDD",
			white: "#FFFFFF",
			black: "#000000",
		},
		borderRadius: {
			DEFAULT: "8px",
			lg: "8px",
			md: "6px",
			sm: "4px",
		},
		extend: {
			boxShadow: {
				subtle: "0px 2px 4px rgba(0,0,0,0.05)",
			},
			spacing: {
				sm: "8px",
				md: "16px",
				lg: "24px",
			},
		}
	},
	plugins: [],
} satisfies Config;
