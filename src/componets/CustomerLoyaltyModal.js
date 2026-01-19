import React, { useMemo, useState } from "react";
import {
  Modal,
  Card,
  Row,
  Col,
  Tag,
  Statistic,
  Space,
  Segmented,
  Progress,
} from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function CustomerLoyaltyModal({
  open,
  onClose,
  mobileNumber,
  history = [],
  populationAverages = {},
  tierColors = {},
  lotteryKeys = [],
}) {
  const [compareAvg, setCompareAvg] = useState("Hide avg");
console.log(history);

  const displayMonth = (m) => {
    return m;
  };

  const latest = history[history.length - 1];

  const lineData = useMemo(() => {
    return history.map((r) => ({
      date: displayMonth(r.Last_Update),
      rawMonth: r.Last_Update,
      tickets: Number(r.Monthly_Ticket_Count || 0),
      tier: r.Month_Tier || "N/A",
      avg: Number(populationAverages[r.Last_Update] || 0),
    }));
  }, [history, populationAverages]);

  const pieData = useMemo(() => {
    if (!latest) return [];
    return lotteryKeys
      .map((k) => ({
        name: k.replace(/_/g, " "),
        value: Number(latest[k] || 0),
      }))
      .filter((x) => x.value > 0);
  }, [latest, lotteryKeys]);

  const totalLatestTickets = Number(latest?.Monthly_Ticket_Count || 0);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={1000}
      footer={null}
      title={`Customer: ${mobileNumber || "-"}`}
    >
      {latest ? (
        <>
          {/* Header Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="Latest Month"
                  value={displayMonth(latest.Last_Update)}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="Latest Tier"
                  valueRender={() => (
                    <Tag
                      color={tierColors[latest.Month_Tier] || "default"}
                      style={{ fontWeight: 600 }}
                    >
                      {latest.Month_Tier || "-"}
                    </Tag>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="Latest Monthly Tickets"
                  value={Number(
                    latest.Monthly_Ticket_Count || 0
                  ).toLocaleString()}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts Row */}
          <Row gutter={[16, 16]}>
            {/* Line Chart */}
            <Col xs={24} md={16}>
              <Card
                title={
                  <Space>
                    Ticket Trend
                    <Segmented
                      options={["Hide avg", "Show avg"]}
                      value={compareAvg}
                      onChange={setCompareAvg}
                      size="small"
                    />
                  </Space>
                }
              >
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={lineData}
                      margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ background: "#fff", borderRadius: 8 }}
                        formatter={(value, name, entry) => {
                          if (name === "tickets") {
                            const tier = entry?.payload?.tier || "N/A";
                            const color = tierColors[tier] || "#7b2ff7";
                            return [
                              <span>
                                {Number(value).toLocaleString()}{" "}
                                <Tag
                                  color={color}
                                  style={{ marginLeft: 6, fontWeight: 600 }}
                                >
                                  {tier}
                                </Tag>
                              </span>,
                              "Tickets",
                            ];
                          }
                          if (name === "avg") {
                            return [Number(value).toFixed(0), "Population Avg"];
                          }
                          return [value, name];
                        }}
                      />
                      <Legend />
                      {/* Flat line (no curve) + tier-colored dots */}
                      <Line
                        type="linear"
                        dataKey="tickets"
                        stroke="#7b2ff7"
                        strokeWidth={3}
                        dot={{
                          r: 6,
                          strokeWidth: 2,
                          stroke: "#fff",
                        }}
                        activeDot={{ r: 8 }}
                      />
                      {/* Tier-colored dots need custom renderer via data props */}
                      {lineData.map((pt, i) => (
                        <Line
                          key={`dot-${i}`}
                          type="linear"
                          dataKey={() => null} // no line
                          dot={{
                            r: 0,
                          }}
                          activeDot={false}
                          // just to force color stops via gradient isn't needed here; the main line remains solid,
                          // and we color the dots via CustomDot:
                        />
                      ))}
                      {compareAvg === "Show avg" && (
                        <Line
                          type="linear"
                          dataKey="avg"
                          stroke="#999999"
                          strokeDasharray="4 4"
                          strokeWidth={2}
                          dot={false}
                          name="avg"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>

          
          
          </Row>

          
          
        </>
      ) : (
        <Card> No data available for this customer. </Card>
      )}
    </Modal>
  );
}

export default CustomerLoyaltyModal;
