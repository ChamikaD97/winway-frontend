import React, { useState } from "react";
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
  Statistic,
  Steps,
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
} from "@ant-design/icons";
import axios from "axios";
import { CheckCircleTwoTone } from "@ant-design/icons";
import ResultsView from "./ResultsView"; // ✅ import results view

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { Step } = Steps;

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
  };

  const handleNextFromPrizes = () => {
    const missingPrize = Object.values(lotteryPrizes).some(
      (val) => !val.trim()
    );
    if (missingPrize) {
      message.warning("⚠️ Please fill in all lottery prize fields!");
      return;
    }
    setStep(2);
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

    const res = await axios.post(
      "http://127.0.0.1:8000/upload-files/",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((100 * e.loaded) / e.total));
        },
      }
    );

    console.log("🧩 Backend data:", res.data);
    setResults(res.data); // ✅ directly use backend structure
    setStep(3);
    message.success("✅ Files uploaded and processed successfully!");
  } catch (err) {
    console.error(err);
    setError("Error uploading files or running pipeline!");
    message.error("❌ Something went wrong!");
  } finally {
    setLoading(false);
  }
};


  // Download prizes as CSV
  const handleDownloadCSV = () => {
    const csvRows = [
      ["Lottery", "Prize"],
      ...Object.entries(lotteryPrizes).map(([lottery, prize]) => [
        lottery,
        prize,
      ]),
    ];
    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lottery_prizes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const totalPrizePool = Object.values(lotteryPrizes)
    .map((v) => parseInt(v) || 0)
    .reduce((a, b) => a + b, 0);
  const maxPrize = Math.max(
    ...Object.values(lotteryPrizes).map((v) => parseInt(v) || 0)
  );

  const renderUpload = (label, name, accept, icon, successMsg) => {
    const hasFile = !!files[name];
    return (
      <Card
        size="small"
        style={{ marginBottom: 16, borderRadius: 8 }}
        bodyStyle={{ padding: 8 }}
      >
        <Form.Item label={label} style={{ marginBottom: 8 }}>
          <div style={{ position: "relative" }}>
            {hasFile && (
              <CheckCircleTwoTone
                twoToneColor="#52c41a"
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  fontSize: 18,
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
                padding: "6px",
                minHeight: "120px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <p className="ant-upload-drag-icon" style={{ fontSize: 22 }}>
                {icon}
              </p>
              {hasFile ? (
                <p style={{ color: "#52c41a", fontWeight: 500, fontSize: 11 }}>
                  {successMsg}
                </p>
              ) : (
                <>
                  <p style={{ fontSize: 11 }}>Click or drag</p>
                  <p style={{ fontSize: 10, color: "#888" }}>{accept}</p>
                </>
              )}
            </Dragger>
          </div>
        </Form.Item>
      </Card>
    );
  };

  return (
    <Card
      style={{
        maxWidth: 1300,
        margin: "20px auto",
        padding: "20px",
        borderRadius: 10,
      }}
      bordered
    >
      {/* Stepper */}
      <Steps current={step - 1} style={{ marginBottom: 30 }}>
        <Step title="Enter Prizes" />
        <Step title="Upload Files" />
        <Step title="View Results" />
      </Steps>

      {/* Step 1: Enter prizes */}
      {step === 1 && (
        <>
          <Title level={3} style={{ textAlign: "center" }}>
            🎁 Enter Lottery Prizes
          </Title>
          <Divider />
          <Form layout="vertical">
            <Row gutter={[12, 12]}>
              {Object.keys(lotteryPrizes).map((prize, idx) => (
                <Col xs={24} sm={12} md={8} lg={6} key={idx}>
                  <Form.Item label={prize}>
                    <Input
                      placeholder="Enter prize amount"
                      value={lotteryPrizes[prize]}
                      onChange={(e) =>
                        setLotteryPrizes({
                          ...lotteryPrizes,
                          [prize]: e.target.value,
                        })
                      }
                    />
                  </Form.Item>
                </Col>
              ))}
            </Row>
            <Form.Item style={{ textAlign: "center", marginTop: 20 }}>
              <Button
                type="primary"
                onClick={handleNextFromPrizes}
                size="large"
                icon={<ArrowRightOutlined />}
              >
                Next
              </Button>
            </Form.Item>
          </Form>
        </>
      )}

      {/* Step 2: Prize summary + Uploaders */}
      {step === 2 && (
        <>
          <Title level={3} style={{ textAlign: "center" }}>
            🎯 Upload Required Files
          </Title>
          <Divider />

          <Row gutter={24}>
            {/* LEFT: Prize Summary */}
            <Col xs={24} md={10}>
              <Card bordered style={{ marginBottom: 20 }}>
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

            {/* RIGHT: Uploaders */}
            <Col xs={24} md={14}>
              <Form layout="vertical">
                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    {renderUpload(
                      "Ticket Sales (.zip)",
                      "ticket_sales",
                      ".zip",
                      <FileZipOutlined
                        style={{ fontSize: 20, color: "#1890ff" }}
                      />,
                      "Ticket Sales attached"
                    )}
                  </Col>
                  <Col span={12}>
                    {renderUpload(
                      "Prize Data (.zip)",
                      "prizes",
                      ".zip",
                      <FileZipOutlined
                        style={{ fontSize: 20, color: "#722ed1" }}
                      />,
                      "Prize Data attached"
                    )}
                  </Col>
                  <Col span={12}>
                    {renderUpload(
                      "Customers (.csv)",
                      "customers",
                      ".csv",
                      <FileTextOutlined
                        style={{ fontSize: 20, color: "#fa8c16" }}
                      />,
                      "Customer list attached"
                    )}
                  </Col>
                  <Col span={12}>
                    {renderUpload(
                      "Banner (.jpeg/.png)",
                      "banner",
                      ".jpeg,.png",
                      <FileImageOutlined
                        style={{ fontSize: 20, color: "#13c2c2" }}
                      />,
                      "Banner ready"
                    )}
                  </Col>
                  <Col span={12}>
                    {renderUpload(
                      "Background (.jpeg/.png)",
                      "background",
                      ".jpeg,.png",
                      <FileImageOutlined
                        style={{ fontSize: 20, color: "#52c41a" }}
                      />,
                      "Background ready"
                    )}
                  </Col>
                </Row>

                {error && (
                  <Alert
                    type="error"
                    message={error}
                    showIcon
                    closable
                    style={{ marginTop: 15 }}
                  />
                )}
                {progress > 0 && (
                  <Progress
                    percent={progress}
                    status={loading ? "active" : "normal"}
                    style={{ marginTop: 15 }}
                  />
                )}

                <Form.Item style={{ textAlign: "center", marginTop: 20 }}>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => setStep(1)}
                    style={{ marginRight: 10 }}
                  >
                    Back
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    size="large"
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
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                    danger
                  >
                    Reset
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </>
      )}

      {/* Step 3: Results */}
      {step === 3 && (
        <>
          <Title level={3} style={{ textAlign: "center" }}>
            📊 Results
          </Title>
          <Divider />
          <ResultsView results={results} />
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => setStep(2)}
              style={{ marginRight: 10 }}
            >
              Back to Uploads
            </Button>
            <Button
              type="primary"
              onClick={handleReset}
              style={{ marginRight: 10 }}
            >
              Start Over
            </Button>

            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={async () => {
                const recipient = prompt("Enter recipient email:");
                if (!recipient) return;
                try {
                  const res = await fetch(
                    "http://127.0.0.1:8000/send-zip-email/",
                    {
                      method: "POST",
                      body: new URLSearchParams({ recipient }),
                    }
                  );
                  const data = await res.json();
                  if (data.status.startsWith("✅")) {
                    message.success(data.status);
                  } else {
                    message.error(data.status);
                  }
                } catch (err) {
                  message.error("❌ Error sending email!");
                }
              }}
            >
              Email ZIP to User
            </Button>
          </div>
        </>
      )}

      {/* Loading Overlay */}
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
    </Card>
  );
}

export default FileUploadForm;
