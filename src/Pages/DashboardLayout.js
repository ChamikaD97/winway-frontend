import React from "react";
import { Layout, Menu, Button, Typography } from "antd";
import {
  CloudUploadOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const DashboardLayout = ({ activeTab, onTabChange, children, onLogout }) => {
  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg,#f9f6ff,#fff4f9)",
      }}
    >
      <Sider
        width={240}
        theme="light"
        style={{
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(12px)",
          borderRight: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "4px 0 25px rgba(123,47,247,0.15)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "28px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.3)",
            background:
              "linear-gradient(135deg,#7b2ff7 0%,#f107a3 50%,#ffd740 100%)",
            color: "#fff",
            borderRadius: "0 0 20px 20px",
            boxShadow: "0 4px 20px rgba(241,7,163,0.25)",
          }}
        >
          <Title
            level={4}
            style={{
              color: "#fff",
              marginBottom: 4,
              textShadow: "0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            WinWay
          </Title>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Smart Insights</div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={(e) => onTabChange(e.key)}
          style={{
            marginTop: 20,
            background: "transparent",
            fontWeight: 500,
          }}
          items={[
            { key: "1", icon: <CloudUploadOutlined />, label: "Upload & Generate" },
            { key: "2", icon: <TrophyOutlined />, label: "Results & Rankings" },
            { key: "3", icon: <BarChartOutlined />, label: "Reports" },
            { key: "4", icon: <SettingOutlined />, label: "Settings" },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            height: 70,
            padding: "0 30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background:
              "linear-gradient(135deg,#7b2ff7 0%,#f107a3 50%,#ffd740 100%)",
            boxShadow: "0 4px 20px rgba(123,47,247,0.25)",
          }}
        >
          <Title
            level={4}
            style={{
              color: "#fff",
              margin: 0,
              textShadow: "0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            {activeTab === "1" && "Upload & Generate"}
            {activeTab === "2" && "Results & Rankings"}
            {activeTab === "3" && "Reports"}
            {activeTab === "4" && "Settings"}
          </Title>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button
              type="text"
              icon={<UserOutlined />}
              style={{
                color: "#fff",
                background: "rgba(255,255,255,0.2)",
                borderRadius: 8,
              }}
            >
              Profile
            </Button>
            <Button
              icon={<LogoutOutlined />}
              onClick={onLogout}
              style={{
                border: "none",
                color: "#fff",
                background: "rgba(0,0,0,0.2)",
                borderRadius: 8,
              }}
            >
              Logout
            </Button>
          </div>
        </Header>

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
