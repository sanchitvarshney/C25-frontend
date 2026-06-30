import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const Information = () => {
  const [visible, setVisible] = useState(false);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const { user } = useSelector((state) => state.login);
  const { pathname } = useLocation();

  const colors = [
    "#ff6b35", // Orange
    "#4ecdc4", // Teal
    "#45b7d1", // Blue
    "#96ceb4", // Mint
    "#feca57", // Yellow
  ];

  // Function to determine if text should be black based on background color
  const getTextColor = (backgroundColor) => {
    const lightColors = ["#96ceb4", "#feca57", "#ff9ff3", "#54a0ff"];
    return lightColors.includes(backgroundColor) ? "#333333" : "white";
  };

  const currentTextColor = getTextColor(colors[currentColorIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % colors.length);
    }, 3000); // Change color every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Show modal when user comes to dashboard after login (only once per session)
  useEffect(() => {
    if (user && user.token && pathname === "/") {
      const hasShownModal = sessionStorage.getItem("masterInfoModalShown");
      if (!hasShownModal) {
        // Small delay to ensure dashboard is loaded
        const timer = setTimeout(() => {
          setVisible(true);
          sessionStorage.setItem("masterInfoModalShown", "true");
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, pathname]);

  const handleOk = () => {
    setVisible(false);
  };

  // Auto-close modal after 5 seconds
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal
      open={visible}
      onCancel={handleOk}
      closable={false}
      footer={null}
      width={600}
      centered
      maskClosable={true}
      style={{
        padding: 0,
      }}
      bodyStyle={{
        background: colors[currentColorIndex],
        color: currentTextColor,
        padding: "24px",
        borderRadius: "8px",
        transition: "background-color 0.5s ease-in-out",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        fontWeight: 500,
        fontSize: "15px",
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: "20px" }}>ℹ️</span>
      <span>
        Master data is integrated with Oakter branch. Therefore, any data created in
        this system will automatically reflect in the Oakter branch.
      </span>
    </Modal>
  );
};

export default Information;
