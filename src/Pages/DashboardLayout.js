import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Typography, Modal } from "antd";
import {
  CloudUploadOutlined,
  SettingOutlined,
  LogoutOutlined,
  HeartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  FileImageOutlined,
  UserSwitchOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import logo from "../assets/logo.png";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const DashboardLayout = ({ activeTab, onTabChange, children, onLogout }) => {
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("user");
  const [collapsed, setCollapsed] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const storedRole = localStorage.getItem("role");

    if (storedName) setUserName(storedName);
    if (storedRole) setUserRole(storedRole);
  }, []);

  const isAdmin = userRole === "admin";
  const isLoyaltyManager = userRole === "loyalty_manager";
  const isDataAnalyzer = userRole === "data_analyzer";

  const canViewLoyalty = isAdmin || isLoyaltyManager;
  const canViewMessages = isAdmin || isLoyaltyManager;
  const canViewAnalytics = isAdmin || isDataAnalyzer;
  const canViewSettings = isAdmin;
  const canViewSystemUsers = isAdmin;

  const loyaltyMenu = [
    { key: "5-3", label: "Monthly Upgrade Process" },
    { key: "5-2", label: "Loyalty Customers" },
  ];

  const messageMenu = [
    { key: "6-1", label: "SMS" },
    { key: "6-2", label: "Emails" },
  ];

  const reports = [
    { key: "9-1", label: "Registrations" },
    { key: "9-4", label: "Summary" },
  ];

  const menuItems = [
    {
      key: "0",
      icon: <BarChartOutlined />,
      label: "Dashboard",
    },

    canViewAnalytics
      ? {
          key: "1",
          icon: <CloudUploadOutlined />,
          label: "Weekly Summary",
        }
      : null,

    canViewAnalytics
      ? {
          key: "8",
          icon: <FileImageOutlined />,
          label: "Images",
        }
      : null,

    { type: "divider" },

    canViewLoyalty
      ? {
          key: "5",
          icon: <HeartOutlined />,
          label: "Loyalty",
          children: loyaltyMenu,
        }
      : null,

    canViewMessages
      ? {
          key: "6",
          icon: <MessageOutlined />,
          label: "Custom Messages",
          children: messageMenu,
        }
      : null,

    { type: "divider" },

    canViewAnalytics
      ? {
          key: "9",
          icon: <FileImageOutlined />,
          label: "Reports",
          children: reports,
        }
      : null,

    canViewSettings
      ? {
          key: "4",
          icon: <SettingOutlined />,
          label: "Settings",
        }
      : null,

    canViewSystemUsers
      ? {
          key: "11",
          icon: <UserSwitchOutlined />,
          label: "System Users",
        }
      : null,
  ].filter(Boolean);

  const getRoleLabel = () => {
    switch (userRole) {
      case "admin":
        return "Admin";
      case "loyalty_manager":
        return "Loyalty Manager";
      case "data_analyzer":
        return "Data Analyzer";
      default:
        return "User";
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "0":
        return "Dashboard";
      case "1":
        return "Weekly Summary";
      case "2":
        return "Results & Rankings";
      case "4":
        return "Settings";
      case "5":
        return "Loyalty";
      case "5-1":
        return "Entry Process";
      case "5-2":
        return "Loyalty Customers";
      case "5-3":
        return "Monthly Upgrade Process";
      case "6":
        return "Custom Messages";
      case "6-1":
        return "SMS";
      case "6-2":
        return "Emails";
      case "8":
        return "Images";
      case "9":
        return "Reports";
      case "9-1":
        return "Registrations";
      case "9-4":
        return "Summary";
      case "10":
        return "Custom SMS";
      case "11":
        return "System Users";
      default:
        return "WinWay";
    }
  };

  return (
    <>
      <Layout
        style={{
          minHeight: "100vh",
          background: "linear-gradient(145deg,#f9f6ff,#fff4f9)",
        }}
      >
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={280}
          theme="light"
          style={{
            background: "#001529",
            transition: "all 0.3s ease",
            boxShadow: "4px 0 25px rgba(0,0,0,0.15)",
          }}
        >
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
            items={menuItems}
            theme="dark"
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
              background: "#001529",
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
                {getPageTitle()}
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
              <div style={{ textAlign: "right" }}>
                <Text style={{ color: "#fff", fontWeight: 600 }}>
                  Hi, {userName.split(" ")[0]}
                </Text>
                <br />
              </div>

              <Button
                icon={<LogoutOutlined />}
                onClick={() => setLogoutModalOpen(true)}
                style={{
                  border: "none",
                  color: "#fff",
                  background: "rgba(255,255,255,0.15)",
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

      <Modal
        open={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        footer={null}
        centered
        width={460}
        styles={{
          body: {
            padding: "32px",
          },
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(255,77,79,0.15), rgba(255,120,117,0.25))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 10px 30px rgba(255,77,79,0.15)",
            }}
          >
            <LogoutOutlined
              style={{
                fontSize: 38,
                color: "#ff4d4f",
              }}
            />
          </div>
          ```
          {/* Title */}
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              color: "#1f1f1f",
            }}
          >
            Confirm Logout
          </h2>
          {/* Badge */}
          <div
            style={{
              display: "inline-block",
              marginTop: 12,
              padding: "4px 12px",
              borderRadius: 20,
              background: "#fff7e6",
              color: "#d48806",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Session Active
          </div>
          {/* Description */}
          <p
            style={{
              marginTop: 20,
              marginBottom: 30,
              color: "#8c8c8c",
              lineHeight: 1.7,
              fontSize: 15,
            }}
          >
            Are you sure you want to sign out from your WinWay account?
            <br />
            Unsaved changes and ongoing actions may be lost.
          </p>
          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
            }}
          >
            <Button
              size="large"
              block
              onClick={() => setLogoutModalOpen(false)}
              style={{
                height: 46,
                borderRadius: 10,
                fontWeight: 600,
              }}
            >
              Stay Logged In
            </Button>

            <Button
              danger
              type="primary"
              block
              size="large"
              icon={<LogoutOutlined />}
              style={{
                height: 46,
                borderRadius: 10,
                fontWeight: 600,
                boxShadow: "0 8px 20px rgba(255,77,79,0.25)",
              }}
              onClick={() => {
                setLogoutModalOpen(false);
                onLogout();
              }}
            >
              Logout
            </Button>
          </div>
       
       
        </div>
      </Modal>
    </>
  );
};

export default DashboardLayout;
