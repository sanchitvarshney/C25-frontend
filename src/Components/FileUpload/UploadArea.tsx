import { Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

interface UploadAreaProps {
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
}

export default function UploadArea({
  accept,
  multiple,
  onFilesSelected,
}: UploadAreaProps) {
  return (
    <Upload.Dragger
      accept={accept}
      multiple={multiple}
      showUploadList={false}
      beforeUpload={(file, fileList) => {
        // beforeUpload fires once per file in a batch; only act on the last one
        // so the whole batch is handed to onFilesSelected exactly once.
        const last = fileList[fileList.length - 1];
        if (file.uid === last.uid) {
          onFilesSelected(fileList as unknown as (UploadFile["originFileObj"] & File)[]);
        }
        return false;
      }}
      style={{ width: "100%", maxHeight: "100%",  }}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Click or drag file to this area to upload</p>
      <p className="ant-upload-hint">
        {accept ? `Supported formats: ${accept}` : "Any file type is supported"}
      </p>
    </Upload.Dragger>
  );
}
