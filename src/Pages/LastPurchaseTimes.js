import React, { useState } from "react";
import {
  Upload,
  Button,
  Table,
  message,
  Statistic,
  Card,
  Row,
  Col,
} from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import axios from "axios";
import { theme } from "../config/themeConfig";

const LastPurchaseTimes = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [data, setData] = useState([]);

  const lotteryKeys = [
    ["HADA", "Handahana"],
    ["ADA", "Ada Sampatha"],
    ["DANA", "Dhana Nidhanaya"],
    ["DRAW", "Govisetha"],
    ["MAHA", "Mahajana Sampatha"],
    ["mgap", "Mega Power"],
    ["Dinu", "Jaya"],
    ["SUBA", "Suba Dawasak"],
  ];

  // --- helpers ---
  const getDrawNo = (name = "") => {
    const m = String(name).match(/(\d{4})$/);
    return m ? m[1] : "-";
  };

  const getFullLotteryName = (rawName = "") => {
    const prefix = String(rawName).replace(/\d{4}$/, "");
    const entry = lotteryKeys.find(([key]) =>
      prefix.toUpperCase().startsWith(key.toUpperCase())
    );
    const fullName = entry ? entry[1] : prefix;
    return fullName?.trim() || "Unknown";
  };

  // Safely combine "YYYY-MM-DD" + "HH:MM" → format as 12h
  const formatLastSaleTime = (dateStr, timeStr) => {
    if (!timeStr) return "-";
    // If we have the date, build an ISO-like string; else just show HH:MM
    if (!dateStr) return timeStr;
    // Build "YYYY-MM-DDTHH:MM:00" so Date can parse reliably
    const isoLike = `${dateStr}T${timeStr}:00`;
    const d = new Date(isoLike);
    if (isNaN(d.getTime())) return timeStr; // fallback
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Optional: quick thousands format
  const nf = (n) => (n == null ? 0 : Number(n).toLocaleString());

  // ========== Table Columns ==========
  const columns = [
    {
      title: "Draw No",
      key: "draw",
      width: 100,
      render: (_, record) => (
        <span style={{ color: theme.info, fontWeight: 600 }}>
          {getDrawNo(record["Lottery Name"])}
        </span>
      ),
    },
    {
      title: "Lottery Name",
      dataIndex: "Lottery Name",
      key: "lottery",
      render: (val) => (
        <strong style={{ color: theme.primary }}>
          {getFullLotteryName(val)}
        </strong>
      ),
    },
    {
      title: "Last Sale Date",
      dataIndex: "Last Sale Date",
      key: "lastDate",
      width: 140,
      render: (val) => (
        <span style={{ color: theme.textSecondary, fontWeight: 500 }}>
          {val || "-"}
        </span>
      ),
      sorter: (a, b) =>
        String(a["Last Sale Date"] || "").localeCompare(
          String(b["Last Sale Date"] || "")
        ),
    },
    {
      title: "Last Sale Time",
      key: "time",
      width: 130,
      render: (_, record) => {
        const dateStr = record["Last Sale Date"];
        const timeStr = record["Last Sale Time"]; // e.g., "21:00"
        const formatted = formatLastSaleTime(dateStr, timeStr);
        return (
          <span style={{ color: theme.textSecondary, fontWeight: 500 }}>
            {formatted}
          </span>
        );
      },
      sorter: (a, b) => {
        const A = new Date(
          `${a["Last Sale Date"] || "1970-01-01"}T${
            a["Last Sale Time"] || "00:00"
          }:00`
        ).getTime();
        const B = new Date(
          `${b["Last Sale Date"] || "1970-01-01"}T${
            b["Last Sale Time"] || "00:00"
          }:00`
        ).getTime();
        return A - B;
      },
    },
    {
      title: "Sales Count",
      dataIndex: "Sales Count",
      key: "count",
      align: "right",
      width: 130,
      render: (val) => (
        <span style={{ color: theme.success, fontWeight: 600 }}>{nf(val)}</span>
      ),
      sorter: (a, b) => (a["Sales Count"] ?? 0) - (b["Sales Count"] ?? 0),
    },
  ];

  // ========== Upload Config ==========
  const props = {
    name: "sales_files",
    multiple: false,
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("sales_files", file);

        // 1️⃣ Send file to FastAPI
        const res = await axios.post(
          "http://127.0.0.1:8000/api/sales-summary/",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        const apiData = res.data.results || [];
        const totalFiles = res.data.total_files || 0;

        // Sort by latest sale time
        const sorted = [...apiData].sort((a, b) => {
          const tA = new Date(a["Last Sale Time"]);
          const tB = new Date(b["Last Sale Time"]);
          return tB - tA;
        });
        const totalSales = apiData.reduce(
          (sum, r) => sum + (Number(r["Sales Count"]) || 0),
          0
        );
        setData(sorted);
        console.log(sorted);

        setSummary({
          total_files: totalFiles,
          latest_time: sorted?.[0]?.["Last Sale Date"] || "-",
          totalSales: totalSales,
        });

        message.success("✅ Sales summary generated successfully!");
        onSuccess();
      } catch (err) {
        console.error("❌ Upload error:", err);
        message.error("❌ Failed to process file.");
        onError(err);
      } finally {
        setLoading(false);
      }
    },
  };
  // ========== Download Report Image (From Node Backend) ==========
  const handleDownloadServerImage = async () => {
    if (!data.length) {
      message.warning("⚠️ Please generate the report first.");
      return;
    }

    try {
      setLoading(true);
      message.loading("🧩 Generating image via server...", 1.5);

      // 2️⃣ Send parsed data to Node.js Puppeteer route
      const res = await axios.post(
        "http://127.0.0.1:8001/report/generate?template=pro", // 👈 ensure backend port
        { results: data,
          summary:summary
         },
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

  // ========== JSX UI ==========
  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.background,
        padding: "40px 50px",
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
        📆 Last Sale Time Summary
      </h2>

      {/* Upload + Download Buttons */}
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
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
            Upload ZIP or CSV Files
          </Button>
        </Upload>

        <Button
          icon={<DownloadOutlined />}
          onClick={handleDownloadServerImage}
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
      </div>

      {/* Summary Section */}
      {summary && (
        <>
          <Row gutter={16} style={{ marginTop: 40 }}>
             <Col span={12}>
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
                  title="Sales Summery On"
                  value={summary.latest_time}
                  valueStyle={{ color: theme.textSecondary }}
                />
              </Card>
            </Col>
            <Col span={6}>
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
                  title="Total Lotteries Processed"
                  value={summary.total_files}
                  valueStyle={{ color: theme.primary }}
                />
              </Card>
            </Col>
            
            <Col span={6}>
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
                  title="Total Sales"
                  value={summary.totalSales}
                  valueStyle={{ color: theme.primary }}
                />
              </Card>
            </Col>

           
          </Row>

          {/* Results Table */}
          <Table
            style={{
              marginTop: 40,
              background: theme.cardBg,
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
            }}
            dataSource={data}
            columns={columns}
            rowKey={(record) => record["File Name"]}
            pagination={{
              pageSize: 8,
              showSizeChanger: false,
            }}
          />
        </>
      )}
    </div>
  );
};

export default LastPurchaseTimes;
