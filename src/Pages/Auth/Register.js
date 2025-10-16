import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import axios from "axios";

const { Title, Text } = Typography;

const Register = ({ onSwitch }) => {
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values) => {
    try {
      setLoading(true);
      await axios.post("http://localhost:8000/api/register", values);
      message.success("Account created successfully!");
      onSwitch("login");
    } catch (err) {
      message.error(err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #ffd740 0%, #f107a3 50%, #7b2ff7 100%)",
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 24,
          padding: "35px 25px",
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.93)",
          boxShadow: "0 8px 30px rgba(241,7,163,0.25)",
          border: "1px solid rgba(255,255,255,0.5)",
        }}
        hoverable
      >
        <Title
          level={3}
          style={{
            textAlign: "center",
            background: "linear-gradient(135deg,#f107a3,#ffd740)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontWeight: 700,
            marginBottom: 25,
          }}
        >
          Create Your Account
        </Title>

        <Form layout="vertical" onFinish={handleRegister}>
          <Form.Item
            name="name"
            label={<span style={{ color: "#333" }}>Full Name</span>}
            rules={[{ required: true }]}
          >
            <Input placeholder="John Doe" size="large" />
          </Form.Item>

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
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password placeholder="••••••••" size="large" />
          </Form.Item>

          <Button
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={{
              background: "linear-gradient(135deg,#f107a3,#ffd740)",
              border: "none",
              color: "#fff",
              fontWeight: 600,
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(241,7,163,0.25)",
              marginTop: 10,
            }}
          >
            Register
          </Button>
        </Form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Text>Already have an account? </Text>
          <a
            href="#"
            onClick={() => onSwitch("login")}
            style={{
              color: "#f107a3",
              fontWeight: 600,
            }}
          >
            Login
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Register;
