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
} from "antd";
import {
  DownloadOutlined,
  CrownOutlined,
  ThunderboltOutlined,
  UserOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

function ResultsView({ results }) {
  const [customerPage, setCustomerPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const pageSizeCustomers = 5;
  const customerSectionRef = useRef(null);

  // 🧭 Smooth scroll
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!results) return null;

  // ✅ Stats
  const totalCustomers =
    results.summary?.total_customers || results?.emails?.length;
  const totalTickets = results.summary?.total_tickets || 0;
  const totalWinnings = results.summary?.total_winnings || 0;

  // ✅ Prepare data
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

  const pagedCustomers = rankedData.slice(
    (customerPage - 1) * pageSizeCustomers,
    customerPage * pageSizeCustomers
  );

  // ✅ Table columns
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
    {
      title: "Customer Name",
      dataIndex: "name",
      key: "name",
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
      title: "Tickets",
      dataIndex: "tickets",
      key: "tickets",
      align: "center",
    },
    {
      title: "Winnings (Rs.)",
      dataIndex: "winnings",
      key: "winnings",
      align: "center",
      sorter: (a, b) => a.winnings - b.winnings,
      render: (val) => (
        <Text strong style={{ color: val > 0 ? "#389e0d" : "#999" }}>
          Rs. {val.toLocaleString()}
        </Text>
      ),
    },
  ];

  // ✅ When row is clicked → open modal
  const handleRowClick = (record) => {
    const customerDetails = results.tblData.filter(
      (t) => t.MobileNumber === record.mobile
    );
    setSelectedCustomer({
      ...record,
      details: customerDetails,
    });
    setIsModalVisible(true);
  };

  // ✅ Modal close
  const handleModalClose = () => {
    setSelectedCustomer(null);
    setIsModalVisible(false);
  };

  // ✅ Subtable columns for tblData
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

  return (
    <div
      style={{
        maxWidth: "1250px",
        margin: "40px auto",
        padding: "0 20px",
      }}
    >
      {/* Summary Cards */}
      <Row gutter={[24, 24]} justify="center" style={{ marginBottom: 40 }}>
        {[
          {
            label: "Customers",
            value: totalCustomers,
            colors: ["#1890ff", "#69c0ff"],
            icon: <UserOutlined />,
          },
          {
            label: "Tickets",
            value: totalTickets,
            colors: ["#52c41a", "#b7eb8f"],
            icon: <ThunderboltOutlined />,
          },
          {
            label: "Total Winnings (Rs.)",
            value: totalWinnings.toLocaleString(),
            colors: ["#faad14", "#ffd666"],
            icon: <CrownOutlined />,
          },
        ].map((stat, idx) => (
          <Col xs={24} sm={12} md={6} key={idx}>
            <Card
              bordered={false}
              hoverable
              style={{
                background: `linear-gradient(135deg, ${stat.colors[0]}, ${stat.colors[1]})`,
                borderRadius: 14,
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
              <Statistic
                title={<Text strong>{stat.label}</Text>}
                value={stat.value}
                valueStyle={{ color: "#000", fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
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
          style={{ background: "#fff", borderRadius: 8, cursor: "pointer" }}
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

      {/* 🪟 Modal for customer details */}
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            <TrophyOutlined style={{ color: "#722ed1", marginRight: 8 }} />
            {selectedCustomer?.name}'s Details
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
        width={700}
        centered
      >
        {selectedCustomer && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Email: </Text>
              {selectedCustomer.email || "N/A"}
              <br />
              <Text strong>Mobile: </Text>
              {selectedCustomer.mobile}
              <br />
              <Text strong>Total Tickets: </Text>
              {selectedCustomer.tickets}
              <br />
              <Text strong>Total Winnings: </Text>
              Rs. {selectedCustomer.winnings.toLocaleString()}
            </div>

            <Divider />

            <Table
              columns={detailColumns}
              dataSource={selectedCustomer.details || []}
              pagination={false}
              size="small"
              bordered
              rowKey={(r) => r.Lottery_Type}
            />
          </>
        )}
      </Modal>
    </div>
  );
}

export default ResultsView;
