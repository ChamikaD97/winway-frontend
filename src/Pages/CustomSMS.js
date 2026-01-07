import React, { useMemo, useState } from "react";
import {
  Card,
  Input,
  Button,
  Form,
  message,
  Typography,
  Steps,
  Table,
  Upload,
  Select,
  Statistic,
  Row,
  Col,
  Divider,
  Alert,
  Space,
  Tag,
  Progress,
} from "antd";
import axios from "axios";
import { UploadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

/* ================= CONFIG ================= */
const API_BASE = "http://127.0.0.1:8000";
const API_SMS = "http://localhost:8001";

/* 🔁 SWITCH MODE HERE */
const IS_TEST_MODE = true;

/* 🇱🇰 Sri Lanka number normalizer */
const normalizeLK = (n) => {
  if (!n) return null;
  let num = n.toString().trim().replace(/\s+/g, "");
  if (num.startsWith("+94")) num = num.replace("+94", "94");
  if (num.startsWith("0")) num = "94" + num.slice(1);
  if (num.length === 9) num = "94" + num;
  return num.startsWith("94") && num.length === 11 ? num : null;
};

const getSendNumber = (customer) =>
  IS_TEST_MODE ? normalizeLK("0719762509") : normalizeLK("0719762509");

/* ================= TEMPLATE UTILS ================= */
const extractKeys = (obj, prefix = "") =>
  Object.entries(obj || {}).flatMap(([k, v]) =>
    typeof v === "object" && v !== null
      ? extractKeys(v, `${prefix}${k}.`)
      : `${prefix}${k}`
  );

/* ================= CARD UPLOADER ================= */
const renderUpload = (title, accept, icon, text, onUpload) => (
  <Upload accept={accept} showUploadList={false} customRequest={onUpload}>
    <Card
      hoverable
      style={{
        textAlign: "center",
        borderRadius: 12,
        height: 140,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div>
        <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
        <Text strong>{title}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {text}
        </Text>
      </div>
    </Card>
  </Upload>
);

/* ================= COMPONENT ================= */
function CustomSMS() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  /* Login */
  const [login, setLogin] = useState({
    username: "chamika@winway.lk",
    password: "iq_!85PB",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /* Customers */

  const [customers, setCustomers] = useState([]);
  const [mobile_column, setMobileColoum] = useState("Mobile Number");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  // which dynamic columns are visible
  const [visibleColumns, setVisibleColumns] = useState([]);

  /* SMS */
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [totalToSend, setTotalToSend] = useState(0);

  const [sms, setSms] = useState({
    campaignName: "",
    mask: "WIN WAY",
    content: "",
  });
  const transformValue = (key, value) => {
    if (!value) return "";

    // Gender → Mr / Ms mapping
    if (key.toLowerCase() === "gender") {
      const v = value.toString().toLowerCase();
      if (["male", "m"].includes(v)) return "Mr";
      if (["female", "f"].includes(v)) return "Ms";
      return "";
    }

    return value;
  };

  const applyTemplate = (template, customer) =>
    template.replace(/{{(.*?)}}/g, (_, key) => {
      const rawValue = key
        .split(".")
        .reduce((o, i) => (o ? o[i] : ""), customer);

      return transformValue(key, rawValue) ?? "";
    });

  const templateKeys = useMemo(
    () => (customers.length ? extractKeys(customers[0]) : []),
    [customers]
  );

  /* ================= LOGIN ================= */
  const handleLogin = async () => {
    if (!login.username || !login.password)
      return message.warning("Enter username and password");

    setLoading(true);
    try {
      await axios.post(`${API_SMS}/sms/login`, login);
      setIsLoggedIn(true);
      setStep(1);
      message.success("Login successful");
    } catch {
      message.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CSV UPLOAD ================= */
  const handleCsvUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("customers", file);

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/csv-upload-process`, formData);
      const rows = res.data.data || [];
      setCustomers(rows);

      setMobileColoum(res.data.mobile_column || "MobileNumber");

      if (rows.length > 0) {
        setVisibleColumns(Object.keys(rows[0]));
      }
      setSelectedCustomers([]);
      setSelectedRowKeys([]);
      message.success(`CSV loaded (${res.data.total_rows} rows)`);
    } catch {
      message.error("CSV upload failed");
    } finally {
      setLoading(false);
    }
  };
  // Fields you DON'T want as table columns
  const EXCLUDED_FIELDS = ["id", "createdAt", "updatedAt", mobile_column];

  const dynamicColumns = useMemo(() => {
    return templateKeys
      .filter(
        (key) => !EXCLUDED_FIELDS.includes(key) && visibleColumns.includes(key)
      )
      .map((key) => ({
        title: key,
        dataIndex: key,
        key,
        render: (value) =>
          value !== undefined && value !== null ? value.toString() : "-",
      }));
  }, [templateKeys, visibleColumns, mobile_column]);

  const columns = useMemo(() => {
    return [
      {
        title: "Mobile",
        dataIndex: mobile_column,
        key: mobile_column,
        fixed: "left",
      },

      ...dynamicColumns,
    ];
  }, [dynamicColumns]);

  /* ================= COMPUTED ================= */

  const validNumbers = selectedCustomers
    .map((c) => normalizeLK(c.MobileNumber))
    .filter(Boolean);

  const smsCount = !IS_TEST_MODE
    ? validNumbers.length > 0
      ? 1
      : 0
    : validNumbers.length;

  const step2Ready = customers.length && selectedCustomers.length;
  const step3Ready =
    sms.campaignName.trim() && sms.mask.trim() && sms.content.trim();

  /* ================= NAV ================= */
  const goNext = () => {
    if (step === 1 && !step2Ready)
      return message.warning("Select at least one customer");
    if (step === 2 && !step3Ready)
      return message.warning("Fill all SMS fields");
    setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => s - 1);

  const sendSms = async () => {
    if (!selectedCustomers.length)
      return message.warning("No customers selected");

    const targets = !IS_TEST_MODE
      ? selectedCustomers.slice(0, 1)
      : selectedCustomers;

    setTotalToSend(targets.length);
    setSentCount(0);
    setSending(true);

    try {
      let count = 0;

      for (const c of targets) {
        const mobile = getSendNumber(c);
        if (!mobile) continue;

        await axios.post(`${API_SMS}/sms/send`, {
          campaignName: sms.campaignName,
          mask: sms.mask,
          numbers: mobile,
          content: applyTemplate(sms.content, c),
        });

        count += 1;
        setSentCount(count);
      }

      message.success(
        IS_TEST_MODE
          ? "SMS sent successfully (TEST MODE)"
          : "All SMS sent successfully"
      );
    } catch (err) {
      message.error("Error occurred while sending SMS");
    } finally {
      setSending(false);
    }
  };

  /* ================= TABLE ================= */

  /* ================= UI ================= */
  return (
    <Card>
      <Title level={3}>SMS Portal {IS_TEST_MODE && "(TEST MODE)"}</Title>

      <Steps current={step} style={{ marginBottom: 24 }}>
        <Step title="Login" />
        <Step title="Customer Selection" />
        <Step title="SMS Compose" />
        <Step title="Send" />
      </Steps>

      {/* ================= STEP 1 : LOGIN ================= */}
      {step === 0 && (
        <Row justify="center" align="middle" style={{ minHeight: "60vh" }}>
          <Col xs={24} sm={20} md={14} lg={10}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              }}
            >
              <Space direction="vertical" size={24} style={{ width: "100%" }}>
                <div style={{ textAlign: "center" }}>
                  <Title level={3}>SMS Gateway Login</Title>
                  <Text type="secondary">Authenticate to continue</Text>
                </div>

                <Form layout="vertical">
                  <Form.Item label="Username">
                    <Input
                      size="large"
                      value={login.username}
                      onChange={(e) =>
                        setLogin((p) => ({
                          ...p,
                          username: e.target.value,
                        }))
                      }
                    />
                  </Form.Item>

                  <Form.Item label="Password">
                    <Input.Password
                      size="large"
                      value={login.password}
                      onChange={(e) =>
                        setLogin((p) => ({
                          ...p,
                          password: e.target.value,
                        }))
                      }
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    size="large"
                    block
                    loading={loading}
                    onClick={handleLogin}
                  >
                    Login & Continue
                  </Button>
                </Form>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* ================= STEP 2 ================= */}
      {step === 1 && (
        <Card>
          {/* ================= UPLOAD ================= */}
          <Row justify="center">
            <Col>
              {renderUpload(
                "Customer CSV (.csv)",
                ".csv",
                <UploadOutlined style={{ color: "#52c41a" }} />,
                customers.length ? "CSV Uploaded" : "Click to upload CSV",
                handleCsvUpload
              )}
            </Col>
          </Row>

          {/* ================= DATA PART ================= */}
          {customers.length > 0 && (
            <>
              <Divider />

              {/* ===== STATS ===== */}
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Customers Loaded"
                    value={customers.length}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Selected Customers"
                    value={selectedCustomers.length}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Valid Numbers"
                    value={validNumbers.length}
                  />
                </Col>
                <Col span={6}>
                  <Statistic title="SMS Count" value={smsCount} />
                </Col>
              </Row>

              <Divider />

              {/* ================= DYNAMIC FIELDS ================= */}
              <Card
                size="small"
                title="🧩 Available Dynamic Fields (Click to show / hide columns)"
                style={{ marginBottom: 16, background: "#fafafa" }}
              >
                <Space wrap>
                  {templateKeys
                    .filter((key) => !EXCLUDED_FIELDS.includes(key))
                    .map((key) => {
                      const active = visibleColumns.includes(key);

                      return (
                        <Tag
                          key={key}
                          color={active ? "blue" : "default"}
                          style={{ cursor: "pointer", userSelect: "none" }}
                          onClick={() =>
                            setVisibleColumns((prev) =>
                              prev.includes(key)
                                ? prev.filter((k) => k !== key)
                                : [...prev, key]
                            )
                          }
                        >
                          {key}
                        </Tag>
                      );
                    })}
                </Space>

                <Text
                  type="secondary"
                  style={{ display: "block", marginTop: 8 }}
                >
                  Click a field to add or remove it from the table view.
                </Text>
              </Card>

              {/* ================= TABLE ================= */}
              <Table
                rowKey={mobile_column}
                columns={columns}
                dataSource={customers}
                rowSelection={{
                  selectedRowKeys,
                  onChange: (k, r) => {
                    console.log(r);
                    console.log(k);

                    setSelectedRowKeys(k);
                    setSelectedCustomers(r);
                  },
                }}
                pagination={{ pageSize: 10 }}
                scroll={{ x: "max-content" }}
              />
            </>
          )}
        </Card>
      )}

      {/* ================= STEP 3 ================= */}
      {step === 2 && (
        <Card>
          <Row gutter={24}>
            <Col span={14}>
              <Form layout="vertical">
                <Form.Item label="Campaign Name">
                  <Input
                    value={sms.campaignName}
                    onChange={(e) =>
                      setSms((p) => ({
                        ...p,
                        campaignName: e.target.value,
                      }))
                    }
                  />
                </Form.Item>

                <Form.Item label="Mask">
                  <Input
                    value={sms.mask}
                    onChange={(e) =>
                      setSms((p) => ({ ...p, mask: e.target.value }))
                    }
                  />
                </Form.Item>

                <Form.Item label="Insert Dynamic Field">
                  <Select
                    onSelect={(v) =>
                      setSms((p) => ({
                        ...p,
                        content: `${p.content} {{${v}}}`,
                      }))
                    }
                  >
                    {templateKeys.map((k) => (
                      <Option key={k}>{k}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label={`Message (${sms.content.length} characters)`}>
                  <Input.TextArea
                    rows={6}
                    value={sms.content}
                    onChange={(e) =>
                      setSms((p) => ({ ...p, content: e.target.value }))
                    }
                  />
                </Form.Item>
              </Form>
            </Col>

            <Col span={10}>
              <Card size="small" title="📱 SMS Preview">
                {selectedCustomers.length ? (
                  <Alert
                    type="info"
                    showIcon
                    message={applyTemplate(
                      sms.content || "Start typing...",
                      selectedCustomers[0]
                    )}
                  />
                ) : (
                  <Alert
                    type="warning"
                    showIcon
                    message="Select a customer to preview"
                  />
                )}
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* ================= STEP 4 ================= */}
      {step === 3 && (
        <Card>
          {IS_TEST_MODE && (
            <Alert
              type="warning"
              showIcon
              message="TEST MODE ACTIVE"
              description="Only one SMS will be sent"
              style={{ marginBottom: 16 }}
            />
          )}

          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="Customers Loaded" value={customers.length} />
            </Col>
            <Col span={6}>
              <Statistic
                title="Selected Customers"
                value={selectedCustomers.length}
              />
            </Col>
            <Col span={6}>
              <Statistic title="Valid Numbers" value={validNumbers.length} />
            </Col>
            <Col span={6}>
              <Statistic title="SMS Count" value={smsCount} />
            </Col>
          </Row>

          <Divider />

          {/* ===== PROGRESS ===== */}
          {sending && (
            <>
              <Text strong>
                Sending SMS {sentCount} / {totalToSend}
              </Text>

              <Progress
                percent={Math.round((sentCount / totalToSend) * 100)}
                status="active"
                style={{ marginTop: 8, marginBottom: 16 }}
              />
            </>
          )}

          <Button
            type="primary"
            size="large"
            block
            loading={sending}
            disabled={sending}
            onClick={sendSms}
          >
            {sending ? "Sending..." : "Send SMS"}
          </Button>
        </Card>
      )}

      {/* ================= FOOTER ================= */}
      <Divider />

      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Button disabled={step === 0} onClick={goBack}>
          Back
        </Button>

        {step < 3 && (
          <Button type="primary" onClick={goNext}>
            Next
          </Button>
        )}
      </Space>
    </Card>
  );
}

export default CustomSMS;
