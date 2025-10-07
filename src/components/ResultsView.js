import React, { useState } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Button,
  Image,
  Table,
  message,
  Divider,
} from "antd";
import {
  CopyOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

function ResultsView({ results }) {
  const [showEmails, setShowEmails] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  if (!results) return null;

  // ✅ Stats from backend summary
  const totalCustomers = results.summary?.total_customers || results?.emails?.length;
  const totalTickets = results.summary?.total_tickets || 0;
  const totalWinnings = results.summary?.total_winnings || 0;
  const totalImages = results.summary?.total_images || results?.images?.length;

  // ✅ Prepare email table
  const tableData = results.emails.map((email, idx) => ({
    key: idx,
    email: email.Email,
    mobile: email.MobileNumber,
    message: email.Email_Message,
    winnings: email.Total_Winnings || 0,
  }));

  // ✅ Top 3 winners (for mini stats)
  const topWinners = [...tableData]
    .sort((a, b) => b.winnings - a.winnings)
    .slice(0, 3);

  const columns = [
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Mobile", dataIndex: "mobile", key: "mobile" },
    {
      title: "Winnings (Rs.)",
      dataIndex: "winnings",
      key: "winnings",
      render: (val) => <span style={{ fontWeight: 500 }}>Rs. {val}</span>,
    },
    {
      title: "Message (Preview)",
      dataIndex: "message",
      key: "message",
      render: (text, record) => {
        const isExpanded = expandedRows.has(record.key);
        return (
          <div>
            <span>
              {isExpanded
                ? text
                : text.length > 80
                ? text.substring(0, 80) + "..."
                : text}
            </span>
            {text.length > 80 && (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  const newSet = new Set(expandedRows);
                  if (isExpanded) newSet.delete(record.key);
                  else newSet.add(record.key);
                  setExpandedRows(newSet);
                }}
              >
                {isExpanded ? "Show Less" : "Show More"}
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          icon={<CopyOutlined />}
          onClick={() => {
            navigator.clipboard.writeText(record.email);
            message.success("Email copied to clipboard!");
          }}
        >
          Copy Email
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "30px auto" }}>
      {/* ✅ Top Dashboard Statistics */}
      <Row gutter={16} style={{ marginBottom: "30px" }}>
        <Col span={6}><Card><Statistic title="Customers" value={totalCustomers} /></Card></Col>
        <Col span={6}><Card><Statistic title="Tickets" value={totalTickets} /></Card></Col>
        <Col span={6}><Card><Statistic title="Total Winnings (Rs.)" value={totalWinnings} /></Card></Col>
        <Col span={6}><Card><Statistic title="Images" value={totalImages} /></Card></Col>
      </Row>

      {/* ✅ Emails Summary Card */}
      <Card
        title={`📧 Generated Emails (${results.emails.length})`}
        style={{ marginBottom: 20 }}
        extra={
          <Button type="link" onClick={() => setShowEmails(!showEmails)}>
            {showEmails ? "Hide Details" : "View Details"}
          </Button>
        }
      >
        {/* Always visible section */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          {topWinners.map((w, idx) => (
            <Col span={8} key={idx}>
              <Card size="small" bordered={false} style={{ background: "#f6ffed" }}>
                <Text strong>{w.email}</Text>
                <br />
                <Text type="secondary">Rs. {w.winnings.toLocaleString()}</Text>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ marginBottom: 15 }}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              // export email list to CSV
              const rows = [["Email", "Mobile", "Winnings"]];
              results.emails.forEach((e) => {
                rows.push([e.Email, e.MobileNumber, e.Total_Winnings || 0]);
              });
              const csv = rows.map((r) => r.join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "emails.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download Emails CSV
          </Button>
        </div>

        {/* Expanded section */}
        {showEmails && (
          <Table
            dataSource={tableData}
            columns={columns}
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>

      {/* ✅ Images Summary Card */}
      <Card
        title={`🖼️ Generated Images (${results.images.length})`}
        extra={
          <Button type="link" onClick={() => setShowImages(!showImages)}>
            {showImages ? "Hide Details" : "View Details"}
          </Button>
        }
      >
        {/* Always visible section */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={12}>
            <Card size="small" bordered={false}>
              <Statistic title="Preview" value={results.images.length} suffix="Images" />
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" bordered={false}>
              <Statistic title="ZIP Download" value="Ready" />
            </Card>
          </Col>
        </Row>

        <div style={{ marginBottom: 15 }}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => window.open("http://127.0.0.1:8000/download-zip", "_blank")}
          >
            Download All as ZIP
          </Button>
        </div>

        {/* Expanded section */}
        {showImages && (
          <Image.PreviewGroup>
            <Row gutter={[16, 16]}>
              {results.images.map((img, idx) => (
                <Col xs={24} sm={12} md={8} lg={6} key={idx}>
                  <Card
                    hoverable
                    cover={
                      <Image
                        src={`http://127.0.0.1:8000/${img}`}
                        alt={`Generated ${idx + 1}`}
                        style={{ borderRadius: "8px" }}
                      />
                    }
                    actions={[
                      <Button
                        type="link"
                        href={`http://127.0.0.1:8000/${img}`}
                        download
                        icon={<DownloadOutlined />}
                      >
                        Download
                      </Button>,
                    ]}
                  >
                    <Text type="secondary">Image {idx + 1}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        )}
      </Card>
    </div>
  );
}

export default ResultsView;
