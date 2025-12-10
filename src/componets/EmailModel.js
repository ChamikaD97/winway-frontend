import React, { useState } from "react";
import { Modal, Form, Input, Button, Row, Col } from "antd";
import {
  Editor,
  EditorProvider,
  Toolbar,
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnStrikeThrough,
  BtnBulletList,
  BtnNumberedList,
  BtnUndo,
  BtnRedo,
  BtnLink,
  BtnClearFormatting,
  BtnStyles,
} from "react-simple-wysiwyg";

/* ----------------------------------------------
   EMAIL TEMPLATE (PREVIEW VERSION WITH IMAGES)
---------------------------------------------- */
const generateLoyaltyCustomeEmail = (
  name = "Valued Customer",
  body,
  customer = {},
  title,
  headerLogo,
  footerLogo
) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>

<body style="margin:0; padding:0; background:#f4f4f7; font-family:Arial, sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding:30px 0;">

        <table width="800" style="
          background:#EBF0F9;
          border-radius:18px;
          overflow:hidden;
          border:3px solid #000;
          box-shadow:0 5px 25px rgba(0,0,0,0.1);
        ">

          <!-- HEADER -->
          <tr>
            <td align="center">
              <div style="
                background:linear-gradient(135deg,#7b2ff7,#f107a3);
                padding:22px 30px;
              ">
                <table width="100%">
                  <tr>
                    <td align="left" width="70">
                      <img src="${headerLogo}" width="90" height="90" style="border-radius:8px;" />
                    </td>

                    <td align="center">
                      <h1 style="color:#fff; font-size:32px; margin:0; font-family:'Crimson Text';">
                      ${title}
                   
                      
                      </h1>
                    </td>

                    <td width="70"></td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px; font-size:16px; color:#333; line-height:1.6;">
              
              <p style="font-size:18px; font-family:'Sylfaen'; font-style:italic;">
                <strong>Dear Customer,</strong>
              </p>

              ${body}

              <p style="font-family:'Sylfaen'; font-style:italic;font-size:15px;">
                If you have any questions, contact <strong>info@winway.lk</strong>
                or call <strong>0707 884 884</strong>.
              </p>

              <p style="font-family:'Sylfaen'; font-style:italic; font-size:15px;">
                Thank you for choosing <strong>WIN WAY</strong>.
              </p>

              <p style="font-weight:600; font-family:'Sylfaen'; font-style:italic; font-size:15px;">
                Best regards,<br/>
                WIN WAY<br/>
                National Lotteries Board
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#D6DCE5; padding:18px 30px; color:#777;">
              <table width="100%">
                <tr>
                  <td align="left">
                    <strong>
                      © ${new Date().getFullYear()} ThinkCube Systems (Pvt) Ltd.<br/>
                      📞 0707884884 | 0722884884
                    </strong>
                    <br/>
                    <a href="https://www.winway.lk">www.winway.lk</a> |
                    <a href="https://www.884.lk">www.884.lk</a>
                  </td>

                  <td align="right" width="60">
                    <img src="${footerLogo}" width="55" height="55" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
};

/* ----------------------------------------------
   MAIN COMPONENT
---------------------------------------------- */
const EmailModal = ({ open, onClose, onSend, headerLogo, footerLogo }) => {
  const [form] = Form.useForm();
  const [editorValue, setEditorValue] = useState("");
  const [title, setTitleValue] = useState("Loyalty Rewards Program");

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSend({
        subject: values.subject,
        body: editorValue, // HTML content
        title: title ? title : "Loyalty Rewards Program",
      });

      form.resetFields();
      setEditorValue("");
    });
  };

  const clearEditor = () => {
    setTitleValue("Loyalty Rewards Program");

    setEditorValue("");
  };

  const buildPreviewHtml = () => {
    return generateLoyaltyCustomeEmail(
      "Customer",
      editorValue,
      {},
      title,
      headerLogo,
      footerLogo
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={1400}
      centered
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
          Send Your Custome Email
        </div>
      }
      footer={[
        <Button key="clear" danger onClick={clearEditor}>
          Clear
        </Button>,
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="send"
          type="primary"
          onClick={handleSubmit}
          style={{ background: "#7b2ff7", borderColor: "#7b2ff7" }}
        >
          Send
        </Button>,
      ]}
    >
      <Row gutter={20}>
        {/* LEFT SIDE — FORM + EDITOR */}
        <Col span={8}>
          <Form form={form} layout="vertical">
            <Form.Item
              label="Subject"
              name="subject"
              rules={[{ required: true, message: "Subject is required" }]}
            >
              <Input placeholder="Enter email subject" />
            </Form.Item>
            <Form.Item
              label="Email Title"
              name="title"
              rules={[{ required: true, message: "Title is required" }]}
            >
              <Input
                placeholder="Enter email title"
                onChange={(e) => setTitleValue(e.target.value)}
                defaultValue={"Loyalty Rewards Program"}
              />
            </Form.Item>

            <Form.Item label="Email Body" required>
              <EditorProvider>
                <Editor
                  value={editorValue}
                  onChange={(e) => setEditorValue(e.target.value)}
                  style={{
                    height: 350,
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                >
                  <Toolbar>
                    <BtnBold />
                    <BtnItalic />
                    <BtnUnderline />
                    <BtnStrikeThrough />
                    <BtnStyles /> {/* Replaces H1 / H2 / H3 / Paragraph */}
                    <BtnBulletList />
                    <BtnNumberedList />
                    <BtnLink />
                    <BtnUndo />
                    <BtnRedo />
                    <BtnClearFormatting />
                  </Toolbar>
                </Editor>
              </EditorProvider>
            </Form.Item>
          </Form>
        </Col>

        {/* RIGHT SIDE — PREVIEW */}
        <Col span={16}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Preview</div>
          <iframe
            srcDoc={buildPreviewHtml()}
            style={{
              width: "100%",
              height: 500,
              border: "1px solid #ccc",
              borderRadius: 8,
              background: "white",
            }}
          />
        </Col>
      </Row>
    </Modal>
  );
};

export default EmailModal;
