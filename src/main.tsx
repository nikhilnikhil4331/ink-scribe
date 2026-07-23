import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global error handlers — prevent mobile crashes from showing blank screen
window.addEventListener('error', (event) => {
  console.error('🔴 Global JS Error:', event.error?.message || event.message);
  // Prevent the error from crashing the page completely
  // React ErrorBoundary will handle React component errors
  event.preventDefault?.();
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🔴 Unhandled Promise Rejection:', event.reason);
  // Prevent unhandled promise rejections from crashing
  event.preventDefault?.();
});

createRoot(document.getElementById("root")!).render(<App />);
