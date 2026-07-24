import { cloneElement, isValidElement, useCallback, useState } from "react";
import type { MouseEvent, ReactElement } from "react";
import UploadDrawer from "./UploadDrawer";
import useFileUpload from "./hooks/useFileUpload";
import type { FileUploadProps } from "./types";

export default function FileUpload({
  accept,
  multiple = true,
  maxFiles,
  maxFileSize,
  defaultFiles,
  onUpload,
  onUploadBatch,
  onDelete,
  onChange,
  children,
  title,
  drawerWidth,
  getContainer,
  loading,
}: FileUploadProps) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const handleClose = useCallback(() => setOpen(false), []);
  const { items, addFiles, replaceFile, retryFile, deleteFile, uploadAll } = useFileUpload({
    accept,
    multiple,
    maxFiles,
    maxFileSize,
    onUpload,
    onUploadBatch,
    onDelete,
    onChange,
    defaultFiles,
  });

  const handleUploadAll = useCallback(async () => {
    const result = await uploadAll();
    if (result?.success) {
      setCollapsed(true);
    }
  }, [uploadAll]);

  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<{ onClick?: (e: MouseEvent) => void }>, {
        onClick: (event: MouseEvent) => {
          //@ts-ignore
          children.props?.onClick?.(event);
          if (!open) {
            setOpen(true);
            setCollapsed(false);
          } else {
            setCollapsed((c) => !c);
          }
        },
      })
    : children;

  return (
    <>
      {trigger}
      <UploadDrawer
        open={open}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        onClose={handleClose}
        title={title}
        width={drawerWidth}
        getContainer={getContainer}
        accept={accept}
        multiple={multiple}
        items={items}
        onFilesSelected={addFiles}
        onDelete={deleteFile}
        onReplace={replaceFile}
        onRetry={retryFile}
        onUploadAll={handleUploadAll}
        loading={loading}
      />
    </>
  );
}
