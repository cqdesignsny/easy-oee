import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export type ShiftSummaryStop = {
  reasonLabel: string;
  minutes: number;
};

export type ShiftSummaryEmailProps = {
  plantName: string;
  lineName: string;
  operatorName: string;
  shiftType: string;
  product: string;
  jobNumber: string | null;
  shiftDateLabel: string;
  startedAtLabel: string;
  endedAtLabel: string | null;
  oee: number | null;
  availability: number | null;
  performance: number | null;
  quality: number | null;
  plannedMinutes: number;
  goodParts: number;
  badParts: number;
  idealRate: number;
  stops: ShiftSummaryStop[];
  dashboardUrl: string;
};

const BG = "#003038";
const ACCENT = "#03BFB5";
const TEXT = "#EFF5F9";
const MUTED = "rgba(239,245,249,0.65)";
const CARD = "#00424b";
const BORDER = "rgba(239,245,249,0.12)";

const fmtPct = (v: number | null) =>
  v == null ? "—" : `${Math.round(v * 100 * 10) / 10}%`;

function bucketColor(v: number | null) {
  if (v == null) return MUTED;
  if (v >= 0.85) return "#22c55e";
  if (v >= 0.65) return "#eab308";
  return "#ef4444";
}

export function ShiftSummaryEmail(props: ShiftSummaryEmailProps) {
  const {
    plantName,
    lineName,
    operatorName,
    shiftType,
    product,
    jobNumber,
    shiftDateLabel,
    startedAtLabel,
    endedAtLabel,
    oee,
    availability,
    performance,
    quality,
    plannedMinutes,
    goodParts,
    badParts,
    idealRate,
    stops,
    dashboardUrl,
  } = props;

  const totalParts = goodParts + badParts;
  const topStops = [...stops]
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5);

  return (
    <Html>
      <Head />
      <Preview>{`${plantName} · ${lineName} · ${fmtPct(oee)} OEE`}</Preview>
      <Body
        style={{
          backgroundColor: BG,
          color: TEXT,
          fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
          <Section>
            <Text
              style={{
                color: ACCENT,
                fontSize: 14,
                letterSpacing: 2,
                textTransform: "uppercase",
                margin: 0,
                fontWeight: 700,
              }}
            >
              Easy OEE
            </Text>
            <Heading
              as="h1"
              style={{
                color: TEXT,
                fontSize: 28,
                margin: "8px 0 4px 0",
                lineHeight: 1.2,
              }}
            >
              Shift summary
            </Heading>
            <Text style={{ color: MUTED, margin: 0, fontSize: 14 }}>
              {plantName} · {lineName}
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: CARD,
              borderRadius: 12,
              padding: 24,
              margin: "24px 0",
              border: `1px solid ${BORDER}`,
            }}
          >
            <Text style={{ color: MUTED, fontSize: 12, margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>
              Overall OEE
            </Text>
            <Text
              style={{
                color: bucketColor(oee),
                fontSize: 56,
                fontWeight: 800,
                margin: "4px 0 0 0",
                lineHeight: 1,
              }}
            >
              {fmtPct(oee)}
            </Text>
            <Hr style={{ borderColor: BORDER, margin: "20px 0" }} />
            <Row>
              <Column align="left" style={{ width: "33.33%" }}>
                <Text style={{ color: MUTED, fontSize: 11, margin: 0 }}>Availability</Text>
                <Text style={{ color: TEXT, fontSize: 20, margin: "2px 0 0 0", fontWeight: 600 }}>
                  {fmtPct(availability)}
                </Text>
              </Column>
              <Column align="left" style={{ width: "33.33%" }}>
                <Text style={{ color: MUTED, fontSize: 11, margin: 0 }}>Performance</Text>
                <Text style={{ color: TEXT, fontSize: 20, margin: "2px 0 0 0", fontWeight: 600 }}>
                  {fmtPct(performance)}
                </Text>
              </Column>
              <Column align="left" style={{ width: "33.33%" }}>
                <Text style={{ color: MUTED, fontSize: 11, margin: 0 }}>Quality</Text>
                <Text style={{ color: TEXT, fontSize: 20, margin: "2px 0 0 0", fontWeight: 600 }}>
                  {fmtPct(quality)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Section style={{ margin: "24px 0" }}>
            <Heading as="h2" style={{ color: TEXT, fontSize: 16, margin: "0 0 12px 0" }}>
              Shift details
            </Heading>
            <DetailRow label="Date" value={shiftDateLabel} />
            <DetailRow label="Shift" value={shiftType} />
            <DetailRow label="Operator" value={operatorName} />
            <DetailRow label="Product" value={product} />
            {jobNumber ? <DetailRow label="Job #" value={jobNumber} /> : null}
            <DetailRow label="Started" value={startedAtLabel} />
            {endedAtLabel ? <DetailRow label="Ended" value={endedAtLabel} /> : null}
            <DetailRow label="Planned minutes" value={String(plannedMinutes)} />
            <DetailRow label="Ideal rate (parts/min)" value={String(idealRate)} />
          </Section>

          <Section style={{ margin: "24px 0" }}>
            <Heading as="h2" style={{ color: TEXT, fontSize: 16, margin: "0 0 12px 0" }}>
              Production
            </Heading>
            <Row>
              <Column align="left" style={{ width: "33.33%" }}>
                <Text style={{ color: MUTED, fontSize: 11, margin: 0 }}>Good</Text>
                <Text style={{ color: TEXT, fontSize: 24, margin: "2px 0 0 0", fontWeight: 700 }}>
                  {goodParts}
                </Text>
              </Column>
              <Column align="left" style={{ width: "33.33%" }}>
                <Text style={{ color: MUTED, fontSize: 11, margin: 0 }}>Defective</Text>
                <Text style={{ color: TEXT, fontSize: 24, margin: "2px 0 0 0", fontWeight: 700 }}>
                  {badParts}
                </Text>
              </Column>
              <Column align="left" style={{ width: "33.33%" }}>
                <Text style={{ color: MUTED, fontSize: 11, margin: 0 }}>Total</Text>
                <Text style={{ color: TEXT, fontSize: 24, margin: "2px 0 0 0", fontWeight: 700 }}>
                  {totalParts}
                </Text>
              </Column>
            </Row>
          </Section>

          {topStops.length > 0 ? (
            <Section style={{ margin: "24px 0" }}>
              <Heading as="h2" style={{ color: TEXT, fontSize: 16, margin: "0 0 12px 0" }}>
                Top downtime
              </Heading>
              {topStops.map((s, i) => (
                <Row key={i} style={{ marginBottom: 6 }}>
                  <Column align="left" style={{ width: "70%" }}>
                    <Text style={{ color: TEXT, fontSize: 14, margin: 0 }}>{s.reasonLabel}</Text>
                  </Column>
                  <Column align="right" style={{ width: "30%" }}>
                    <Text style={{ color: MUTED, fontSize: 14, margin: 0 }}>
                      {Math.round(s.minutes * 10) / 10} min
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>
          ) : null}

          <Hr style={{ borderColor: BORDER, margin: "32px 0 16px 0" }} />

          <Section>
            <Text style={{ color: MUTED, fontSize: 13, margin: 0 }}>
              View the full breakdown, edit shift details, or export CSV from the dashboard.
            </Text>
            <Link
              href={dashboardUrl}
              style={{
                color: ACCENT,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                marginTop: 4,
                display: "inline-block",
              }}
            >
              Open the dashboard →
            </Link>
          </Section>

          <Section style={{ marginTop: 32 }}>
            <Text style={{ color: MUTED, fontSize: 11, margin: 0, lineHeight: 1.5 }}>
              Easy OEE · Real-time production performance for manufacturers.
              <br />
              You received this because someone shared a shift summary with this address from
              the Easy OEE dashboard.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Row style={{ marginBottom: 4 }}>
      <Column align="left" style={{ width: "40%" }}>
        <Text style={{ color: MUTED, fontSize: 13, margin: 0 }}>{label}</Text>
      </Column>
      <Column align="left" style={{ width: "60%" }}>
        <Text style={{ color: TEXT, fontSize: 13, margin: 0 }}>{value}</Text>
      </Column>
    </Row>
  );
}

export default ShiftSummaryEmail;
