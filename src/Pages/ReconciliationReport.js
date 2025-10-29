import React, { useState } from "react";
import {
  Upload,
  Button,
  Table,
  message,
  Statistic,
  Row,
  Col,
  Card,
} from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { theme } from "../config/themeConfig";

const ReconciliationReport = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [data, setData] = useState([]);

  const props = {
    name: "reconciliation_zip",
    multiple: false,
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("reconciliation_zip", file);

        const res = await axios.post(
          "http://127.0.0.1:8000/api/analyze-reconciliation/",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        setSummary(res.data);

        const details = Object.entries(res.data.details || {}).map(
          ([lottery, values]) => ({
            key: lottery,
            lottery,
            draw_date: values["Draw Date"] || "-",
            draw_no: values["Draw No"] || "-",
            sold: values["Prizes for Sold Tickets (Rs.)"],
            unsold: values["Prizes for Unsold Tickets (Thinkcube) (Rs.)"],
          })
        );

        setData(details);
        message.success("✅ Reconciliation analysis complete!");
        onSuccess();
      } catch (err) {
        console.error(err);
        message.error("❌ Failed to analyze reconciliation ZIP.");
        onError(err);
      } finally {
        setLoading(false);
      }
    },
  };

  const columns = [
    {
      title: "Lottery Name",
      dataIndex: "lottery",
      key: "lottery",
      render: (text) => (
        <strong style={{ color: theme.primary }}>{text || "Unknown"}</strong>
      ),
    },
    {
      title: "Draw Date",
      dataIndex: "draw_date",
      key: "draw_date",
      render: (val) => (
        <span style={{ color: theme.textSecondary }}>{val}</span>
      ),
    },
    {
      title: "Draw No",
      dataIndex: "draw_no",
      key: "draw_no",
      align: "center",
      render: (val) => (
        <span style={{ fontWeight: 500, color: theme.secondary }}>{val}</span>
      ),
    },
    {
      title: "Sold Prizes (Rs.)",
      dataIndex: "sold",
      key: "sold",
      align: "right",
      render: (val) => (
        <span style={{ color: theme.success, fontWeight: 600 }}>
          Rs. {val?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      title: "Unsold Prizes (Rs.)",
      dataIndex: "unsold",
      key: "unsold",
      align: "right",
      render: (val) => (
        <span style={{ color: theme.danger, fontWeight: 600 }}>
          Rs. {val?.toLocaleString() || 0}
        </span>
      ),
    },
  ];
  const handleDownloadPrizeImage = async () => {
    if (!data.length) {
      message.warning("⚠️ Please generate the report first.");
      return;
    }

    try {
      setLoading(true);
      message.loading("🧩 Generating image via server...", 1.5);

      // 2️⃣ Send parsed data to Node.js Puppeteer route
      const res = await axios.post(
        "http://127.0.0.1:8001/prizeReport/generate?template=pro", // 👈 ensure backend port
        { results: data, summary: summary },
        { responseType: "blob" } // Important for binary image data
      );

      // 3️⃣ Trigger image download in browser
      const blob = new Blob([res.data], { type: "image/png" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      // Dynamic filename with date
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace("T", "_")
        .split(".")[0];
      link.download = `WinWay_LastSaleReport_${timestamp}.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success("✅ Report image downloaded successfully!");
    } catch (error) {
      console.error("❌ Failed to generate image:", error);
      if (error.response?.data) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errMsg = JSON.parse(reader.result)?.error || "Unknown error.";
            message.error(`❌ Server error: ${errMsg}`);
          } catch {
            message.error("❌ Could not parse server response.");
          }
        };
        reader.readAsText(error.response.data);
      } else {
        message.error("❌ Could not connect to report server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.background,
        padding: "40px 50px",
        color: theme.textPrimary,
      }}
    >
      {/* Header */}
      <h2
        style={{
          fontWeight: 700,
          fontSize: "1.6rem",
          color: theme.primary,
          marginBottom: 25,
        }}
      >
        🎯 Reconciliation Summary Report
      </h2>

      {/* Upload Button */}
      <Upload {...props}>
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
          Upload Reconciliation ZIP
        </Button>
      </Upload>
      <Button
        icon={<DownloadOutlined />}
        onClick={handleDownloadPrizeImage}
        disabled={!summary}
        style={{
          background: theme.success,
          color: "#fff",
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: "0 4px 10px rgba(46,204,113,0.3)",
        }}
      >
        Download Server Image
      </Button>
      {/* Summary Cards */}
      {summary && (
        <>
          <Row gutter={16} style={{ marginTop: 40 }}>
            <Col span={8}>
              <Card
                bordered
                style={{
                  background: theme.cardBg,
                  borderColor: theme.border,
                  borderRadius: 12,
                  boxShadow: theme.shadow,
                }}
              >
                <Statistic
                  title="Total Lotteries"
                  value={summary.total_lotteries}
                  valueStyle={{ color: theme.primary }}
                />
              </Card>
            </Col>

            <Col span={8}>
              <Card
                bordered
                style={{
                  background: theme.cardBg,
                  borderColor: theme.border,
                  borderRadius: 12,
                  boxShadow: theme.shadow,
                }}
              >
                <Statistic
                  title="Total Sold Prizes"
                  prefix="Rs."
                  value={summary.total_sold_prizes}
                  valueStyle={{ color: theme.success }}
                />
              </Card>
            </Col>

            <Col span={8}>
              <Card
                bordered
                style={{
                  background: theme.cardBg,
                  borderColor: theme.border,
                  borderRadius: 12,
                  boxShadow: theme.shadow,
                }}
              >
                <Statistic
                  title="Total Unsold Prizes"
                  prefix="Rs."
                  value={summary.total_unsold_prizes}
                  valueStyle={{ color: theme.danger }}
                />
              </Card>
            </Col>
          </Row>

          {/* Table Section */}
          <Table
            style={{
              marginTop: 40,
              background: theme.cardBg,
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
            }}
            dataSource={data}
            columns={columns}
            pagination={false}
            bordered={false}
          />
        </>
      )}
    </div>
  );
};

export default ReconciliationReport;
