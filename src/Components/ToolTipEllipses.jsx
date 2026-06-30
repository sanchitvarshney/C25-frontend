import { Tooltip, Typography } from "antd";
import React from "react";
import { customColor } from "../utils/customColor";

export default function ToolTipEllipses({ text, type, copy, width }) {
  return (
    <Tooltip
      styles={{ root: { fontSize: "0.7rem", color: "white" } }}
      placement="topLeft"
      title={text}
      color= {customColor.newBgColor}
    >
      {type == "Paragraph" ? (
        <Typography.Text ellipsis={{ width: "100%" }}> {text} </Typography.Text>
      ) : (
        <Typography.Text
          copyable={copy && { tooltips: false }}
          style={{
            fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
            width: "100%",
          }}
          ellipsis={{ width: "100%" }}
        >
          {text}
        </Typography.Text>
      )}
    </Tooltip>
  );
}
