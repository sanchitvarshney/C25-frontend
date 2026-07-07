import { useState, useEffect } from "react";
import {  Card, Col, Row, Space, Typography } from "antd";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";
import DetailsModal from "../Admin/View/DetailsModal";
import TaskLogs from "../TaskLogs";
import { useToast } from "../../../hooks/useToast.js";
import Loading from "../../../Components/Loading.jsx";

const UserTasks = () => {
  const {showToast} = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState("fetch");
  const [showDetailsModal, setShowDetailModal] = useState(false);
  // const [showTransferModal, setShowTransferModal] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const getTasks = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.get("/taskmaster/fetchTaskByName");
  
    if(response.success){
      const arr = response.data.map((task) => ({
        taskId: task.task_id,
        status: task.status,
        title: task.task_title,
        assignedByName: task.assign_by_name,
        assignedBy: task.assign_by,
        tat: task.tat,
        assignedDate: task.assign_dt,
        canTransfer: task.is_transferable === "Y",
      }));

      setTasks(arr);
      setLoading( false);
    }
    } catch (error) {
      showToast(error.message || "Something went wrong", "error");
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);
  return (
    <Row style={{ height: "90%" }}>
      {loading === "fetch" && <Loading />}
      <Col span={18}>
        <Row gutter={6}>
          {tasks.map((task, index) => (
            <Col span={6} key={task?.key || index}>
              <TaskCard
                key={index}
                task={task}
                setShowDetailModal={setShowDetailModal}
                setShowLogs={setShowLogs}
                // setShowTransferModal={setShowTransferModal}
              />
            </Col>
          ))}
        </Row>
      </Col>

      <DetailsModal
        show={showDetailsModal}
        hide={() => setShowDetailModal(false)}
      />
      {/* <TransferModal
        show={showTransferModal}
        hide={() => setShowTransferModal(false)}
      /> */}
      <TaskLogs show={showLogs} hide={() => setShowLogs(false)} />
    </Row>
  );
};

export default UserTasks;

const TaskCard = ({
  task,
  setShowDetailModal,
  setShowLogs,
}) => {
  return (
    <Card title={task.title} size="small">
      <Row gutter={[6, 10]}>
        <Col span={12}>
          <Typography.Text strong>ID</Typography.Text> -{" "}
          <Typography.Text type="secondary">{task.taskId}</Typography.Text>
        </Col>
        <Col span={12}>
          {/* <Typography.Text strong>ID</Typography.Text>-{" "} */}
          <Typography.Text strong>{task.status}</Typography.Text>
        </Col>
        <Col span={12}>
          <Typography.Text strong>By</Typography.Text> -{" "}
          <Typography.Text type="secondary">
            {task.assignedByName}
          </Typography.Text>
        </Col>
        <Col span={12}>
          <Typography.Text strong>TAT</Typography.Text> -{" "}
          <Typography.Text type="secondary">{task.tat}</Typography.Text>
        </Col>
        <Col span={12}>
          <Typography.Text strong>From</Typography.Text> -{" "}
          <Typography.Text type="secondary">
            {task.assignedDate}
          </Typography.Text>
        </Col>
        <Col span={24}>
          <Row justify="end">
            <Space>
              {/* {task.canTransfer && (
                <Button
                  type="link"
                  onClick={() => setShowTransferModal({ taskId: task.taskId })}
                >
                  Transfer
                </Button>
              )} */}

              <MyButton
                variant="logs"
                onClick={() => setShowLogs(task.taskId)}
              />
              <MyButton
                variant="details"
                onClick={() => setShowDetailModal({ taskId: task.taskId })}
              />
            </Space>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};
