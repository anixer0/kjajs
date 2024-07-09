/** @type {import('tailwindcss').Config}*/
const config = {
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		"./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}"
	],

	plugins: [require("flowbite/plugin")],

	darkMode: "class",
	theme: {
		colors: {
			primary: {
				50: "#FFE9E3",
				100: "#FFE0D8",
				200: "#FFD0C6",
				300: "#FFBCAF",
				400: "#FFA898",
				500: "#F58E72",
				600: "#EF7A5B",
				700: "#EA6B49",
				800: "#E55C37",
				900: "#E04D25"
			},
			secondary: {
				50: "#FEFBF9",
				100: "#FEF7F3",
				200: "#FEF0E9",
				300: "#FDEADF",
				400: "#FCE2D2",
				500: "#F8B995",
				600: "#F7AC7E",
				700: "#F69E67",
				800: "#F59050",
				900: "#F48239"
			},
			tertiary: {
				50: "#FEF7F3",
				100: "#FEF0E9",
				200: "#FDDFC8",
				300: "#FCCFA8",
				400: "#FBBC87",
				500: "#E69D77",
				600: "#E58D67",
				700: "#E47C57",
				800: "#E36C47",
				900: "#E25B37"
			},
			accent: {
				50: "#FEF1EF",
				100: "#FEE6E1",
				200: "#FDD3CB",
				300: "#FCBCAF",
				400: "#FB9F8F",
				500: "#D26A4D",
				600: "#CB5F3E",
				700: "#C45430",
				800: "#BD4922",
				900: "#B63E14"
			},
			neutral: {
				50: "#F7EDEB",
				100: "#EFDCD9",
				200: "#E2C1BD",
				300: "#D5A7A1",
				400: "#C88D85",
				500: "#A34A2A",
				600: "#9A4426",
				700: "#913E22",
				800: "#88381E",
				900: "#7F321A"
			}
		}
	}
};

module.exports = config;
