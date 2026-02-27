import React, { useState, useMemo, useRef } from "react";
import {
  Form,
  Upload,
  Button,
  Card,
  Typography,
  message,
  Spin,
  Divider,
  Alert,
  Row,
  Col,
  Table,
  Tag,
  Statistic,
  Space,
  Tabs,
} from "antd";
import {
  FileTextOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  LoadingOutlined,
  CheckCircleTwoTone,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import {
  countRegistrations,
  getMonthlyActivations,
} from "../api/endPointsPhyton";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import html2canvas from "html2canvas";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function RegistrationCountView() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("line");
  const [reportType, setReportType] = useState("daily");
  const summaryRef = useRef(null);

  /* ================= QUICK DATE BUTTONS ================= */

  const setLast7Days = () => {
    setDateRange([dayjs().subtract(6, "day"), dayjs()]);
  };

  const setLast30Days = () => {
    setDateRange([dayjs().subtract(29, "day"), dayjs()]);
  };

  /* ================= UPLOAD CARD (UNCHANGED STYLE) ================= */

  const renderUpload = () => {
    const hasFile = !!file;

    return (
      <Card
        size="small"
        style={{
          marginBottom: 16,
          borderRadius: 10,
          borderColor: hasFile ? "#b7eb8f" : "#d9d9d9",
          boxShadow: hasFile ? "0 0 10px rgba(82,196,26,0.2)" : "none",
        }}
      >
        <Form.Item
          label={<Text strong>Customers (.csv)</Text>}
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

            <Upload.Dragger
              beforeUpload={(f) => {
                setFile(f);
                message.success("CSV file selected");
                return false;
              }}
              fileList={hasFile ? [file] : []}
              onRemove={() => setFile(null)}
              accept=".csv"
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
                <FileTextOutlined style={{ color: "#fa8c16" }} />
              </p>

              {hasFile ? (
                <p style={{ color: "#52c41a", fontWeight: 500 }}>
                  Customer list attached
                </p>
              ) : (
                <>
                  <p>Click or drag file to this area</p>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Accepts .csv
                  </Text>
                </>
              )}
            </Upload.Dragger>
          </div>
        </Form.Item>
      </Card>
    );
  };

  /* ================= GENERATE ================= */

  const handleGenerate = async () => {
    if (!file || !dateRange) {
      message.error("Upload file and select date range.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let start, end;

      if (reportType === "daily") {
        // ✅ Daily = exact selected dates
        start = dayjs(dateRange[0]).format("YYYY-MM-DD");
        end = dayjs(dateRange[1]).format("YYYY-MM-DD");
      } else {
        // ✅ Monthly = full month boundaries
        start = dayjs(dateRange[0]).startOf("month").format("YYYY-MM-DD");

        end = dayjs(dateRange[1]).endOf("month").format("YYYY-MM-DD");
      }

      let data;

      if (reportType === "daily") {
        data = await countRegistrations(file, start, end);
      } else {
        data = await getMonthlyActivations(file, start, end);
      }

      setResult(data);
      setStep(2);
      message.success("Report generated successfully");
    } catch (err) {
      setError("Processing failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setDateRange(null);
    setResult(null);
    setError(null);
    setChartType("line");
    setReportType("daily");
  };
  const downloadImage = async () => {
    try {
      if (!summaryRef.current) return;

      const canvas = await html2canvas(summaryRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `daily-sales-summary-${dayjs().format("YYYY-MM-DD")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      message.error("Image download failed");
    }
  };
  /* ================= SAFE DATA ================= */

  const dailyData = reportType === "daily" ? result?.daily_breakdown || [] : [];

  const monthlyData =
    reportType === "monthly" ? result?.monthly_breakdown || [] : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div
        style={{
          background: "#ffffff",
          padding: "12px 16px",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          border: "1px solid #f0f0f0",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>

        <div style={{ color: "#1890ff", fontWeight: 500 }}>
          {reportType === "daily"
            ? `Registrations: ${payload[0].value}`
            : `Activations: ${payload[0].value}`}
        </div>
      </div>
    );
  };

  const totalRegistrations =
    reportType === "daily"
      ? dailyData.reduce(
          (sum, item) => sum + (item?.registration_count || 0),
          0,
        )
      : monthlyData.reduce(
          (sum, item) => sum + (item?.activation_count || 0),
          0,
        );

  const averagePerDay =
    reportType === "daily" && dailyData.length > 0
      ? (totalRegistrations / dailyData.length).toFixed(1)
      : 0;

  const columns =
    reportType === "daily"
      ? [
          {
            title: "Date",
            dataIndex: "RegisteredDate",
            render: (date) => <Tag color="purple">{date}</Tag>,
          },
          {
            title: "Registrations",
            dataIndex: "registration_count",
            render: (count) => <Tag color="green">{count}</Tag>,
          },
        ]
      : [
          {
            title: "Month",
            dataIndex: "month_name",
            render: (month) => <Tag color="blue">{month}</Tag>,
          },
          {
            title: "Activations",
            dataIndex: "activation_count",
            render: (count) => <Tag color="green">{count}</Tag>,
          },
        ];

  return (
    <>
      {/* ================= STEP 1 ================= */}
      {step === 1 && (
        <>
          <Spin spinning={loading} indicator={<LoadingOutlined spin />} />
          <Title level={3}>Registration Analytics</Title>
          <Divider />

          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} lg={20}>
              <Form layout="vertical">
                <Row justify="center">
                  <Col xs={24} md={12}>
                    {renderUpload()}
                  </Col>
                </Row>
                <Row justify="center" style={{ marginBottom: 20 }}>
                  <Space>
                    <Button
                      type={reportType === "daily" ? "primary" : "default"}
                      onClick={() => setReportType("daily")}
                    >
                      Daily
                    </Button>

                    <Button
                      type={reportType === "monthly" ? "primary" : "default"}
                      onClick={() => setReportType("monthly")}
                    >
                      Monthly
                    </Button>
                  </Space>
                </Row>
                {reportType === "daily" && (
                  <Row justify="center" style={{ marginBottom: 20 }}>
                    <Space>
                      <Button onClick={setLast7Days}>Last 7 Days</Button>
                      <Button onClick={setLast30Days}>Last 30 Days</Button>
                    </Space>
                  </Row>
                )}
                {reportType === "daily" && (
                  <Row justify="center" style={{ marginTop: 20 }}>
                    <Col xs={24} md={12}>
                      <Form.Item label={<Text strong>Select Date Range</Text>}>
                        <RangePicker
                          style={{ width: "100%" }}
                          value={dateRange}
                          format="YYYY-MM-DD"
                          onChange={(values) => setDateRange(values)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                {reportType === "monthly" && (
                  <Row justify="center" style={{ marginTop: 20 }}>
                    <Col xs={24} md={12}>
                      <Form.Item label={<Text strong>Select Month Range</Text>}>
                        <RangePicker
                          picker="month"
                          style={{ width: "100%" }}
                          value={dateRange}
                          format="YYYY-MM"
                          onChange={(values) => setDateRange(values)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                {/* NEW REPORT TYPE SELECTOR (NO STYLE CHANGES ABOVE) */}

                {error && <Alert type="error" message={error} showIcon />}

                <div style={{ textAlign: "center" }}>
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={handleGenerate}
                    disabled={!file || !dateRange}
                    style={{ marginRight: 10 }}
                  >
                    Generate Report
                  </Button>

                  <Button
                    danger
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </>
      )}

      {/* ================= STEP 2 ================= */}
      {step === 2 && (
        <>
          <Title level={3}>
            {reportType === "daily"
              ? "Daily Registration Results"
              : "Monthly Activation Results"}
          </Title>

          <Tabs defaultActiveKey="overview">
            <Tabs.TabPane tab="Overview" key="overview">
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Card>
                    <Statistic
                      title={
                        reportType === "daily"
                          ? "Total Registrations"
                          : "Total Activations"
                      }
                      value={totalRegistrations}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>

                {reportType === "daily" && (
                  <Col xs={24} md={8}>
                    <Card>
                      <Statistic
                        title="Average per Day"
                        value={averagePerDay}
                      />
                    </Card>
                  </Col>
                )}
              </Row>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Charts" key="charts">
              <Space style={{ marginBottom: 20 }}>
                <Button
                  type={chartType === "line" ? "primary" : "default"}
                  onClick={() => setChartType("line")}
                >
                  Line
                </Button>

                <Button
                  type={chartType === "bar" ? "primary" : "default"}
                  onClick={() => setChartType("bar")}
                >
                  Bar
                </Button>
              </Space>
              <div ref={summaryRef}>
                <Title level={4} style={{ textAlign: "center" , paddingTop: 10 }}>
                  {reportType === "daily"
                    ? "Daily Activations"
                    : "Monthly Activations"}
                </Title>
                <Card ref={summaryRef}>
                  <div style={{ width: "100%", height: 500 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "line" ? (
                        <LineChart
                          data={
                            reportType === "daily" ? dailyData : monthlyData
                          }
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey={
                              reportType === "daily"
                                ? "RegisteredDate"
                                : "month_name"
                            }
                            tickFormatter={(value) =>
                              reportType === "daily"
                                ? dayjs(value).format("MM-DD")
                                : value
                            }
                            tick={{ fontSize: 12 }}
                            interval="preserveStartEnd"
                            minTickGap={25}
                          />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Line
                            type="monotone"
                            dataKey={
                              reportType === "daily"
                                ? "registration_count"
                                : "activation_count"
                            }
                            stroke="#7b2ff7"
                            strokeWidth={3}
                          />
                        </LineChart>
                      ) : (
                        <BarChart
                          data={
                            reportType === "daily" ? dailyData : monthlyData
                          }
                          margin={{ top: 30, right: 20, left: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey={
                              reportType === "daily"
                                ? "RegisteredDate"
                                : "month_name"
                            }
                            tickFormatter={(value) =>
                              reportType === "daily"
                                ? dayjs(value).format("D-MMM") // 1-Feb format
                                : value
                            }
                            angle={-40}
                            textAnchor="end"
                            height={70}
                            tick={{
                              fontSize: 14,

                              fill: "#000000", // 👈 change color here
                            }}
                            label={{
                              value: reportType === "daily" ? "Date" : "Month",
                              position: "insideBottom",
                              offset: -5,
                              style: {
                                fontSize: 16,
                                fontWeight: 600,
                                fill: "#262626",
                              },
                            }}
                          />
                          <YAxis
                            tick={{ fontSize: 14, fill: "#000000" }}
                            domain={[0, "dataMax + 300"]}
                            label={{
                              value:
                                reportType === "daily"
                                  ? "Activations"
                                  : "Activations",
                              angle: -90,
                              position: "insideLeft",
                              style: {
                                fontSize: 16,
                                fontWeight: 600,
                                fill: "#262626",
                              },
                            }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar
                            dataKey={
                              reportType === "daily"
                                ? "registration_count"
                                : "activation_count"
                            }
                            fill="#ad852f" // softer professional blue
                            radius={[10, 10, 0, 0]} // rounded top corners
                          >
                            <LabelList
                              dataKey={
                                reportType === "daily"
                                  ? "registration_count"
                                  : "activation_count"
                              }
                              position="top"
                              style={{
                                fontSize: 16,
                                fontWeight: 700,
                                fill: "#262626",
                              }}
                            />
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Table" key="table">
              <Table
                columns={columns}
                dataSource={reportType === "daily" ? dailyData : monthlyData}
                rowKey={
                  reportType === "daily" ? "RegisteredDate" : "month_name"
                }
                bordered
              />
            </Tabs.TabPane>
          </Tabs>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => setStep(1)}
              style={{ marginRight: 10 }}
            >
              Back
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
              onClick={downloadImage}
            >
              Download Image
            </Button>
          </div>
        </>
      )}
    </>
  );
}

export default RegistrationCountView;
