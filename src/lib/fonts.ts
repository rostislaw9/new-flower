import { Geist, New_Rocker } from "next/font/google";

export const fontDisplay = New_Rocker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const fontSans = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const fontClass = `font-sans ${fontDisplay.variable} ${fontSans.variable}`;
