import React, { useState, useMemo, useEffect } from "react";
import {
  Form,
  Upload,
  Button,
  Card,
  Typography,
  message,
  Spin,
  Divider,
  Progress,
  Alert,
  Row,
  Col,
  Input,
  Steps,
  Statistic,
} from "antd";
import {
  LoadingOutlined,
  FileZipOutlined,
  FileTextOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EditOutlined,
  CheckCircleTwoTone,
  GiftOutlined,
  InboxOutlined,
  EyeOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ResultsView from "./ResultsView";
import logo from "../assets/logo.png";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
} from "recharts";

const { Title, Text } = Typography;
const { Dragger } = Upload;
const API_BASE = "http://127.0.0.1:8000"; // ✅ centralized backend URL

function FileUploadForm() {
  // ---------------- STATE ----------------
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState({});
  const [lotteryPrizes, setLotteryPrizes] = useState({
    "Ada Sampatha": "250000",
    "Dhana Nidhanaya": "124500000",
    Govisetha: "62700000",
    Handahana: "3100000",
    "Mahajana Sampatha": "3030000",
    "Mega Power": "162000000",
    "NLB Jaya": "500000",
    "Suba Dawasak": "500000",
  });
  const [editingPrize, setEditingPrize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);

  // ---------------- AUTO-SAVE PRIZES ----------------
  useEffect(() => {
    const savedPrizes = localStorage.getItem("lotteryPrizes");
    if (savedPrizes) setLotteryPrizes(JSON.parse(savedPrizes));
  }, []);

  useEffect(() => {
    localStorage.setItem("lotteryPrizes", JSON.stringify(lotteryPrizes));
  }, [lotteryPrizes]);

  // ---------------- COMPUTATIONS ----------------
  const totalPrizePool = useMemo(
    () =>
      Object.values(lotteryPrizes)
        .map((v) => parseInt(v) || 0)
        .reduce((a, b) => a + b, 0),
    [lotteryPrizes]
  );

  const maxPrize = useMemo(
    () =>
      Math.max(...Object.values(lotteryPrizes).map((v) => parseInt(v) || 0)),
    [lotteryPrizes]
  );

  // ---------------- HANDLERS ----------------
  const handleChange = (file, name) => {
    setFiles((prev) => ({ ...prev, [name]: file }));
    return false;
  };

  const handleRemove = (name) => {
    setFiles((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const handleReset = () => {
    setStep(1);
    setFiles({});
    setEditingPrize(null);
    setResults(null);
    setProgress(0);
    setError(null);
    setLastGenerated(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextFromPrizes = () => {
    const missingPrize = Object.values(lotteryPrizes).some(
      (val) => !val.trim() || parseInt(val) <= 0
    );
    if (missingPrize) {
      message.warning("⚠️ Please fill valid prize values for all lotteries!");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!files.ticket_sales || !files.prizes || !files.customers) {
      message.warning("⚠️ Please upload all required files before proceeding!");
      return;
    }

    const formData = new FormData();
    Object.entries(files).forEach(([key, file]) => formData.append(key, file));
    formData.append("lottery_prizes", JSON.stringify(lotteryPrizes));

    try {
      setLoading(true);
      setError(null);
      setProgress(0);

      const res = await axios.post(`${API_BASE}/upload-files/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((100 * e.loaded) / e.total));
        },
      });

      setResults(res.data);
      setStep(3);
      setLastGenerated(new Date().toLocaleString());
      message.success("✅ Files processed successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError("❌ Error uploading files or running pipeline!");
      message.error("Error during processing!");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EMAIL PREVIEW ----------------
  const handlePreviewEmail = () => {
    const sampleEmail = `
      <h2 style="color:#722ed1;">Dear Valued Customer,</h2>
      <p>We are thrilled to recognize you as one of our top supporters!</p>
      <p>Your dedication has already brought you Rs. ${maxPrize.toLocaleString()} in winnings.</p>
      <p>Keep the momentum going and check this week’s top prizes!</p>
    `;
    const emailWindow = window.open("", "_blank");
    emailWindow.document.write(sampleEmail);
    emailWindow.document.close();
  };

  // ---------------- RENDER UPLOAD ----------------
  const renderUpload = (label, name, accept, icon, successMsg) => {
    const hasFile = !!files[name];
    return (
      <Card
        size="small"
        style={{
          marginBottom: 16,
          borderRadius: 10,
          borderColor: hasFile ? "#b7eb8f" : "#d9d9d9",
          boxShadow: hasFile ? "0 0 10px rgba(82,196,26,0.2)" : "none",
        }}
        bodyStyle={{ padding: 8 }}
      >
        <Form.Item label={<Text strong>{label}</Text>} style={{ marginBottom: 8 }}>
          <div style={{ position: "relative" }}>
            {hasFile && (
              <CheckCircleTwoTone
                twoToneColor="#52c41a"
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  fontSize: 20,
                  zIndex: 10,
                }}
              />
            )}
            <Dragger
              beforeUpload={(file) => handleChange(file, name)}
              fileList={hasFile ? [files[name]] : []}
              onRemove={() => handleRemove(name)}
              accept={accept}
              maxCount={1}
              style={{
                background: hasFile ? "#f6ffed" : "#fafafa",
                borderColor: hasFile ? "#b7eb8f" : "#d9d9d9",
                borderRadius: 10,
                padding: "12px",
                minHeight: "110px",
              }}
            >
              <p className="ant-upload-drag-icon" style={{ fontSize: 28 }}>
                {icon}
              </p>
              {hasFile ? (
                <p style={{ color: "#52c41a", fontWeight: 500 }}>{successMsg}</p>
              ) : (
                <>
                  <p>Click or drag file to this area</p>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Accepts {accept}
                  </Text>
                </>
              )}
            </Dragger>
          </div>
        </Form.Item>
      </Card>
    );
  };

  // ---------------- MAIN RETURN ----------------
  return (
    <div style={{ background: "#fafafa", minHeight: "100vh", paddingBottom: 20 }}>
      {/* ---------------- HEADER ---------------- */}
      <div
        style={{
          background: "linear-gradient(270deg, #722ed1, #d4af37, #722ed1)",
          backgroundSize: "400% 400%",
          animation: "gradientMove 10s ease infinite",
          padding: "25px 40px",
          borderRadius: "0 0 25px 25px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          color: "white",
          marginBottom: 35,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <img
          src={logo}
          alt="WinWay Logo"
          style={{
            width: "clamp(90px, 12vw, 150px)",
            height: "auto",
            filter: "drop-shadow(0 0 5px rgba(255,255,255,0.7))",
          }}
        />
        <div>
          <Title level={2} style={{ color: "white", fontWeight: 700, marginBottom: 0 }}>
           WinWay | Smart Lottery Manager
          </Title>
          <Text style={{ color: "#fffbe6", fontSize: 16 }}>
            Empowering marketing with automation and style ✨
          </Text>
        </div>
      </div>

      {/* ---------------- MAIN CARD ---------------- */}
      <Card
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          padding: "30px",
          borderRadius: 12,
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        }}
        bordered
      >
        <Steps
          current={step - 1}
          status={step === 3 ? "finish" : "process"}
          style={{ marginBottom: 40 }}
          items={[
            { title: "Prize Setup", icon: <GiftOutlined /> },
            { title: "File Uploads", icon: <InboxOutlined /> },
            { title: "Results Dashboard", icon: <EyeOutlined /> },
          ]}
        />

        {/* ---------------- STEP 1 ---------------- */}
        {step === 1 && (
          <>
            <Title level={3} style={{ textAlign: "center", marginBottom: 10 }}>
              🎁 Lottery Prize Dashboard
            </Title>

            {/* Stats Row */}
            <Row gutter={16} justify="center" style={{ marginBottom: 25 }}>
              <Col xs={24} sm={8}>
                <Card bordered style={{ background: "#f0f5ff" }}>
                  <Statistic
                    title="Total Prize Pool"
                    value={totalPrizePool.toLocaleString()}
                    prefix="Rs."
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card bordered style={{ background: "#fff7e6" }}>
                  <Statistic
                    title="Highest Prize"
                    value={maxPrize.toLocaleString()}
                    prefix="Rs."
                    valueStyle={{ color: "#fa8c16" }}
                    suffix={<CrownOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card bordered style={{ background: "#f6ffed" }}>
                  <Statistic
                    title="Total Lotteries"
                    value={Object.keys(lotteryPrizes).length}
                    valueStyle={{ color: "#52c41a" }}
                    prefix={<GiftOutlined />}
                  />
                </Card>
              </Col>
            </Row>


            <Divider />

            {/* Prize Inputs */}
            <Row gutter={[16, 16]}>
              {Object.keys(lotteryPrizes).map((prize, idx) => (
                <Col xs={24} sm={12} md={8} lg={6} key={idx}>
                  <Card
                    hoverable
                    bordered
                    size="small"
                    title={<Text strong>{prize}</Text>}
                    actions={[
                      <EditOutlined
                        key="edit"
                        onClick={() => setEditingPrize(prize)}
                      />,
                    ]}
                    style={{
                      borderRadius: 10,
                      textAlign: "center",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    }}
                  >
                    {editingPrize === prize ? (
                      <Input
                        value={lotteryPrizes[prize]}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^\d]/g, "");
                          setLotteryPrizes({
                            ...lotteryPrizes,
                            [prize]: val,
                          });
                        }}
                        onBlur={() => setEditingPrize(null)}
                        autoFocus
                      />
                    ) : (
                      <Statistic
                        prefix="Rs."
                        value={parseInt(lotteryPrizes[prize]).toLocaleString()}
                        valueStyle={{ fontSize: 18 }}
                      />
                    )}
                  </Card>
                </Col>
              ))}
            </Row>

            <div style={{ textAlign: "center", marginTop: 30 }}>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={handleNextFromPrizes}
              >
                Proceed to File Uploads
              </Button>
            
            </div>
          </>
        )}

        {/* ---------------- STEP 2 ---------------- */}
        {step === 2 && (
          <>
            <Title level={3} style={{ textAlign: "center" }}>
              📂 Upload Files & Review Prizes
            </Title>
            <Divider />
            <Row gutter={[24, 24]} justify="center">
              <Col xs={24} lg={20}>
                {/* Upload Files */}
                <Form layout="vertical">
                  <Row gutter={[12, 12]} justify="center">
                    <Col xs={24} sm={12} md={8}>
                      {renderUpload(
                        "Ticket Sales (.zip)",
                        "ticket_sales",
                        ".zip",
                        <FileZipOutlined style={{ color: "#1890ff" }} />,
                        "Ticket Sales attached"
                      )}
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      {renderUpload(
                        "Prize Data (.zip)",
                        "prizes",
                        ".zip",
                        <FileZipOutlined style={{ color: "#722ed1" }} />,
                        "Prize Data attached"
                      )}
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      {renderUpload(
                        "Customers (.csv)",
                        "customers",
                        ".csv",
                        <FileTextOutlined style={{ color: "#fa8c16" }} />,
                        "Customer list attached"
                      )}
                    </Col>
                  </Row>

                  {error && (
                    <Alert
                      type="error"
                      message={error}
                      showIcon
                      style={{ marginTop: 15 }}
                    />
                  )}

                  {progress > 0 && (
                    <Progress
                      percent={progress}
                      status={loading ? "active" : "normal"}
                      style={{ marginTop: 20 }}
                    />
                  )}

                  {lastGenerated && (
                    <div style={{ textAlign: "center", marginTop: 10 }}>
                      <Text type="secondary">
                        🕒 Last generated on: {lastGenerated}
                      </Text>
                    </div>
                  )}

                  <div style={{ textAlign: "center", marginTop: 30 }}>
                    <Button
                      icon={<ArrowLeftOutlined />}
                      onClick={() => setStep(1)}
                      style={{ marginRight: 10 }}
                    >
                      Back
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleSubmit}
                      disabled={loading}
                      style={{ marginRight: 10 }}
                    >
                      {loading ? (
                        <>
                          <LoadingOutlined /> Generating...
                        </>
                      ) : (
                        "Generate Emails"
                      )}
                    </Button>
                    <Button icon={<ReloadOutlined />} danger onClick={handleReset}>
                      Reset
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </>
        )}

        {/* ---------------- STEP 3 ---------------- */}
        {step === 3 && results && (
          <>
            <Title level={3} style={{ textAlign: "center" }}>
              📊 Results
            </Title>
            <Divider />
            <ResultsView results={results} lotteryPrizes={lotteryPrizes} />
            <div style={{ textAlign: "center", marginTop: 25 }}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => setStep(2)}
                style={{ marginRight: 10 }}
              >
                Back to Uploads
              </Button>
              <Button type="primary" onClick={handleReset}>
                Start Over
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* ---------------- LOADING OVERLAY ---------------- */}
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(255,255,255,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            zIndex: 9999,
          }}
        >
          <Spin size="large" />
          <Text strong style={{ marginTop: 20, color: "#722ed1" }}>
            Generating personalized emails... ✨
          </Text>
        </div>
      )}
    </div>
  );
}

export default FileUploadForm;
