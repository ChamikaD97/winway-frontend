import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import axios from "axios";
import winwayLogo from "../../assets/logo.png";
import winwayLeft from "../../assets/back.png";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [isLogging, setIsLogging] = useState(true);
const navigate = useNavigate();

const handleLogin = async (values) => {
  try {
    setLoading(true);
    const res = await axios.post("http://localhost:8001/api/users/login", values);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("name", res.data.name); // store name for quick access
    
    message.success(`Welcome back, ${res.data.name || "User"}!`);

    navigate("/dashboard"); // 🚀 redirect after successful login
  } catch (err) {
    message.error(err.response?.data?.message || "Login failed!");
  } finally {
    setLoading(false);
  }
};

  // 🟣 Handle Register Submit
  const handleRegister = async (values) => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8001/api/users/register",
        values
      );
      message.success("Account created successfully!");
      setIsLogging(true); // switch to login form
    } catch (err) {
      message.error(err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* LEFT IMAGE */}
      <div
        style={{
          flex: 1,
          backgroundImage: `url(${winwayLeft})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "100px",
            background:
              "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
          }}
        ></div>
      </div>

      {/* RIGHT FORM */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
        }}
      >
        <Card
          hoverable
          style={{
            width: 380,
            paddingTop: "20px",
            borderRadius: "20px",
            textAlign: "center",
            background: "rgba(255,255,255,0.93)",
            boxShadow: "0 8px 30px rgba(241,7,163,0.25)",
            border: "1px solid rgba(255,255,255,0.5)",
          }}
        >
          <img
            src={winwayLogo}
            alt="WinWay Logo"
            style={{
              width: 150,
              marginBottom: 10,
              borderRadius: 10,
            }}
          />

          {isLogging ? (
            <>
              <Title
                level={3}
                style={{
                  color: "#6a1b9a",
                  fontWeight: 800,
                  marginTop: 5,
                  marginBottom: 5,
                }}
              >
                Sign In
              </Title>

              <Form
                layout="vertical"
                onFinish={handleLogin}
                style={{ marginTop: 30, textAlign: "left" }}
              >
                <Form.Item
                  name="email"
                  label={<span style={{ color: "#333" }}>Email</span>}
                  rules={[{ required: true, type: "email" }]}
                >
                  <Input
                    placeholder="you@example.com"
                    size="large"
                    style={{
                      borderRadius: 10,
                      border: "1px solid #ccc",
                      padding: "10px 14px",
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span style={{ color: "#333" }}>Password</span>}
                  rules={[{ required: true }]}
                >
                  <Input.Password
                    placeholder="••••••••"
                    size="large"
                    style={{
                      borderRadius: 10,
                      border: "1px solid #ccc",
                      padding: "10px 14px",
                    }}
                  />
                </Form.Item>

                <Button
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  style={{
                    background:
                      "linear-gradient(135deg,#7b2ff7,#f107a3,#ffd740)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 600,
                    borderRadius: 12,
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
                  onClick={() => setIsLogging(false)}
                  style={{
                    color: "#7b2ff7",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Register Now
                </a>
              </div>
            </>
          ) : (
            <>
              <Title
                level={3}
                style={{
                  color: "#6a1b9a",
                  fontWeight: 800,
                  marginTop: 5,
                  marginBottom: 5,
                }}
              >
                Register
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
                  onClick={() => setIsLogging(true)}
                  style={{
                    color: "#f107a3",
                    fontWeight: 600,
                  }}
                >
                  Login
                </a>
              </div>
            </>
          )}

          <div
            style={{
              textAlign: "center",
              marginTop: 30,
              fontSize: 12,
              color: "#999",
            }}
          >
            © {new Date().getFullYear()} WinWay. All rights reserved.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
