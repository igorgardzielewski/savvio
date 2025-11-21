import {platformSelect} from "nativewind/theme";
import {StyleSheet} from "react-native";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        safe: "#16c47f",
        danger: "#f87171",
        warning: "#ffcc4d",
        heading: "#414054",
        headingMeta: "#6B7280",
        amount: "#F87171",
        amountMeta: "#374151",
        accent: "#6B5AED",
      }
    },
  },
  plugins: [],
};