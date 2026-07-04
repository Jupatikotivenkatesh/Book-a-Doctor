import React, { useState } from "react";
import { Upload, Button, Typography, List, Progress, message } from "antd";
import { UploadOutlined, FilePdfOutlined, FileImageOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/jpg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE_MB = 10;
const MAX_FILES = 5;

const FileUploader = ({ onFilesChange, disabled = false }) => {
  const [fileList, setFileList] = useState([]);

  const getIcon = (type) => {
    if (type?.includes("pdf")) return <FilePdfOutlined style={{ color: "#f5222d" }} />;
    if (type?.includes("image")) return <FileImageOutlined style={{ color: "#1890ff" }} />;
    return <FilePdfOutlined style={{ color: "#8c8c8c" }} />;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const beforeUpload = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      message.error(`${file.name}: Invalid file type. Only PDF, DOC, JPG, PNG allowed.`);
      return Upload.LIST_IGNORE;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      message.error(`${file.name}: File exceeds ${MAX_SIZE_MB}MB limit.`);
      return Upload.LIST_IGNORE;
    }
    if (fileList.length >= MAX_FILES) {
      message.error(`Maximum ${MAX_FILES} files allowed.`);
      return Upload.LIST_IGNORE;
    }
    const updated = [...fileList, file];
    setFileList(updated);
    if (onFilesChange) onFilesChange(updated);
    return false; // Prevent auto-upload; we send manually
  };

  const removeFile = (uid) => {
    const updated = fileList.filter((f) => f.uid !== uid);
    setFileList(updated);
    if (onFilesChange) onFilesChange(updated);
  };

  return (
    <div>
      <Upload
        beforeUpload={beforeUpload}
        showUploadList={false}
        multiple
        disabled={disabled || fileList.length >= MAX_FILES}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      >
        <Button
          icon={<UploadOutlined />}
          disabled={disabled || fileList.length >= MAX_FILES}
          style={{ borderRadius: 8 }}
        >
          Select Files ({fileList.length}/{MAX_FILES})
        </Button>
      </Upload>

      <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 6 }}>
        Accepted: PDF, DOC, DOCX, JPG, PNG — Max {MAX_SIZE_MB}MB each
      </Text>

      {fileList.length > 0 && (
        <List
          size="small"
          style={{ marginTop: 12, background: "#fafafa", borderRadius: 8, padding: "8px 0" }}
          dataSource={fileList}
          renderItem={(file) => (
            <List.Item
              style={{ padding: "6px 16px" }}
              actions={[
                <Button
                  key="remove"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => removeFile(file.uid)}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={getIcon(file.type)}
                title={
                  <Text style={{ fontSize: 13 }} ellipsis>
                    {file.name}
                  </Text>
                }
                description={
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {formatSize(file.size)}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default FileUploader;
