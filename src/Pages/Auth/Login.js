import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import axios from "axios";

const { Title, Text } = Typography;

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/api/login", values);
      localStorage.setItem("token", res.data.token);
      message.success("Welcome back!");
      onLogin(); // triggers success
    } catch (err) {
      message.error(err.response?.data?.message || "Login failed!");
       onLogin();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #7b2ff7 0%, #f107a3 50%, #ffd740 100%)",
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 24,
          padding: "35px 25px",
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.93)",
          boxShadow: "0 8px 30px rgba(123,47,247,0.2)",
          border: "1px solid rgba(255,255,255,0.5)",
        }}
        hoverable
      >
        <Title
          level={3}
          style={{
            textAlign: "center",
            background: "linear-gradient(135deg,#7b2ff7,#f107a3)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontWeight: 700,
            marginBottom: 25,
          }}
        >
          Welcome Back!
        </Title>

        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="email"
            label={<span style={{ color: "#333" }}>Email</span>}
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="you@example.com" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ color: "#333" }}>Password</span>}
            rules={[{ required: true }]}
          >
            <Input.Password placeholder="••••••••" size="large" />
          </Form.Item>

          <Button
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={{
              background: "linear-gradient(135deg,#7b2ff7,#f107a3,#ffd740)",
              border: "none",
              color: "#fff",
              fontWeight: 600,
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(241,7,163,0.25)",
              marginTop: 10,
            }}
          >
            Login
          </Button>
        </Form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Text>Don’t have an account? </Text>
          <a
            href="#"
            onClick={() => onLogin("register")}
            style={{
              color: "#7b2ff7",
              fontWeight: 600,
            }}
          >
            Register
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Login;
