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
  Tag,
} from "antd";
import { DownloadOutlined, CrownOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function ResultsView({ results }) {
  const [showEmails, setShowEmails] = useState(false);
  const [showImages, setShowImages] = useState(false);

  if (!results) return null;

  // ✅ Summary values
  const totalCustomers =
    results.summary?.total_customers || results?.emails?.length;
  const totalTickets = results.summary?.total_tickets || 0;
  const totalWinnings = results.summary?.total_winnings || 0;
  const totalImages = results.summary?.total_images || results?.images?.length;

  // ✅ Email table data
  const tableData = results.emails.map((email, idx) => ({
    key: idx,
    name: email.Customer_Name || "Unknown",
    email: email.Email,
    mobile: email.MobileNumber,
    winnings: email.Total_Winnings || 0,
  }));

  const topWinners = [...tableData]
    .sort((a, b) => b.winnings - a.winnings)
    .slice(0, 3);

  const columns = [
    {
      title: "Customer Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) =>
        text ? (
          <Text copyable={{ text }}>{text}</Text>
        ) : (
          <Text type="secondary">No email</Text>
        ),
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Winnings (Rs.)",
      dataIndex: "winnings",
      key: "winnings",
      sorter: (a, b) => a.winnings - b.winnings,
      render: (val) => (
        <Text strong style={{ color: val > 0 ? "#389e0d" : "#999" }}>
          Rs. {val.toLocaleString()}
        </Text>
      ),
    },
  ];

  // ✅ Export CSV
  const handleExport = () => {
    if (!results?.emails?.length) {
      message.warning("No email data available to export.");
      return;
    }

    const rows = [
      ["Customer Name", "Email", "Mobile Number", "Total Winnings (Rs.)"],
    ];
    results.emails.forEach((e) =>
      rows.push([
        e.Customer_Name || "",
        e.Email || "",
        e.MobileNumber || "",
        e.Total_Winnings || 0,
      ])
    );

    const csvContent =
      "\uFEFF" +
      rows
        .map((r) =>
          r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Generated_Emails_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
    message.success("✅ Email list exported successfully!");
  };

  return (
    <div
      style={{
        maxWidth: "1250px",
        margin: "40px auto",
        padding: "0 20px",
      }}
    >
      {/* --- Dashboard Summary --- */}
      <Row gutter={[20, 20]} style={{ marginBottom: 50 }}>
        <Col xs={12} sm={6}>
          <Card
            bordered={false}
            style={{
              background: "linear-gradient(135deg, #1890ff, #69c0ff)",
              borderRadius: 12,
            }}
          >
            <Statistic
              title={
                <Text strong style={{ color: "#000000ff" }}>
                  Customers
                </Text>
              }
              value={totalCustomers}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            bordered={false}
            style={{
              background: "linear-gradient(135deg, #52c41a, #b7eb8f)",
              borderRadius: 12,
            }}
          >
            <Statistic
              title={
                <Text strong style={{ color: "#000000ff" }}>
                  Tickets
                </Text>
              }
              value={totalTickets}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            bordered={false}
            style={{
              background: "linear-gradient(135deg, #faad14, #ffd666)",
              borderRadius: 12,
            }}
          >
            <Statistic
              title={
                <Text strong style={{ color: "#000000ff" }}>
                  Total Winnings (Rs.)
                </Text>
              }
              value={totalWinnings}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            bordered={false}
            style={{
              background: "linear-gradient(135deg, #722ed1, #b37feb)",
              borderRadius: 12,
            }}
          >
            <Statistic
              title={
                <Text strong style={{ color: "#000000ff" }}>
                  Images
                </Text>
              }
              value={totalImages}
            />
          </Card>
        </Col>
      </Row>

      {/* --- Emails Section --- */}
      <Card
        title={
          <Title level={4}>📧 Generated Emails ({results.emails.length})</Title>
        }
        extra={
          <Button type="link" onClick={() => setShowEmails(!showEmails)}>
            {showEmails ? "Hide Details" : "View Details"}
          </Button>
        }
        style={{
          marginBottom: 30,
          borderRadius: 12,
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        }}
      >
        {/* Top Winners */}
        <Row gutter={16} style={{ marginBottom: 25 }}>
          {topWinners.map((w, idx) => (
            <Col xs={24} sm={8} key={idx}>
              <Card
                size="small"
                bordered={false}
                style={{
                  borderRadius: 10,
                  textAlign: "center",
                  background:
                    idx === 0
                      ? "linear-gradient(135deg,#fffbe6,#ffd666)"
                      : idx === 1
                      ? "linear-gradient(135deg,#e6f7ff,#91d5ff)"
                      : "linear-gradient(135deg,#f9f0ff,#d3adf7)",
                }}
              >
                <Tag
                  color={idx === 0 ? "gold" : idx === 1 ? "blue" : "purple"}
                  icon={<CrownOutlined />}
                  style={{ fontSize: 12, padding: "4px 8px" }}
                >
                  #{idx + 1}
                </Tag>
                <Text strong>{w.name}</Text>
                <br />
                <Text type="secondary">Rs. {w.winnings.toLocaleString()}</Text>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ textAlign: "right", marginBottom: 10 }}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Download Emails CSV
          </Button>
        </div>

        {showEmails && (
          <Table
            dataSource={tableData}
            columns={columns}
            pagination={{ pageSize: 6 }}
            bordered
            size="middle"
            style={{ background: "#fff", borderRadius: 8 }}
          />
        )}
      </Card>

      {/* --- Images Section --- */}
      <Card
        title={
          <Title level={4}>🖼️ Generated Images ({results.images.length})</Title>
        }
        extra={
          <Button type="link" onClick={() => setShowImages(!showImages)}>
            {showImages ? "Hide Details" : "View Details"}
          </Button>
        }
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        }}
      >
        <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
          <Col span={12}>
            <Card bordered={false}>
              <Statistic
                title="Preview"
                value={results.images.length}
                suffix="Images"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card bordered={false}>
              <Statistic title="ZIP Download" value="Ready" />
            </Card>
          </Col>
        </Row>

        <div style={{ textAlign: "right", marginBottom: 10 }}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() =>
              window.open("http://127.0.0.1:8000/download-zip", "_blank")
            }
          >
            Download All as ZIP
          </Button>
        </div>

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
                        style={{
                          borderRadius: 10,
                          objectFit: "cover",
                          height: 220,
                        }}
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
                    <Text strong>Image {idx + 1}</Text>
                    <br />
                    <Text type="secondary">Personalized Result</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        )}
      </Card>

      <Button
        type="default"
        onClick={async () => {
          if (!results?.emails?.length) {
            message.warning("No email data available to send!");
            return;
          }

          // Generate CSV
          const rows = [
            ["Customer Name", "Email", "Mobile Number", "Total Winnings (Rs.)"],
          ];
          results.emails.forEach((e) =>
            rows.push([
              e.Customer_Name || "",
              e.Email || "",
              e.MobileNumber || "",
              e.Total_Winnings || 0,
            ])
          );

          const csvContent =
            "\uFEFF" +
            rows
              .map((r) =>
                r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
              )
              .join("\n");

          const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
          });
          const file = new File([blob], "Generated_Emails.csv", {
            type: "text/csv",
          });
          const formData = new FormData();
          formData.append("file", file);

          try {
            message.loading("Sending CSV to Call Center...", 2);
            const res = await fetch(
              "http://127.0.0.1:8000/send-callcenter-csv/",
              {
                method: "POST",
                body: formData,
              }
            );
            const data = await res.json();
            if (data.status?.includes("✅")) {
              message.success("✅ CSV successfully emailed to Call Center!");
            } else {
              message.error("❌ Failed to send email!");
            }
          } catch (error) {
            message.error("❌ Error sending email!");
          }
        }}
      >
        📤 Send CSV to Call Center
      </Button>
    </div>
  );
}

export default ResultsView;
