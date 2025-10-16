import React, { useState, useRef } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Table,
  message,
  Divider,
  Pagination,
  Modal,
  Space,
  Progress,
  List,
  Tooltip,
  Tag,
} from "antd";
import {
  MailOutlined,
  ReloadOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  ClockCircleTwoTone,
  PauseCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  PieChartOutlined,
  BarChartOutlined,
  RedoOutlined,
  CalendarOutlined,
  UserOutlined,
  GiftOutlined,
  TrophyOutlined,
  PictureOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
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

  const [sendingMailAll, setSendingMailAll] = useState(false);
  const [sendingMailSingle, setSendingMailSingle] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [logList, setLogList] = useState([]);

  const pausedRef = useRef(false);
  const stoppedRef = useRef(false);

  const pageSizeCustomers = 5;
  const COLORS = ["#1890ff", "#52c41a", "#faad14", "#722ed1", "#eb2f96"];

  if (!results) return null;

  const weekStart = results?.week_range?.start_date || "N/A";
  const weekEnd = results?.week_range?.end_date || "N/A";
  const totalCustomers = results?.summary?.total_customers || 0;
  const totalTickets = results?.summary?.total_tickets || 0;
  const totalWinnings = results?.summary?.total_winnings || 0;

  const rankedData = [...(results.emails || [])]
    .sort((a, b) => b.Total_Winnings - a.Total_Winnings)
    .map((e, i) => {
      const details = (results.tblData || [])
        .filter((t) => t.MobileNumber === e.MobileNumber)
        .map((item, index) => ({
          key: index + 1,
          Lottery_Type: item.Lottery_Type || "Unknown Lottery",
          Count: item.Count || 0,
          Winnings: item.Total_Winnings || 0,
        }));

      return {
        key: i + 1,
        rank: i + 1,
        name: e.Customer_Name || "Unknown",
        email: e.Email,
        mobile: e.MobileNumber,
        winnings: e.Total_Winnings || 0,
        tickets: e.Total_Tickets || 0,
        details,
      };
    });

  const top3 = rankedData.slice(0, 3);
  const pagedCustomers = rankedData.slice(
    (customerPage - 1) * pageSizeCustomers,
    customerPage * pageSizeCustomers
  );

  // 📧 Send single or fallback image
  const sendEmail = async (customer, i) => {
    try {
      const tblData = (customer.details || []).map((item) => ({
        name: item.Lottery_Type,
        count: item.Count,
        winnings: item.Total_Winnings,
      }));

      const formData = new FormData();
      formData.append("to", customer.email ? "" : ""); // empty = trigger image mode
      if (i < 20) {
        formData.append("cc", "info@winway.lk");
      }

      formData.append("name", customer.name);
      formData.append("tickets", customer.tickets);
      formData.append("winnings", customer.winnings);
      formData.append(
        "subject",
        `${customer.name} - Weekly Summary (${weekStart} → ${weekEnd})`
      );
      formData.append("tblData", JSON.stringify(tblData));
      formData.append("superPrizes", JSON.stringify(lotteryPrizes || {}));
      formData.append("weekStart", results?.week_range?.start_date || "");
      formData.append("weekEnd", results?.week_range?.end_date || "");

      const res = await axios.post(
        "http://localhost:8001/email/sendToCustomer",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // ✅ If backend returns image fallback
      if (res.data?.imagePath) {
        message.info(
          `📸 No email for ${customer.name}. Image saved at ${res.data.imagePath}`
        );
        return { status: "image", path: res.data.imagePath };
      }

      message.success(`✅ Email sent to ${customer.email || customer.name}`);
      return { status: "success" };
    } catch (error) {
      console.error("❌ Email send error:", error);
      message.error(`❌ Failed for ${customer.name}`);
      return { status: "failed" };
    }
  };
  // 📤 Send all (loop)
  const handleSendAllEmails = async () => {
    setSendingMailAll(true);
    setLogModalVisible(true);
    setLogList([]);
    setProgress(0);
    pausedRef.current = false;
    stoppedRef.current = false;

    // 🟢 Start from 10th record (index 9)

    const total = rankedData.length;
    let sentCount = 0;

    for (let i = 0; i < rankedData.length; i++) {
      const customer = rankedData[i];
      if (stoppedRef.current) break;

      // 🟡 Pause handling
      while (pausedRef.current && !stoppedRef.current) {
        await new Promise((r) => setTimeout(r, 500));
      }

      // 🧾 Add initial log
      setLogList((prev) => [
        ...prev,
        { name: customer.name, email: customer.email, status: "sending" },
      ]);

      // ✉️ Send or generate
      const result = await sendEmail(customer, i);
      sentCount++;
      setProgress(Math.round((sentCount / total) * 100));

      // 🟢 Update log item
      setLogList((prev) =>
        prev.map((l) =>
          l.name === customer.name
            ? {
                ...l,
                status: result.status,
                imagePath: result.path || null,
              }
            : l
        )
      );

      await new Promise((r) => setTimeout(r, 600)); // Delay between sends
    }

    setSendingMailAll(false);
  };
  // 📥 Download "No Email" Customers List
  const handleDownloadNoEmailList = () => {
    const noEmailCustomers = rankedData.filter((c) => !c.email);

    if (noEmailCustomers.length === 0) {
      message.info("✅ All customers have emails — nothing to download.");
      return;
    }

    // Create CSV content
    const headers = ["Customer Name", "Mobile Number"];
    const rows = noEmailCustomers.map((c) => [c.name, c.mobile]);
    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");

    // Create downloadable blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `WinWay_NoEmail_Customers_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success(
      `📥 Downloaded ${noEmailCustomers.length} customer(s) without emails.`
    );
  };

  const handlePause = () => (pausedRef.current = true);
  const handleResume = () => (pausedRef.current = false);
  const handleStop = () => {
    stoppedRef.current = true;
    pausedRef.current = false;
    setLogModalVisible(false);
    message.info("🛑 Email sending stopped.");
  };

  const retrySingleEmail = async (email) => {
    const customer = rankedData.find((c) => c.email === email);
    if (!customer) return;
    const result = await sendEmail(customer);
    setLogList((prev) =>
      prev.map((l) =>
        l.email === email
          ? {
              ...l,
              status: result.status,
              imagePath: result.path || null,
            }
          : l
      )
    );
  };

  const successCount = logList.filter((l) => l.status === "success").length;
  const failCount = logList.filter((l) => l.status === "failed").length;
  const imageCount = logList.filter((l) => l.status === "image").length;

  const handleSendEmail = async () => {
    if (!selectedCustomer) return;
    setSendingMailSingle(true);
    await sendEmail(selectedCustomer);
    setSendingMailSingle(false);
  };

  const handleRowClick = (record) => {
    setSelectedCustomer(record);
    setIsModalVisible(true);
  };

  // 🎨 UI
  return (
    <div style={{ maxWidth: 1250, margin: "40px auto", padding: "0 20px" }}>
      {/* Dashboard Cards */}
      <Card
        bordered={false}
        style={{
          marginBottom: 35,
          borderRadius: 18,
          background: "linear-gradient(145deg,#faf7ff,#ffffff)",
          boxShadow: "0 4px 15px rgba(123,47,247,0.12)",
        }}
      >
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} md={6}>
            <Title level={5} style={{ color: "#722ed1", marginBottom: 0 }}>
              <CalendarOutlined /> Week
            </Title>
            <Text type="secondary">
              {weekStart} → {weekEnd}
            </Text>
          </Col>
          <Col xs={12} md={6}>
            <div
              style={{
                background: "linear-gradient(90deg,#7b2ff7,#f107a3)",
                color: "#fff",
                padding: "10px 18px",
                borderRadius: 12,
                textAlign: "center",
              }}
            >
              <UserOutlined /> <strong>{totalCustomers}</strong> Customers
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div
              style={{
                background: "linear-gradient(90deg,#52c41a,#8bc34a)",
                color: "#fff",
                padding: "10px 18px",
                borderRadius: 12,
                textAlign: "center",
              }}
            >
              <GiftOutlined /> <strong>{totalTickets}</strong> Tickets
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div
              style={{
                background: "linear-gradient(90deg,#faad14,#fadb14)",
                color: "#000",
                padding: "10px 18px",
                borderRadius: 12,
                textAlign: "center",
              }}
            >
              <TrophyOutlined /> Rs. {totalWinnings.toLocaleString()}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Table */}
