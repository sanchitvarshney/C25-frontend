import { Button, Dropdown, Space } from "antd";


const ConfirmationNotifyModal = ({
  setOpen,
  open,
  children,
  onConfirm,
  confirmLoading = false,
}) => {
  const handleOk = async () => {
    if (onConfirm) {
      await onConfirm();
    } else {
      setOpen(false);
    }
  };
  const handleCancel = () => {
    if (!confirmLoading) setOpen(false);
  };

  const content = (
    <div
      style={{
        background: "#fff",
        padding: 16,
        borderRadius: 8,
        boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
        width: 200,
      }}
    >
      <p style={{ marginBottom: 12 }}>Delete all notifications?</p>

      <Space style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button size="small" onClick={handleCancel} disabled={confirmLoading}>
          Cancel
        </Button>
        <Button
          size="small"
          type="primary"
          danger
          loading={confirmLoading}
          onClick={handleOk}
        >
          OK
        </Button>
      </Space>
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={["click"]}
      dropdownRender={() => content}
      getPopupContainer={(trigger) =>
        trigger.closest(".notification-dropdown") || document.body
      }
      
    >
      {children}
    </Dropdown>
  );
};

export default ConfirmationNotifyModal;

