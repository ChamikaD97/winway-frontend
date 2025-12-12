import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Typography } from "antd";
import {
  CloudUploadOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  TrophyOutlined,
  HeartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import logo from "../assets/logo.png"; // ✅ make sure path is correct

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const DashboardLayout = ({ activeTab, onTabChange, children, onLogout }) => {
  const [userName, setUserName] = useState("User");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) setUserName(storedName);
  }, []);

  const loyaltyMenu = [
    { key: "5-1", label: "Initial Process" },
    { key: "5-3", label: "Monthly Upgrade Process" },
    { key: "5-2", label: "Loyalty Customers" },
    { key: "5-4", label: "Loyalty Histoty" },
    { key: "5-5", label: "Send Emails" },
    { key: "5-6", label: "Send SMS" },

    { key: "5-7", label: "Summary " },
  ];

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg,#f9f6ff,#fff4f9)",
      }}
    >
      {/* ========================== SIDEBAR ========================== */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={280}
        theme="light"
        style={{
          background: "#001529", // same color as header
          transition: "all 0.3s ease",
          boxShadow: "4px 0 25px rgba(0,0,0,0.15)",
        }}
      >
        {/* ---------- LOGO AREA ---------- */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: collapsed ? "16px 0" : "26px 0",
            borderBottom: "1px solid rgba(255,255,255,0.15)",
            transition: "all 0.3s ease",
          }}
        >
          <img
            src={logo}
            alt="WinWay"
            style={{
              width: collapsed ? "50px" : "100px",
              height: collapsed ? "50px" : "100px",
              transition: "all 0.3s ease",
            }}
          />
          {!collapsed && (
            <>
              <Title
                level={4}
                style={{
                  color: "#fff",
                  marginBottom: 0,
                  textShadow: "0 2px 8px rgba(0,0,0,0.25)",
                }}
              >
                WinWay
              </Title>
              <Text style={{ color: "#ccc", fontSize: 12 }}>
                Smart Insights
              </Text>
            </>
          )}
        </div>

        {/* ---------- MAIN NAV MENU ---------- */}
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={(e) => onTabChange(e.key)}
          style={{
            marginTop: 20,
            background: "transparent",
            fontWeight: 500,
            color: "#fff",
          }}
          items={[
            {
              key: "0",
              icon: <CloudUploadOutlined />,
              label: "Dashboard",
            },
            {
              key: "1",
              icon: <CloudUploadOutlined />,
              label: "Weekly Purchase ",
            },
            {
              key: "2",
              icon: <TrophyOutlined />,
              label: "Results & Rankings",
            },

            {
              key: "5",
              icon: <HeartOutlined />,
              label: "Loyalty",
              children: loyaltyMenu,
            },
            {
              key: "4",
              icon: <SettingOutlined />,
              label: "Settings",
            },
          ]}
          theme="dark"
        />
      </Sider>

      {/* ========================== MAIN AREA ========================== */}
      <Layout>
        {/* ---------- HEADER ---------- */}
        <Header
          style={{
            height: 70,
            padding: "0 30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#001529", // ✅ same as sider
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Button
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                border: "none",
                color: "#fff",
                background: "rgba(255,255,255,0.15)",
                borderRadius: 8,
              }}
            />
            <Title
              level={4}
              style={{
                color: "#fff",
                margin: 0,
                textShadow: "0 2px 8px rgba(0,0,0,0.25)",
              }}
            >
              {activeTab === "1" && "Weekly Purchase "}
              {activeTab === "2" && "Results & Rankings"}

              {activeTab === "5" && "Loyalty"}
              {activeTab === "5-1" && "Entry Process"}
              {activeTab === "5-3" && "Monthly Upgrade Process"}
              {activeTab === "5-2" && "Loyalty Customers"}
              {activeTab === "4" && "Settings"}
            </Title>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: "#fff",
              fontWeight: 500,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: 600 }}>
              Hi, {userName.split(" ")[0]}
            </Text>

            <Button
              icon={<LogoutOutlined />}
              onClick={onLogout}
              style={{
                border: "none",
                color: "#fff",
                background: "rgba(255,255,255,0.15)",
                borderRadius: 8,
              }}
            />
          </div>
        </Header>

        {/* ---------- CONTENT ---------- */}
        <Content
          style={{
            padding: "40px",
            overflowY: "auto",
            minHeight: "calc(100vh - 70px)",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              background: "rgba(255,255,255,0.9)",
              borderRadius: 20,
              padding: 35,
              boxShadow:
                "0 8px 30px rgba(123,47,247,0.15), 0 2px 10px rgba(241,7,163,0.08)",
              backdropFilter: "blur(6px)",
              transition: "all 0.3s ease",
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
