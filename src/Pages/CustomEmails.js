import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Modal,
  List,
  Tooltip,
  Switch,
  UploadFile,
} from "antd";
import axios from "axios";
import headerLogo from "../assets/logo.png";
import footerLogo from "../assets/nlb_logo.png";
import {
  Editor,
  EditorProvider,
  Toolbar,
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnStrikeThrough,
  BtnBulletList,
  BtnNumberedList,
  BtnUndo,
  BtnRedo,
  BtnLink,
  BtnClearFormatting,
  BtnStyles,
} from "react-simple-wysiwyg";
import {
  StopOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ClockCircleTwoTone,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  PictureOutlined,
  RedoOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  MailOutlined,
  UploadOutlined,
  FileTextOutlined,
  DownloadOutlined,
  MoneyCollectFilled,
  DollarCircleFilled,
} from "@ant-design/icons";
// Add these imports
import { ReloadOutlined } from "@ant-design/icons";
import { DatePicker } from "antd";
import dayjs from "dayjs";
const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

/* ================= CONFIG ================= */
const API_BASE = "http://127.0.0.1:8000";
const API_BASE_LOCAL = "http://localhost:8001";

/* ================= COMPONENT ================= */
function CustomEmails() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [IS_TEST_MODE, Set_IS_TEST_MODE] = useState(true);

  const [form] = Form.useForm();
  const [uploadForm] = Form.useForm(); // Separate form for upload

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [mobile_column, setMobileColoum] = useState("Mobile Number");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [title, setTitle] = useState("");
  const [filename, setFilename] = useState(""); // New state for filename
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null); // Store upload response
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [monthForm] = Form.useForm();
  /* Email sending states */
  const pausedRef = useRef(false);
  const stoppedRef = useRef(false);
  const [filtered, setFiltered] = useState([]);
  const [sendingMailAll, setSendingMailAll] = useState(false);
  const [logList, setLogList] = useState([]);
  const [progress, setProgress] = useState(0);
  const [noEmailList, setNoEmailList] = useState([]);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [totalToSend, setTotalToSend] = useState(0);
  const [editorValue, setEditorValue] = useState("");
  /* ================= CARD THEME ================= */
  const cardBase = {
    borderRadius: 14,
    transition: "all 0.25s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  };

  const cardStyles = {
    blue: {
      background: "linear-gradient(145deg, #e3f2fd, #ffffff)",
      border: "1px solid #bbdefb",
    },
    green: {
      background: "linear-gradient(145deg, #e8f5e9, #ffffff)",
      border: "1px solid #c8e6c9",
    },
    orange: {
      background: "linear-gradient(145deg, #fff3e0, #ffffff)",
      border: "1px solid #ffe0b2",
    },
    red: {
      background: "linear-gradient(145deg, #fff1f0, #ffffff)",
      border: "1px solid #ffa39e",
    },
    purple: {
      background: "linear-gradient(145deg, #f3e8ff, #ffffff)",
      border: "1px solid #d3adf7",
    },
    neutral: {
      background: "#ffffff",
      border: "1px solid #e0e0e0",
    },
  };

  /* ================= UTILITY FUNCTIONS ================= */
  function toProperCase(name = "") {
    return name
      .replace(/[^a-zA-Z ]/g, "")
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const getGenderTitle = (customer = {}) => {
    const g = (customer.GENDER || "").toLowerCase();
    if (g === "male") return "Mr.";
    if (g === "female") return "Ms.";
    return "";
  };

  const transformValue = (key, value) => {
    if (!value) return "";
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

  const generateLoyaltyCustomeEmail = (
    body,
    customer = {},
    title,
    headerLogo,
    footerLogo,
  ) => {
    const renderedBody = applyTemplate(body, customer);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>
<body style="margin:0; padding:0; sans-serif; border-radius:18px;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding:0;">
        <table width="100%" style="
          background:#EBF0F9;
          border-radius:18px;
          overflow:hidden;
          border:3px solid #000;
          box-shadow:0 5px 25px rgba(0,0,0,0.1);
        ">
          <!-- HEADER -->
          <tr>
            <td align="center">
              <div style="border-radius:18px;
                background:linear-gradient(135deg,#7b2ff7,#f107a3);
                padding:22px 30px;
              ">
                <table width="100%">
                  <tr>
                    <td align="left" width="70">
                      <img src="${headerLogo}" width="90" height="90" style="border-radius:8px;" />
                    </td>
                    <td align="center">
                      <h1 style="color:#fff; font-size:32px; margin:0; font-family:'Crimson Text';">
                        ${title}
                      </h1>
                    </td>
                    <td width="70"></td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px; font-size:16px; color:#333; line-height:1.6;">
              <p style="font-size:18px; font-family:'Sylfaen'; font-style:italic;">
                <strong>${getFullGreeting(customer)},</strong>
              </p>
              <p style="margin:0 0 0 0; font-family:'Sylfaen'; font-style: italic;font-size:15px;">
                ${renderedBody}
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#D6DCE5; padding:18px 30px; color:#777;">
              <table width="100%">
                <tr>
                  <td align="left">
                    <strong>
                      © ${new Date().getFullYear()} ThinkCube Systems (Pvt) Ltd.<br/>
                      📞 0707884884 | 0722884884
                    </strong>
                    <br/>
                    <a href="https://www.winway.lk">www.winway.lk</a> |
                    <a href="https://www.884.lk">www.884.lk</a>
                  </td>
                  <td align="right" width="60">
                    <img src="${footerLogo}" width="55" height="55" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  function getFullGreeting(customer = {}) {
    const greeting = getGenderTitle(customer);
    const firstName = customer.FIRSTNAME?.trim();
    const lastName = customer.LastName?.trim();
    const name =
      firstName && lastName
        ? `${firstName} ${lastName}`
        : firstName || lastName || "Valued Customer";
    return toProperCase(`Dear ${greeting ? greeting + " " : ""}${name},`);
  }

  const previewHtml = useMemo(() => {
    if (!customers.length) return "";
    return generateLoyaltyCustomeEmail(
      editorValue,
      customers[0],
      title,
      headerLogo,
      footerLogo,
    );
  }, [editorValue, customers, title, headerLogo, footerLogo]);

  /* ================= TEMPLATE UTILS ================= */
  const extractKeys = (obj, prefix = "") =>
    Object.entries(obj || {}).flatMap(([k, v]) =>
      typeof v === "object" && v !== null
        ? extractKeys(v, `${prefix}${k}.`)
        : `${prefix}${k}`,
    );

  const templateKeys = useMemo(
    () => (customers.length ? extractKeys(customers[0]) : []),
    [customers],
  );

  /* ================= CSV UPLOAD HANDLER ================= */
  const handleCsvUpload = async () => {
    const values = await uploadForm.validateFields();
    const file = values.customers?.[0]?.originFileObj;

    if (!file) {
      message.error("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("customers", file);

    // Add optional filename if provided
    if (filename.trim()) {
      formData.append("filename", filename.trim());
    }

    // Add optional mobile number override if provided
    if (values.mobile_override?.trim()) {
      formData.append("mobile_number", values.mobile_override.trim());
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/csv-upload-process`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const rows = res.data.data || [];
      console.log("Upload response:", res.data);

      setCustomers(rows);
      setFiltered(rows);
      setFilteredCustomers(rows);
      setMobileColoum(res.data.mobile_column || "MobileNumber");
      setUploadedFileInfo({
        saved_file: res.data.saved_file,
        user_provided_name: res.data.user_provided_name,
        saved_path: res.data.saved_path,
        file_size_bytes: res.data.file_size_bytes,
        upload_timestamp: res.data.upload_timestamp,
      });

      if (rows.length > 0) {
        setVisibleColumns(Object.keys(rows[0]));
      }

      setSelectedRowKeys([]);
      message.success(
        `CSV loaded (${res.data.total_rows} rows) - Saved as: ${res.data.saved_file}`,
      );

      // Reset filename after successful upload
      setFilename("");
      uploadForm.resetFields(["filename"]);
    } catch (error) {
      console.error("Upload error:", error);
      message.error(error.response?.data?.error || "CSV upload failed");
    } finally {
      setStep(1);
      setLoading(false);
    }
  };

  /* ================= CSV EXPORT ================= */
  const exportNoEmailCSV = () => {
    const csv = [
      "Name,Mobile,Tier",
      ...noEmailList.map((c) => `${c.name},${c.mobile},${c.tier}`),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "no-email-customers.csv";
    a.click();
  };

  /* ================= SEARCH FILTER ================= */
  useEffect(() => {
    if (!searchText) {
      setFilteredCustomers(customers);
      return;
    }

    const s = searchText.toLowerCase();
    const filtered = customers.filter((row) =>
      visibleColumns.some((key) => {
        const value = key.split(".").reduce((o, i) => (o ? o[i] : ""), row);
        return value && value.toString().toLowerCase().includes(s);
      }),
    );

    setFilteredCustomers(filtered);
  }, [customers, searchText, visibleColumns]);

  /* ================= TABLE CONFIG ================= */
  const EXCLUDED_FIELDS = ["id", "createdAt", "updatedAt", mobile_column];

  const dynamicColumns = useMemo(() => {
    return templateKeys
      .filter(
        (key) => !EXCLUDED_FIELDS.includes(key) && visibleColumns.includes(key),
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
    return [...dynamicColumns];
  }, [dynamicColumns, mobile_column]);

  /* ================= EMAIL SENDING ================= */
  const sendLoyaltyEmail = async (customer, i, subject, body, title) => {
    try {
      console.log(customer.EMAIL);

      const formData = new FormData();
      formData.append("to", customer.EMAIL ? customer.EMAIL : "");
      if (i < 20) {
        // formData.append("cc", "info@winway.lk");
      }
      formData.append(
        "name",
        `${customer?.FIRSTNAME || ""} ${customer?.LASTNAME || ""}`,
      );
      formData.append("type", "loyalty_welcome");
      formData.append("number", i);
      formData.append("subject", subject);
      formData.append("body", body);
      formData.append("title", title);
      formData.append("customerData", JSON.stringify(customer));

      const res = await axios.post(
        `${API_BASE_LOCAL}/email/loyality/custome-email`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      message.success(`✅ Email sent`);
      return { status: "success" };
    } catch (error) {
      console.error("❌ Loyalty Email Error:", error);
      message.error(`❌ Failed to send email`);
      return { status: "failed" };
    }
  };
  // Email validation function
  const isValidEmail = (email) => {
    if (!email) return false;

    const emailStr = String(email).trim().toLowerCase();

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Additional checks
    if (!emailRegex.test(emailStr)) return false;

    return true;
  };

  const handleSendLoyaltyEmails = async () => {
    const subject = form.getFieldValue("subject");
    const body = editorValue;

    pausedRef.current = false;
    stoppedRef.current = false;
    const total = filtered.length;

    let sentCount = 0;
    let failCount = 0;
    setLogModalVisible(true);
    setSending(true);
    setLogList([]);
    setNoEmailList([]);
    setProgress(0);

    for (let i = 0; i < total; i++) {
      const customer = filtered[i];

      setProgress(Math.round(((i + 1) / total) * 100));

      const customerEmail =
        customer?.EMAIL || customer?.Email || customer?.email || "";

      // Check if email exists AND is valid
      const hasValidEmail =
        customerEmail &&
        customerEmail.trim() !== "" &&
        customerEmail !== "null" &&
        customerEmail !== "undefined" &&
        customerEmail !== "nan" &&
        isValidEmail(customerEmail);

      if (customer && hasValidEmail) {
        if (stoppedRef.current) break;

        // Pause behavior
        while (pausedRef.current && !stoppedRef.current) {
          await new Promise((r) => setTimeout(r, 400));
        }

        setLogList((prev) => [
          ...prev,
          {
            name: `${customer.FIRSTNAME || customer.FirstName || ""} ${customer.LASTNAME || customer.LastName || ""}`,
            email: customerEmail,
            status: "sending",
          },
        ]);

        // Send email
        const result = await sendLoyaltyEmail(
          customer,
          i,
          subject,
          body,
          title,
        );

        sentCount++;
        setSentCount(sentCount);

        // Update log - fix the comparison to use customerEmail
        setLogList((prev) =>
          prev.map((l) =>
            l.email === customerEmail ? { ...l, status: result.status } : l,
          ),
        );

        await new Promise((r) => setTimeout(r, 500)); // Rate limit
      } else {
        failCount++;
        const noEmailCustomer = {
          name: `${customer?.FIRSTNAME || customer?.FirstName || ""} ${customer?.LASTNAME || customer?.LastName || ""}`,
          mobile: customer?.[mobile_column] || "",
          tier: customer?.TIER || customer?.Tier || "",
          email: customerEmail || "(empty/invalid)",
        };

        setNoEmailList((prev) => [...prev, noEmailCustomer]);

        setLogList((prev) => [
          ...prev,
          {
            name: noEmailCustomer.name,
            email: customerEmail || "(empty/invalid)",
            status: "no-email",
          },
        ]);
      }
    }

    setSending(false);
    setSendingMailAll(false);
    message.success(
      `Email sending completed! Success: ${sentCount}, No Email: ${failCount}`,
    );
  };

  const goNext = () => {
    console.log(step);

    if (step === 0 && customers.length === 0) {
      message.error("Please upload a CSV file first");
      return;
    }

    if (step === 1) {
      // if (!form.getFieldValue("subject") || !editorValue.trim()) {
      //   message.error("Please fill in subject and email body");
      //   return;
      // }
      setStep(2);
    } else if (step === 2) {
      handleSendLoyaltyEmails();
    } else {
      setStep((s) => s + 1);
    }
  };

  const goBack = () => setStep((s) => s - 1);

  const handlePause = () => (pausedRef.current = true);
  const handleResume = () => (pausedRef.current = false);
  const handleStop = () => {
    stoppedRef.current = true;
    pausedRef.current = false;
    setLogList([]);
    setProgress(0);
    setNoEmailList([]);
    setLogModalVisible(false);
    setSending(false);
    message.info("🛑 Email sending stopped.");
  };

  const successCount = logList.filter((l) => l.status === "success").length;
  const failCount = logList.filter((l) => l.status === "failed").length;
  const noEmailCount = logList.filter((l) => l.status === "no-email").length;
  const handleCashbackTemplateClick = () => {
    setShowMonthModal(true);
  };

  const handleMonthConfirm = () => {
    monthForm
      .validateFields()
      .then((values) => {
        const selectedMonth = dayjs(values.month);
        loadCashbackTemplate(selectedMonth.format("MMMM YYYY"));
        setShowMonthModal(false);
        monthForm.resetFields();
      })
      .catch((error) => {
        console.error("Validation failed:", error);
      });
  };

  const loadCashbackTemplate = (monthYear) => {
    // Set subject with dynamic month
    form.setFieldsValue({
      subject: `Your WIN WAY Cashback for ${monthYear} Has Been Credited`,
    });

    // Set email title
    setTitle("WIN WAY Cashback");

    // Set the exact HTML template with bold formatting
    const template = `
<p>We are pleased to inform you that your<strong>  Rs. {{CASHBACK_AMOUNT}}.00 cashback for ${monthYear} </strong>, earned under the WIN WAY Loyalty Rewards Program, has been successfully credited to your WIN WAY Wallet.</p>
<p>Loyalty cashback amount is determined based on your monthly ticket purchases, allowing you to earn cashback and enjoy greater benefits each month.</p>
<p>Should you have any questions, please feel free to reach out to our support team at info@winway.lk or contact us directly at <strong>0707 884 884 | 0722 884 884</strong>.</p>
<p>Thank you for choosing WIN WAY. We truly appreciate your continued loyalty.</p>
<p>Best regards,<br><strong>WIN WAY</strong><br>National Lotteries Board</p>`;

    setEditorValue(template);

    // Update the preview
  };

  const resetForm = () => {
    // Reset the form
    form.resetFields();
    setTitle("");
    setEditorValue("");

    // Optional: Show confirmation message
    message.success("Form has been reset");
  };

  /* ================= RENDER ================= */
  return (
    <>
      <Title level={3}>Custom EMAIL Portal</Title>

      {/* STEP 0: UPLOAD CSV */}
      {step === 0 && (
        <Card>
          <Title level={4} style={{ marginBottom: 24 }}>
            Upload Customer CSV
          </Title>

          <Form form={uploadForm} layout="vertical" onFinish={handleCsvUpload}>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="CSV File"
                  name="customers"
                  rules={[
                    { required: true, message: "Please upload a CSV file" },
                  ]}
                  valuePropName="fileList"
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                >
                  <Upload
                    accept=".csv"
                    maxCount={1}
                    beforeUpload={() => false}
                    showUploadList={true}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      block
                      style={{ height: 40 }}
                    >
                      Click to upload CSV
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Save As"
                  name="filename"
                  rules={[{ required: true, message: "Filename is required" }]}
                >
                  <Input
                    placeholder="e.g., customer_data_jan2024"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    suffix={<FileTextOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="Mobile Number Override (Optional)"
                  name="mobile_override"
                  tooltip="Override all mobile numbers with this value"
                >
                  <Input placeholder="e.g., 94771234567" />
                </Form.Item>
              </Col>

              <Col
                span={12}
                style={{ display: "flex", alignItems: "flex-end" }}
              >
                <Form.Item style={{ marginBottom: 0, width: "100%" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={{ height: 40 }}
                  >
                    {loading ? "Processing..." : "Upload & Process CSV"}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      )}
      {step === 1 && (
        <>
          {customers.length > 0 && (
            <>
              <Divider />

              <Row gutter={16}>
                <Col span={4}>
                  <Card hoverable style={{ ...cardBase, ...cardStyles.blue }}>
                    <Statistic
                      title={
                        <Text style={{ color: "#1976d2", fontWeight: 600 }}>
                          Customers
                        </Text>
                      }
                      value={customers.length}
                      valueStyle={{ fontSize: 18, fontWeight: 500 }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card hoverable style={{ ...cardBase, ...cardStyles.orange }}>
                    <Statistic
                      title={
                        <Text style={{ color: "#f57c00", fontWeight: 600 }}>
                          Your Filename
                        </Text>
                      }
                      value={uploadedFileInfo.user_provided_name}
                      valueStyle={{ fontSize: 18, fontWeight: 500 }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card hoverable style={{ ...cardBase, ...cardStyles.green }}>
                    <Statistic
                      title={
                        <Text style={{ color: "#2e7d32", fontWeight: 600 }}>
                          File Saved As
                        </Text>
                      }
                      value={uploadedFileInfo.saved_file}
                      valueStyle={{ fontSize: 18, fontWeight: 500 }}
                    />
                  </Card>
                </Col>

                <Col span={4}>
                  <Card hoverable style={{ ...cardBase, ...cardStyles.purple }}>
                    <Statistic
                      title={
                        <Text style={{ color: "#722ed1", fontWeight: 600 }}>
                          Size
                        </Text>
                      }
                      value={`${(uploadedFileInfo.file_size_bytes / 1024).toFixed(2)} KB`}
                      valueStyle={{ fontSize: 18, fontWeight: 500 }}
                    />
                  </Card>
                </Col>
              </Row>

              <Divider />

              {/* DYNAMIC FIELDS SELECTION */}
              <Card
                size="small"
                title="Available Dynamic Fields (Click to show/hide columns)"
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
                                : [...prev, key],
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

              {/* SEARCH */}
              <Card
                size="small"
                style={{ marginBottom: 16, background: "#fafafa" }}
              >
                <Space
                  wrap
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <Input.Search
                    placeholder="Search customers, mobile, or any field..."
                    allowClear
                    enterButton
                    style={{ maxWidth: 420 }}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <Text type="secondary">
                    Showing {filteredCustomers.length} result(s)
                  </Text>
                </Space>
              </Card>

              {/* TABLE */}
              <Table
                rowKey={mobile_column}
                columns={columns}
                dataSource={filteredCustomers}
                pagination={{ pageSize: 100 }}
                scroll={{ x: "max-content" }}
              />
            </>
          )}
        </>
      )}
      {/* STEP 1: COMPOSE EMAIL */}
      {step === 2 && (
        <Card>
          {/* Pre-defined template section */}
          <Title level={4} style={{ marginBottom: 24 }}>
            Compose Email
          </Title>

          <Divider />

          {/* Template selection and reset buttons */}
          <Space>
            <Button
              icon={<DollarCircleFilled />}
              onClick={handleCashbackTemplateClick}
            >
              Cash Back Template
            </Button>
            <Button icon={<ReloadOutlined />} onClick={resetForm}>
              Reset Form
            </Button>
          </Space>

          <Divider />

          {/* Month Selection Modal */}
          <Modal
            title="Select Month for Template"
            open={showMonthModal}
            onOk={handleMonthConfirm}
            onCancel={() => setShowMonthModal(false)}
          >
            <Form form={monthForm} layout="vertical">
              <Form.Item
                name="month"
                label="Select Month and Year"
                rules={[
                  { required: true, message: "Please select month and year" },
                ]}
              >
                <DatePicker
                  picker="month"
                  format="MMMM YYYY"
                  style={{ width: "100%" }}
                  placeholder="Select month and year"
                />
              </Form.Item>
            </Form>
          </Modal>

          <Row gutter={20}>
            {/* LEFT SIDE: FORM */}
            <Col span={8}>
              <Form form={form} layout="vertical">
                <Form.Item
                  label="Subject"
                  name="subject"
                  rules={[{ required: true, message: "Subject is required" }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Email Title"
                  rules={[
                    { required: true, message: "Email title is required" },
                  ]}
                >
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter email title"
                  />
                </Form.Item>

                <Form.Item label="Insert Dynamic Field">
                  <Select
                    showSearch
                    placeholder="Select field to insert"
                    onSelect={(v) =>
                      setEditorValue((prev) => `${prev} {{${v}}}`)
                    }
                  >
                    {templateKeys.map((k) => (
                      <Option key={k} value={k}>
                        {k}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Email Body"
                  required
                  rules={[
                    { required: true, message: "Email body is required" },
                  ]}
                >
                  <EditorProvider>
                    <Editor
                      value={editorValue}
                      onChange={(e) => setEditorValue(e.target.value)}
                      style={{ height: 350, background: "#fff" }}
                    >
                      <Toolbar>
                        <BtnBold />
                        <BtnItalic />
                        <BtnUnderline />
                        <BtnStrikeThrough />
                        <BtnStyles />
                        <BtnBulletList />
                        <BtnNumberedList />
                        <BtnLink />
                        <BtnUndo />
                        <BtnRedo />
                        <BtnClearFormatting />
                      </Toolbar>
                    </Editor>
                  </EditorProvider>
                </Form.Item>
              </Form>
            </Col>

            {/* RIGHT SIDE: PREVIEW */}
            <Col span={16}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                Email Preview
              </div>
              <iframe
                title="Email Preview"
                srcDoc={previewHtml}
                style={{
                  width: "100%",
                  height: 500,
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  background: "white",
                }}
              />
              <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                Preview shows how the email will look for the first customer
              </Text>
            </Col>
          </Row>
        </Card>
      )}
      <Modal
        open={logModalVisible}
        onCancel={handleStop}
        width={720}
        centered
        footer={null}
        style={{
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 10px 35px rgba(123,47,247,0.35)",
        }}
        title={
          <div
            style={{
              background: "linear-gradient(90deg,#001529,#2b1055)",
              padding: "22px 0",
              margin: "-28px -36px 24px -36px",
              textAlign: "center",
              color: "white",
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: 0.5,
              boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
            }}
          >
            Sending Custom Emails
          </div>
        }
      >
        {/* PROGRESS */}
        <Progress
          percent={progress}
          strokeWidth={10}
          strokeColor={{ "0%": "#7b2ff7", "100%": "#f107a3" }}
          trailColor="#f0f0f0"
          status="active"
          style={{
            marginBottom: 26,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.12))",
          }}
        />

        {/* STATS */}
        <Row gutter={16} style={{ marginBottom: 26 }}>
          <Col span={6}>
            <Card bordered={false} style={{ ...cardBase, ...cardStyles.blue }}>
              <Statistic
                title="Total"
                value={filtered.length}
                valueStyle={{ fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ ...cardBase, ...cardStyles.blue }}>
              <Statistic
                title="Success"
                value={successCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a", fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ ...cardBase, ...cardStyles.blue }}>
              <Statistic
                title="No Email"
                value={noEmailCount}
                prefix={<MailOutlined />}
                valueStyle={{ color: "#fa8c16", fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ ...cardBase, ...cardStyles.blue }}>
              <Statistic
                title="Failed"
                value={failCount}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: "#f5222d", fontWeight: 700 }}
              />
            </Card>
          </Col>
        </Row>

        {/* EMAIL LOG */}
        <List
          size="small"
          bordered
          dataSource={logList}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: "10px 16px",
                margin: "6px 0",
                borderRadius: 10,
                background:
                  item.status === "sending"
                    ? "rgba(123,47,247,0.08)"
                    : item.status === "success"
                      ? "rgba(82,196,26,0.1)"
                      : item.status === "no-email"
                        ? "rgba(250,173,20,0.14)"
                        : "rgba(255,77,79,0.1)",
              }}
            >
              <Space>
                {item.status === "sending" && (
                  <ClockCircleTwoTone twoToneColor="#faad14" />
                )}
                {item.status === "success" && (
                  <CheckCircleTwoTone twoToneColor="#52c41a" />
                )}
                {item.status === "failed" && (
                  <CloseCircleTwoTone twoToneColor="#ff4d4f" />
                )}
                {item.status === "no-email" && (
                  <MailOutlined style={{ color: "#faad14" }} />
                )}
                <Text strong>{item.name}</Text>
                <Text type="secondary">
                  {item.email || "No Email Available"}
                </Text>
              </Space>
            </List.Item>
          )}
          style={{
            maxHeight: 260,
            overflowY: "auto",
            borderRadius: 10,
            marginBottom: 22,
          }}
        />

        {/* NO EMAIL LIST */}
        {noEmailList.length > 0 && (
          <>
            <Divider />
            <Title level={4} style={{ color: "#722ed1" }}>
              Customers Without Email ({noEmailList.length})
            </Title>
            <List
              size="small"
              bordered
              dataSource={noEmailList}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <Text strong>{item.name}</Text>
                    <Text type="secondary">{item.mobile}</Text>
                    <Text type="secondary">({item.tier})</Text>
                  </Space>
                </List.Item>
              )}
              style={{
                maxHeight: 180,
                overflowY: "auto",
                background: "#fff7e6",
                borderRadius: 10,
              }}
            />

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Button onClick={exportNoEmailCSV} icon={<DownloadOutlined />}>
                Export No-Email List as CSV
              </Button>
            </div>
          </>
        )}

        {/* COMPLETION MESSAGE */}
        {progress === 100 && (
          <Alert
            message="Email process completed"
            description={`Success: ${successCount}, No Email: ${noEmailCount}, Failed: ${failCount}`}
            type="success"
            showIcon
            style={{ marginTop: 22 }}
          />
        )}

        {/* CONTROLS */}
        <Divider style={{ margin: "26px 0 12px" }} />
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          {pausedRef.current ? (
            <Button
              icon={<PlayCircleOutlined />}
              onClick={handleResume}
              size="large"
              type="primary"
              style={{ background: "#52c41a" }}
            >
              Resume
            </Button>
          ) : (
            <Button
              icon={<PauseCircleOutlined />}
              onClick={handlePause}
              size="large"
              style={{ background: "#faad14", color: "#fff" }}
            >
              Pause
            </Button>
          )}

          <Button
            icon={<StopOutlined />}
            size="large"
            onClick={handleStop}
            danger
          >
            Stop & Close
          </Button>
        </div>
      </Modal>

      <div
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button disabled={step === 0} onClick={goBack}>
          Back
        </Button>
        <Button type="primary" onClick={goNext}>
          {step === 2 ? "Send Emails" : "Next"}
        </Button>
      </div>
    </>
  );
}

export default CustomEmails;
