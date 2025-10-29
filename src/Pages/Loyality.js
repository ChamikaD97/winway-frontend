import React, { useState, useCallback, useMemo } from "react";
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
  Steps,
  Statistic,
  Table,
  Input,
  Tag,
} from "antd";
import {
  LoadingOutlined,
  FileZipOutlined,
  FileTextOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  InboxOutlined,
  EyeOutlined,
  GiftOutlined,
  TeamOutlined,
  CrownOutlined,
  SearchOutlined,
  TrophyOutlined,
  RiseOutlined,
  DownloadOutlined,
  SaveFilled,
} from "@ant-design/icons";
import axios from "axios";
import logo from "../assets/logo.png";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { Search } = Input;
const API_BASE = "http://127.0.0.1:8000";

function Loyality() {
  // ---------------- STATE ----------------
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [weekRange, setWeekRange] = useState(null);
  const [files, setFiles] = useState({});
  const [searchText, setSearchText] = useState("");

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  // ---------------- FILE HANDLERS ----------------
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
    setResults([]);
    setSummary(null);
    setError(null);
    message.info("Form reset successfully");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ---------------- STEP 1 → PROCESS ----------------
  const handleSubmit = async () => {
    if (!files.zip_file || !files.customers_file) {
      message.warning("⚠️ Please upload both ZIP and CSV files first!");
      return;
    }
    const formData = new FormData();

    const res = await axios.get("http://localhost:8001/api/settings");
    const map = Object.fromEntries(res.data.map((s) => [s.key, s.value]));
    console.log(map);
    console.log("data");
    formData.append(
      "platinum",
      parseInt(map.LOYALTY_ENTRY_PLATINUM_TICKETS, 10)
    ); // ✅ always int
    formData.append("gold", parseInt(map.LOYALTY_ENTRY_GOLD_TICKETS, 10)); // ✅ always int
    formData.append("silver", parseInt(map.LOYALTY_ENTRY_SILVER_TICKETS, 10)); // ✅ always int

    Object.entries(files).forEach(([key, file]) => formData.append(key, file));

    try {
      setLoading(true);
      setProgress(0);

      const res = await axios.post(
        `${API_BASE}/api/customer-tickets/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((100 * e.loaded) / e.total));
          },
        }
      );

      const data = res.data;
      console.log(data);

      if (!data || !data.customers) {
        message.warning("No valid ticket data found!");
        return;
      }
      console.log(data);

      const tierCounts = data.customers.reduce((acc, curr) => {
        const tier = curr.Loyalty_Tier || "None";
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {});

      // 🧩 Add tier counts to summary

      const totalTicketsSum = data.customers.reduce(
        (acc, curr) => acc + Number(curr.Ticket_Count || 0),
        0
      );

      const updatedSummary = {
        ...data.summary,
        tiers: tierCounts,
        totalTicketsSum: totalTicketsSum,
      };

      setResults(data.customers);

      setSummary(updatedSummary);
      setWeekRange(data.week_range);
      setStep(2);
      message.success("✅ Ticket report generated successfully!");
    } catch (err) {
      console.log(err);
      setError("❌ Error processing ticket data!");
      message.error("Error generating report!");
    } finally {
      console.log("sssssssssssssssssssssssss");

      setLoading(false);
    }
  };

  const handleDownloadData = () => {
    if (!filteredResults || filteredResults.length === 0) {
      message.warning("No data available to download!");
      return;
    }

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(filteredResults);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Loyalty Summary");

    // Generate Excel file buffer and save
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `WinWay_Loyalty_Report_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    saveAs(blob, fileName);
    message.success("✅ Loyalty report downloaded!");
  };

  // ---------------- FILTERS ----------------
  const filteredResults = useMemo(() => {
    if (!searchText) return results;
    const text = searchText.toLowerCase();
    return results.filter(
      (r) =>
        (r.Customer_Name && r.Customer_Name.toLowerCase().includes(text)) ||
        (r.MobileNumber && r.MobileNumber.toLowerCase().includes(text))
    );
  }, [searchText, results]);

  const ticketColumns = [
    {
      title: "Customer",
      dataIndex: "FirstName", // still needed for sorting and indexing
      sorter: (a, b) =>
        (a.FirstName + " " + a.LastName).localeCompare(
          b.FirstName + " " + b.LastName
        ),
      render: (_, record) => `${record.FirstName} ${record.LastName}`,
    },
    {
      title: "Mobile",
      dataIndex: "MobileNumber",
      sorter: (a, b) => a.MobileNumber.localeCompare(b.MobileNumber),
    },
    {
      title: "Total Tickets",
      dataIndex: "Ticket_Count",
      align: "center",
      sorter: (a, b) => a.Ticket_Count - b.Ticket_Count,
    },
    {
      title: "Tier",
      dataIndex: "Loyalty_Tier",
      align: "center",
      filters: [
        { text: "Platinum", value: "Platinum" },
        { text: "Gold", value: "Gold" },
        { text: "Silver", value: "Silver" },
        { text: "Blue", value: "Blue" },
        { text: "None", value: "None" },
      ],
      onFilter: (value, record) => record.Tier === value,
      sorter: (a, b) => a.Loyalty_Tier.localeCompare(b.Loyalty_Tier),
      render: (tier) => {
        const colorMap = {
          Platinum: "geekblue",
          Gold: "gold",
          Silver: "gray",
          Blue: "blue",
          None: "default",
        };
        return (
          <Tag color={colorMap[tier] || "default"} style={{ fontWeight: 600 }}>
            {tier || "None"}
          </Tag>
        );
      },
    },
  ];

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
          bodyStyle={{ padding: 8 }}
        >
          <Form.Item
            label={<Text strong>{label}</Text>}
            style={{ marginBottom: 8 }}
          >
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
          </Form.Item>
        </Card>
      );
    },
    [files, handleChange, handleRemove]
  );

  // ---------------- RENDER ----------------
  return (
    <>
      {/* STEP 1 */}
      {step === 1 && (
        <div style={{ position: "relative" }}>
          <Spin
            spinning={loading}
            indicator={<LoadingOutlined spin />}
            tip="Processing..."
          >
            <Title level={3} style={{ textAlign: "left" }}>
              Upload ZIP and Customer Files
            </Title>
            <Divider />
            <Row gutter={[24, 24]} justify="center">
              <Col xs={24} lg={20}>
                <Form layout="vertical">
                  <Row gutter={[12, 12]} justify="center">
                    <Col xs={24} sm={12} md={8}>
                      {renderUpload(
                        "Tickets ZIP (.zip)",
                        "zip_file",
                        ".zip",
                        <FileZipOutlined style={{ color: "#1890ff" }} />,
                        "Tickets ZIP attached"
                      )}
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      {renderUpload(
                        "Customers CSV (.csv)",
                        "customers_file",
                        ".csv",
                        <FileTextOutlined style={{ color: "#fa8c16" }} />,
                        "Customers file attached"
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
                      type="primary"
                      size="large"
                      icon={<ArrowRightOutlined />}
                      onClick={handleSubmit}
                      disabled={loading}
                      style={{ marginRight: 10 }}
                    >
                      {loading ? "Processing..." : "Proceed to Process"}
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      danger
                      type="primary"
                      size="large"
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
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div style={{ position: "relative" }}>
          <Spin
            spinning={loading}
            tip="Loading summary..."
            indicator={<LoadingOutlined spin />}
          >
            <Title level={3} style={{ textAlign: "left" }}>
              Ticket Summary Results
            </Title>
            <Divider />

            <Row gutter={[16, 16]} style={{ marginBottom: 10 }}>
              <Col xs={24} sm={12} md={12}>
                <Card>
                  <Statistic
                    title="Loyal Customers"
                    value={summary.loyal_customers}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12}>
                <Card>
                  <Statistic
                    title="Total Tickets"
                    value={summary.totalTicketsSum}
                    prefix={<CrownOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 25 }}>
              {/* Platinum Tier */}
              <Col xs={24} sm={12} md={8}>
                <Card>
                  <Statistic
                    title="Platinum"
                    value={summary?.tiers?.Platinum || 0}
                    valueStyle={{ color: "#7b2ff7", fontWeight: 700 }}
                    prefix={<TrophyOutlined />}
                  />
                </Card>
              </Col>

              {/* Gold Tier */}
              <Col xs={24} sm={12} md={8}>
                <Card>
                  <Statistic
                    title="Gold"
                    value={summary?.tiers?.Gold || 0}
                    valueStyle={{ color: "#facc15", fontWeight: 700 }}
                    prefix={<GiftOutlined />}
                  />
                </Card>
              </Col>

              {/* Silver Tier */}
              <Col xs={24} sm={12} md={8}>
                <Card>
                  <Statistic
                    title="Silver"
                    value={summary?.tiers?.Silver || 0}
                    valueStyle={{ color: "#a1a1aa", fontWeight: 700 }}
                    prefix={<RiseOutlined />}
                  />
                </Card>
              </Col>
            </Row>
            <Divider />
            <Row
              gutter={[16, 16]}
              style={{
                marginBottom: 20,
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <Col xs={24} md={10}>
                <Input.Search
                  placeholder="Search by name, email, or mobile"
                  allowClear
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                  }}
                />
              </Col>

              <Row
                gutter={[16, 16]}
                style={{
                  marginBottom: 20,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Col xs={24} sm={12} md={10}></Col>

                <Col xs={24} sm={12} md={14}>
                  <Button
                    icon={<DownloadOutlined />}
                    type="primary"
                    style={{
                      border: "none",
                      fontWeight: 500,
                    }}
                    onClick={handleDownloadData}
                  >
                    Download Data
                  </Button>
                </Col>
              </Row>
            </Row>

            <Table
              dataSource={filteredResults}
              columns={ticketColumns}
              rowKey="MobileNumber"
              bordered
              size="middle"
              scroll={{ x: true, y: 420 }}
              sticky
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                showTotal: (total, range) =>
                  `Showing ${range[0]}-${range[1]} of ${total} customers`,
                onChange: (page, pageSize) =>
                  setPagination({ current: page, pageSize }),
              }}
              rowClassName={(record) => {
                switch (record.Loyalty_Tier) {
                  case "Platinum":
                    return "tier-row-platinum";
                  case "Gold":
                    return "tier-row-gold";
                  case "Silver":
                    return "tier-row-silver";
                  case "Blue":
                    return "tier-row-blue";
                  default:
                    return "";
                }
              }}
              style={{ borderRadius: 8, overflow: "hidden" }}
            />

            <style>
              {`
.ant-table-tbody > tr.tier-row-platinum > td {
  background: linear-gradient(90deg, #f8f9fa, #e8f0ff) !important;
  font-weight: 400;
  font-size: 14px !important;
  border-bottom: 2px solid #c5cae9 !important; /* ✅ Added */
}

.ant-table-tbody > tr.tier-row-gold > td {
  background: linear-gradient(90deg, #fff8e1, #ffecb3) !important;
  font-weight: 400;
  font-size: 14px !important;
  border-bottom: 2px solid #ffcc80 !important; /* ✅ Added */
}

.ant-table-tbody > tr.tier-row-silver > td {
  background: linear-gradient(90deg, #f5f5f5, #e0e0e0) !important;
  font-weight: 400;
  font-size: 14px !important;
  border-bottom: 2px solid #bdbdbd !important; /* ✅ Added */
}

.ant-table-tbody > tr.tier-row-blue > td {
  background: linear-gradient(90deg, #e3f2fd, #bbdefb) !important;
  font-weight: 400;
  font-size: 14px !important;
  border-bottom: 2px solid #90caf9 !important; /* ✅ Added */
}


`}
            </style>

            <div style={{ textAlign: "center", marginTop: 25 }}>
              <Button icon={<ArrowLeftOutlined />} onClick={() => setStep(1)}>
                Back To Uploads
              </Button>
              <Button
                icon={<SaveFilled />}
                type="primary"
                style={{ marginLeft: 10 }}
                onClick={() => setStep(3)}
              >
                Save To Reports
              </Button>
            </div>
          </Spin>
        </div>
      )}
    </>
  );
}

export default Loyality;
