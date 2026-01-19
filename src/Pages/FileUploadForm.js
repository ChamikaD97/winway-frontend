import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Tooltip,
  Space,
  Tag,
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
  CrownOutlined,
  TeamOutlined,
  PhoneOutlined,
  SaveOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import ResultsView from "./ResultsView";
import logo from "../assets/logo.png";
import { getSettings, saveSettingsGroup } from "../api/endPoints";

const { Title, Text } = Typography;
const { Dragger } = Upload;
const API_BASE = "http://127.0.0.1:8000";

function FileUploadForm() {
  // ---------------- STATE ----------------
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState({});
  const [lotteryPrizes, setLotteryPrizes] = useState({});
  const [numCustomers, setNumCustomers] = useState("");
  const [mobileNumber, setMobileNumber] = useState(""); // ✅ new input
  const [editingPrize, setEditingPrize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const rawDate = settings?.LastUpdatedPrizes;

  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Colombo",
      })
    : "N/A";

  const saveSettingGroup = async (group) => {
    try {
      setSaving(true);

      await saveSettingsGroup(group);

      message.success("Settings saved successfully");
    } catch (err) {
      console.error(err);
      message.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // 🔄 Load settings from backend
  const fetchSettings = async () => {
    try {
      setLoading(true);

      const settingsArray = await getSettings();
      const map = Object.fromEntries(
        settingsArray.data.data.map((s) => [s.key, s.value])
      );

      setSettings(map);
      setLotteryPrizes({
        AdaSampatha: map.AdaSampatha,
        DhanaNidhanaya: map.DhanaNidhanaya,
        Govisetha: map.Govisetha,
        Handahana: map.Handahana,
        MahajanaSampatha: map.MahajanaSampatha,
        MegaPower: map.MegaPower,
        NLBJaya: map.NLBJaya,
        SubaDawasak: map.SubaDawasak,
      });
      console.log(map);
    } catch (err) {
      message.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };
  // ---------------- LOCAL STORAGE ----------------
  useEffect(() => {
    const savedPrizes = localStorage.getItem("lotteryPrizes");
    const savedNum = localStorage.getItem("numCustomers");
    if (savedPrizes) setLotteryPrizes(JSON.parse(savedPrizes));
    if (savedNum) setNumCustomers(savedNum);
  }, []);
  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    localStorage.setItem("lotteryPrizes", JSON.stringify(lotteryPrizes));
  }, [lotteryPrizes]);

  useEffect(() => {
    if (numCustomers) localStorage.setItem("numCustomers", numCustomers);
  }, [numCustomers]);

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
  const handleChange = useCallback((file, name) => {
    setFiles((prev) => ({ ...prev, [name]: file }));
    return false;
  }, []);

  const handleRemove = useCallback((name) => {
    setFiles((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  }, []);

  const handleReset = useCallback(() => {
    setStep(1);
    setFiles({});
    setEditingPrize(null);
    setResults(null);
    setProgress(0);
    setError(null);
    setLastGenerated(null);
    setNumCustomers("");
    setMobileNumber("");
    message.info("Form reset successfully");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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

  // ✅ Updated handleSubmit
  const handleSubmit = async () => {
    if (!files.ticket_sales || !files.prizes || !files.customers) {
      message.warning("⚠️ Please upload all required files before proceeding!");
      return;
    }

    const formData = new FormData();
    Object.entries(files).forEach(([key, file]) => formData.append(key, file));
    formData.append("lottery_prizes", JSON.stringify(lotteryPrizes));
    formData.append("num_customers", numCustomers);
    let formattedMobile = mobileNumber;
    if (formattedMobile) {
      if (mobileNumber.startsWith("0")) {
        // 0712345678 → +94712345678
        formattedMobile = "+94" + mobileNumber.slice(1);
      } else if (mobileNumber.startsWith("94")) {
        // 94712345678 → +94712345678
        formattedMobile = "+" + mobileNumber;
      } else if (mobileNumber.startsWith("+94")) {
        formattedMobile = mobileNumber || "";
      } else if (
        !mobileNumber.startsWith("0") &&
        !mobileNumber.startsWith("94")
      ) {
        formattedMobile = "+94" + mobileNumber;
      } else {
        // keep original
        formattedMobile = mobileNumber || "";
      }
    }

    formData.append("mobile_number", formattedMobile);

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

  // ---------------- REUSABLE UPLOAD ----------------
  const renderUpload = useCallback(
    (label, name, accept, icon, successMsg) => {
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
          styles={{ padding: 8 }}
        >
          <Form.Item
            label={<Text strong>{label}</Text>}
            style={{ marginBottom: 8 }}
          >
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
                  <p style={{ color: "#52c41a", fontWeight: 500 }}>
                    {successMsg}
                  </p>
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
    },
    [files, handleChange, handleRemove]
  );

  // ---------------- RENDER ----------------
  return (
    <>
      {/* STEP 1 - Prize setup */}
      {step === 1 && (
        <>
          <Spin
            spinning={loading}
            indicator={<LoadingOutlined spin />}
            tip="Processing..."
          />
          <Title level={3} style={{ textAlign: "left" }}>
            Update Lottery Super Prizes
          </Title>
          <Divider />
          <Row
            gutter={16}
            justify="center"
            style={{
              boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
              marginBottom: 10,
            }}
          >
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
              <Card
                bordered
                style={{
                  background: "#fff7e6",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
                }}
              >
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
              <Card
                bordered
                style={{
                  boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
                  background: "#f6ffed",
                }}
              >
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
          <Row gutter={[24, 24]}>
            <Card
              headStyle={{
                background: "#001529",
                color: "#fff",
                fontWeight: "600",
                borderRadius: "10px 10px 0 0",
              }}
              title="Super Prize Amounts"
              extra={
                <Space size="middle">
                  {/* Optional Refresh */}
                  <Tooltip title="Refresh latest values">
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={fetchSettings} // <-- your existing reload function
                    />
                  </Tooltip>

                  {/* Save Button */}
                  <Button
                    icon={<SaveOutlined />}
                    type="primary"
                    loading={saving}
                    onClick={() =>
                      saveSettingGroup({
                        AdaSampatha: lotteryPrizes.AdaSampatha,
                        DhanaNidhanaya: lotteryPrizes.DhanaNidhanaya,
                        Govisetha: lotteryPrizes.Govisetha,
                        Handahana: lotteryPrizes.Handahana,
                        MahajanaSampatha: lotteryPrizes.MahajanaSampatha,
                        MegaPower: lotteryPrizes.MegaPower,
                        NLBJaya: lotteryPrizes.NLBJaya,
                        SubaDawasak: lotteryPrizes.SubaDawasak,
                        LastUpdatedPrizes: new Date().toISOString(),
                      })
                    }
                  >
                    Save
                  </Button>
                </Space>
              }
            >
              <Row gutter={[20, 20]}>
                {lotteryPrizes &&
                  Object.entries(lotteryPrizes).map(([prize, value]) => {
                    return (
                      <Col xs={24} sm={12} md={8} lg={6} key={prize}>
                        <Card hoverable bordered={false}>
                          {/* Header */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 12,
                            }}
                          >
                            <Text>{prize}</Text>
                          </div>

                          {/* Body */}
                          <>
                            <Input
                              autoFocus
                              size="large"
                              prefix="Rs."
                              value={Number(value || 0).toLocaleString()}
                              onChange={(e) => {
                                const val = e.target.value.replace(
                                  /[^\d]/g,
                                  ""
                                );
                                setLotteryPrizes({
                                  ...lotteryPrizes,
                                  [prize]: val,
                                });
                              }}
                              style={{
                                fontSize: 18,
                                textAlign: "center",
                                borderRadius: 10,
                              }}
                            />
                          </>
                        </Card>
                      </Col>
                    );
                  })}
              </Row>
            </Card>
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

      {/* STEP 2 - Upload */}
      {step === 2 && (
        <>
          <div style={{ position: "relative" }}>
            <Spin
              spinning={loading}
              indicator={<LoadingOutlined spin />}
              tip="Processing..."
            >
              <Title level={3} style={{ textAlign: "left" }}>
                Upload Files & Specify Customers
              </Title>

              <Divider />
              <Row gutter={[24, 24]} justify="center">
                <Col xs={24} lg={20}>
                  <Form layout="vertical">
                    {/* File Uploads */}
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

                    {/* ✅ New Input Fields */}
                    <Row gutter={[12, 12]} justify="center">
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item
                          label={
                            <Text strong>Number of Customers to Include</Text>
                          }
                          style={{ marginTop: 20 }}
                        >
                          <Input
                            type="number"
                            min={1}
                            value={numCustomers}
                            onChange={(e) => setNumCustomers(e.target.value)}
                            prefix={<TeamOutlined />}
                            placeholder="e.g. 500"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item
                          label={
                            <Text strong>
                              Filter by Mobile Number (Optional)
                            </Text>
                          }
                          style={{ marginTop: 20 }}
                        >
                          <Input
                            type="text"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            prefix={<PhoneOutlined />}
                            placeholder="e.g. +94779488015"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Alerts / Progress */}
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

                    {/* Buttons */}
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

                      <Button
                        icon={<ReloadOutlined />}
                        danger
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                    </div>
                  </Form>
                </Col>
              </Row>
            </Spin>
          </div>
        </>
      )}

      {/* STEP 3 - Results */}
      {step === 3 && results && (
        <>
          <Title level={3} style={{ textAlign: "left" }}>
            Results
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
    </>
  );
}

export default FileUploadForm;
