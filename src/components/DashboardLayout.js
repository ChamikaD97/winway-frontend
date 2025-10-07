import React, { useState } from "react";
import { Layout, Menu, Typography } from "antd";
import {
  UploadOutlined,
  PieChartOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function DashboardLayout({ children, activeTab, onTabChange }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            height: 60,
            margin: 16,
            color: "white",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          WINWAY
        </div>
        <Menu
          theme="dark"
          selectedKeys={[activeTab]}
          mode="inline"
          onClick={(e) => onTabChange(e.key)}
        >
          <Menu.Item key="1" icon={<UploadOutlined />}>
            Upload Files
          </Menu.Item>
          <Menu.Item key="2" icon={<PieChartOutlined />}>
            Results
          </Menu.Item>
          <Menu.Item key="3" icon={<FileTextOutlined />}>
            Reports
          </Menu.Item>
          <Menu.Item key="4" icon={<SettingOutlined />}>
            Settings
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Main Content */}
      <Layout>
        <Header style={{ background: "#fff", paddingLeft: 20 }}>
          <Title level={3} style={{ margin: 0 }}>
            WinWay Dashboard
          </Title>
        </Header>

        <Content style={{ margin: "20px", padding: 20, background: "#fff" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;
