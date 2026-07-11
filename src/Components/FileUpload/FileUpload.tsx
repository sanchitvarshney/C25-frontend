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

  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<{ onClick?: (e: MouseEvent) => void }>, {
        onClick: (event: MouseEvent) => {
          //@ts-ignore
          children.props?.onClick?.(event);
          setOpen(true);
        },
      })
    : children;

  return (
    <>
      {trigger}
      <UploadDrawer
        open={open}
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
        onUploadAll={uploadAll}
        loading={loading}
      />
    </>
  );
}
