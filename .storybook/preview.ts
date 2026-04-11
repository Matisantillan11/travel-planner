import { definePreview } from "@storybook/nextjs";
import "../app/globals.css";

// Apply dark class to <html> on every story load so @custom-variant dark activates.
// Matches the app's html.dark setup in layout.tsx.
export const beforeEach = async () => {
  document.documentElement.classList.add("dark");
};

export default definePreview({
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "hsl(222.2 84% 4.9%)" }],
    },
  },
});
