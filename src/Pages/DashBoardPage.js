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
  StopOutlined,
} from "@ant-design/icons";

import "./Dashboard.css";

import {
  getCombinedCustomers,
  getSettings,
  getMonthlyUpgrades,
} from "../api/endPoints";

const { Search } = Input;

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [settings, setSettings] = useState({});
  const [summary, setSummary] = useState({});
  const [monthlyUpgrades, setMonthlyUpgrades] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 🎨 Tier Colors
  const tierColors = {
    Platinum: "#9B5DE5",
    Gold: "#E6B800",
    Silver: "#C0C0C0",
    Blue: "#2563EB",
    Warning: "#FFA500",
    Rejected: "#E63946",
  };

  // =========================
  // FETCH DATA
  // =========================
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const [settingsRes, customersRes, upgradesRes] =
        await Promise.all([
          getSettings(),
          getCombinedCustomers(),
          getMonthlyUpgrades(),
        ]);

      // SETTINGS
      const map = Object.fromEntries(
        settingsRes.data.data.map((s) => [s.key, s.value]),
      );
      setSettings(map);

      // CUSTOMERS
      if (customersRes.data?.success) {
        const data = customersRes.data.data || [];

        setCustomers(data);
        setFiltered(data);

        // ✅ FIXED SUMMARY
        const sum = generateSummary(data);
        setSummary(sum);

        message.success("✅ Customers loaded successfully");
      }

      // MONTHLY UPGRADES
      if (upgradesRes.data?.success) {
        setMonthlyUpgrades(upgradesRes.data.data || []);
      }

    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      message.error("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // =========================
  // SUMMARY CALCULATION
  // =========================
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
      const info = c.CustomerInfo || {};

      summary.totalTickets += Number(info.Current_Ticket_Count || 0);
      summary.totalWallet += Number(info.WalletBalance || 0);

      const tier = info.Current_Loyalty_Tier || "Unknown";
      summary.tierCounts[tier] =
        (summary.tierCounts[tier] || 0) + 1;

      const lastPurchase = info.Last_Purchase_Time
        ? new Date(info.Last_Purchase_Time).toDateString()
        : "";

      if (lastPurchase === today) summary.activeToday++;
    });

    return summary;
  };

  // =========================
  // SEGMENTS
  // =========================
  const highSpenders = customers.filter(
    (c) =>
      Number(c.CustomerInfo?.Current_Ticket_Count || 0) > 100,
  );

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

  const inactiveCustomers = customers.filter((c) => {
    if (!c.CustomerInfo?.Last_Purchase_Time) return true;
    const last = new Date(c.CustomerInfo.Last_Purchase_Time);
    return (Date.now() - last.getTime()) / (1000 * 3600 * 24) > 30;
  });

  const missingEmail = customers.filter(
    (c) =>
      !c.CustomerInfo?.Email ||
      c.CustomerInfo.Email.trim() === "",
  );

  const warningTier = customers.filter(
    (c) =>
      c.CustomerInfo?.Current_Loyalty_Tier === "Warning",
  );

  const rejectedTier = customers.filter(
    (c) =>
      c.CustomerInfo?.Current_Loyalty_Tier === "Rejected",
  );

  // =========================
  // SEARCH
  // =========================
  useEffect(() => {
    if (!searchText) setFiltered(customers);
    else {
      const s = searchText.toLowerCase();
      setFiltered(
        customers.filter(
          (c) =>
            c.MobileNumber?.toLowerCase().includes(s) ||
            c.CustomerInfo?.FirstName
              ?.toLowerCase()
              .includes(s) ||
            c.CustomerInfo?.LastName
              ?.toLowerCase()
              .includes(s),
        ),
      );
    }
  }, [searchText, customers]);

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [
    {
      title: "Mobile",
      dataIndex: "MobileNumber",
      render: (v) => <b>{v}</b>,
    },
    {
      title: "Name",
      render: (r) =>
        `${r.CustomerInfo?.FirstName || ""} ${
          r.CustomerInfo?.LastName || ""
        }`,
    },
    {
      title: "Tier",
      render: (r) => {
        const tier = r.CustomerInfo?.Current_Loyalty_Tier;
        return (
          <span
            className="tier-badge"
            style={{ background: tierColors[tier] }}
          >
            {tier}
          </span>
        );
      },
    },
    {
      title: "Tickets",
      render: (r) =>
        Number(
          r.CustomerInfo?.Current_Ticket_Count || 0,
        ).toLocaleString(),
    },
    {
      title: "Wallet",
      render: (r) =>
        Number(
          r.CustomerInfo?.WalletBalance || 0,
        ).toLocaleString(),
    },
  ];

  const upgradeColumns = [
    {
      title: "Mobile",
      dataIndex: "MobileNumber",
    },
    {
      title: "Name",
      render: (r) =>
        `${r.FirstName || ""} ${r.LastName || ""}`,
    },
    {
      title: "Previous Tier",
      dataIndex: "PreviousTier",
    },
    {
      title: "New Tier",
      dataIndex: "NewTier",
      render: (tier) => (
        <span
          className="tier-badge"
          style={{ background: tierColors[tier] }}
        >
          {tier}
        </span>
      ),
    },
  ];

  // =========================
  // UI
  // =========================
  return (
    <div className="dashboard-wrapper">
      <Spin spinning={loading}>
        <h2 className="dash-title">Dashboard Analytics</h2>

        {/* KPI */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Customers"
                value={summary.totalCustomers}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="Active Today"
                value={summary.activeToday}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="Total Tickets"
                value={summary.totalTickets}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="Wallet Total"
                value={summary.totalWallet?.toFixed(2)}
                prefix={<CrownOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* MONTHLY UPGRADES */}
        <Card title="Monthly Loyalty Upgrades">
          <Table
            dataSource={monthlyUpgrades}
            columns={upgradeColumns}
            rowKey="MobileNumber"
            pagination={{ pageSize: 5 }}
          />
        </Card>

        <Divider />

        {/* SEARCH */}
        <Search
          placeholder="Search customers"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
        />

        {/* SEGMENTS */}
        <Card title="High Spenders">
          <Table dataSource={highSpenders} columns={columns} rowKey="MobileNumber" />
        </Card>

        <Card title="Upgrade Candidates">
          <Table dataSource={upgradeCandidates} columns={columns} rowKey="MobileNumber" />
        </Card>

        <Card title="Inactive Customers">
          <Table dataSource={inactiveCustomers} columns={columns} rowKey="MobileNumber" />
        </Card>

        <Card title="Missing Email">
          <Table dataSource={missingEmail} columns={columns} rowKey="MobileNumber" />
        </Card>

        <Card title="Warning Tier">
          <Table dataSource={warningTier} columns={columns} rowKey="MobileNumber" />
        </Card>

        <Card title="Rejected Tier">
          <Table dataSource={rejectedTier} columns={columns} rowKey="MobileNumber" />
        </Card>
      </Spin>
    </div>
  );
}

export default Dashboard;