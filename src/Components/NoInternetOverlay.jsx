import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import {  WifiOff } from "@mui/icons-material";

// const formatTime = (seconds) => {
//   const hours = Math.floor(seconds / 3600);
//   const mins = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;
//   return `${hours.toString().padStart(2, "0")}:${mins
//     .toString()
//     .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
// };

const NoInternetOverlay = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {children}
      {!isOnline && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            zIndex: 1200,
          }}
          aria-live="polite"
          role="alert"
        >
          {/* Row: Icon + Text */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3,
              border: "1px solid #ccc",
              p: 4,
              boxShadow: "0px 5px 2px 1px #c5c5c5",
              backgroundColor: "#ffffff"
            }}
          >
            {/* Icon Left */}
            <WifiOff
              sx={{
                fontSize: 72,
                color: "#f44336",
                mr: 2,
              }}
            />

            {/* Right Side: Heading + Description */}
            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: "#000",
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                You are Offline...
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#666",
                  lineHeight: 1.4,
            
                }}
              >
                Your internet connection has lost, check your internet connection...
              </Typography>
                <Typography
                variant="body2"
                sx={{
                  color: "#666",
                  lineHeight: 1.4,
                  mb: 1,
                  fontSize:12
                }}
              >
                as your internet will stable this notification will automatically remove.
              </Typography>
            </Box>
          </Box>
        </div>
      )}
    </>
  );
};

export default NoInternetOverlay;
