import { memo, useState } from "react";
import { Col, Image, Popconfirm, Progress, Tooltip } from "antd";
import {
  DeleteFilled,
  EyeOutlined,
  FileOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";


import type { FileUploadItem } from "./types";

interface ImageCardProps {
  item: FileUploadItem;
  accept?: string;
  onDelete: (uid: string) => void;
  onReplace: (uid: string, file: File) => void;
  onRetry: (uid: string) => void;
}

function ImageCard({
  item,
  accept,
  onDelete,
  onReplace,
  onRetry,
}: ImageCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const isImage = item.type?.startsWith("image/");
  const thumb = item.previewUrl ?? item.url;
  const isPending = item.status === "idle";

  const handleReplaceClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    if (accept) input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) onReplace(item.uid, file);
    };
    input.click();
  };



  return (
    <Col span={24}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "6px 4px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            flexShrink: 0,
            borderRadius: 6,
            overflow: "hidden",
            background: "#fafafa",
            border: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {isImage && thumb ? (
            <Image
              src={thumb}
              height={36}
              width={36}
              style={{ objectFit: "cover" }}
              preview={{ visible: previewOpen, onVisibleChange: setPreviewOpen }}
            />
          ) : (
            <FileOutlined style={{ fontSize: 16, color: "#bfbfbf" }} />
          )}

        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span
            title={item.name}
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: 13,
            }}
          >
            {item.name}
          </span>
          {item.status === "uploading" && (
            <Progress percent={item.progress} size="small" showInfo={false} />
          )}
          {item.status === "error" && (
            <span style={{ fontSize: 12, color: "#ff4d4f" }}>{item.error || "Upload failed"}</span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {isPending ? (
            <Popconfirm
              title="Remove this file?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => onDelete(item.uid)}
            >
              <DeleteFilled style={{ fontSize: 13, cursor: "pointer" }} />
            </Popconfirm>
          ) : (
            <>
              <Tooltip title="Preview">
                <EyeOutlined
                  onClick={() => isImage && thumb && setPreviewOpen(true)}
                  style={{ opacity: isImage && thumb ? 1 : 0.35, fontSize: 13, cursor: "pointer" }}
                />
              </Tooltip>
              {/* {item.status === "error" ? (
              {item.status === "error" ? (
                <Tooltip title="Retry upload">
                  <ReloadOutlined onClick={() => onRetry(item.uid)} style={{ fontSize: 13, cursor: "pointer" }} />
                </Tooltip>
              ) : (
                <Tooltip title="Replace">
                  <UploadOutlined onClick={handleReplaceClick} style={{ fontSize: 13, cursor: "pointer" }} />
                </Tooltip>
              )} */}
              <Popconfirm
                title="Remove this file?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => onDelete(item.uid)}
              >
                <DeleteFilled style={{ fontSize: 13, cursor: "pointer" }} />
              </Popconfirm>
            </>
          )}
        </div>
      </div>
    </Col>
  );
}

export default memo(ImageCard);
