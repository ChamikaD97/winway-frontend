import React, { useState, useRef } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Button,
  Table,
  message,
  Divider,
  Pagination,
  Modal,
  Tag,
  Space,
} from "antd";
import {
  CrownOutlined,
  ThunderboltOutlined,
  UserOutlined,
  TrophyOutlined,
  PieChartOutlined,
  BarChartOutlined,
  MailOutlined,
} from "@ant-design/icons";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const { Title, Text } = Typography;

function ResultsView({ results, lotteryPrizes }) {
  const [customerPage, setCustomerPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [chartType, setChartType] = useState("pie");
  const [sendingMail, setSendingMail] = useState(false);

  const pageSizeCustomers = 5;
  const customerSectionRef = useRef(null);
  const COLORS = ["#1890ff", "#52c41a", "#faad14", "#722ed1", "#eb2f96"];

  if (!results) return null;

  // ✅ Summary Stats
  const totalCustomers =
    results.summary?.total_customers || results?.emails?.length;
  const totalTickets = results.summary?.total_tickets || 0;
  const totalWinnings = results.summary?.total_winnings || 0;

  // ✅ Ranked Data
  const rankedData = [...(results.emails || [])]
    .sort((a, b) => b.Total_Winnings - a.Total_Winnings)
    .map((e, i) => ({
      key: i + 1,
      rank: i + 1,
      name: e.Customer_Name || "Unknown",
      email: e.Email,
      text: e.Email_Message,
      mobile: e.MobileNumber,
      winnings: e.Total_Winnings || 0,
      tickets: e.Total_Tickets || 0,
    }));

  const top3 = rankedData.slice(0, 3);
  const pagedCustomers = rankedData.slice(
    (customerPage - 1) * pageSizeCustomers,
    customerPage * pageSizeCustomers
  );

  // 🎟️ Table Columns
  const columns = [
    {
      title: "🏆 Rank",
      dataIndex: "rank",
      key: "rank",
      align: "center",
      render: (rank) => {
        const emojis = ["🥇", "🥈", "🥉"];
        const colors = ["#faad14", "#91d5ff", "#d3adf7"];
        return (
          <Text strong style={{ color: colors[rank - 1] || "#555" }}>
            {emojis[rank - 1] || `#${rank}`}
          </Text>
        );
      },
    },
    { title: "Customer Name", dataIndex: "name", key: "name" },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) =>
        text ? <Text copyable={{ text }}>{text}</Text> : "No email",
    },
    { title: "Mobile", dataIndex: "mobile", key: "mobile" },
    { title: "Tickets", dataIndex: "tickets", key: "tickets", align: "center" },
    {
      title: "Winnings (Rs.)",
      dataIndex: "winnings",
      key: "winnings",
      align: "center",
      render: (val) => (
        <Text strong style={{ color: val > 0 ? "#389e0d" : "#999" }}>
          Rs. {val.toLocaleString()}
        </Text>
      ),
    },
  ];

  // 📊 Subtable Columns
  const detailColumns = [
    {
      title: "🎟️ Lottery Type",
      dataIndex: "Lottery_Type",
      key: "Lottery_Type",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Ticket Count",
      dataIndex: "Count",
      key: "Count",
      align: "center",
    },
  ];

  // 🧭 Row Click → Show Modal
  const handleRowClick = (record) => {
    const customerDetails = results.tblData.filter(
      (t) => t.MobileNumber === record.mobile
    );
    setSelectedCustomer({
      ...record,
      details: customerDetails,
    });
    setIsModalVisible(true);
    setChartType("pie");
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedCustomer(null);
  };

  // 📧 Send Email to this customer
