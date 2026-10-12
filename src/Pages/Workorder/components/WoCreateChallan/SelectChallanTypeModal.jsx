import { Row, Col, Modal } from "antd";
import MySelect from "../../../../Components/MySelect";
import { useState } from "react";
import { useEffect } from "react";

const SelectChallanTypeModal = ({ typeOptions, setType, show, close }) => {
  const [selectType, setSelectType] = useState();
  const [isValid, setIsValid] = useState(false);
  const handleChangingType = () => {
    if (!selectType) {
      setIsValid(true);
      return;
    }
    setIsValid(false);
    setType(selectType);
    close();
  };
  //
  useEffect(() => {
    setSelectType();
    setIsValid(false);
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
      <Row>
        <Col span={18}>
          <MySelect
            options={typeOptions}
            value={selectType}
            onChange={setSelectType}
            labelInValue
            placeholder="Select Challan Type"
            showError={isValid}
            message="Please select a Challan Type"
          />
        </Col>
      </Row>
    </Modal>
  );
};

export default SelectChallanTypeModal;
