import  { createContext, useState, useEffect } from "react";
import ToastShow from "../Components/ToastShow";

export const ToastCreateContext = createContext(undefined);


let globalShowToast = null;

export const getGlobalToast = () => {
  return globalShowToast;
};

export const ToastContext = ({ children }) => {
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (msg, type = "success") => {
   
    setToastMessage(msg);
    setToastType(type);
    setToastOpen(true);
  };

  
  useEffect(() => {
    globalShowToast = showToast;
    return () => {
      globalShowToast = null;
    };
  }, []);

  const handleToastClose = () => {
    setToastOpen(false);
  };

  return (
    <ToastCreateContext.Provider value={{ showToast }}>
      {children}
      <ToastShow
        isOpen={toastOpen}
        msg={toastMessage}
        type={toastType}
        onClose={handleToastClose}
      />
    </ToastCreateContext.Provider>
  );
};