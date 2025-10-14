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

  // ✅ useRef for live pause/stop values
  const pausedRef = useRef(false);
  const stoppedRef = useRef(false);

  const pageSizeCustomers = 5;
  const COLORS = ["#1890ff", "#52c41a", "#faad14", "#722ed1", "#eb2f96"];

  if (!results) return null;

  // ✅ Ranked Data with details
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

  // 📧 Single Email Sender
  const sendEmail = async (customer) => {
    if (!customer?.email) {
      message.warning("⚠️ No email address for this customer.");
      return false;
    }

    try {
      const tblData = (customer.details || []).map((item) => ({
        name: item.Lottery_Type,
        count: item.Count,
        winnings: item.Total_Winnings,
      }));

      const formData = new FormData();
      formData.append("to", "chamikadeshan97@gmail.com"); // ✅ fixed
      formData.append("name", customer.name);
      formData.append("tickets", customer.tickets);
      formData.append("winnings", customer.winnings);
      formData.append("subject", `Congratulations   ${customer.name}`);
      formData.append("tblData", JSON.stringify(tblData));
      formData.append("superPrizes", JSON.stringify(lotteryPrizes || {}));

      await axios.post("http://localhost:8001/email/sendToCustomer", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return true;
    } catch (error) {
      console.error("❌ Email send error:", error);
      return false;
    }
  };

  // 📤 Send All Emails (with working pause/stop)
  const handleSendAllEmails = async () => {
    setSendingMailAll(true);
    setLogModalVisible(true);
    setLogList([]);
    setProgress(0);
    pausedRef.current = false;
    stoppedRef.current = false;

    const total = rankedData.length;
    let sentCount = 0;

    for (const customer of rankedData) {
      if (stoppedRef.current) break;

      // 💤 Wait if paused
      while (pausedRef.current && !stoppedRef.current) {
        await new Promise((r) => setTimeout(r, 500));
      }

      setLogList((prev) => [
        ...prev,
        { name: customer.name, email: customer.email, status: "sending" },
      ]);

      const success = await sendEmail(customer);
      sentCount++;
      setProgress(Math.round((sentCount / total) * 100));

      setLogList((prev) =>
        prev.map((l) =>
          l.email === customer.email
            ? { ...l, status: success ? "success" : "failed" }
            : l
        )
      );

      await new Promise((r) => setTimeout(r, 600));
    }

    setSendingMailAll(false);
  };

  // ✅ Pause & Stop handlers (update refs too)
  const handlePause = () => {
    pausedRef.current = true;
  };
  const handleResume = () => {
    pausedRef.current = false;
  };
  const handleStop = () => {
    stoppedRef.current = true;
    pausedRef.current = false;
    setLogModalVisible(false);
    message.info("🛑 Email sending stopped.");
  };

  // ♻️ Retry single failed
  const retrySingleEmail = async (email) => {
    const customer = rankedData.find((c) => c.email === email);
    if (!customer) return;
    const success = await sendEmail(customer);
    setLogList((prev) =>
      prev.map((l) =>
        l.email === email ? { ...l, status: success ? "success" : "failed" } : l
      )
    );
  };

  const successCount = logList.filter((l) => l.status === "success").length;
  const failCount = logList.filter((l) => l.status === "failed").length;

  // 📧 Send one customer (modal)
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

  // --- rest of your file stays the same (modals, tables, top 3, etc.)

  return (
    <div style={{ maxWidth: 1250, margin: "40px auto", padding: "0 20px" }}>
      {/* 🏅 Top 3 Winners */}
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
                  background: gradients[idx],
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontSize: 40 }}>{medals[idx]}</div>
                <Text strong style={{ fontSize: 18 }}>
                  {w.name}
                </Text>
                <Divider style={{ margin: "8px 0" }} />
                <Text type="secondary" style={{ fontSize: 15 }}>
                  Rs. {w.winnings.toLocaleString()}
                </Text>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* 👥 Customer Table */}
      <Card
        title="👥 Ranked Customer List"
        extra={
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
                const colors = ["#faad14", "#91d5ff", "#d3adf7"];
                return (
                  <Text strong style={{ color: colors[rank - 1] || "#555" }}>
                    {emojis[rank - 1] || `#${rank}`}
                  </Text>
                );
              },
            },
            { title: "Customer Name", dataIndex: "name" },
            { title: "Email", dataIndex: "email" },
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

      {/* 📨 Send All Progress Modal – WinWay Premium Design */}
      <Modal
        open={logModalVisible}
        onCancel={() => setLogModalVisible(false)}
        width={650}
        centered
        bodyStyle={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderRadius: 16,
          padding: "24px 32px",
        }}
        style={{
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 10px 35px rgba(123,47,247,0.3)",
        }}
        footer={[
          <Space
            key="controls"
            style={{ justifyContent: "center", width: "100%" }}
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
              }}
            >
              Stop & Close
            </Button>
            {failCount > 0 && (
              <Button
                key="retry"
                icon={<ReloadOutlined />}
                onClick={() =>
                  logList
                    .filter((l) => l.status === "failed")
                    .forEach((l) => retrySingleEmail(l.email))
                }
                size="large"
                style={{
                  background: "linear-gradient(90deg,#ffe58f,#fadb14)",
                  color: "#000",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                Retry All Failed ({failCount})
              </Button>
            )}
          </Space>,
        ]}
        title={
          <div
            style={{
              background: "linear-gradient(90deg,#7b2ff7,#f107a3)",
              padding: "22px 0",
              margin: "-24px -32px 20px -32px",
              textAlign: "center",
              color: "white",
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: 0.4,
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            }}
          >
            {progress < 100
              ? "📨 Sending Emails..."
              : failCount > 0
              ? "⚠️ Some Emails Failed"
              : "✅ All Emails Sent Successfully"}
          </div>
        }
      >
        {/* 🔵 Gradient progress bar */}
        <div style={{ marginBottom: 24 }}>
          <Progress
            percent={progress}
            strokeWidth={10}
            strokeColor={{ "0%": "#7b2ff7", "100%": "#f107a3" }}
            trailColor="#f0f0f0"
            status={
              progress < 100
                ? "active"
                : failCount > 0
                ? "exception"
                : "success"
            }
            style={{
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
            }}
          />
        </div>

        {/* 🧾 Email Log List */}
        <List
          size="small"
          bordered
          dataSource={logList}
          renderItem={(item) => (
            <List.Item
              className={
                item.status === "failed"
                  ? "failed-blink"
                  : item.status === "success"
                  ? "success-flash"
                  : ""
              }
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                margin: "6px 0",
                transition: "background 0.3s ease",
                background:
                  item.status === "sending"
                    ? "rgba(123,47,247,0.05)"
                    : "rgba(255,255,255,0.9)",
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
                <Text strong style={{ color: "#111" }}>
                  {item.name}
                </Text>
                <Text type="secondary">{item.email}</Text>
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

        {/* ✨ Summary Row (Gradient Badges) */}
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
          <div
            style={{
              background: "linear-gradient(90deg,#7b2ff7,#f107a3)",
              padding: "6px 16px",
              borderRadius: 20,
              color: "#fff",
              fontWeight: 600,
              boxShadow: "0 2px 6px rgba(123,47,247,0.4)",
            }}
          >
            📊 Total {logList.length}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ResultsView;
