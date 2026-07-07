import { Row, Col, Modal } from "antd";
import MySelect from "../../../../Components/MySelect";
import { useState } from "react";
import { useEffect } from "react";

const SelectChallanTypeModal = ({
  typeOptions,
  setType,
  show,
  close,
}) => {
  const [selectType, setSelectType] = useState();
  const handleChangingType = () => {
    if (selectType) {
      setType(selectType);
      close();
    }
  };
// 
  useEffect(() => {
    setSelectType();
  }, [show]);
  return (
    <Modal
      title="Select challan type"
      open={show}
      onOk={handleChangingType}
      onCancel={close}
      width={400}
      okText="Create Challan"
    >
      <Row >
        <Col span={18}>
          <MySelect
            options={typeOptions}
            value={selectType}
            onChange={setSelectType}
            labelInValue
            placeholder="Select Challan Type"
          />
        </Col>
      </Row>
    </Modal>
  );
};

export default SelectChallanTypeModal;
