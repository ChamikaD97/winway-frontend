import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Spin,
  message,
  Modal,
  Tooltip,
  Input,
  Divider,
} from "antd";

import {
  TeamOutlined,
  TrophyOutlined,
  CrownOutlined,
  UserOutlined,
  RiseOutlined,
  WarningOutlined,
  MailOutlined,
  StopOutlined,
} from "@ant-design/icons";

import axios from "axios";
import "./Dashboard.css";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  LineChart,
  Line,
} from "recharts";
import { getCombinedCustomers, getSettings } from "../api/endPoints";

const API_BASE = "http://localhost:8001";
const { Search } = Input;

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [settings, setSettings] = useState({});
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [selectedTier, setSelectedTier] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Tier card colors
  const tierColors = {
    Platinum: "#9B5DE5",
    Gold: "#E6B800",
    Silver: "#C0C0C0",
    Blue: "#2563EB",
    Warning: "#FFA500",
    Rejected: "#E63946",
  };

  const tierColorsFade = {
    Platinum: "rgba(155, 93, 229, 0.15)",
    Gold: "rgba(230, 184, 0, 0.15)",
    Silver: "rgba(192, 192, 192, 0.15)",
    Blue: "rgba(37, 99, 235, 0.15)",
    Warning: "rgba(255, 165, 0, 0.15)",
    Rejected: "rgba(230, 57, 70, 0.15)",
  };

  const tierIcons = {
    Platinum: <TrophyOutlined />,
    Gold: <CrownOutlined />,
    Silver: <RiseOutlined />,
    Blue: <UserOutlined />,
    Warning: <WarningOutlined />,
    Rejected: <StopOutlined />,
  };

  // Fetch customers + settings
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const settingsArray = await getSettings();
      const customers = await getCombinedCustomers();
      const map = Object.fromEntries(
        settingsArray.data.data.map((s) => [s.key, s.value]),
      );

      setSettings(map);
      if (customers.data?.success) {
        const data = customers.data.data || [];

        setCustomers(data);
        setFiltered(data);
        message.success("✅ Entry customers loaded successfully");
      } else {
        message.warning("No customer data found.");
      }
    } catch (error) {
      console.error("❌ Error fetching customers:", error);
      message.error("Failed to fetch entry customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Summary calculations
  const generateSummary = (data) => {
    const summary = {
      totalCustomers: data.length,
      totalTickets: 0,
      activeToday: 0,
      totalWallet: 0,
      tierCounts: {},
    };

    const today = new Date().toDateString();

    data.forEach((c) => {
      const info = c.CustomerInfo;

      summary.totalTickets += Number(info.Current_Ticket_Count || 0);
      summary.totalWallet += Number(info.WalletBalance || 0);

      const tier = info.Current_Loyalty_Tier || "Unknown";
      summary.tierCounts[tier] = (summary.tierCounts[tier] || 0) + 1;

      const lastPurchase = info.Last_Purchase_Time
        ? new Date(info.Last_Purchase_Time).toDateString()
        : "";

      if (lastPurchase === today) summary.activeToday++;
    });

    return summary;
  };

  // --- Derived Segments ---

  // 1️⃣ High Spenders (> 100 tickets)
  const highSpenders = customers.filter(
    (c) => Number(c.CustomerInfo?.Current_Ticket_Count || 0) > 100,
  );

  // 2️⃣ Upgrade candidates (using settings thresholds)
  const upgradeCandidates = customers.filter((c) => {
    const tier = c.CustomerInfo?.Current_Loyalty_Tier;
    const count = Number(c.CustomerInfo?.Current_Ticket_Count || 0);

    let nextTierMin = null;

    if (tier === "Blue") nextTierMin = Number(settings.silver_min);
    if (tier === "Silver") nextTierMin = Number(settings.gold_min);
    if (tier === "Gold") nextTierMin = Number(settings.platinum_min);

    if (!nextTierMin) return false;

    return count >= nextTierMin - 20;
  });

  // 3️⃣ Inactive (30+ days)
  const inactiveCustomers = customers.filter((c) => {
    if (!c.CustomerInfo.Last_Purchase_Time) return true;
    const last = new Date(c.CustomerInfo.Last_Purchase_Time);
    return (Date.now() - last.getTime()) / (1000 * 3600 * 24) > 30;
  });

  // 4️⃣ Missing Email
  const missingEmail = customers.filter(
    (c) => !c.CustomerInfo.Email || c.CustomerInfo.Email.trim() === "",
  );

  // 5️⃣ Warning Tier
  const warningTier = customers.filter(
    (c) => c.CustomerInfo.Current_Loyalty_Tier === "Warning",
  );

  // 6️⃣ Rejected Tier
  const dangerTier = customers.filter(
    (c) => c.CustomerInfo.Current_Loyalty_Tier === "Rejected",
  );

  // Search filtering
  useEffect(() => {
    if (!searchText) setFiltered(customers);
    else {
      const s = searchText.toLowerCase();
      setFiltered(
        customers.filter(
          (c) =>
            c.MobileNumber.toLowerCase().includes(s) ||
            c.CustomerInfo.FirstName?.toLowerCase().includes(s) ||
            c.CustomerInfo.LastName?.toLowerCase().includes(s),
        ),
      );
    }
  }, [searchText, customers]);

  // Table Columns
  const columns = [
    {
      title: "Mobile",
      dataIndex: "MobileNumber",
      key: "mobile",
      width: 150,
      render: (v) => <b>{v}</b>,
    },
    {
      title: "Name",
      key: "name",
      render: (r) => `${r.CustomerInfo.FirstName} ${r.CustomerInfo.LastName}`,
    },
    {
      title: "Tier",
      key: "tier",
      width: 120,
      render: (r) => {
        const tier = r.CustomerInfo.Current_Loyalty_Tier;
        return (
          <span
            className="tier-badge"
            style={{ background: tierColors[tier] || "#333" }}
          >
            {tier}
          </span>
        );
      },
    },
    {
      title: "Tickets",
      key: "tickets",
      width: 100,
      render: (r) =>
        Number(r.CustomerInfo.Current_Ticket_Count || 0).toLocaleString(),
    },
    {
      title: "Wallet",
      key: "wallet",
      width: 100,
      render: (r) =>
        Number(r.CustomerInfo.WalletBalance || 0).toLocaleString("en-US"),
    },
  ];

  return (
    <div className="dashboard-wrapper">
      <Spin spinning={loading}>
        {/* TITLE */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 20 }}
        >
          <h2 className="dash-title">Dashboard Analytics</h2>
        </Row>

        {/* KPI SUMMARY */}
        <Row gutter={16}>
          <Col span={6}>
            <Card className="kpi-card" title="Total Customers">
              <Statistic
                value={summary.totalCustomers}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card className="kpi-card" title="Active Today">
              <Statistic
                value={summary.activeToday}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card className="kpi-card" title="Total Tickets">
              <Statistic
                value={summary.totalTickets}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card className="kpi-card" title="Wallet Total">
              <Statistic
                value={summary.totalWallet?.toFixed(2)}
                prefix={<CrownOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* SEARCH BAR */}
        <Row style={{ marginBottom: 20 }}>
          <Col span={8}>
            <Search
              placeholder="Search by name or mobile"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
        </Row>

        {/* SEGMENT TABLES */}

        {/* 1️⃣ HIGH SPENDERS */}
        <Card className="segment-card" title="High Spenders ( > 100 Tickets )">
          <Table
            dataSource={highSpenders}
            columns={columns}
            rowKey="MobileNumber"
            pagination={{ pageSize: 5 }}
          />
        </Card>

        {/* 2️⃣ UPGRADE CANDIDATES */}
        <Card className="segment-card" title="Upgrade Candidates">
          <Table
            dataSource={upgradeCandidates}
            columns={columns}
            rowKey="MobileNumber"
            pagination={{ pageSize: 5 }}
          />
        </Card>

        {/* 3️⃣ INACTIVE */}
        <Card className="segment-card" title="Inactive Customers (30+ Days)">
          <Table
            dataSource={inactiveCustomers}
            columns={columns}
            rowKey="MobileNumber"
            pagination={{ pageSize: 5 }}
          />
        </Card>

        {/* 4️⃣ MISSING EMAIL */}
        <Card className="segment-card" title="Missing Email Customers">
          <Table
            dataSource={missingEmail}
            columns={columns}
            rowKey="MobileNumber"
            pagination={{ pageSize: 5 }}
          />
        </Card>

        {/* 5️⃣ WARNING */}
        <Card className="segment-card" title="Warning Tier Customers">
          <Table
            dataSource={warningTier}
            columns={columns}
            rowKey="MobileNumber"
            pagination={{ pageSize: 5 }}
          />
        </Card>

        {/* 6️⃣ REJECTED */}
        <Card className="segment-card" title="Rejected Tier Customers">
          <Table
            dataSource={dangerTier}
            columns={columns}
            rowKey="MobileNumber"
            pagination={{ pageSize: 5 }}
          />
        </Card>
      </Spin>

      {/* CUSTOMER MODAL */}
      <Modal
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        title="Customer Details"
      >
        {selectedCustomer && (
          <>
            <p>
              <b>Name:</b> {selectedCustomer.CustomerInfo.FirstName}{" "}
              {selectedCustomer.CustomerInfo.LastName}
            </p>
            <p>
              <b>Mobile:</b> {selectedCustomer.MobileNumber}
            </p>
            <p>
              <b>Tier:</b> {selectedCustomer.CustomerInfo.Current_Loyalty_Tier}
            </p>
            <p>
              <b>Tickets:</b>{" "}
              {selectedCustomer.CustomerInfo.Current_Ticket_Count}
            </p>

            <h4>Ticket Breakdown</h4>
            <pre className="json-block">
              {JSON.stringify(selectedCustomer.InitialBreakdown, null, 2)}
            </pre>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Dashboard;
