import { useContext } from "react";
import { ToastCreateContext } from "../context/ToastContext";

export const useToast = () => {
  const context = useContext(ToastCreateContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};