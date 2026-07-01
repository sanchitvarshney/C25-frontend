import { Modal } from "antd";

function SubmitConfirmModal({ open, handleCancel, loading, submitHandler }) {
  return (
    <Modal
      title="Submit Confirm"
      open={open}
      onOk={submitHandler}
      confirmLoading={loading}
      onCancel={handleCancel}
    >
      <p>Are you sure you want to submit this MIN?</p>
    </Modal>
  );
}

export default SubmitConfirmModal;
