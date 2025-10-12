import React, { useState } from "react";
import { Layout, Menu, Typography } from "antd";
import {
  UploadOutlined,
  PieChartOutlined,
  FileTextOutlined,
  SettingOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import logo from "../assets/logo.png";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function DashboardLayout({ children, activeTab, onTabChange }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* 🟣 Sidebar */}
      <Sider
        width={260} // ⬅️ custom width (you can set 260, 280, etc.)
        collapsedWidth={80} // ⬅️ width when collapsed
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background:
            "linear-gradient(180deg, #722ed1 0%, #a67efc 60%, #d4af37 100%)",
          boxShadow: "2px 0 12px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease",
        }}
      >
        {/* Logo / Title */}
        <div
          style={{
            height: 70,
            margin: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: collapsed ? 16 : 20,
            letterSpacing: 1,
            borderBottom: "1px solid rgba(255,255,255,0.25)",
            transition: "all 0.3s ease",
          }}
        >
          <img
            src={logo}
            alt="WinWay Logo"
            style={{
              width: "clamp(90px, 12vw, 150px)",
              height: "auto",
              filter: "drop-shadow(0 0 5px rgba(255,255,255,0.7))",
            }}
          />
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          selectedKeys={[activeTab]}
          mode="inline"
          onClick={(e) => onTabChange(e.key)}
          style={{
            background: "transparent",
            fontWeight: 500,
          }}
          items={[
            {
              key: "1",
              icon: <CrownOutlined />,
              label: "Customers Of The Week",
            },
            {
              key: "2",
              icon: <PieChartOutlined />,
              label: "Results",
            },
            {
              key: "3",
              icon: <FileTextOutlined />,
              label: "Reports",
            },
            {
              key: "4",
              icon: <SettingOutlined />,
              label: "Settings",
            },
          ]}
        />
      </Sider>

      {/* 🟣 Main Layout */}
      <Layout>
        {/* Header */}

        {/* Content */}
        <Content
          style={{
            margin: "24px",
            padding: "24px",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            minHeight: "calc(100vh - 120px)",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;
