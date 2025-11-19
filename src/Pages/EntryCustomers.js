import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Spin,
  Divider,
  message,
  Button,
  Typography,
  Tooltip,
} from "antd";
import {
  TeamOutlined,
  CrownOutlined,
  TrophyOutlined,
  GiftOutlined,
  RiseOutlined,
  ReloadOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteFilled,
  WarningOutlined,
  DragOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axios from "axios";
import CustomerModel from "../componets/CustomerModel";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { Search } = Input;
const { Title, Text } = Typography;

const API_BASE = "http://localhost:8001";

function EntryCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [settings, setSettings] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 💎 Tier Colors & Icons
  const tierColors = {
    Platinum: "#9B5DE5", // Elegant purple tone (modern premium look)
    Gold: "#E6B800", // True metallic gold
    Silver: "#C0C0C0", // Standard silver shade
    Blue: "#2563EB", // Same strong WinWay blue
    Warning: "#FFA500", // Bright amber-orange for visibility
    Rejected: "#E63946", // Clear red for rejected state
  };

  const tierIcons = {
    Platinum: <TrophyOutlined />,
    Gold: <GiftOutlined />,
    Silver: <RiseOutlined />,
    Blue: <RiseOutlined />,
    Warning: <WarningOutlined />,
    Rejected: <DragOutlined />,
  };

  // 🧾 Summary Calculation
  const getCustomerSummary = (data) => {
    if (!Array.isArray(data)) return {};

    const summary = {
      totalCustomers: data.length,
      totalTickets: 0,
      tierCounts: {},
    };

    data.forEach((c) => {
      const tier = c.CustomerInfo?.Current_Loyalty_Tier || "Unknown";
      const tickets = Number(c.CustomerInfo?.Current_Ticket_Count || 0);
      summary.totalTickets += tickets;
      summary.tierCounts[tier] = (summary.tierCounts[tier] || 0) + 1;
    });

    return summary;
  };

  // 🔹 Fetch customers from backend
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/initialCustomer/combined`);
      const res2 = await axios.get("http://localhost:8001/api/settings");
      const map = Object.fromEntries(
        res2.data.data.map((s) => [s.key, s.value])
      );
      setSettings(map);
      if (res.data?.success) {
        const data = res.data.data || [];
        console.log(getCustomerSummary(data));

        setCustomers(data);
        setFiltered(data);
        setSummary(getCustomerSummary(data));
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

  // 🔍 Search Filter
  useEffect(() => {
    if (!searchText) setFiltered(customers);
    else {
      const lower = searchText.toLowerCase();
      setFiltered(
        customers.filter(
          (c) =>
            c.MobileNumber.toLowerCase().includes(lower) ||
            c.CustomerInfo?.FirstName?.toLowerCase().includes(lower) ||
            c.CustomerInfo?.LastName?.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchText, customers]);

  // 🧹 Delete all customers
  const deleteCustomers = async () => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete all entry customer data?"
      );
      if (!confirmDelete) return;
      setLoading(true);
      await axios.delete(
        `${API_BASE}/api/initialCustomer/delete-all?confirm=true`
      );
      setCustomers([]);
      setFiltered([]);
      setSummary({});
      message.success("🗑 All entry customer data deleted successfully!");
    } catch (err) {
      message.error("❌ Failed to delete entry customers.");
    } finally {
      setLoading(false);
    }
  };

  // 📦 Excel Export
  const handleDownloadData = () => {
    if (!filtered.length) return message.warning("No data to export.");

    const exportData = filtered.map((item) => ({
      MobileNumber: item.MobileNumber,
      FirstName: item.CustomerInfo?.FirstName,
      LastName: item.CustomerInfo?.LastName,
      Email: item.CustomerInfo?.Email,
      Gender: item.CustomerInfo?.Gender,
      Country: item.CustomerInfo?.Country,
      Loyalty_Tier: item.CustomerInfo?.Current_Loyalty_Tier,
      Ticket_Count: item.CustomerInfo?.Current_Ticket_Count,
      Last_Update: item.Last_Update,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Entry Customers");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(new Blob([excelBuffer]), "EntryCustomers.xlsx");
  };


  

  
  const handleRowClick = async (record) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE}/api/initialCustomer/${record.MobileNumber}`
      );
      if (res.data?.success) {
        setSelectedCustomer(res.data.data);
        setIsModalVisible(true);
      } else {
        message.warning("No detailed data found for this customer.");
      }
    } catch (error) {
      console.error("❌ Error fetching detailed data:", error);
      message.error("Failed to load customer details.");
    } finally {
      setLoading(false);
    }
  };

  // 📊 Table Columns
  // 📊 Table Columns
  const columns = [
    {
      title: "Mobile Number",
      dataIndex: "MobileNumber",
      key: "MobileNumber",
      width: 160,
      fixed: "left",
      sorter: (a, b) => a.MobileNumber.localeCompare(b.MobileNumber),
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "Name",
      key: "Name",
      sorter: (a, b) => {
        const nameA = `${a.CustomerInfo?.FirstName || ""} ${
          a.CustomerInfo?.LastName || ""
        }`;
        const nameB = `${b.CustomerInfo?.FirstName || ""} ${
          b.CustomerInfo?.LastName || ""
        }`;
        return nameA.localeCompare(nameB);
      },
      render: (record) =>
        `${record.CustomerInfo?.FirstName || ""} ${
          record.CustomerInfo?.LastName || ""
        }`,
    },
    {
      title: "Tier",
      key: "Tier",
      width: 120,
      align: "center",
      sorter: (a, b) =>
        (a.CustomerInfo?.Current_Loyalty_Tier || "").localeCompare(
          b.CustomerInfo?.Current_Loyalty_Tier || ""
        ),
      render: (record) => {
        const tier = record.CustomerInfo?.Current_Loyalty_Tier;
        return (
          <Tag
            color={tierColors[tier] || "default"}
            style={{ fontWeight: 500 }}
          >
            {tier || "-"}
          </Tag>
        );
      },
    },

    {
      title: "Tickets",
      dataIndex: ["CustomerInfo", "Current_Ticket_Count"],
      key: "Current_Ticket_Count",
      width: 100,
      align: "center",
      sorter: (a, b) =>
        (a.CustomerInfo?.Current_Ticket_Count || 0) -
        (b.CustomerInfo?.Current_Ticket_Count || 0),
      render: (value) => (
        <span style={{ fontWeight: 500, color: "#000000ff" }}>
          {Number(value || 0).toLocaleString()}
        </span>
      ),
    },

    {
      title: "Last Update",
      dataIndex: "Last_Update",
      key: "Last_Update",
      align: "center",
      sorter: (a, b) =>
        (a.Last_Update || "").localeCompare(b.Last_Update || ""),
    },
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <>
      <Spin spinning={loading} tip="Loading customers...">
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 20 }}
        >
          <Title level={3}>🎟 Loyalty Customers</Title>
        </Row>

        <Divider />

        {/* Overview Stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: 10 }}>
          <Col xs={24} sm={12} md={12}>
            <Card>
              <Statistic
                title="Total Customers"
                value={summary.totalCustomers || 0}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={12}>
            <Card>
              <Statistic
                title="Total Tickets"
                value={summary.totalTickets || 0}
                prefix={<CrownOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 🏆 Tier Summary */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {["Platinum", "Gold", "Silver", "Blue", "Warning", "Rejected"].map(
            (tier) => (
              <Col xs={24} sm={12} md={4} key={tier}>
                <Tooltip
                  title={`${tier} Members: ${summary?.tierCounts?.[tier] || 0}`}
                  placement="top"
                >
                  <Card
                    hoverable
                    style={{
                      borderRadius: 12,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      textAlign: "center",
                    }}
                  >
                    <Statistic
                      title={tier}
                      value={summary?.tierCounts?.[tier] || 0}
                      prefix={tierIcons[tier] || <UserOutlined />}
                      valueStyle={{
                        color: tierColors[tier] || "#595959",
                        fontWeight: 600,
                      }}
                    />
                  </Card>
                </Tooltip>
              </Col>
            )
          )}
        </Row>

        {/* 🔍 Search */}
        <Row style={{ marginBottom: 20 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search by name or mobile"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
        </Row>

        {/* 📋 Table */}
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="MobileNumber"
          onRow={(record) => ({ onClick: () => handleRowClick(record) })}
          bordered
          size="middle"
          scroll={{ x: true, y: 420 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) =>
              `Showing ${range[0]}-${range[1]} of ${total} customers`,
            onChange: (page, pageSize) =>
              setPagination({ current: page, pageSize }),
          }}
          rowClassName={(record) => {
            const tier = record.CustomerInfo?.Current_Loyalty_Tier;
            if (tier === "Platinum") return "tier-row-platinum";
            if (tier === "Gold") return "tier-row-gold";
            if (tier === "Silver") return "tier-row-silver";
            if (tier === "Blue") return "tier-row-blue";
            return "";
          }}
        />

        {/* ⚙️ Footer Buttons */}
        <div style={{ textAlign: "center", marginTop: 25 }}>
          <Button icon={<ReloadOutlined />} onClick={fetchCustomers}>
            Refresh
          </Button>
          <Button
            icon={<DeleteFilled />}
            danger
            style={{ marginLeft: 10 }}
            onClick={deleteCustomers}
          >
            Delete Customers
          </Button>
          <Button
            icon={<DownloadOutlined />}
            type="primary"
            style={{ marginLeft: 10 }}
            onClick={handleDownloadData}
          >
            Download Data
          </Button>
        </div>
      </Spin>

      <CustomerModel
        open={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        customer={selectedCustomer}
        settings={settings}
      />
    </>
  );
}

export default EntryCustomers;
