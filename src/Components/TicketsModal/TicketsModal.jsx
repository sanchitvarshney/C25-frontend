import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { getDiagnostics } from "../../utils/diagnostics";
import {
  Button,
  Card,
  Col,
  Drawer,
  Modal,
  Row,
  Typography,
  Input,
  Select,
  Upload,
  Space,
  Divider,
  Skeleton,
  Checkbox,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  UnorderedListOutlined,
  InboxOutlined,
  MessageOutlined,
  HighlightOutlined,
  EyeInvisibleOutlined,
  UndoOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { imsAxios } from "../../axiosInterceptor";
import { customColor } from "../../utils/customColor";
import { useToast } from "../../hooks/useToast";
const { TextArea } = Input;
const axiosLink = "https://support.mscorpres.com";

export default function TicketsModal({ open, handleClose }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [activeMenu, setActiveMenu] = useState("create"); // 'create' or 'fetch'
  const { user } = useSelector((state) => state.login);

  // Masters data from API
  const [topicOptions, setTopicOptions] = useState([]);
  const [priorityOptions, setPriorityOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);

  // Feedback form state
  const [feedbackData, setFeedbackData] = useState({
    topic: null,
    priority: null,
    language: null,
    subject: "",
    description: "",
    emailConsent: false,
    screenshot: null,
  });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [capturingScreen, setCapturingScreen] = useState(false);

  // Annotation modal
  const [annotationOpen, setAnnotationOpen] = useState(false);
  const [activeTool, setActiveTool] = useState("highlight");
  const [shapeCount, setShapeCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);
  const canvasRef = useRef(null);
  const baseImgRef = useRef(null);
  const shapesRef = useRef([]);
  const redoStackRef = useRef([]);
  const isDrawingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  //handle submit feedback
  const handleSubmitFeedback = async () => {
    const ALLOWED = /^[A-Za-z0-9@%&()\-[\]:?.,/ ]*$/;
    const len = feedbackData.description.length;
    if (
      len < 10 ||
      len > 500 ||
      !ALLOWED.test(feedbackData.description) ||
      !feedbackData.emailConsent
    )
      return;
    setFeedbackLoading(true);
    try {
      const diagnostics = getDiagnostics();
      const payload = new FormData();
      payload.append("email", user?.email || "");
      payload.append("name", user?.userName || user?.name || "");
      payload.append("message", feedbackData.description);
      payload.append("email_consent", feedbackData.emailConsent ? "1" : "0");

      // ── Diagnostic fields ──────────────────────────────
      // Browser / environment
      payload.append("browser_info", JSON.stringify(diagnostics.browser));

      // Console logs (errors, warnings, info)
      payload.append(
        "console_logs",
        JSON.stringify(
          diagnostics.console.filter((l) =>
            ["error", "warn", "info"].includes(l.level),
          ),
        ),
      );

      // Network — last 20 XHR/fetch + all WebSocket connections
      payload.append(
        "network_requests",
        JSON.stringify(diagnostics.network.requests.slice(-20)),
      );
      payload.append(
        "network_sockets",
        JSON.stringify(diagnostics.network.sockets),
      );

      // Application storage
      payload.append(
        "local_storage",
        JSON.stringify(diagnostics.application.localStorage),
      );
      payload.append(
        "session_storage",
        JSON.stringify(diagnostics.application.sessionStorage),
      );
      payload.append(
        "cookies",
        JSON.stringify(diagnostics.application.cookies),
      );

      payload.append("captured_at", diagnostics.capturedAt);

      // Screenshot (base64 → blob for efficient transfer)
      if (feedbackData.screenshot) {
        const res = await fetch(feedbackData.screenshot);
        const blob = await res.blob();
        payload.append("screenshot", blob, "screenshot.png");
      }

      await imsAxios.post("/ticket/feedback", payload);
      showToast("Feedback sent successfully!");
      setFeedbackData({
        description: "",
        emailConsent: false,
        screenshot: null,
      });
      setActiveMenu("create");
    } catch {
      showToast("Failed to send feedback", "error");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const initAnnotationCanvas = (src) => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;
    shapesRef.current = [];
    redoStackRef.current = [];
    setShapeCount(0);
    setRedoCount(0);
    const img = new Image();
    img.onload = () => {
      baseImgRef.current = img;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
    };
    img.src = src;
  };

  const drawHideShape = (ctx, s) => {
    const lx = Math.min(s.x, s.x2);
    const ly = Math.min(s.y, s.y2);
    const w = Math.abs(s.x2 - s.x);
    const h = Math.abs(s.y2 - s.y);
    ctx.save();
    ctx.fillStyle = "#111111";
    ctx.fillRect(lx, ly, w, h);
    ctx.restore();
  };

  const redrawAnnotation = (shapes, preview = null) => {
    const canvas = canvasRef.current;
    const img = baseImgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    const cw = canvas.width;
    const allShapes = preview ? [...shapes, preview] : shapes;

    // 1. Base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // 2. Highlight spotlight: grey overlay + transparent punch-through windows
    const highlights = allShapes.filter((s) => s.type === "highlight");
    if (highlights.length > 0) {
      ctx.fillStyle = "rgba(80, 80, 80, 0.55)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      highlights.forEach((s) => {
        const lx = Math.min(s.x, s.x2);
        const ly = Math.min(s.y, s.y2);
        const w = Math.abs(s.x2 - s.x);
        const h = Math.abs(s.y2 - s.y);
        ctx.save();
        ctx.beginPath();
        ctx.rect(lx, ly, w, h);
        ctx.clip();
        ctx.drawImage(img, 0, 0);
        ctx.restore();
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = Math.max(2, cw / 300);
        ctx.strokeRect(lx, ly, w, h);
      });
    }

    // 3. Hide shapes
    allShapes
      .filter((s) => s.type === "hide")
      .forEach((s) => drawHideShape(ctx, s));
  };

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const onCanvasMouseDown = (e) => {
    isDrawingRef.current = true;
    startPosRef.current = getCanvasPos(e);
    redoStackRef.current = [];
    setRedoCount(0);
  };

  const onCanvasMouseMove = (e) => {
    if (!isDrawingRef.current) return;
    const pos = getCanvasPos(e);
    redrawAnnotation(shapesRef.current, {
      type: activeTool,
      x: startPosRef.current.x,
      y: startPosRef.current.y,
      x2: pos.x,
      y2: pos.y,
    });
  };

  const onCanvasMouseUp = (e) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const pos = getCanvasPos(e);
    const shape = {
      type: activeTool,
      x: startPosRef.current.x,
      y: startPosRef.current.y,
      x2: pos.x,
      y2: pos.y,
    };
    shapesRef.current = [...shapesRef.current, shape];
    setShapeCount(shapesRef.current.length);
    redrawAnnotation(shapesRef.current);
  };

  const undoAnnotation = () => {
    if (shapesRef.current.length === 0) return;
    const last = shapesRef.current[shapesRef.current.length - 1];
    redoStackRef.current = [...redoStackRef.current, last];
    shapesRef.current = shapesRef.current.slice(0, -1);
    setShapeCount(shapesRef.current.length);
    setRedoCount(redoStackRef.current.length);
    redrawAnnotation(shapesRef.current);
  };

  const redoAnnotation = () => {
    if (redoStackRef.current.length === 0) return;
    const last = redoStackRef.current[redoStackRef.current.length - 1];
    redoStackRef.current = redoStackRef.current.slice(0, -1);
    shapesRef.current = [...shapesRef.current, last];
    setShapeCount(shapesRef.current.length);
    setRedoCount(redoStackRef.current.length);
    redrawAnnotation(shapesRef.current);
  };

  useEffect(() => {
    if (!annotationOpen) return;
    const onKey = (e) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undoAnnotation();
      } else if (e.ctrlKey && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        redoAnnotation();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [annotationOpen]);

  const saveAnnotation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setFeedbackData((prev) => ({
      ...prev,
      screenshot: canvas.toDataURL("image/png"),
    }));
    setAnnotationOpen(false);
  };

  const captureScreenshot = async () => {
    try {
      // Hide the drawer so it doesn't appear in the screenshot
      setCapturingScreen(true);
      await new Promise((r) => setTimeout(r, 150));

      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 1,
        scrollX: 0,
        scrollY: 0,
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        // Skip any elements marked as overlays (the Ant Drawer portal)
        ignoreElements: (el) =>
          el.classList.contains("ant-drawer-mask") ||
          el.classList.contains("ant-drawer") ||
          el.getAttribute("data-capture-ignore") === "true",
      });

      setFeedbackData((prev) => ({
        ...prev,
        screenshot: canvas.toDataURL("image/png"),
      }));
    } catch (err) {
      console.error("Screenshot failed:", err);
    } finally {
      setCapturingScreen(false);
    }
  };

  // Create ticket form state
  const [formData, setFormData] = useState({
    topic: null,
    subject: "",
    concern: "",
    priority: null,
    language: null,
    attachment: null,
  });
  const [fileList, setFileList] = useState([]);

  // Fetch masters (topics, priority, language)
  const fetchMasters = async () => {
    try {
      const response = await imsAxios.get("/ticket/masters");
      if (response?.success && response?.data) {
        const { topics, priorities, languages } = response.data;

        // Map topics - { value, text }
        if (topics && Array.isArray(topics)) {
          setTopicOptions(
            topics.map((t) => ({
              label: t.text,
              value: t.value,
            })),
          );
        }

        // Map priorities - { value, text }
        if (priorities && Array.isArray(priorities)) {
          setPriorityOptions(
            priorities.map((p) => ({
              label: p.text,
              value: p.value,
            })),
          );
        }

        // Map languages - { value, text }
        if (languages && Array.isArray(languages)) {
          setLanguageOptions(
            languages.map((l) => ({
              label: l.text,
              value: l.value,
            })),
          );
        }
      }
    } catch (error) {
      console.error("Error fetching masters:", error);
    }
  };

  // Getting tickets list
  const getTickets = async () => {
    setLoading("fetching");
    try {
      const response = await imsAxios.get("/ticket/fetch", {
        params: { email: user?.email, topic: 18 },
      });
      setLoading(false);
      if (response?.success && response?.data) {
        setTickets(response.data || []);
      } else {
        showToast(response?.message || "Failed to fetch tickets", "error");
        setTickets([]);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching tickets:", error);
      setTickets([]);
    }
  };

  // Handle form field changes
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle file upload
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      setFormData((prev) => ({
        ...prev,
        attachment: newFileList[0].originFileObj,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        attachment: null,
      }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      topic: null,
      subject: "",
      concern: "",
      priority: null,
      language: null,
      attachment: null,
    });
    setFileList([]);
  };

  // Handle submit ticket
  const handleSubmit = async () => {
    // Validation
    if (!formData.topic) {
      showToast("Please select a topic", "error");
      return;
    }
    if (!formData.subject.trim()) {
      showToast("Please enter a subject", "error");
      return;
    }
    if (!formData.concern.trim()) {
      showToast("Please describe your concern", "error");
      return;
    }

    try {
      setLoading("submitting");

      // Build FormData payload
      const submitFormData = new FormData();
      submitFormData.append("name", user?.userName || user?.name || "");
      submitFormData.append("email", user?.email || "");
      submitFormData.append("phone", user?.phone || "");
      submitFormData.append("subject", formData.subject);
      submitFormData.append("message", formData.concern);
      submitFormData.append("topic", formData.topic);

      if (formData.priority) {
        submitFormData.append("priority", formData.priority);
      }

      if (formData.language) {
        submitFormData.append("language", formData.language);
      }

      // Add attachment if present
      if (formData.attachment) {
        submitFormData.append("attachment[]", formData.attachment);
      } else {
        // Add empty attachment array if no file
        submitFormData.append("attachment[]", "");
      }

      const response = await imsAxios.post("/ticket/create", submitFormData);

      setLoading(false);

      if (response?.success) {
        showToast("Ticket created successfully!");
        resetForm();
        setActiveMenu("fetch");
        getTickets();
      } else {
        showToast(response?.message || "Failed to create ticket", "error");
      }
    } catch (error) {
      setLoading(false);
      showToast(error?.message || "Failed to create ticket", "error");
    }
  };

  // Handle cancel
  const handleCancel = () => {
    resetForm();
    setActiveMenu("fetch");
  };

  useEffect(() => {
    if (open) {
      setActiveMenu("create");
      fetchMasters();
    } else {
      setTickets([]);
      resetForm();
    }
  }, [open]);

  return (
    <>
      <Drawer
        title="Your Tickets"
        placement="right"
        onClose={handleClose}
        open={open}
        width={800}
        rootStyle={{ display: capturingScreen ? "none" : undefined }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ display: "flex", height: "100%" }}>
          {/* Left Vertical Icon Menu */}
          <div
            style={{
              width: 50,
              borderRight: "1px solid #cccccc",
              backgroundColor: "#eeeeee",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 12,
              gap: 8,
            }}
          >
            {/* Create Ticket Icon */}
            <div
              onClick={() => setActiveMenu("create")}
              style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
                cursor: "pointer",
                backgroundColor:
                  activeMenu === "create"
                    ? customColor.newBgColor
                    : "transparent",
                color: activeMenu === "create" ? "#fff" : "#666",
                transition: "all 0.2s ease",
              }}
              title="Create Ticket"
            >
              <PlusOutlined style={{ fontSize: 18 }} />
            </div>

            {/* My Tickets Icon */}
            <div
              onClick={() => {
                setActiveMenu("fetch");
                getTickets();
              }}
              style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
                cursor: "pointer",
                backgroundColor:
                  activeMenu === "fetch"
                    ? customColor.newBgColor
                    : "transparent",
                color: activeMenu === "fetch" ? "#fff" : "#666",
                transition: "all 0.2s ease",
              }}
              title="My Tickets"
            >
              <UnorderedListOutlined style={{ fontSize: 18 }} />
            </div>

            <div style={{ marginTop: "auto", paddingBottom: 12 }}>
              <div
                onClick={() => setActiveMenu("feedback")}
                style={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                  cursor: "pointer",
                  backgroundColor:
                    activeMenu === "feedback"
                      ? customColor.newBgColor
                      : "transparent",
                  color: activeMenu === "feedback" ? "#fff" : "#666",
                  transition: "all 0.2s ease",
                }}
                title="Send Feedback"
              >
                <MessageOutlined style={{ fontSize: 18 }} />
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div style={{ flex: 1, padding: 20, overflow: "auto" }}>
            {/* Create Ticket Form */}
            {activeMenu === "create" && (
              <div style={{ maxWidth: 600 }}>
                <Typography.Title level={4} style={{ marginBottom: 24 }}>
                  Create New Ticket
                </Typography.Title>

                {/* Topic */}
                <div style={{ marginBottom: 20 }}>
                  <Typography.Text strong>
                    Topic <span style={{ color: "red" }}>*</span>
                  </Typography.Text>
                  <Select
                    style={{ width: "100%", marginTop: 8 }}
                    placeholder="Select Topic"
                    options={topicOptions}
                    value={formData.topic}
                    onChange={(value) => handleFormChange("topic", value)}
                    loading={topicOptions.length === 0}
                  />
                </div>

                {/* Priority & Language Row */}
                <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                  <div style={{ flex: 1 }}>
                    <Typography.Text strong>Priority</Typography.Text>
                    <Select
                      style={{ width: "100%", marginTop: 8 }}
                      placeholder="Select Priority"
                      options={priorityOptions}
                      value={formData.priority}
                      onChange={(value) => handleFormChange("priority", value)}
                      allowClear
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Typography.Text strong>Language</Typography.Text>
                    <Select
                      style={{ width: "100%", marginTop: 8 }}
                      placeholder="Select Language"
                      options={languageOptions}
                      value={formData.language}
                      onChange={(value) => handleFormChange("language", value)}
                      allowClear
                    />
                  </div>
                </div>

                {/* Subject */}
                <div style={{ marginBottom: 20 }}>
                  <Typography.Text strong>
                    Subject <span style={{ color: "red" }}>*</span>
                  </Typography.Text>
                  <Input
                    style={{ marginTop: 8 }}
                    placeholder="Enter subject"
                    value={formData.subject}
                    onChange={(e) =>
                      handleFormChange("subject", e.target.value)
                    }
                    maxLength={100}
                    showCount
                  />
                </div>

                {/* Concern */}
                <div style={{ marginBottom: 20 }}>
                  <Typography.Text strong>
                    Describe Your Concern{" "}
                    <span style={{ color: "red" }}>*</span>
                  </Typography.Text>
                  <TextArea
                    style={{ marginTop: 8 }}
                    placeholder="Please describe your issue or concern in detail..."
                    rows={6}
                    value={formData.concern}
                    onChange={(e) =>
                      handleFormChange("concern", e.target.value)
                    }
                    maxLength={1000}
                    showCount
                  />
                </div>

                {/* Attachment */}
                <div style={{ marginBottom: 24 }}>
                  <Typography.Text strong>Attachment</Typography.Text>
                  <Upload.Dragger
                    style={{ marginTop: 8 }}
                    fileList={fileList}
                    onChange={handleFileChange}
                    beforeUpload={() => false}
                    maxCount={1}
                    accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx"
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag file to upload
                    </p>
                    <p className="ant-upload-hint">
                      Supported: PNG, JPG, PDF, DOC, XLS (Max 1 file)
                    </p>
                  </Upload.Dragger>
                </div>

                <Divider />

                {/* Bottom Fixed Buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 12,
                  }}
                >
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={loading === "submitting"}
                    style={{
                      backgroundColor: customColor.newBgColor,
                      borderColor: customColor.newBgColor,
                    }}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            )}

            {activeMenu === "feedback" && (
              <div style={{ maxWidth: 520 }}>
                <Typography.Title level={4} style={{ marginBottom: 4 }}>
                  Send Feedback
                </Typography.Title>
                <Divider style={{ marginTop: 8, marginBottom: 20 }} />

                {/* Description */}
                {(() => {
                  const ALLOWED = /^[A-Za-z0-9@%&()\-[\]:?.,/ ]*$/;
                  const len = feedbackData.description.length;
                  const tooShort = len > 0 && len < 10;
                  const hasInvalid =
                    len > 0 && !ALLOWED.test(feedbackData.description);
                  const showError = tooShort || hasInvalid;
                  return (
                    <>
                      {/* Topic */}
                      <div style={{ marginBottom: 20 }}>
                        <Typography.Text strong>
                          Topic <span style={{ color: "red" }}>*</span>
                        </Typography.Text>
                        <Select
                          style={{ width: "100%", marginTop: 8 }}
                          placeholder="Select Topic"
                          options={topicOptions}
                          value={feedbackData.topic}
                          onChange={(value) =>
                            setFeedbackData((prev) => ({
                              ...prev,
                              topic: value,
                            }))
                          }
                          loading={topicOptions.length === 0}
                        />
                      </div>

                      {/* Priority & Language Row */}
                      <div
                        style={{ display: "flex", gap: 16, marginBottom: 20 }}
                      >
                        <div style={{ flex: 1 }}>
                          <Typography.Text strong>Priority</Typography.Text>
                          <Select
                            style={{ width: "100%", marginTop: 8 }}
                            placeholder="Select Priority"
                            options={priorityOptions}
                            value={feedbackData.priority}
                            onChange={(value) =>
                              setFeedbackData((prev) => ({
                                ...prev,
                                priority: value,
                              }))
                            }
                            allowClear
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Typography.Text strong>Language</Typography.Text>
                          <Select
                            style={{ width: "100%", marginTop: 8 }}
                            placeholder="Select Language"
                            options={languageOptions}
                            value={feedbackData.language}
                            onChange={(value) =>
                              handleFormChange("language", value)
                            }
                            allowClear
                          />
                        </div>
                      </div>

                      {/* Subject */}
                      <div style={{ marginBottom: 20 }}>
                        <Typography.Text strong>
                          Subject <span style={{ color: "red" }}>*</span>
                        </Typography.Text>
                        <Input
                          style={{ marginTop: 8 }}
                          placeholder="Enter subject"
                          value={feedbackData.subject}
                          onChange={(e) =>
                            setFeedbackData((prev) => ({
                              ...prev,
                              subject: e.target.value,
                            }))
                          }
                          maxLength={100}
                          showCount
                        />
                      </div>
                      <div
                        style={{
                          marginBottom: 6,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography.Text strong>
                          Describe your feedback{" "}
                          <span style={{ color: "red" }}>(required)</span>
                        </Typography.Text>
                        <Typography.Text
                          style={{
                            fontSize: 12,
                            color:
                              len > 500
                                ? "red"
                                : len >= 10
                                  ? "#52c41a"
                                  : "#999",
                          }}
                        >
                          {len}/500
                        </Typography.Text>
                      </div>
                      <TextArea
                        rows={5}
                        placeholder="Tell us what prompted this feedback... (min 10 characters)"
                        value={feedbackData.description}
                        maxLength={500}
                        status={showError ? "error" : ""}
                        onChange={(e) => {
                          // Strip characters not in the allowed set
                          const filtered = e.target.value.replace(
                            /[^A-Za-z0-9@%&()\-[\]:?.,/ ]/g,
                            "",
                          );
                          setFeedbackData((prev) => ({
                            ...prev,
                            description: filtered,
                          }));
                        }}
                        style={{ marginBottom: 4 }}
                      />
                      {showError && (
                        <Typography.Text type="danger" style={{ fontSize: 12 }}>
                          {tooShort
                            ? `Minimum 10 characters required (${len} entered)`
                            : "Only A-Z a-z 0-9 @ % & ( ) - [ ] : ? . , / and spaces are allowed"}
                        </Typography.Text>
                      )}
                      {!showError && (
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          {`Please don't include any sensitive information
 `}{" "}
                        </Typography.Text>
                      )}
                    </>
                  );
                })()}

                <Divider style={{ margin: "16px 0" }} />

                {/* Screenshot */}
                <Typography.Text style={{ display: "block", marginBottom: 8 }}>
                  A screenshot will help us better understand your feedback.
                </Typography.Text>
                <Button
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      style={{ verticalAlign: "middle", marginRight: 6 }}
                      fill="currentColor"
                    >
                      <path d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H3V5h18v14zM5 15l3.5-4.5 2.5 3.01L14.5 9l4.5 6H5z" />
                    </svg>
                  }
                  onClick={captureScreenshot}
                  style={{ width: "100%", marginBottom: 12 }}
                >
                  Capture screenshot
                </Button>
                {feedbackData.screenshot && (
                  <div style={{ marginBottom: 12 }}>
                    <Typography.Text
                      strong
                      style={{
                        display: "block",
                        marginBottom: 6,
                        fontSize: 12,
                      }}
                    >
                      Attached screenshot
                    </Typography.Text>
                    <div
                      style={{
                        position: "relative",
                        border: "1px solid #d9d9d9",
                        borderRadius: 6,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={feedbackData.screenshot}
                        alt="screenshot preview"
                        style={{
                          width: "100%",
                          display: "block",
                          objectFit: "contain",
                          maxHeight: 200,
                        }}
                      />
                      <Button
                        size="small"
                        danger
                        style={{ position: "absolute", top: 6, right: 6 }}
                        onClick={() =>
                          setFeedbackData((prev) => ({
                            ...prev,
                            screenshot: null,
                          }))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                    <Button
                      icon={<HighlightOutlined />}
                      style={{
                        marginTop: 8,
                        width: "100%",
                        color: customColor.newBgColor,
                        borderColor: customColor.newBgColor,
                      }}
                      onClick={() => {
                        setAnnotationOpen(true);
                        setTimeout(
                          () => initAnnotationCanvas(feedbackData.screenshot),
                          80,
                        );
                      }}
                    >
                      Highlight or Hide info on your screenshot
                    </Button>
                  </div>
                )}

                <Divider style={{ margin: "16px 0" }} />

                {/* Email consent */}
                <Checkbox
                  checked={feedbackData.emailConsent}
                  onChange={(e) =>
                    setFeedbackData((prev) => ({
                      ...prev,
                      emailConsent: e.target.checked,
                    }))
                  }
                  style={{ marginBottom: 16 }}
                >
                  We may email you for more information or updates
                </Checkbox>

                <div
                  style={{
                    fontSize: 11,
                    color: "#888",
                    lineHeight: 1.5,
                    marginBottom: 24,
                  }}
                >
                  Some account and system information may be sent to support. We
                  will use it to fix problems and improve our services, subject
                  to our Privacy Policy and Terms of Service. We may email you
                  for more information or updates.
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                  }}
                >
                  <Button
                    onClick={() => {
                      setFeedbackData({
                        description: "",
                        emailConsent: false,
                        screenshot: null,
                      });
                      setActiveMenu("create");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    loading={feedbackLoading}
                    disabled={(() => {
                      const ALLOWED = /^[A-Za-z0-9@%&()\-[\]:?.,/ ]*$/;
                      const len = feedbackData.description.length;
                      return (
                        len < 10 ||
                        len > 500 ||
                        !ALLOWED.test(feedbackData.description) ||
                        !feedbackData.emailConsent
                      );
                    })()}
                    style={{
                      backgroundColor: customColor.newBgColor,
                      borderColor: customColor.newBgColor,
                    }}
                    onClick={handleSubmitFeedback}
                  >
                    Send
                  </Button>
                </div>
              </div>
            )}

            {/* Fetch Tickets List */}
            {activeMenu === "fetch" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    My Tickets
                  </Typography.Title>
                  <Button
                    href={`${axiosLink}/open.php`}
                    target="_blank"
                    type="link"
                  >
                    Open on Support Portal
                  </Button>
                </div>

                {/* Skeleton Loading */}
                {loading === "fetching" && (
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size={12}
                  >
                    {[1, 2, 3].map((item) => (
                      <Card size="small" key={item}>
                        <Skeleton active paragraph={{ rows: 2 }} />
                      </Card>
                    ))}
                  </Space>
                )}

                {/* No Tickets */}
                {tickets.length === 0 && loading !== "fetching" && (
                  <Card style={{ textAlign: "center", padding: 40 }}>
                    <Typography.Text type="secondary">
                      No tickets found
                    </Typography.Text>
                  </Card>
                )}

                {/* Tickets List */}
                {!loading && tickets.length > 0 && (
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size={12}
                  >
                    {tickets.map((ticket, index) => (
                      <Card size="small" key={ticket.ticket || index}>
                        <Row gutter={[6, 4]}>
                          <Col span={8}>
                            <Typography.Text strong>Date: </Typography.Text>
                            <Typography.Text>{ticket.date}</Typography.Text>
                          </Col>
                          <Col span={8}>
                            <Typography.Text strong>Priority: </Typography.Text>
                            <Typography.Text
                              style={{
                                backgroundColor:
                                  ticket.priorityColor || "#f0f0f0",
                                padding: "2px 8px",
                                borderRadius: 4,
                                fontSize: 12,
                              }}
                            >
                              {ticket.priority}
                            </Typography.Text>
                          </Col>
                          <Col span={8}>
                            <Typography.Text strong>
                              Ticket No.:{" "}
                            </Typography.Text>
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href={`${axiosLink}/view.php?e=${user.email}&t=${ticket.ticket}`}
                            >
                              <Typography.Text
                                style={{ color: customColor.newBgColor }}
                                copyable
                              >
                                {ticket.ticket}
                              </Typography.Text>
                            </a>
                          </Col>
                          <Col span={24}>
                            <Typography.Text strong>Subject: </Typography.Text>
                            <Typography.Text>{ticket.subject}</Typography.Text>
                          </Col>
                          <Col span={24}>
                            <Typography.Text strong>Status: </Typography.Text>
                            <Typography.Text
                              style={{
                                color:
                                  ticket.status === "O"
                                    ? "#faad14"
                                    : ticket.status === "R"
                                      ? "#52c41a"
                                      : ticket.status === "C"
                                        ? "#1890ff"
                                        : "#999",
                              }}
                            >
                              {ticket.status === "O"
                                ? "Open"
                                : ticket.status === "A"
                                  ? "Archived"
                                  : ticket.status === "C"
                                    ? "Closed"
                                    : ticket.status === "R"
                                      ? "Resolved"
                                      : ticket.status === "D"
                                        ? "Deleted"
                                        : ticket.status}
                            </Typography.Text>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                  </Space>
                )}
              </div>
            )}
          </div>
        </div>
      </Drawer>

      {/* ── Annotation Modal ── */}
      <Modal
        open={annotationOpen}
        onCancel={() => setAnnotationOpen(false)}
        width="92vw"
        style={{ top: 20 }}
        styles={{ body: { padding: 0 } }}
        title="Highlight or Hide Info"
        destroyOnClose
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {/* Left — tools + undo/redo */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {[
                {
                  key: "highlight",
                  icon: <HighlightOutlined />,
                  label: "Highlight",
                },
                { key: "hide", icon: <EyeInvisibleOutlined />, label: "Hide" },
              ].map((tool) => (
                <Tooltip key={tool.key} title={tool.label}>
                  <Button
                    size="small"
                    type={activeTool === tool.key ? "primary" : "default"}
                    icon={tool.icon}
                    onClick={() => setActiveTool(tool.key)}
                    style={
                      activeTool === tool.key
                        ? {
                            backgroundColor: customColor.newBgColor,
                            borderColor: customColor.newBgColor,
                          }
                        : {}
                    }
                  >
                    {tool.label}
                  </Button>
                </Tooltip>
              ))}

              <div
                style={{
                  width: 1,
                  height: 22,
                  background: "#d9d9d9",
                  margin: "0 2px",
                }}
              />

              <Tooltip title="Undo (Ctrl+Z)">
                <Button
                  size="small"
                  icon={<UndoOutlined />}
                  onClick={undoAnnotation}
                  disabled={shapeCount === 0}
                />
              </Tooltip>
              <Tooltip title="Redo (Ctrl+Y)">
                <Button
                  size="small"
                  icon={<RedoOutlined />}
                  onClick={redoAnnotation}
                  disabled={redoCount === 0}
                />
              </Tooltip>
            </div>

            {/* Right — Cancel | Done */}
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={() => setAnnotationOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                onClick={saveAnnotation}
                style={{
                  backgroundColor: customColor.newBgColor,
                  borderColor: customColor.newBgColor,
                }}
              >
                Done
              </Button>
            </div>
          </div>
        }
      >
        {/* Canvas area */}
        <div
          style={{
            overflow: "auto",
            maxHeight: "82vh",
            background: "#f0f0f0",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: 16,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: "100%",
              cursor: "crosshair",
              borderRadius: 4,
              boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
              display: "block",
            }}
            onMouseDown={onCanvasMouseDown}
            onMouseMove={onCanvasMouseMove}
            onMouseUp={onCanvasMouseUp}
            onMouseLeave={onCanvasMouseUp}
          />
        </div>
      </Modal>
    </>
  );
}
