import { Button, Empty } from "antd";
import React from "react";

export default function Page404() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
      }}
    >
      <Empty
        image="/assets/images/404image.png"
        styles={{ image: { height: 200 } }}
        description={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 800,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 30, fontWeight:"bold",color: "rgba(0,0,0,0.7)" }}>
              Page Not Found
            </span>
            <span style={{ fontSize: 20, color: "rgba(0,0,0,0.5)" }}>
              The page you are trying to access doesn't exist. please check if
              the URL is correct.
            </span>
   
          </div>
        }
      ></Empty>
    </div>
  );
}
