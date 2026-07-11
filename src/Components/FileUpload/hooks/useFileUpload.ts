import { useCallback, useEffect, useRef, useState } from "react";
import type { FileUploadItem, FileUploadProps } from "../types";
import {
  formatFileSize,
  generateUid,
  matchAccept,
  readImageDimensions,
} from "../utils";
//@ts-ignore
import {useToast} from "../../../hooks/useToast";

type UseFileUploadArgs = Pick<
  FileUploadProps,
  | "accept"
  | "multiple"
  | "maxFiles"
  | "maxFileSize"
  | "onUpload"
  | "onUploadBatch"
  | "onDelete"
  | "onChange"
  | "defaultFiles"
>;

export default function useFileUpload({
  accept,
  multiple = true,
  maxFiles,
  maxFileSize,
  onUpload,
  onUploadBatch,
  onDelete,
  onChange,
  defaultFiles,
}: UseFileUploadArgs) {
  const { showToast } = useToast();
  const [items, setItems] = useState<FileUploadItem[]>(() =>
    (defaultFiles ?? []).map((f) => ({
  
      ...f,
      uid: f.uid ?? generateUid(),
    })),
  );
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
  
    onChange?.(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(
    () => () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    },
    [],
  );

  const updateItem = useCallback(
    (uid: string, patch: Partial<FileUploadItem>) => {
      setItems((prev) =>
        prev.map((it) => (it.uid === uid ? { ...it, ...patch } : it)),
      );
    },
    [],
  );

  const uploadItem = useCallback(
    async (uid: string, file: File) => {
      if (!onUpload) {
        updateItem(uid, { status: "success", progress: 100 });
        return;
      }
      updateItem(uid, { status: "uploading", progress: 0, error: undefined });
      try {
        const response = await onUpload(file, (percent) =>
          updateItem(uid, { progress: percent }),
        );
        if (response?.success === false) {
          updateItem(uid, {
            status: "error",
            error: response?.message || "Upload failed",
          });
          return;
        }
        updateItem(uid, {
          status: "success",
          progress: 100,
          response,
          url: response?.url ?? response?.data?.url ?? undefined,
        });
      } catch (error: any) {
        updateItem(uid, {
          status: "error",
          error: error?.message || "Upload failed",
        });
      }
    },
    [onUpload, updateItem],
  );

  const addFiles = useCallback(
    async (fileList: File[]) => {
      const currentCount = itemsRef.current.length;
      let incoming = multiple ? fileList : fileList.slice(0, 1);

      if (maxFiles && currentCount + incoming.length > maxFiles) {
        const allowed = Math.max(maxFiles - currentCount, 0);
        if (allowed <= 0) {
          showToast(`You can only upload up to ${maxFiles} file(s).`, "error");
          return;
        }
        showToast(
          `Only ${allowed} of ${incoming.length} file(s) added — limit is ${maxFiles}.`,
          "error",
        );
        incoming = incoming.slice(0, allowed);
      }

      const validFiles: File[] = [];
      incoming.forEach((file) => {
        if (!matchAccept(file, accept)) {
          showToast(`"${file.name}" is not an accepted file type.`, "error");
          return;
        }
        if (maxFileSize && file.size > maxFileSize) {
          showToast(
            `"${file.name}" exceeds the ${formatFileSize(maxFileSize)} size limit.`,
            "error",
          );
          return;
        }
        validFiles.push(file);
      });

      if (!validFiles.length) return;

      const newItems: FileUploadItem[] = await Promise.all(
        validFiles.map(async (file) => {
          const isImage = file.type.startsWith("image/");
          const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
          const dims = previewUrl ? await readImageDimensions(previewUrl) : {};
          return {
            uid: generateUid(),
            name: file.name,
            size: file.size,
            type: file.type || "unknown",
            status: "idle",
            progress: 0,
            previewUrl,
            uploadDate: new Date().toISOString(),
            file,
            ...dims,
          } as FileUploadItem;
        }),
      );

      setItems((prev) => (multiple ? [...prev, ...newItems] : newItems));
    },
    [accept, maxFiles, maxFileSize, multiple, showToast],
  );

  const replaceFile = useCallback(
    (uid: string, file: File) => {
      if (!matchAccept(file, accept)) {
        showToast(`"${file.name}" is not an accepted file type.`, "error");
        return;
      }
      if (maxFileSize && file.size > maxFileSize) {
        showToast(
          `"${file.name}" exceeds the ${formatFileSize(maxFileSize)} size limit.`,
          "error",
        );
        return;
      }
      const previous = itemsRef.current.find((it) => it.uid === uid);
      if (previous?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previous.previewUrl);
      }
      const isImage = file.type.startsWith("image/");
      const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
      updateItem(uid, {
        name: file.name,
        size: file.size,
        type: file.type || "unknown",
        status: "idle",
        progress: 0,
        previewUrl,
        url: undefined,
        uploadDate: new Date().toISOString(),
        file,
        error: undefined,
        response: undefined,
        width: undefined,
        height: undefined,
      });
      if (previewUrl) {
        readImageDimensions(previewUrl).then((dims) => updateItem(uid, dims));
      }
      uploadItem(uid, file);
    },
    [accept, maxFileSize, showToast, updateItem, uploadItem],
  );

  const retryFile = useCallback(
    (uid: string) => {
      const target = itemsRef.current.find((it) => it.uid === uid);
      if (target?.file) uploadItem(uid, target.file);
    },
    [uploadItem],
  );

  const uploadAll = useCallback(async () => {
    const pending = itemsRef.current.filter(
      (item) => (item.status === "idle" || item.status === "error") && item.file,
    );
    if (!pending.length) return;

    if (!onUploadBatch) {
      pending.forEach((item) => uploadItem(item.uid, item.file as File));
      return;
    }

    pending.forEach((item) =>
      updateItem(item.uid, { status: "uploading", progress: 0, error: undefined }),
    );
    try {
      const response = await onUploadBatch(
        pending.map((item) => item.file as File),
      );
      if (response?.success === false) {
        pending.forEach((item) =>
          updateItem(item.uid, {
            status: "error",
            error: response?.message || "Upload failed",
          }),
        );
        return;
      }
      pending.forEach((item) =>
        updateItem(item.uid, {
          status: "success",
          progress: 100,
          response,
          url: response?.url ?? response?.data?.url ?? undefined,
        }),
      );
    } catch (error: any) {
      pending.forEach((item) =>
        updateItem(item.uid, {
          status: "error",
          error: error?.message || "Upload failed",
        }),
      );
    }
  }, [onUploadBatch, uploadItem, updateItem]);

  const deleteFile = useCallback(
    async (uid: string) => {
      const target = itemsRef.current.find((it) => it.uid === uid);
      if (!target) return;
      try {
        await onDelete?.(target);
        if (target.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(target.previewUrl);
        }
        setItems((prev) => prev.filter((it) => it.uid !== uid));
      } catch (error: any) {
        showToast(error?.message || "Failed to delete file.", "error");
      }
    },
    [onDelete, showToast],
  );

  return { items, addFiles, replaceFile, retryFile, deleteFile, uploadAll };
}
