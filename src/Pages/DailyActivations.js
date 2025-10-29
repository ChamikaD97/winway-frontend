import React, { useState } from "react";
import {
  Upload,
  Button,
  DatePicker,
  Statistic,
  Card,
  message,
  Row,
  Col,
  Space,
  Segmented,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { theme } from "../config/themeConfig"; // ✅ same theme used in all pages

const { RangePicker } = DatePicker;

const DailyActivations = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [viewMode, setViewMode] = useState("Daily");
  const [dateRange, setDateRange] = useState([dayjs().subtract(6, "day"), dayjs()]);

  const handleUpload = async ({ file }) => {
    if (!dateRange || dateRange.length !== 2) {
      message.warning("Please select a valid date range!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("customers", file);
      formData.append("start_date", dateRange[0].format("YYYY-MM-DD"));
      formData.append("end_date", dateRange[1].format("YYYY-MM-DD"));

      const res = await axios.post(
        "http://127.0.0.1:8000/api/daily-activations/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data) {
        setData(res.data);
        message.success("📈 Activations data loaded!");
      } else {
        message.warning("No data found for selected range.");
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to process file.");
    } finally {
      setLoading(false);
    }
  };

  const dailyData = data?.daily || [];
  const monthlyData = data?.monthly || [];
  const chartData = viewMode === "Daily" ? dailyData : monthlyData;

  return (
    <div
      style={{
        background: theme.background,
        minHeight: "100vh",
        padding: "40px 50px",
      }}
    >
      <h2
        style={{
          fontWeight: 700,
          fontSize: "1.6rem",
          color: theme.primary,
          marginBottom: 25,
        }}
      >
        📊 Customer Activations
      </h2>

      {/* Upload + Date Range */}
      <Row gutter={16} align="middle">
        <Col>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ borderRadius: 8 }}
              format="YYYY-MM-DD"
            />
            <Upload customRequest={handleUpload} showUploadList={false} multiple={false}>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                loading={loading}
                style={{
                  borderRadius: 8,
                  background: theme.gradient,
                  border: "none",
                  fontWeight: 600,
                  boxShadow: "0 4px 10px rgba(25,118,210,0.3)",
                }}
              >
                Upload Customers CSV
              </Button>
            </Upload>
          </Space>
        </Col>
      </Row>

      {/* Total Summary */}
      {data && (
        <Row gutter={16} style={{ marginTop: 40 }}>
          <Col span={8}>
            <Card
              style={{
                background: theme.cardBg,
                borderRadius: 12,
                boxShadow: theme.shadow,
                textAlign: "center",
              }}
            >
              <Statistic
                title="Total Registrations"
                value={data.total_registrations}
                valueStyle={{ color: theme.primary }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              style={{
                background: theme.cardBg,
                borderRadius: 12,
                boxShadow: theme.shadow,
                textAlign: "center",
              }}
            >
              <Statistic
                title="Start Date"
                value={data.range.start_date}
                valueStyle={{ color: theme.textSecondary }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              style={{
                background: theme.cardBg,
                borderRadius: 12,
                boxShadow: theme.shadow,
                textAlign: "center",
              }}
            >
              <Statistic
                title="End Date"
                value={data.range.end_date}
                valueStyle={{ color: theme.textSecondary }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Chart Toggle */}
      {data && (
        <div style={{ textAlign: "center", marginTop: 30 }}>
          <Segmented
            options={["Daily", "Monthly"]}
            value={viewMode}
            onChange={setViewMode}
            style={{
              background: theme.cardBg,
              borderRadius: 8,
              boxShadow: theme.shadow,
            }}
          />
        </div>
      )}

      {/* Charts */}
      {chartData && chartData.length > 0 && (
        <div style={{ marginTop: 50 }}>
          <h3
            style={{
              textAlign: "center",
              marginBottom: 20,
              color: theme.textPrimary,
              fontWeight: 600,
            }}
          >
            {viewMode === "Daily"
              ? "📅 Daily Registrations"
              : "📆 Monthly Registrations"}
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            {viewMode === "Daily" ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke={theme.primary}
                  strokeWidth={3}
                  dot={{ r: 4, fill: theme.secondary }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="registrations"
                  fill={theme.primary}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DailyActivations;
