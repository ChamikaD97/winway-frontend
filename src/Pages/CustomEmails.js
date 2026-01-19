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
} from "@ant-design/icons";
import { UploadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

/* ================= CONFIG ================= */
const API_BASE = "http://127.0.0.1:8000";

const API_BASE_LOCAL = "http://localhost:8001";
/* 🔁 SWITCH MODE HERE */

/* 🇱🇰 Sri Lanka number normalizer */

/* ================= COMPONENT ================= */
function CustomEmails() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [IS_TEST_MODE, Set_IS_TEST_MODE] = useState(true);

  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [mobile_column, setMobileColoum] = useState("Mobile Number");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  // which dynamic columns are visible
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [title, setTitle] = useState("");

  /* SMS */

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
  function toProperCase(name = "") {
    return name
      .replace(/[^a-zA-Z ]/g, "") // remove commas & symbols
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  const getGenderTitle = (customer = {}) => {
    const g = (customer.Gender || "").toLowerCase();

    if (g === "male") return "Mr.";
    if (g === "female") return "Ms.";

    return ""; // fallback
  };
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
  const generateLoyaltyCustomeEmail = (
    body,
    customer = {},
    title,
    headerLogo,
    footerLogo
  ) => {
    const renderedBody = applyTemplate(body, customer);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>

<body style="margin:0; padding:0;   sans-serif;           border-radius:18px;
" >
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
              <div style="
                        border-radius:18px;

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
  <strong>

   ${getFullGreeting(customer)},
  </strong>
</p>

  <p style="margin:0 0 0 0; font-family:'Sylfaen'; font-style: italic;font-size:15px;">


              ${renderedBody}</p>

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
</html>
`;
  };

  function getFullGreeting(customer = {}) {
    const greeting = getGenderTitle(customer);
    const firstName = customer.FirstName?.trim();
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
      footerLogo
    );
  }, [editorValue, customers, title, headerLogo, footerLogo]);

  /* ================= TEMPLATE UTILS ================= */
  const extractKeys = (obj, prefix = "") =>
    Object.entries(obj || {}).flatMap(([k, v]) =>
      typeof v === "object" && v !== null
        ? extractKeys(v, `${prefix}${k}.`)
        : `${prefix}${k}`
    );

  const templateKeys = useMemo(
    () => (customers.length ? extractKeys(customers[0]) : []),
    [customers]
  );

  const normalizeLK = (n) => {
    if (!n) return null;
    let num = n.toString().trim().replace(/\s+/g, "");
    if (num.startsWith("+94")) num = num.replace("+94", "94");
    if (num.startsWith("0")) num = "94" + num.slice(1);
    if (num.length === 9) num = "94" + num;
    return num.startsWith("94") && num.length === 11 ? num : null;
  };

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
      })
    );

    setFilteredCustomers(filtered);
  }, [customers, searchText, visibleColumns]);
  /* ================= CSV UPLOAD ================= */
  /* ================= CSV EXPORT (NO EMAIL CUSTOMERS) ================= */

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

  const handleCsvUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("customers", file);

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/csv-upload-process`, formData);
      const rows = res.data.data || [];
      console.log(rows);

      setCustomers(rows);
      setFiltered(rows);

      setFilteredCustomers(rows);
      setMobileColoum(res.data.mobile_column || "MobileNumber");

      if (rows.length > 0) {
        setVisibleColumns(Object.keys(rows[0]));
      }

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

  const [testModalOpen, setTestModalOpen] = useState(false);

  const goBack = () => setStep((s) => s - 1);

  const sendLoyaltyEmail = async (customer, i, subject, body, title) => {
    try {
      const formData = new FormData();

      formData.append("to", customer.Email ? customer.Email : "");
      if (i < 20 ) {
        formData.append("cc", "info@winway.lk");
      }
      formData.append(
        "name",
        `${customer?.FirstName || ""} ${customer?.LastName || ""}`
      );
      formData.append("type", "loyalty_welcome");
      formData.append("number", i);

      formData.append("subject", subject);
      formData.append("body", body);
      formData.append("title", title);
      // NEW → send full object
      formData.append("customerData", JSON.stringify(customer));

      const res = await axios.post(
        `${API_BASE_LOCAL}/email/loyality/custome-email`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      message.success(`✅ Email sent`);
      return { status: "success" };
    } catch (error) {
      console.error("❌ Loyalty Email Error:", error);
      message.error(`❌ Failed to send email`);
      return { status: "failed" };
    }
  };

  const handleSendLoyaltyEmails = async () => {
    const subject = form.getFieldValue("subject");
    const body = editorValue;

    pausedRef.current = false;
    stoppedRef.current = false;
    const total = filtered.length;
    let sentCount = 0;
    setLogModalVisible(true);

    for (let i = 0; i <= total; i++) {
      const customer = filtered[i];

      if (customer && customer.Email) {
        if (stoppedRef.current) break;

        // Pause behaviour
        while (pausedRef.current && !stoppedRef.current) {
          await new Promise((r) => setTimeout(r, 400));
        }

        setLogList((prev) => [
          ...prev,
          {
            name: `${customer.FirstName} ${customer.LastName}`,
            email: customer.Email,
            status: "sending",
          },
        ]);

        // Actual send

        const result = await sendLoyaltyEmail(
          customer,
          i,
          subject,
          body,
          title
        );
        sentCount++;
        setProgress(Math.round((sentCount + noEmailList.length / total) * 100));

        // Update log
        setLogList((prev) =>
          prev.map((l) =>
            l.email === customer.Email ? { ...l, status: result.status } : l
          )
        );

        await new Promise((r) => setTimeout(r, 500)); // Rate limit
      } else {
        failCount++;

        const noEmailCustomer = {
          MobileNumber: customer["MobileNumber"] || "",
          firstName: customer["FirstName"] || "",
          lastName: customer["LastName"] || "",
          cashBackAmount: customer["cashBack amount"] || "",
          Gender: customer["Gender"] || "",
          ticketCountInDecember: customer["Tickect Count In December"] || "",
        };

        // 🔥 STORE NO-EMAIL CUSTOMERS
        setNoEmailList((prev) => [...prev, noEmailCustomer]);

        setLogList((prev) => [
          ...prev,
          {
            name: noEmailCustomer.firstName + " " + noEmailCustomer.lastName,
            email: "N/A",
            status: "no-email",
          },
        ]);
      }

      setSendingMailAll(false);
    }

    //setLogList([]);
    setTotalToSend(total);

    return;
  };
  const goNext = () => {
    if (step === 2) {
      handleSendLoyaltyEmails(title, editorValue);
    } else {
      setStep((s) => s + 1);
    }
  };
  let successCount = logList.filter((l) => l.status === "success").length;
  let failCount = logList.filter((l) => l.status === "failed").length;

  const handlePause = () => (pausedRef.current = true);
  const handleResume = () => (pausedRef.current = false);
  const handleStop = () => {
    stoppedRef.current = true;
    pausedRef.current = false;
    setLogList([]);
    setProgress(0);
    setNoEmailList([]);
    setLogModalVisible(false);
    message.info("🛑 Email sending stopped.");
  };

  return (
    <>
      <Title level={3}>Custom EMAIL Portal</Title>

      {step === 0 && (
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
              </Row>

              <Divider />

              {/* ================= DYNAMIC FIELDS ================= */}
              <Card
                size="small"
                title="Available Dynamic Fields (Click to show / hide columns)"
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
              <Card
                size="small"
                style={{ marginBottom: 16, background: "#fafafa" }}
              >
                <Space
                  wrap
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  {/* 🔍 Global Search */}
                  <Input.Search
                    placeholder="Search customers, mobile, or any field..."
                    allowClear
                    enterButton
                    style={{ maxWidth: 420 }}
                    onChange={(e) => setSearchText(e.target.value)}
                  />

                  {/* Optional helper text / count */}
                  <Text type="secondary">
                    Showing {filteredCustomers.length} result(s)
                  </Text>
                </Space>

                <Text
                  type="secondary"
                  style={{ display: "block", marginTop: 8 }}
                >
                  Type to search across all visible columns.
                </Text>
              </Card>

              {/* ================= TABLE ================= */}
              <Table
                rowKey={mobile_column}
                columns={columns}
                dataSource={filteredCustomers}
                pagination={{ pageSize: 100 }}
                scroll={{ x: "max-content" }}
              />
            </>
          )}
        </Card>
      )}

      {/* ================= STEP 3 ================= */}
      {step === 1 && (
        <>
          <Row gutter={20}>
            {/* LEFT */}
            <Col span={8}>
              <Form form={form} layout="vertical">
                <Form.Item
                  label="Subject"
                  name="subject"
                  rules={[{ required: true, message: "Subject is required" }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item label="Email Title">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    rules={[
                      {
                        required: true,
                        message: "Please select a Email Title",
                      },
                    ]}
                  />
                </Form.Item>

                <Form.Item label="Insert Dynamic Field">
                  <Select
                    showSearch
                    placeholder="Select field"
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

                <Form.Item label="Email Body" required>
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

            {/* RIGHT */}
            <Col span={16}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Preview</div>
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
            </Col>
          </Row>
        </>
      )}

      {/* ================= STEP 4 ================= */}
      {step === 2 && (
        <Card>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="Customers Loaded" value={customers.length} />
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
        </Card>
      )}

      <Modal
        open={logModalVisible}
        onCancel={handleStop}
        width={720}
        centered
        footer={null}
        styles={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderRadius: 16,
          padding: "28px 36px",
        }}
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
        {/* 🔮 Gradient Progress */}
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

        {/* 📊 STATS */}
        <Row gutter={16} style={{ marginBottom: 26 }}>
          <Col span={8}>
            <Card
              bordered={false}
              style={{
                background: "linear-gradient(145deg,#f3e8ff,#ffffff)",
                borderRadius: 14,
              }}
            >
              <Statistic
                title="Total"
                value={filtered.length}
                valueStyle={{ fontWeight: 700 }}
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card
              bordered={false}
              style={{
                background: "linear-gradient(145deg,#e7fbe7,#ffffff)",
                borderRadius: 14,
              }}
            >
              <Statistic
                title="Success"
                value={successCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#00bd00", fontWeight: 700 }}
              />
            </Card>
          </Col>

          <Col span={8}>
            <Card
              bordered={false}
              style={{
                background: "linear-gradient(145deg,#fff2e8,#ffffff)",
                borderRadius: 14,
              }}
            >
              <Statistic
                title="No Email"
                value={noEmailList.length}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: "#d46b08", fontWeight: 700 }}
              />
            </Card>
          </Col>
        </Row>

        {/* 📋 EMAIL LOG */}
        <List
          size="small"
          bordered
          dataSource={logList.sort((a, b) => {
            const statusOrder = {
              sending: 0,
              failed: 1,
              "no-email": 2,
              success: 3,
            };
            return -statusOrder[a.status] + statusOrder[b.status];
          })}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: "10px 16px",
                margin: "6px 0",
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.04)",
                background:
                  item.status === "sending"
                    ? "linear-gradient(90deg,rgba(123,47,247,0.08),#fff)"
                    : item.status === "success"
                    ? "linear-gradient(90deg,rgba(82,196,26,0.1),#fff)"
                    : item.status === "no-email"
                    ? "linear-gradient(90deg,rgba(250,173,20,0.14),#fff)"
                    : "linear-gradient(90deg,rgba(255,77,79,0.1),#fff)",
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
            background: "rgba(255,255,255,0.6)",
            marginBottom: 22,
          }}
        />

        {/* ❌ NO EMAIL LIST */}
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
                    <Text strong>{item.FirstName}</Text>
                    <Text type="secondary">{item.MobileNumber}</Text>
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
          </>
        )}

        {/* ✅ COMPLETED */}
        {progress === 100 && (
          <Alert
            message="Email process completed"
            description={`Success: ${successCount}, No Email: ${noEmailList.length}`}
            type="success"
            showIcon
            style={{ marginTop: 22 }}
          />
        )}

        {/* 🕹 CONTROLS */}
        <Divider style={{ margin: "26px 0 12px" }} />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {pausedRef.current ? (
            <Button
              icon={<PlayCircleOutlined />}
              onClick={handleResume}
              size="large"
              style={{
                background: "linear-gradient(90deg,#52c41a,#8bc34a)",
                color: "#fff",
                borderRadius: 8,
                fontWeight: 600,
                border: "none",
              }}
            >
              Resume
            </Button>
          ) : (
            <Button
              icon={<PauseCircleOutlined />}
              onClick={handlePause}
              size="large"
              style={{
                background: "linear-gradient(90deg,#faad14,#fadb14)",
                color: "#fff",
                borderRadius: 8,
                fontWeight: 600,
                border: "none",
              }}
            >
              Pause
            </Button>
          )}

          {noEmailList.length > 0 && (
            <Button
              onClick={exportNoEmailCSV}
              size="large"
              style={{
                background: "linear-gradient(90deg,#722ed1,#9254de)",
                color: "#fff",
                borderRadius: 8,
                fontWeight: 600,
                border: "none",
              }}
            >
              Export No-Email CSV
            </Button>
          )}

          <Button
            icon={<StopOutlined />}
            size="large"
            onClick={handleStop}
            style={{
              background: "linear-gradient(90deg,#ff4d4f,#cf1322)",
              color: "#fff",
              borderRadius: 8,
              fontWeight: 600,
              border: "none",
            }}
          >
            Stop & Close
          </Button>
        </div>
      </Modal>

      {/* ================= FOOTER ================= */}

      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Button disabled={step === 0} onClick={goBack}>
          Back
        </Button>

        <Button type="primary" onClick={goNext}>
          Next
        </Button>
      </Space>
    </>
  );
}

export default CustomEmails;