const handleSendEmail = async () => {
  if (!selectedCustomer?.email) {
    message.warning("⚠️ No email address for this customer.");
    console.log("🧩 Missing email in selectedCustomer:", selectedCustomer);
    return;
  }

  try {
    setSendingMail(true);
    message.loading({
      content: `📤 Sending personalized email to ${selectedCustomer.name}...`,
      key: "sendCustomerMail",
    });

    // 🧾 Prepare table data for this customer
    const tblData = (selectedCustomer.details || []).map((item) => ({
      name: item.Lottery_Type,
      count: item.Count,
      winnings: item.Total_Winnings,
    }));

    // 🎁 Prepare Super Prize data (from prop or state)
    // assuming you passed `lotteryPrizes` from parent or ResultsView
    const superPrizes = lotteryPrizes || {};

    // 📨 Build form data
    const formData = new FormData();
    formData.append("to", "chamikadeshan97@gmail.com"); // ✅ actual customer email
    formData.append("name", selectedCustomer.name);
    formData.append("tickets", selectedCustomer.tickets);
    formData.append("winnings", selectedCustomer.winnings);
    formData.append(
      "subject",
      `🎯 WinWay Results Update for ${selectedCustomer.name}`
    );

    // ✅ Include ticket breakdown
    formData.append("tblData", JSON.stringify(tblData || []));

    // ✅ Include super prize data
    formData.append("superPrizes", JSON.stringify(superPrizes));

    // 🔗 Send to backend email endpoint
    await axios.post("http://localhost:8001/email/sendToCustomer", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    message.success({
      content: `✅ Eye-catching email successfully sent to ${selectedCustomer.email}`,
      key: "sendCustomerMail",
    });
  } catch (error) {
    console.error("Email send error:", error);
    message.error({
      content: "❌ Failed to send email to customer.",
      key: "sendCustomerMail",
    });
  } finally {
    setSendingMail(false);
  }
};

  return (
    <div style={{ maxWidth: "1250px", margin: "40px auto", padding: "0 20px" }}>
      {/* 🏆 Top 3 Winners */}
      <Title
        level={4}
        style={{
          textAlign: "center",
          color: "#722ed1",
          marginBottom: 25,
          fontWeight: 700,
        }}
      >
        🏅 This Week’s Top 3 Winners
      </Title>
      <Row gutter={[24, 24]} justify="center" style={{ marginBottom: 40 }}>
        {top3.map((w, idx) => {
          const gradients = [
            "linear-gradient(145deg,#fff4e6,#ffd666)",
            "linear-gradient(145deg,#e6f4ff,#91d5ff)",
            "linear-gradient(145deg,#f9f0ff,#d3adf7)",
          ];
          const medals = ["🥇", "🥈", "🥉"];
          return (
            <Col xs={24} sm={12} md={8} key={idx}>
              <Card
                hoverable
                bordered={false}
                style={{
                  borderRadius: 18,
                  boxShadow:
                    idx === 0
                      ? "0 0 25px rgba(250,173,20,0.45)"
                      : "0 0 15px rgba(0,0,0,0.1)",
                  background: gradients[idx],
                  textAlign: "center",
                  transition: "transform 0.2s ease",
                }}
              >
                <div style={{ fontSize: 46, marginBottom: 8 }}>
                  {medals[idx]}
                </div>
                <Text strong style={{ fontSize: 20 }}>
                  {w.name}
                </Text>
                <Divider style={{ margin: "12px 0" }} />
                <Text type="secondary" style={{ fontSize: 16 }}>
                  Total Winnings
                </Text>
                <br />
                <Text strong style={{ fontSize: 22, color: "#08979c" }}>
                  Rs. {w.winnings.toLocaleString()}
                </Text>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* 👥 Customer Table */}
      <Card
        ref={customerSectionRef}
        title="👥 Ranked Customer List"
        style={{
          borderRadius: 12,
          marginBottom: 30,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Table
          dataSource={pagedCustomers}
          columns={columns}
          pagination={false}
          bordered
          size="middle"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          style={{ cursor: "pointer" }}
        />

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Pagination
            current={customerPage}
            pageSize={pageSizeCustomers}
            total={rankedData.length}
            onChange={(page) => setCustomerPage(page)}
            showSizeChanger={false}
          />
        </div>
      </Card>

      {/* 🪟 Customer Modal */}
      <Modal
        title={
          <div
            style={{
              textAlign: "center",
              fontSize: 20,
              fontWeight: 600,
              color: "#4B0082",
              letterSpacing: 0.5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}
          >
            <TrophyOutlined style={{ color: "#D4AF37", fontSize: 22 }} />
            {selectedCustomer?.name}'s Lottery Overview
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        width={1000}
        centered
        bodyStyle={{
          background: "linear-gradient(180deg, #ffffff 0%, #faf5ff 100%)",
          borderRadius: 16,
          padding: "24px 32px",
        }}
        footer={[
          <Button
            key="toggle"
            type="default"
            icon={
              chartType === "pie" ? <BarChartOutlined /> : <PieChartOutlined />
            }
            onClick={() => setChartType(chartType === "pie" ? "bar" : "pie")}
            style={{
              borderRadius: 8,
              fontWeight: 500,
              borderColor: "#722ed1",
              color: "#722ed1",
            }}
          >
            {chartType === "pie" ? "Bar View" : "Pie View"}
          </Button>,
          <Button
            key="send"
            type="primary"
            icon={<MailOutlined />}
            loading={sendingMail}
            onClick={handleSendEmail}
            style={{
              background: "linear-gradient(90deg, #7b2ff7, #f107a3)",
              border: "none",
              borderRadius: 8,
              boxShadow: "0 3px 8px rgba(123,47,247,0.3)",
            }}
          >
            Send Email to Customer
          </Button>,
          <Button
            key="close"
            onClick={handleModalClose}
            style={{
              borderRadius: 8,
              fontWeight: 500,
              borderColor: "#ccc",
            }}
          >
            Close
          </Button>,
        ]}
      >
        {selectedCustomer && (
          <>
            {/* 🧾 Info Cards */}
            <Row
              gutter={[16, 16]}
              justify="center"
              style={{ marginBottom: 25 }}
            >
              {[
                { title: "Email", value: selectedCustomer.email || "N/A" },
                { title: "Mobile", value: selectedCustomer.mobile },
                { title: "Total Tickets", value: selectedCustomer.tickets },
                {
                  title: "Total Winnings",
                  value: `Rs. ${selectedCustomer.winnings.toLocaleString()}`,
                },
              ].map((info, i) => (
                <Col xs={24} sm={12} md={6} key={i}>
                  <Card
                    bordered={false}
                    size="small"
                    hoverable
                    style={{
                      borderRadius: 14,
                      background: "linear-gradient(145deg, #ffffff, #f4f0ff)",
                      textAlign: "center",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
                      border: "1px solid #f0f0f0",
                      transition: "transform 0.25s ease",
                    }}
                  >
                    <Text strong style={{ color: "#722ed1", fontSize: 15 }}>
                      {info.title}
                    </Text>
                    <Divider
                      style={{
                        margin: "8px 0",
                        borderColor: "#e5d4ff",
                      }}
                    />
                    <Text style={{ color: "#333", fontSize: 15 }}>
                      {info.value}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* 📊 Chart (Left) + 📋 Table (Right) */}
            <Row gutter={[20, 20]} align="top">
              {/* Left: Chart */}
              <Col xs={24} md={12}>
                <Card
                  bordered={false}
                  style={{
                    height: 360,
                    borderRadius: 12,
                    background: "#fff",
                    boxShadow: "0 3px 10px rgba(123,47,247,0.1)",
                    padding: 10,
                  }}
                  title={
                    <div style={{ textAlign: "center", color: "#722ed1" }}>
                      {chartType === "pie"
                        ? "Ticket Distribution"
                        : "Ticket Summary"}
                    </div>
                  }
                >
                  <ResponsiveContainer width="100%" height={270}>
                    {chartType === "pie" ? (
                      <PieChart>
                        <Pie
                          data={selectedCustomer.details || []}
                          dataKey="Count"
                          nameKey="Lottery_Type"
                          outerRadius={100}
                          
                        >
                          {(selectedCustomer.details || []).map((entry, i) => (
                            <Cell
                              key={`cell-${i}`}
                              fill={COLORS[i % COLORS.length]}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            borderColor: "#722ed1",
                            background: "#faf5ff",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    ) : (
                      <BarChart data={selectedCustomer.details || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="Lottery_Type" tick={{ fill: "#555" }} />
                        <YAxis tick={{ fill: "#555" }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            borderColor: "#722ed1",
                            background: "#faf5ff",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="Count"
                          fill="#722ed1"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </Card>
              </Col>

              {/* Right: Table */}
              <Col xs={24} md={12}>
                <Card
                  bordered={false}
                  style={{
                    height: 360,
                    borderRadius: 12,
                    background: "#fff",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
                    overflowY: "auto",
                  }}
                  title={
                    <div style={{ textAlign: "center", color: "#722ed1" }}>
                      Lottery Breakdown
                    </div>
                  }
                >
                  <Table
                    columns={detailColumns}
                    dataSource={selectedCustomer.details || []}
                    pagination={false}
                    size="small"
                    bordered
                    rowKey={(r) => r.Lottery_Type}
                    scroll={{ y: 210 }}
                  />
                </Card>
              </Col>
            </Row>

            {/* 🏆 Super Prizes Section */}
            {lotteryPrizes && (
              <div
                style={{
                  marginTop: 20,
                  padding: "25px 20px",
                  background:
                    "linear-gradient(90deg, rgba(123,47,247,1) 0%, rgba(241,7,163,1) 100%)",
                  borderRadius: 14,
                  color: "white",
                  textAlign: "center",
                  boxShadow: "0 3px 12px rgba(123,47,247,0.3)",
                }}
              >
                <Title
                  level={4}
                  style={{
                    color: "#FFD700",
                    marginBottom: 10,
                    letterSpacing: 0.8,
                  }}
                >
                  🏆 NEXT SUPER PRIZES 🏆
                </Title>

                <Row gutter={[16, 12]} justify="center">
                  {Object.entries(lotteryPrizes).map(([name, value], index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={index}>
                      <Card
                        bordered={false}
                        style={{
                          background: "rgba(255,255,255,0.12)",
                          borderRadius: 10,
                          color: "#fff",
                          fontWeight: 500,
                          textAlign: "center",
                          border: "1px solid rgba(255,255,255,0.2)",
                          transition: "all 0.3s ease",
                        }}
                        hoverable
                      >
                        <Text style={{ fontSize: 14, color: "#fff" }}>
                          {name}
                        </Text>
                        <Divider
                          style={{ margin: "8px 0", borderColor: "#FFD700" }}
                        />
                        <Text strong style={{ fontSize: 15, color: "#FFD700" }}>
                          Rs. {parseInt(value).toLocaleString()}
                        </Text>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

export default ResultsView;
