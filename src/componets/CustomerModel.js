// CustomerModel.jsx — FINAL VERSION WITH LEFT TABLE + RIGHT INFO PANELS
import React from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Statistic,
  Descriptions,
  Divider,
  Avatar,
  Tag,
  Button,
  Space,
} from "antd";
import {
  PhoneOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

function CustomerModel({ open, onClose, customer, settings }) {
  if (!customer) return null;

  const {
    Current_Customer_Details,
    Iniotial_Ticket_Breakdown_Details,
    Monthly_Update_Details,
  } = customer;

  const tierColors = {
    Platinum: "#9B5DE5",
    Gold: "#E6B800",
    Silver: "#C0C0C0",
    Blue: "#2563EB",
    Warning: "#FFA500",
    Rejected: "#E63946",
  };

  const monthlyThresholds = {
    Platinum: Number(settings.LOYALTY_MONTHLY_PLATINUM_TICKETS),
    Gold: Number(settings.LOYALTY_MONTHLY_GOLD_TICKETS),
    Silver: Number(settings.LOYALTY_MONTHLY_SILVER_TICKETS),
    Blue: Number(settings.LOYALTY_DOWNGRADE_THRESHOLD),
  };

  const downgradeMonths = Number(settings.DOWNGRADE_MONTHS);

  const currentTier = Current_Customer_Details?.Current_Loyalty_Tier;
  const currentTierColor = tierColors[currentTier] || "#7b2ff7";

  const monthlySorted = [...Monthly_Update_Details].sort((a, b) => {
    return new Date(a.Last_Update) - new Date(b.Last_Update);
  });

  const latest = monthlySorted[monthlySorted.length - 1] || null;
  const currentMonthTickets = latest?.Monthly_Ticket_Count || 0;

  const monthlyRequirement = monthlyThresholds[currentTier];
  const remainingForSafety = Math.max(
    monthlyRequirement - currentMonthTickets,
    0
  );

  let safetyStatus = "";
  let safetyColor = "";
  let safetyMessage = "";

  if (currentMonthTickets >= monthlyRequirement) {
    safetyStatus = "Safe This Month";
    safetyColor = "#2e7d32";
    safetyMessage = `You have met the monthly requirement (${monthlyRequirement}). Your ${currentTier} tier is safe.`;
  } else {
    safetyStatus = "At Risk";
    safetyColor = "#c62828";
    safetyMessage = `You need ${remainingForSafety} more tickets this month to maintain your ${currentTier} tier.`;
  }

  let consecutiveFails = 0;
  monthlySorted.forEach((month) => {
      if (currentTier === "Blue") {
      consecutiveFails = 1;
    }
    if (currentTier === "Warning") {
      consecutiveFails = 2;
    }
    if (currentTier === "Rejected") {
      consecutiveFails = 3;
    }

  });

  const remainingBeforeDowngrade = Math.max(
    downgradeMonths - consecutiveFails,
    0
  );

  let downgradeMessage = "";
  let downgradeColor = remainingBeforeDowngrade <= 1 ? "#b71c1c" : "#ff8f00";

  if (remainingBeforeDowngrade === 0) {
    downgradeMessage = `⚠ Downgrade will happen immediately based on the rules.`;
  } else {
    downgradeMessage = `You have ${remainingBeforeDowngrade} month(s) left before a downgrade if requirements continue to be missed.`;
  }

  const initialBreakdown = Object.entries(Iniotial_Ticket_Breakdown_Details)
    .filter(
      ([key]) =>
        ![
          "MobileNumber",
          "Last_Update",
          "Iniotial_Tier",
          "Iniotial_Ticket_Count",
        ].includes(key)
    )
    .map(([key, val], i) => ({
      key: i,
      lottery: key.replace(/_/g, " "),
      count: val,
    }));

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={1200}
      footer={[
        <Space key="footer" style={{ width: "100%", justifyContent: "end" }}>
          <Button onClick={onClose}>Close</Button>
        </Space>,
      ]}
      title={
        <div
          style={{
            background: "linear-gradient(90deg,#001529,#00509e)",
            color: "white",
            padding: "18px 0",
            margin: "-24px -24px 16px -24px",
            textAlign: "center",
            fontWeight: 700,
            fontSize: 20,
            borderBottom: "3px solid #7b2ff7",
          }}
        >
          {Current_Customer_Details?.FirstName}{" "}
          {Current_Customer_Details?.LastName} — Loyalty Profile
        </div>
      }
    >
      {/* HEADER */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8} style={{ textAlign: "center" }}>
          <Avatar
            size={110}
            icon={<UserOutlined />}
            style={{
              background: currentTierColor,
              fontSize: 38,
              fontWeight: 700,
              color: "white",
            }}
          />

          <div
            style={{
              marginTop: 10,
              fontSize: 20,
              fontWeight: 700,
              color: currentTierColor,
            }}
          >
            {currentTier}
          </div>

          <div style={{ color: "#003f7f", fontSize: 12 }}>Current Tier</div>
        </Col>

        <Col xs={24} sm={16}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              background: "linear-gradient(145deg,#ffffff,#f5f7ff)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            }}
          >
            <Descriptions column={2}>
              <Descriptions.Item label="Mobile">
                <PhoneOutlined /> {Current_Customer_Details?.MobileNumber}
              </Descriptions.Item>

              <Descriptions.Item label="Email">
                {Current_Customer_Details?.Email}
              </Descriptions.Item>

              <Descriptions.Item label="Gender">
                {Current_Customer_Details?.Gender}
              </Descriptions.Item>

              <Descriptions.Item label="Registered Date">
                {dayjs(Current_Customer_Details?.RegisteredDate).format(
                  "MMM D, YYYY"
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* ---------------------------------------------------------
            MAIN LAYOUT: LEFT TABLE + RIGHT PANELS
         --------------------------------------------------------- */}
      <Row gutter={[16, 16]}>
        {/* LEFT SIDE — FULL TABLE */}
        <Col xs={24} md={14}>
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              background: "white",
              padding: 0,
              height: "100%",
              boxShadow: "0 4px 14px rgba(0,0,0,0.07)",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                background: "linear-gradient(90deg,#001529,#003b80)",
                padding: "14px 20px",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                color: "white",
                fontWeight: 700,
                fontSize: 17,
                letterSpacing: 0.4,
              }}
            >
              Initial Ticket Breakdown (At Entry)
            </div>

            {/* TOP SUMMARY */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 22px",
                borderBottom: "1px solid #e0e6ff",
                background: "#f9faff",
              }}
            >
              <div>
                <span style={{ fontSize: 13, color: "#475569" }}>
                  Initial Tier
                </span>
                <br />
                <Tag
                  color="#7b2ff7"
                  style={{
                    borderRadius: 6,
                    fontWeight: 700,
                    padding: "4px 12px",
                    fontSize: 14,
                    marginTop: 3,
                  }}
                >
                  {Iniotial_Ticket_Breakdown_Details?.Iniotial_Tier}
                </Tag>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 13, color: "#475569" }}>
                  Initial Ticket Count
                </span>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 20,
                    color: "#ef6c00",
                    marginTop: 3,
                  }}
                >
                  {Iniotial_Ticket_Breakdown_Details?.Iniotial_Ticket_Count?.toLocaleString()}
                </div>
              </div>
            </div>

            {/* TABLE */}
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                fontSize: 14,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f5f7ff",
                    textAlign: "left",
                    color: "#1a237e",
                  }}
                >
                  <th style={{ padding: "12px 16px", fontWeight: 700 }}>
                    Lottery Type
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontWeight: 700,
                      textAlign: "right",
                    }}
                  >
                    Tickets
                  </th>
                </tr>
              </thead>

              <tbody>
                {initialBreakdown.map((row, i) => (
                  <tr
                    key={row.key}
                    style={{
                      background: i % 2 === 0 ? "#ffffff" : "#f9f9ff",
                      transition: "0.2s",
                    }}
                  >
                    <td style={{ padding: "12px 16px", color: "#0d1b2a" }}>
                      {row.lottery}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontWeight: 700,
                        color: "#7b2ff7",
                      }}
                    >
                      {Number(row.count).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </Col>

        {/* RIGHT SIDE — SAFETY PANEL + DOWNGRADE PANEL */}
        <Col xs={24} md={10}>
          {/* Monthly Safety */}
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              padding: 25,
              background: "linear-gradient(135deg, #ffffff, #f1f8ff)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#0d47a1",
                marginBottom: 12,
              }}
            >
              Monthly Safety Status
            </h3>

            <Statistic
              title="Status"
              value={safetyStatus}
              valueStyle={{
                color: safetyColor,
                fontWeight: 700,
                fontSize: 22,
              }}
              prefix={
                <WarningOutlined style={{ color: safetyColor, fontSize: 20 }} />
              }
            />

            <Divider />

            <p style={{ fontSize: 14, fontWeight: 500, color: "#333" }}>
              {safetyMessage}
            </p>

            <Tag
              color="#1976d2"
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                fontWeight: 600,
                display: "block",
                marginTop: 15,
              }}
            >
              Required This Month: {monthlyRequirement} tickets
            </Tag>

            <Tag
              color="#7b2ff7"
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                fontWeight: 600,
                display: "block",
                marginTop: 10,
              }}
            >
              Current Month: {currentMonthTickets} tickets
            </Tag>
          </Card>

          {/* Downgrade Panel */}
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              padding: 25,
              background: "linear-gradient(135deg, #ffffff, #fff4f4)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: downgradeColor,
                marginBottom: 12,
              }}
            >
              Downgrade Risk
            </h3>

            <Statistic
              title="Consecutive Failures"
              value={consecutiveFails}
              valueStyle={{
                color: downgradeColor,
                fontWeight: 700,
                fontSize: 22,
              }}
            />

            <Divider />

            <p style={{ fontSize: 14, fontWeight: 500, color: "#333" }}>
              {downgradeMessage}
            </p>

            <Tag
              color={downgradeColor}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                fontWeight: 600,
                display: "block",
                marginTop: 15,
              }}
            >
              Allowed Failures: {downgradeMonths} months
            </Tag>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
}

export default CustomerModel;
