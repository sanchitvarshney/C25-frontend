import { Button, Divider, Empty, Row, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import SlidingPanel from "./SlidingPanel";
import UploadArea from "./UploadArea";
import ImageCard from "./ImageCard";
import type { FileUploadItem } from "./types";

interface UploadDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number | string;
  getContainer?: HTMLElement | (() => HTMLElement | null);
  accept?: string;
  multiple?: boolean;
  items: FileUploadItem[];
  onFilesSelected: (files: File[]) => void;
  onDelete: (uid: string) => void;
  onReplace: (uid: string, file: File) => void;
  onRetry: (uid: string) => void;
  onUploadAll: () => void;
  loading?: boolean;
}

export default function UploadDrawer({
  open,
  onClose,
  title = "Upload Files",
  width = 320,
  getContainer,
  accept,
  multiple,
  items,
  onFilesSelected,
  onDelete,
  onReplace,
  onRetry,
  onUploadAll,
  loading =false,
}: UploadDrawerProps) {
  const pendingCount = items.filter(
    (item) => item.status === "idle" || item.status === "error",
  ).length;

  return (
    <SlidingPanel open={open} onClose={onClose} title={title} width={width} container={getContainer} >
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100% - 0px)",  }}>


        <div style={{ flexShrink: 0 }}>
          <UploadArea accept={accept} multiple={multiple} onFilesSelected={onFilesSelected} />
        </div>
         <Divider style={{ margin: "12px 0" }} />
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
              <Spin />
            </div>
          ) : items.length ? (
            <Row gutter={[0, 0]}>
              {items.map((item) => (
                <ImageCard
                  key={item.uid}
                  item={item}
                  accept={accept}
                  onDelete={onDelete}
                  onReplace={onReplace}
                  onRetry={onRetry}
                />
              ))}
            </Row>
          ) : (
            <Empty description="No files uploaded yet" style={{ marginTop: 32 }} />
          )}
        </div>

        {pendingCount > 0 && (
          <div style={{ flexShrink: 0, paddingTop: 12 }}>
            <Divider style={{ margin: "0 0 12px" }} />
            <Button
              type="primary"
              icon={<UploadOutlined />}
              block
              onClick={onUploadAll}
            >
              Upload {pendingCount} file{pendingCount > 1 ? "s" : ""}
            </Button>
          </div>
        )}

      </div>
    </SlidingPanel>
  );
}