<Card
  title="👥 Ranked Customer List"
  extra={
    <Space>
      <Button
        icon={<DownloadOutlined />}
        onClick={handleDownloadNoEmailList}
        style={{
          background: "linear-gradient(90deg,#52c41a,#8bc34a)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
        }}
      >
        Download No-Email List
      </Button>

      <Button
        type="primary"
        icon={<MailOutlined />}
        onClick={handleSendAllEmails}
        loading={sendingMailAll}
        style={{
          background: "linear-gradient(90deg,#7b2ff7,#f107a3)",
          border: "none",
          borderRadius: 8,
        }}
      >
        Send All Emails
      </Button>
    </Space>
  }
>

        <Table
          dataSource={pagedCustomers}
          columns={[
            {
              title: "🏆 Rank",
              dataIndex: "rank",
              align: "center",
              render: (rank) => {
                const emojis = ["🥇", "🥈", "🥉"];
                return emojis[rank - 1] || `#${rank}`;
              },
            },
            { title: "Customer Name", dataIndex: "name" },
            {
              title: "Email",
              dataIndex: "email",
              render: (email) =>
                email ? (
                  email
                ) : (
                  <Tag color="gold" style={{ fontWeight: 500 }}>
                    No Email (Image Saved)
                  </Tag>
                ),
            },
            { title: "Tickets", dataIndex: "tickets", align: "center" },
            {
              title: "Winnings (Rs.)",
              dataIndex: "winnings",
              align: "center",
              render: (val) => (
                <Text strong style={{ color: val > 0 ? "#389e0d" : "#999" }}>
                  Rs. {val.toLocaleString()}
                </Text>
              ),
            },
          ]}
          pagination={false}
          bordered
          size="middle"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
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

      {/* Progress Log Modal */}
      <Modal
        open={logModalVisible}
        onCancel={() => setLogModalVisible(false)}
        width={650}
        centered
        footer={null}
        bodyStyle={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderRadius: 16,
          padding: "28px 36px",
        }}
        style={{
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 10px 35px rgba(123,47,247,0.3)",
        }}
        title={
          <div
            style={{
              background: "linear-gradient(90deg,#7b2ff7,#f107a3)",
              padding: "22px 0",
              margin: "-28px -36px 24px -36px",
              textAlign: "center",
              color: "white",
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: 0.4,
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            }}
          >
            Sending Emails / Generating Images
          </div>
        }
      >
        {/* 🔵 Gradient Progress Bar */}
        <Progress
          percent={progress}
          strokeWidth={10}
          strokeColor={{ "0%": "#7b2ff7", "100%": "#f107a3" }}
          trailColor="#f0f0f0"
          status="active"
          style={{
            marginBottom: 28,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
          }}
        />

        {/* 📋 Email + Image Log List */}
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
                border: "1px solid rgba(0,0,0,0.04)",
                background:
                  item.status === "sending"
                    ? "linear-gradient(90deg,rgba(123,47,247,0.05),rgba(255,255,255,0.8))"
                    : item.status === "image"
                    ? "linear-gradient(90deg,rgba(250,173,20,0.12),rgba(255,255,255,0.9))"
                    : item.status === "failed"
                    ? "linear-gradient(90deg,rgba(255,77,79,0.08),rgba(255,255,255,0.9))"
                    : "rgba(255,255,255,0.95)",
                transition: "background 0.3s ease",
              }}
              actions={
                item.status === "failed"
                  ? [
                      <Tooltip title="Retry this email" key="retry">
                        <Button
                          type="link"
                          icon={<RedoOutlined />}
                          onClick={() => retrySingleEmail(item.email)}
                          style={{ color: "#722ed1" }}
                        />
                      </Tooltip>,
                    ]
                  : item.status === "image" && item.imagePath
                  ? [
                      <a
                        href={`file://${item.imagePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#faad14", fontWeight: 500 }}
                      >
                        Open Image
                      </a>,
                    ]
                  : []
              }
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
                {item.status === "image" && (
                  <PictureOutlined style={{ color: "#faad14", fontSize: 18 }} />
                )}
                <Text strong style={{ color: "#111" }}>
                  {item.name}
                </Text>
                <Text type="secondary">
                  {item.email || "📸 Image Saved (No Email)"}
                </Text>
              </Space>
            </List.Item>
          )}
          style={{
            maxHeight: 320,
            overflowY: "auto",
            borderRadius: 8,
            borderColor: "rgba(0,0,0,0.06)",
            background: "rgba(255,255,255,0.6)",
          }}
        />

        {/* ✨ Status Summary */}
        <Divider style={{ margin: "22px 0 16px 0" }} />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg,#52c41a,#8bc34a)",
              padding: "6px 16px",
              borderRadius: 20,
              color: "#fff",
              fontWeight: 600,
              boxShadow: "0 2px 6px rgba(82,196,26,0.4)",
            }}
          >
            ✅ {successCount} Success
          </div>
          <div
            style={{
              background: "linear-gradient(90deg,#faad14,#fadb14)",
              padding: "6px 16px",
              borderRadius: 20,
              color: "#fff",
              fontWeight: 600,
              boxShadow: "0 2px 6px rgba(250,173,20,0.4)",
            }}
          >
            📸 {imageCount} Images Saved
          </div>
          <div
            style={{
              background:
                failCount > 0
                  ? "linear-gradient(90deg,#ff4d4f,#cf1322)"
                  : "linear-gradient(90deg,#aaa,#ccc)",
              padding: "6px 16px",
              borderRadius: 20,
              color: "#fff",
              fontWeight: 600,
              boxShadow:
                failCount > 0
                  ? "0 2px 6px rgba(255,77,79,0.4)"
                  : "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            ❌ {failCount} Failed
          </div>
        </div>

        {/* 🕹️ Controls (Pause / Resume / Stop) */}
        <Divider style={{ margin: "24px 0 10px 0" }} />
        <div
          style={{
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            gap: 16,
            flexWrap: "wrap",
            marginTop: 10,
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
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                minWidth: 120,
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
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                minWidth: 120,
              }}
            >
              Pause
            </Button>
          )}
          <Button
            icon={<StopOutlined />}
            danger
            size="large"
            onClick={handleStop}
            style={{
              background: "linear-gradient(90deg,#ff4d4f,#cf1322)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              minWidth: 140,
            }}
          >
            Stop & Close
          </Button>
        </div>
      </Modal>

      {/* 🧾 Customer Details Modal – WinWay Premium Design */}
      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        centered
        bodyStyle={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderRadius: 18,
          padding: "32px 36px",
        }}
        style={{
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 10px 35px rgba(123,47,247,0.3)",
        }}
        footer={[
          <Space
            key="footer"
            style={{ justifyContent: "center", width: "100%" }}
          >
            <Button
              key="toggle"
              type="default"
              icon={
                chartType === "pie" ? (
                  <BarChartOutlined />
                ) : (
                  <PieChartOutlined />
                )
              }
              onClick={() => setChartType(chartType === "pie" ? "bar" : "pie")}
              size="large"
              style={{
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(90deg,#e6e0ff,#f8f0ff)",
                color: "#722ed1",
                fontWeight: 600,
              }}
            >
              {chartType === "pie" ? "Bar View" : "Pie View"}
            </Button>
            <Button
              key="send"
              type="primary"
              icon={<MailOutlined />}
              loading={sendingMailSingle}
              onClick={handleSendEmail}
              size="large"
              style={{
                background: "linear-gradient(90deg,#7b2ff7,#f107a3)",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              Send Email to Customer
            </Button>
            <Button
              key="close"
              onClick={() => setIsModalVisible(false)}
              size="large"
              style={{
                borderRadius: 8,
                fontWeight: 500,
                borderColor: "#d9d9d9",
              }}
            >
              Close
            </Button>
          </Space>,
        ]}
        title={
          <div
            style={{
              background: "linear-gradient(90deg,#7b2ff7,#f107a3)",
              padding: "22px 0",
              margin: "-32px -36px 25px -36px",
              textAlign: "center",
              color: "white",
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 0.4,
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            }}
          >
            {selectedCustomer?.name}'s Lottery Overview
          </div>
        }
      >
        {selectedCustomer && (
          <>
            {/* 🪪 Customer Info Cards */}
            <Row
              gutter={[16, 16]}
              justify="center"
              style={{ marginBottom: 25 }}
            >
              {[
                { title: "Email", value: selectedCustomer.email },
                { title: "Mobile", value: selectedCustomer.mobile },
                { title: "Tickets", value: selectedCustomer.tickets },
                {
                  title: "Winnings",
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
                      background: "linear-gradient(145deg,#ffffff,#f8f4ff)",
                      boxShadow: "0 3px 10px rgba(123,47,247,0.12)",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Text strong style={{ color: "#722ed1", fontSize: 15 }}>
                      {info.title}
                    </Text>
                    <Divider
                      style={{ margin: "8px 0", borderColor: "#e5d4ff" }}
                    />
                    <Text style={{ color: "#333", fontSize: 15 }}>
                      {info.value}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* 📊 Chart + Table Layout */}
            <Row gutter={[24, 24]} align="top">
              {/* Left – Chart */}
              <Col xs={24} md={12}>
                <Card
                  bordered={false}
                  style={{
                    height: 380,
                    borderRadius: 14,
                    background: "linear-gradient(145deg,#ffffff,#faf5ff)",
                    boxShadow: "0 3px 12px rgba(123,47,247,0.1)",
                    padding: 16,
                  }}
                  title={
                    <div
                      style={{
                        textAlign: "center",
                        color: "#722ed1",
                        fontWeight: 600,
                      }}
                    >
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
                              key={i}
                              fill={COLORS[i % COLORS.length]}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <ChartTooltip
                          contentStyle={{
                            borderRadius: 8,
                            borderColor: "#722ed1",
                            background: "#faf5ff",
                          }}
                        />
                      </PieChart>
                    ) : (
                      <BarChart data={selectedCustomer.details || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="Lottery_Type" tick={{ fill: "#555" }} />
                        <YAxis tick={{ fill: "#555" }} />
                        <ChartTooltip
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
                          barSize={40}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </Card>
              </Col>

              {/* Right – Table */}
              <Col xs={24} md={12}>
                <Card
                  bordered={false}
                  style={{
                    height: 380,
                    borderRadius: 14,
                    background: "linear-gradient(145deg,#ffffff,#faf5ff)",
                    boxShadow: "0 3px 12px rgba(0,0,0,0.05)",
                    overflowY: "auto",
                  }}
                  title={
                    <div
                      style={{
                        textAlign: "center",
                        color: "#722ed1",
                        fontWeight: 600,
                      }}
                    >
                      Lottery Breakdown
                    </div>
                  }
                >
                  <Table
                    columns={[
                      { title: "🎟️ Lottery Type", dataIndex: "Lottery_Type" },
                      { title: "Count", dataIndex: "Count", align: "center" },
                    ]}
                    dataSource={selectedCustomer.details}
                    pagination={false}
                    size="small"
                    bordered
                    rowKey={(r) => r.Lottery_Type}
                    scroll={{ y: 220 }}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Modal>
    </div>
  );
}

export default ResultsView;
