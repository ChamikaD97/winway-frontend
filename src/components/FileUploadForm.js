import React, { useState, useMemo } from "react";
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
  FileImageOutlined,
  FileTextOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EditOutlined,
  DownloadOutlined,
  CheckCircleTwoTone,
  GiftOutlined,
  InboxOutlined,
  EyeOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ResultsView from "./ResultsView";
import logo from "../assets/logo.png"; // ✅ WinWay logo

const { Title, Text } = Typography;
const { Dragger } = Upload;

function FileUploadForm() {
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

  const totalPrizePool = useMemo(
    () =>
      Object.values(lotteryPrizes)
        .map((v) => parseInt(v) || 0)
        .reduce((a, b) => a + b, 0),
    [lotteryPrizes]
  );
  const maxPrize = useMemo(
    () => Math.max(...Object.values(lotteryPrizes).map((v) => parseInt(v) || 0)),
    [lotteryPrizes]
  );

  // ✅ Handlers
  const handleChange = (file, name) => {
    setFiles({ ...files, [name]: file });
    return false;
  };

  const handleRemove = (name) => {
    const updatedFiles = { ...files };
    delete updatedFiles[name];
    setFiles(updatedFiles);
  };

  const handleReset = () => {
    setStep(1);
    setFiles({});
    setEditingPrize(null);
    setResults(null);
    setProgress(0);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextFromPrizes = () => {
    const missingPrize = Object.values(lotteryPrizes).some((val) => !val.trim());
    if (missingPrize) {
      message.warning("⚠️ Please fill in all lottery prize fields!");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (
      !files.ticket_sales ||
      !files.prizes ||
      !files.customers ||
      !files.banner ||
      !files.background
    ) {
      message.warning("⚠️ Please upload all required files before proceeding!");
      return;
    }

    const formData = new FormData();
    formData.append("ticket_sales", files.ticket_sales);
    formData.append("prizes", files.prizes);
    formData.append("customers", files.customers);
    formData.append("banner", files.banner);
    formData.append("background", files.background);
    formData.append("lottery_prizes", JSON.stringify(lotteryPrizes));

    try {
      setLoading(true);
      setError(null);
      setProgress(0);

      const res = await axios.post("http://127.0.0.1:8000/upload-files/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((100 * e.loaded) / e.total));
        },
      });

      setResults(res.data);
      setStep(3);
      message.success("✅ Files processed successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError("Error uploading files or running pipeline!");
      message.error("❌ Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

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
              fileList={files[name] ? [files[name]] : []}
              onRemove={() => handleRemove(name)}
              accept={accept}
              maxCount={1}
              style={{
                background: hasFile ? "#f6ffed" : "#fafafa",
                borderColor: hasFile ? "#b7eb8f" : "#d9d9d9",
                borderRadius: 10,
                padding: "10px",
                minHeight: "110px",
              }}
            >
              <p className="ant-upload-drag-icon" style={{ fontSize: 26 }}>
                {icon}
              </p>
              {hasFile ? (
                <p style={{ color: "#52c41a", fontWeight: 500 }}>{successMsg}</p>
              ) : (
                <>
                  <p>Click or drag file here</p>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {accept}
                  </Text>
                </>
              )}
            </Dragger>
          </div>
        </Form.Item>
      </Card>
    );
  };

  return (
    <div style={{ background: "#fafafa", minHeight: "100vh", paddingBottom: 50 }}>
      {/* Header */}
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
            objectFit: "contain",
            filter: "drop-shadow(0 0 5px rgba(255,255,255,0.7))",
          }}
        />
        <div>
          <Title
            level={2}
            style={{
              color: "white",
              fontWeight: 700,
              marginBottom: 0,
              letterSpacing: 1,
            }}
          >
            WINWAY Personalized Email Generator
          </Title>
          <Text style={{ color: "#fffbe6", fontSize: 16 }}>
            Empowering marketing with automation and style ✨
          </Text>
        </div>
      </div>

      {/* Main Card */}
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
          style={{ marginBottom: 40 }}
          items={[
            { title: "Prize Setup", icon: <GiftOutlined /> },
            { title: "File Uploads", icon: <InboxOutlined /> },
            { title: "Results Dashboard", icon: <EyeOutlined /> },
          ]}
        />

        {/* ✅ Step 1 – Prize Setup */}
        {step === 1 && (
          <>
            <Title level={3} style={{ textAlign: "center", marginBottom: 10 }}>
              🎁 Lottery Prize Dashboard
            </Title>
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
            <Row gutter={[16, 16]}>
              {Object.keys(lotteryPrizes).map((prize, idx) => (
                <Col xs={24} sm={12} md={8} lg={6} key={idx}>
                  <Card
                    hoverable
                    bordered
                    size="small"
                    title={<Text strong>{prize}</Text>}
                    actions={[
                      <EditOutlined key="edit" onClick={() => setEditingPrize(prize)} />,
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
                        onChange={(e) =>
                          setLotteryPrizes({
                            ...lotteryPrizes,
                            [prize]: e.target.value,
                          })
                        }
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

        {/* ✅ Step 2 – Uploads */}
        {step === 2 && (
          <>
            <Title level={3} style={{ textAlign: "center" }}>
              📂 Upload Files & Review Prizes
            </Title>
            <Divider />
            <Row gutter={[24, 24]}>
              <Col xs={24} md={10}>
                <Card bordered title="🎯 Lottery Prize Summary" style={{ borderRadius: 10 }}>
                  <Row gutter={[12, 12]}>
                    {Object.keys(lotteryPrizes).map((key, idx) => (
                      <Col xs={12} key={idx}>
                        <Card
                          size="small"
                          hoverable
                          style={{
                            borderRadius: 8,
                            background: "#ffffff",
                            borderColor: "#d9d9d9",
                          }}
                          title={key}
                          actions={[
                            <EditOutlined
                              key="edit"
                              onClick={() => setEditingPrize(key)}
                            />,
                          ]}
                        >
                          {editingPrize === key ? (
                            <Input
                              value={lotteryPrizes[key]}
                              onChange={(e) =>
                                setLotteryPrizes({
                                  ...lotteryPrizes,
                                  [key]: e.target.value,
                                })
                              }
                              onBlur={() => setEditingPrize(null)}
                              autoFocus
                            />
                          ) : (
                            <Text type="success">
                              Rs. {parseInt(lotteryPrizes[key]).toLocaleString()}
                            </Text>
                          )}
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>

              <Col xs={24} md={14}>
                <Form layout="vertical">
                  <Row gutter={[12, 12]}>
                    <Col span={12}>
                      {renderUpload(
                        "Ticket Sales (.zip)",
                        "ticket_sales",
                        ".zip",
                        <FileZipOutlined style={{ color: "#1890ff" }} />,
                        "Ticket Sales attached"
                      )}
                    </Col>
                    <Col span={12}>
                      {renderUpload(
                        "Prize Data (.zip)",
                        "prizes",
                        ".zip",
                        <FileZipOutlined style={{ color: "#722ed1" }} />,
                        "Prize Data attached"
                      )}
                    </Col>
                    <Col span={12}>
                      {renderUpload(
                        "Customers (.csv)",
                        "customers",
                        ".csv",
                        <FileTextOutlined style={{ color: "#fa8c16" }} />,
                        "Customer list attached"
                      )}
                    </Col>
                    <Col span={12}>
                      {renderUpload(
                        "Banner (.jpeg/.png)",
                        "banner",
                        ".jpeg,.png",
                        <FileImageOutlined style={{ color: "#13c2c2" }} />,
                        "Banner ready"
                      )}
                    </Col>
                    <Col span={12}>
                      {renderUpload(
                        "Background (.jpeg/.png)",
                        "background",
                        ".jpeg,.png",
                        <FileImageOutlined style={{ color: "#52c41a" }} />,
                        "Background ready"
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
                        "Generate Emails & Images"
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

        {/* ✅ Step 3 – Results */}
        {step === 3 && (
          <>
            <Title level={3} style={{ textAlign: "center" }}>
              📊 Results
            </Title>
            <Divider />
            <ResultsView results={results} />
            <div style={{ textAlign: "center", marginTop: 25 }}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => setStep(2)}
                style={{ marginRight: 10 }}
              >
                Back to Uploads
              </Button>
              <Button type="primary" onClick={handleReset} style={{ marginRight: 10 }}>
                Start Over
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={async () => {
                  const recipient = prompt("Enter recipient email:");
                  if (!recipient) return;
                  try {
                    const res = await fetch("http://127.0.0.1:8000/send-zip-email/", {
                      method: "POST",
                      body: new URLSearchParams({ recipient }),
                    });
                    const data = await res.json();
                    if (data.status?.startsWith("✅")) {
                      message.success(data.status);
                    } else {
                      message.error(data.status || "Error sending email");
                    }
                  } catch {
                    message.error("❌ Error sending email!");
                  }
                }}
              >
                Email ZIP to User
              </Button>
            </div>
          </>
        )}
      </Card>

      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(255,255,255,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Spin size="large" tip="Processing data & generating results..." />
        </div>
      )}
    </div>
  );
}

export default FileUploadForm;
