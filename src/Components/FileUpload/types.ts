import type { ReactElement } from "react";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface FileUploadItem {
  uid: string;
  name: string;
  size: number;
  type: string;
  status: UploadStatus;
  progress: number;
  /** Local object URL used for instant image preview before/while uploading. */
  previewUrl?: string;
  /** Server URL of the uploaded file, once available. */
  url?: string;
  uploadDate?: string;
  width?: number;
  height?: number;
  error?: string;
  /** Original browser File, kept around to support retry/replace. */
  file?: File;
  
  /** Whatever the onUpload promise resolved with. */
  response?: any;
}

export interface FileUploadProps {
  /** Same semantics as the native input accept attribute, e.g. "image/*" or ".pdf,.doc". */
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  loading?: boolean;
  /** Max size per file, in bytes. */
  maxFileSize?: number;
  defaultFiles?: FileUploadItem[];
  /**
   * Called once per selected file. Resolve with any server metadata (e.g. { url }) on
   * success, or throw/reject to mark the file as failed. When omitted, files are
   * treated as locally staged only (status flips straight to "success").
   */
  onUpload?: (
    file: File,
    onProgress?: (percent: number) => void,
  ) => Promise<any>;
  /**
   * Called once with every pending file when "Upload All" is triggered, so multiple
   * files are sent as a single multipart request instead of one request per file.
   * When provided, this takes priority over onUpload for the bulk upload action;
   * onUpload is still used for single-file retry/replace.
   */
  onUploadBatch?: (files: File[]) => Promise<any>;
  /** Called when the user removes a file. Throw/reject to keep the file in the list. */
  onDelete?: (file: FileUploadItem) => Promise<any> | void;
  /** Fired whenever the file list changes (add, remove, status update). */
  onChange?: (files: FileUploadItem[]) => void;
  /** Trigger element — FileUpload clones it and wires an onClick that opens the drawer. */
  children: ReactElement;
  title?: string;
  drawerWidth?: number | string;
  /**
   * DOM node the sliding panel portals into. Pass a function returning a page
   * section's element to confine the panel inside just that container instead of
   * the whole viewport. Defaults to document.body (full-viewport overlay).
   */
  getContainer?: HTMLElement | (() => HTMLElement | null);
}
