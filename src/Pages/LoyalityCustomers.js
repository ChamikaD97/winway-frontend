import React, { useEffect, useState, useMemo } from "react";
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
} from "@ant-design/icons";
import axios from "axios";
import CustomerModel from "./CustomerModel";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
const { Search } = Input;
const API_BASE = "http://localhost:8001";
const { Title, Text } = Typography;

function LoyalityCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const handleRowClick = (record) => {
    setSelectedCustomer(record);
    setIsModalVisible(true);
  };
  const fetchCustomersNew = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/initialCustomer/combined`);

      console.log(res.data);
    } catch (error) {
      console.error("❌ Error fetching customers:", error);
      message.error("Failed to fetch customer data.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomers = async () => {
    try {
      // 🔒 Step 1: Confirm user action
      const confirmed = window.confirm(
        "⚠️ Are you sure you want to delete ALL loyalty data? This cannot be undone."
      );
      if (!confirmed) return;

      setLoading(true);

      // 🔄 Step 2: Call backend
      const res = await axios.delete(`${API_BASE}/api/initialCustomer/all`);

      // ✅ Step 3: Handle success
      if (res.data.success) {
        message.success("🧹 All loyalty data deleted successfully!");

        // Clear local state
        setCustomers([]);
        setFiltered([]);
        setSummary({});
      } else {
        message.warning(res.data.message || "No data was deleted");
      }
    } catch (err) {
      console.error("❌ Error deleting loyalty data:", err);
      message.error("Server error while deleting loyalty data!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchText) setFiltered(customers);
    else {
      const text = searchText.toLowerCase();
      const filteredList = customers.filter(
        (c) =>
          (c.FirstName && c.FirstName.toLowerCase().includes(text)) ||
          (c.LastName && c.LastName.toLowerCase().includes(text)) ||
          (c.MobileNumber && c.MobileNumber.toLowerCase().includes(text))
      );
      setFiltered(filteredList);
    }
  }, [searchText, customers]);

  const numberRender = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toLocaleString() : v ?? "-";
  };

  const columns = [
    {
      title: "Customer",
      dataIndex: "FirstName", // still needed for sorting and indexing
      sorter: (a, b) =>
        (a.FirstName + " " + a.LastName).localeCompare(
          b.FirstName + " " + b.LastName
        ),
      render: (_, record) => `${record.FirstName} ${record.LastName}`,
    },
    {
      title: "Mobile",
      dataIndex: "MobileNumber",
      sorter: (a, b) => a.MobileNumber.localeCompare(b.MobileNumber),
    },
    {
      title: "Last Month Tickets",
      dataIndex: "lastMonthTickets",
      align: "center",
      sorter: (a, b) => Number(a.lastMonthTickets) - Number(b.lastMonthTickets),
      render: numberRender,
    },
    {
      title: "Total Tickets",
      dataIndex: "Ticket_Count",
      align: "center",
      sorter: (a, b) => Number(a.Ticket_Count) - Number(b.Ticket_Count),
      render: numberRender,
    },

    {
      title: "Tier",
      dataIndex: "Loyalty_Tier",
      align: "center",
    },

    {
      title: "Old Tier",
      dataIndex: "oldTier",
      align: "center",
      filters: [
        { text: "Platinum", value: "Platinum" },
        { text: "Gold", value: "Gold" },
        { text: "Silver", value: "Silver" },
        { text: "Blue", value: "Blue" },
        { text: "None", value: "None" },
      ],
      onFilter: (value, record) => record.Tier === value,
      sorter: (a, b) => a.Loyalty_Tier.localeCompare(b.Loyalty_Tier),
      render: (tier) => {
        const colorMap = {
          Platinum: "geekblue",
          Gold: "gold",
          Silver: "gray",
          Blue: "blue",
          None: "default",
        };
        return (
          <Tag color={colorMap[tier] || "default"} style={{ fontWeight: 600 }}>
            {tier || "None"}
          </Tag>
        );
      },
    },
  ];
  const handleDownloadData = () => {
    if (!filtered || filtered.length === 0) {
      message.warning("No data available to download!");
      return;
    }

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Loyalty Summary");

    // Generate Excel file buffer and save
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `WinWay_Loyalty_Report_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    saveAs(blob, fileName);
    message.success("✅ Loyalty report downloaded!");
  };

  return (
    <Spin spinning={loading} tip="Loading customers...">
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: 20, color: "black" }}
      >
        <Title level={3} style={{ textAlign: "left" }}>
          Loyalty Customers
        </Title>
      </Row>

      <Divider />

      {/* 🏆 Tier Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Platinum"
              value={summary.Platinum || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#7b2ff7", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Gold"
              value={summary.Gold || 0}
              prefix={<GiftOutlined />}
              valueStyle={{ color: "#facc15", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Silver"
              value={summary.Silver || 0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: "#a1a1aa", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Blue"
              value={summary.Blue || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#2563eb", fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 🔍 Search bar */}
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

      {/* 📋 Customers table */}
      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="MobileNumber"
        bordered
        size="middle"
        scroll={{ x: true, y: 420 }}
        sticky
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
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
          switch (record.Loyalty_Tier) {
            case "Platinum":
              return "tier-row-platinum";
            case "Gold":
              return "tier-row-gold";
            case "Silver":
              return "tier-row-silver";
            case "Blue":
              return "tier-row-blue";
            default:
              return "";
          }
        }}
        style={{ borderRadius: 8, overflow: "hidden" }}
      />

      <style>
        {`
.ant-table-tbody > tr.tier-row-platinum > td {
  background: linear-gradient(90deg, #f8f9fa, #e8f0ff) !important;
  font-weight: 400;
  font-size: 14px !important;
  border-bottom: 2px solid #c5cae9 !important; /* ✅ Added */
}

.ant-table-tbody > tr.tier-row-gold > td {
  background: linear-gradient(90deg, #fff8e1, #ffecb3) !important;
  font-weight: 400;
  font-size: 14px !important;
  border-bottom: 2px solid #ffcc80 !important; /* ✅ Added */
}

.ant-table-tbody > tr.tier-row-silver > td {
  background: linear-gradient(90deg, #f5f5f5, #e0e0e0) !important;
  font-weight: 400;
  font-size: 14px !important;
  border-bottom: 2px solid #bdbdbd !important; /* ✅ Added */
}

.ant-table-tbody > tr.tier-row-blue > td {
  background: linear-gradient(90deg, #e3f2fd, #bbdefb) !important;
  font-weight: 400;
  font-size: 14px !important;
  border-bottom: 2px solid #90caf9 !important; /* ✅ Added */
}


`}
      </style>
      <div style={{ textAlign: "center", marginTop: 25 }}>
        <Button icon={<ReloadOutlined />} onClick={fetchCustomersNew}>
          Refresh
        </Button>
        <Button
          icon={<DeleteFilled />}
          type="primary"
          danger
          style={{
            marginLeft: 10,
            border: "none",
            fontWeight: 500,
          }}
          onClick={deleteCustomers}
        >
          Delete Customers
        </Button>
        <Button
          icon={<DownloadOutlined />}
          type="primary"
          style={{
            marginLeft: 10,
            border: "none",
            fontWeight: 500,
          }}
          onClick={handleDownloadData}
        >
          Download Data
        </Button>
      </div>

      {/* 🧍‍♂️ Customer detail modal */}
      <CustomerModel
        open={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        customer={selectedCustomer}
      />
    </Spin>
  );
}

export default LoyalityCustomers;
