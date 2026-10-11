
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./App.css";

const profiles = {
  Home: {
    roof: 120,
    tank: 5000,
    demand: 300,
    efficiency: 85,
    icon: "🏡",
    description: "Plan rainwater harvesting for your home and reduce tanker costs.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
  },
  "Apartment/RWA": {
    roof: 1000,
    tank: 20000,
    demand: 3000,
    efficiency: 85,
    icon: "🏢",
    description: "Manage shared water resources for apartments and residential communities.",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80",
  },
  "Data Center": {
    roof: 2000,
    tank: 50000,
    demand: 5000,
    efficiency: 90,
    icon: "🖥️",
    description: "Estimate water collection and explore cooling-water planning.",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
  },
};

const cities = {
  Hyderabad: 800,
  Bengaluru: 970,
  Chennai: 1400,
  Mumbai: 2200,
  Delhi: 750,
};

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const monthlyWeights = [
  0.015, 0.02, 0.025, 0.04, 0.09, 0.14,
  0.17, 0.16, 0.14, 0.09, 0.065, 0.045,
];

const C = {
  bg: "#03291f",
  panel: "rgba(5, 53, 39, 0.94)",
  panelLight: "rgba(10, 69, 49, 0.86)",
  green: "#35c18a",
  mint: "#b7f5d5",
  white: "#f4fff8",
  muted: "#b7d3c4",
  border: "rgba(151, 225, 187, 0.24)",
  orange: "#f5bd73",
};

const btn = {
  background: C.green,
  color: "#03291f",
  border: "1px solid transparent",
  padding: "12px 19px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 14,
};

const inputStyle = {
  boxSizing: "border-box",
  width: "100%",
  minWidth: 0,
  padding: "12px",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  background: "#0a382a",
  color: C.white,
  fontSize: 15,
};

function Panel({ children, style = {} }) {
  return (
    <section
      style={{
        background: C.panel,
        color: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: 22,
        boxShadow: "0 12px 35px rgba(234, 233, 228, 0.13)",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function Heading({ children }) {
  return (
    <h2
      style={{
        color: C.mint,
        fontSize: 22,
        margin: "0 0 18px",
      }}
    >
      {children}
    </h2>
  );
}

function Field({ label, value, onChange, unit, max }) {
  return (
    <label style={{ display: "block", minWidth: 0 }}>
      <span
        style={{
          display: "block",
          color: C.muted,
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {label}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="number"
          min="0"
          max={max}
          step="any"
          value={value}
          onChange={(e) => {
            const raw = e.target.value;

            if (raw === "") {
              onChange(0);
              return;
            }

            let next = Math.max(0, Number(raw) || 0);

            if (max !== undefined) {
              next = Math.min(max, next);
            }

            onChange(next);
          }}
          style={inputStyle}
        />

        <span
          style={{
            color: C.muted,
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          {unit}
        </span>
      </div>
    </label>
  );
}

function Label({ children }) {
  return (
    <span
      style={{
        display: "block",
        color: C.muted,
        fontSize: 13,
        fontWeight: 700,
        marginBottom: 8,
      }}
    >
      {children}
    </span>
  );
}

export default function App() {
  const [page, setPage] = useState("landing");
  const [mode, setMode] = useState("Home");
  const [city, setCity] = useState("Hyderabad");
  const [roof, setRoof] = useState(120);
  const [tank, setTank] = useState(5000);
  const [demand, setDemand] = useState(300);
  const [efficiency, setEfficiency] = useState(85);
  const [runoff, setRunoff] = useState(0.8);
  const [rainAdjustment, setRainAdjustment] = useState(0);
  const [customRainfall, setCustomRainfall] = useState(0);
  const [tankerPrice, setTankerPrice] = useState(800);
  const [tankerLitres, setTankerLitres] = useState(5000);
  const [itLoad, setItLoad] = useState(100);
  const [wue, setWue] = useState(1.8);
  const [savedScenarios, setSavedScenarios] = useState([]);

  const annualRain = Math.max(
    0,
    (customRainfall > 0 ? customRainfall : cities[city]) +
      rainAdjustment
  );

  const annualCollected = Math.round(
    annualRain * roof * runoff * (efficiency / 100)
  );

  const annualDemand = demand * 365;
  const usableWater = Math.min(annualCollected, annualDemand);

  const coverage =
    annualDemand > 0
      ? Math.min(100, (usableWater / annualDemand) * 100)
      : 0;

  const monthlyData = useMemo(() => {
    let stored = 0;

    return months.map((month, index) => {
      const rainfall = annualRain * monthlyWeights[index];

      const collected =
        rainfall * roof * runoff * (efficiency / 100);

      const available = stored + collected;
      const used = Math.min(available, demand * 30);

      stored = Math.min(tank, Math.max(0, available - used));

      return {
        month,
        rainfall: Math.round(rainfall),
        collected: Math.round(collected),
        demand: demand * 30,
        stored: Math.round(stored),
      };
    });
  }, [annualRain, roof, runoff, efficiency, demand, tank]);

  const tankComparison = [2000, 5000, 10000, 20000, 50000].map(
    (capacity) => ({
      tank: `${capacity / 1000}k L`,
      storage: Math.min(capacity, Math.round(annualCollected / 12)),
    })
  );

  const equivalentTankerValue =
    tankerLitres > 0
      ? (usableWater / tankerLitres) * tankerPrice
      : 0;

  const coolingWaterPerDay = itLoad * wue * 24;

  function changeMode(nextMode) {
    const profile = profiles[nextMode];

    setMode(nextMode);
    setRoof(profile.roof);
    setTank(profile.tank);
    setDemand(profile.demand);
    setEfficiency(profile.efficiency);
  }

  function openDashboard(nextMode) {
    changeMode(nextMode);
    setPage("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goHome() {
    setPage("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveScenario() {
    setSavedScenarios((previous) => [
      ...previous,
      {
        id: Date.now(),
        mode,
        city,
        roof,
        tank,
        demand,
        annualCollected,
        date: new Date().toLocaleDateString(),
      },
    ]);
  }

  const backgroundStyle = {
    minHeight: "100vh",
    color: C.white,
    fontFamily: "Inter, Arial, sans-serif",
    backgroundColor: C.bg,
    backgroundImage:
      "linear-gradient(rgba(2, 35, 26, 0.83), rgba(2, 35, 26, 0.94)), url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=85')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };

  const chartTooltip = {
    contentStyle: {
      background: "#073a2a",
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      color: C.white,
    },
  };

  if (page === "landing") {
    return (
      <div style={backgroundStyle}>
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            padding: "18px clamp(18px, 5vw, 65px)",
            background: "rgba(2, 35, 26, 0.95)",
            borderBottom: `1px solid ${C.border}`,
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 900 }}>
            💧 RainBank <span style={{ color: C.green }}>Flex</span>
          </div>

          <nav style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            <a href="#home" style={navStyle}>Home</a>
            <a href="#solutions" style={navStyle}>Solutions</a>
            <a href="#about" style={navStyle}>About</a>

            <button
              onClick={() => setPage("saved")}
              style={{
                ...navStyle,
                background: "transparent",
                border: 0,
                cursor: "pointer",
                padding: 0,
              }}
            >
              Saved Scenarios
            </button>
          </nav>
        </header>

        <section
          id="home"
          style={{
            minHeight: 430,
            display: "flex",
            alignItems: "center",
            padding: "65px clamp(22px, 8vw, 110px)",
            backgroundImage:
              "linear-gradient(90deg, rgba(1,35,26,0.92), rgba(1,35,26,0.52)), url('https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=2000&q=85')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div style={{ maxWidth: 730 }}>
            <p
              style={{
                color: C.mint,
                fontWeight: 800,
                letterSpacing: 2,
                fontSize: 13,
              }}
            >
              SMART RAINWATER HARVESTING
            </p>

            <h1
              style={{
                color: "#FFFFFF",
                fontSize: "clamp(38px, 6vw, 66px)",
                lineHeight: 1.08,
                margin: "18px 0",
                letterSpacing: -1.4,
              }}
            >
              Every drop counts,
              <br />
              <span style={{ color: "#FFFFFF" }}>
                when you plan for it.
              </span>
            </h1>

            <p
              style={{
                color: "#e0f4e8",
                fontSize: 17,
                lineHeight: 1.8,
                maxWidth: 650,
              }}
            >
              Estimate how much rainwater you can capture, store and use
              for your home, community or data center. Make every rainfall
              count with smarter water planning.
            </p>

            <button
              onClick={() =>
                document.getElementById("solutions")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              style={{ ...btn, marginTop: 12, padding: "15px 25px" }}
            >
              Explore Solutions →
            </button>
          </div>
        </section>

        <section
          id="solutions"
          style={{
            maxWidth: 1250,
            margin: "0 auto",
            padding: "45px 22px 55px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <p
              style={{
                color: C.mint,
                fontWeight: 800,
                letterSpacing: 2,
                fontSize: 12,
              }}
            >
              CHOOSE YOUR DASHBOARD
            </p>

            <h2
              style={{
                color: "#FFFFFF",
                fontSize: "clamp(27px, 4vw, 38px)",
                margin: "10px 0",
              }}
            >
              Water planning for every space
            </h2>

            <p style={{ color: C.muted, lineHeight: 1.7 }}>
              Choose a category to explore your own water-planning dashboard.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 22,
            }}
          >
            {Object.entries(profiles).map(([name, profile]) => (
              <article
                key={name}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "rgba(4, 48, 35, 0.94)",
                  border: `1px solid ${C.border}`,
                  borderRadius: 22,
                  overflow: "hidden",
                  boxShadow: "0 12px 35px rgba(0,0,0,0.2)",
                  transition: "transform 0.2s",
                }}
              >
                <img
                  src={profile.image}
                  alt={`${name} rainwater planning`}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: 190,
                    objectFit: "cover",
                  }}
                />

                <div
                  style={{
                    padding: 23,
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <div style={{ fontSize: 30, marginBottom: 10 }}>
                    {profile.icon}
                  </div>

                  <h3 style={{ fontSize: 22, margin: "0 0 10px" }}>
                    {name}
                  </h3>

                  <p
                    style={{
                      color: C.muted,
                      lineHeight: 1.8,
                      flex: 1,
                      fontSize: 14,
                    }}
                  >
                    {profile.description}
                  </p>

                  <button
                    onClick={() => openDashboard(name)}
                    style={{
                      ...btn,
                      background: "transparent",
                      border: `1px solid ${C.green}`,
                      color: C.mint,
                      width: "100%",
                      marginTop: 15,
                    }}
                  >
                    Open Dashboard →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer
          id="about"
          style={{
            textAlign: "center",
            padding: "32px 20px",
            borderTop: `1px solid ${C.border}`,
            background: "rgba(2, 35, 26, 0.88)",
          }}
        >
          <div style={{ color: C.green, fontSize: 25 }}>🌿</div>

          <p
            style={{
              color: C.mint,
              letterSpacing: 2,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            SUSTAINABLE TODAY. SECURE TOMORROW.
          </p>

          <p style={{ color: C.muted, fontSize: 13 }}>
            RainBank Flex · Plan smarter · Conserve every drop
          </p>
        </footer>
      </div>
    );
  }

  if (page === "saved") {
    return (
      <div style={backgroundStyle}>
        <header style={headerStyle}>
          <div style={{ fontSize: 23, fontWeight: 900 }}>
            💧 RainBank <span style={{ color: C.green }}>Flex</span>
          </div>

          <button onClick={goHome} style={btn}>
            ← Back to Home
          </button>
        </header>

        <main style={mainStyle}>
          <Panel>
            <Heading>Saved Scenarios</Heading>

            {savedScenarios.length === 0 ? (
              <p style={{ color: C.muted, lineHeight: 1.8 }}>
                You have no saved scenarios yet. Open a dashboard and use
                “Save Current Scenario” to save a snapshot during this session.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {savedScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    style={{
                      background: C.panelLight,
                      border: `1px solid ${C.border}`,
                      padding: 18,
                      borderRadius: 14,
                    }}
                  >
                    <h3>
                      {profiles[scenario.mode].icon} {scenario.mode}
                    </h3>

                    <p style={{ color: C.muted, lineHeight: 1.8 }}>
                      City: {scenario.city}<br />
                      Roof area: {scenario.roof.toLocaleString("en-IN")} m²<br />
                      Tank: {scenario.tank.toLocaleString("en-IN")} L<br />
                      Daily demand: {scenario.demand.toLocaleString("en-IN")} L<br />
                      Estimated annual collection:{" "}
                      {scenario.annualCollected.toLocaleString("en-IN")} L<br />
                      Saved on: {scenario.date}
                    </p>

                    <button
                      onClick={() => {
                        changeMode(scenario.mode);
                        setCity(scenario.city);
                        setRoof(scenario.roof);
                        setTank(scenario.tank);
                        setDemand(scenario.demand);
                        setPage("dashboard");
                      }}
                      style={btn}
                    >
                      Open Scenario
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={goHome}
              style={{ ...btn, marginTop: 20 }}
            >
              ← Back to Home
            </button>
          </Panel>
        </main>
      </div>
    );
  }

  return (
    <div style={backgroundStyle}>
      <header style={headerStyle}>
        <div style={{ fontSize: 23, fontWeight: 900 }}>
          💧 RainBank <span style={{ color: C.green }}>Flex</span>
        </div>

        <button onClick={goHome} style={btn}>
          ← Back to Home
        </button>
      </header>

      <main style={mainStyle}>
        <section
          style={{
            padding: "30px clamp(20px, 4vw, 40px)",
            borderRadius: 22,
            background: "linear-gradient(125deg, #064431, #08734f)",
            border: `1px solid ${C.border}`,
            marginBottom: 24,
          }}
        >
          <p
            style={{
              color: C.mint,
              fontWeight: 800,
              letterSpacing: 2,
              fontSize: 12,
            }}
          >
            SMART WATER PLANNING
          </p>

          <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)", margin: "10px 0" }}>
            {profiles[mode].icon} {mode} Dashboard
          </h1>

          <p style={{ color: "#d7f0e2", lineHeight: 1.8 }}>
            {profiles[mode].description}
          </p>
        </section>

        <Panel style={{ marginBottom: 24 }}>
          <Heading>Select Dashboard</Heading>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
            }}
          >
            {Object.keys(profiles).map((name) => (
              <button
                key={name}
                onClick={() => changeMode(name)}
                style={{
                  ...btn,
                  background: mode === name ? C.green : "#0a382a",
                  color: mode === name ? "#03291f" : C.mint,
                  border: `1px solid ${C.border}`,
                }}
              >
                {profiles[name].icon} {name}
              </button>
            ))}
          </div>
        </Panel>

        <Panel style={{ marginBottom: 24 }}>
          <Heading>Rainwater Calculator</Heading>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 22,
            }}
          >
            <label>
              <Label>City</Label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={inputStyle}
              >
                {Object.keys(cities).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <Field
              label="Roof area"
              value={roof}
              onChange={setRoof}
              unit="m²"
            />

            <Field
              label="Tank capacity"
              value={tank}
              onChange={setTank}
              unit="litres"
            />

            <Field
              label="Daily water demand"
              value={demand}
              onChange={setDemand}
              unit="L/day"
            />

            <Field
              label="Collection efficiency"
              value={efficiency}
              onChange={setEfficiency}
              unit="%"
              max={100}
            />

            <Field
              label="Runoff coefficient"
              value={runoff}
              onChange={setRunoff}
              unit="0–1"
              max={1}
            />

            <Field
              label="Rainfall adjustment"
              value={rainAdjustment}
              onChange={setRainAdjustment}
              unit="mm"
            />

            <Field
              label="Custom annual rainfall (optional)"
              value={customRainfall}
              onChange={setCustomRainfall}
              unit="mm"
            />
          </div>

          <p
            style={{
              color: C.muted,
              fontSize: 12,
              lineHeight: 1.8,
              marginTop: 18,
            }}
          >
            City rainfall values are illustrative estimates, not live weather
            data. A custom rainfall value replaces the city estimate; rainfall
            adjustment is then added to that value.
          </p>
        </Panel>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            {
              title: "Annual Collection",
              value: annualCollected.toLocaleString("en-IN"),
              unit: "litres/year",
              icon: "🌧️",
            },
            {
              title: "Annual Demand",
              value: annualDemand.toLocaleString("en-IN"),
              unit: "litres/year",
              icon: "🚰",
            },
            {
              title: "Demand Coverage",
              value: `${coverage.toFixed(1)}%`,
              unit: "estimated",
              icon: "📊",
            },
            {
              title: "Monthly Average",
              value: Math.round(annualCollected / 12).toLocaleString("en-IN"),
              unit: "litres/month",
              icon: "💧",
            },
          ].map((stat) => (
            <Panel key={stat.title} style={{ padding: 20 }}>
              <div style={{ fontSize: 25 }}>{stat.icon}</div>

              <p style={{ color: C.muted, fontSize: 13 }}>
                {stat.title}
              </p>

              <div
                style={{
                  fontSize: "clamp(22px, 3vw, 30px)",
                  color: C.mint,
                  fontWeight: 900,
                  overflowWrap: "anywhere",
                }}
              >
                {stat.value}
              </div>

              <p style={{ color: C.muted, fontSize: 12 }}>
                {stat.unit}
              </p>
            </Panel>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            marginBottom: 24,
          }}
        >
          <Panel>
            <Heading>Monthly Rainfall</Heading>

            <div style={{ height: 280, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#315b49"
                  />
                  <XAxis dataKey="month" stroke={C.muted} />
                  <YAxis stroke={C.muted} />
                  <Tooltip {...chartTooltip} />
                  <Bar
                    dataKey="rainfall"
                    name="Rainfall (mm)"
                    fill="#42b9d5"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <Heading>Water Collection vs Demand</Heading>

            <div style={{ height: 280, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#315b49"
                  />
                  <XAxis dataKey="month" stroke={C.muted} />
                  <YAxis stroke={C.muted} />
                  <Tooltip {...chartTooltip} />

                  <Line
                    type="monotone"
                    dataKey="collected"
                    name="Collected (L)"
                    stroke={C.green}
                    strokeWidth={3}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="demand"
                    name="Demand (L)"
                    stroke={C.orange}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <Panel style={{ marginBottom: 24 }}>
          <Heading>Tank Size Finder</Heading>

          <p style={{ color: C.muted, lineHeight: 1.8 }}>
            Compare possible tank sizes against the estimated average monthly
            collection. Real storage also depends on rainfall timing, water
            use, overflow and the tank's starting level.
          </p>

          <div style={{ height: 290, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tankComparison}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#315b49"
                />
                <XAxis dataKey="tank" stroke={C.muted} />
                <YAxis stroke={C.muted} />
                <Tooltip {...chartTooltip} />
                <Bar
                  dataKey="storage"
                  name="Estimated storage (L)"
                  fill={C.green}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              padding: 18,
              borderRadius: 14,
              background: C.panelLight,
              border: `1px solid ${C.border}`,
              lineHeight: 1.8,
            }}
          >
            <strong style={{ color: C.mint }}>Recommendation: </strong>

            {annualCollected > 0 && tank > 0
              ? `Your ${tank.toLocaleString("en-IN")} L tank can hold up to its rated capacity. Your estimated average monthly collection is ${Math.round(annualCollected / 12).toLocaleString("en-IN")} L. Compare both figures when choosing a tank.`
              : "Enter a positive roof area and rainfall value to estimate collection."}
          </div>
        </Panel>

        <Panel style={{ marginBottom: 24 }}>
          <Heading>Water Savings Estimator</Heading>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 22,
            }}
          >
            <Field
              label="Price per tanker"
              value={tankerPrice}
              onChange={setTankerPrice}
              unit="₹"
            />

            <Field
              label="Litres per tanker"
              value={tankerLitres}
              onChange={setTankerLitres}
              unit="litres"
            />
          </div>

          <div
            style={{
              marginTop: 22,
              padding: 22,
              borderRadius: 15,
              background: C.panelLight,
              border: `1px solid ${C.border}`,
            }}
          >
            <p style={{ color: C.muted }}>
              Estimated equivalent tanker-water value
            </p>

            <h2 style={{ color: C.mint, fontSize: 34 }}>
              ₹{Math.round(equivalentTankerValue).toLocaleString("en-IN")}
            </h2>

            <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.8 }}>
              An illustrative estimate based on usable collected water and your
              entered tanker price. Actual financial savings may differ.
            </p>
          </div>
        </Panel>

        {mode === "Data Center" && (
          <Panel style={{ marginBottom: 24 }}>
            <Heading>Data Center Cooling Water Estimator</Heading>

            <p style={{ color: C.muted, lineHeight: 1.8 }}>
              Estimate daily cooling-water use from IT load and water usage
              effectiveness (WUE).
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 22,
              }}
            >
              <Field
                label="IT load"
                value={itLoad}
                onChange={setItLoad}
                unit="kW"
              />

              <Field
                label="Water usage effectiveness"
                value={wue}
                onChange={setWue}
                unit="L/kWh"
              />
            </div>

            <div
              style={{
                marginTop: 22,
                padding: 20,
                borderRadius: 14,
                background: C.panelLight,
                border: `1px solid ${C.border}`,
              }}
            >
              <p style={{ color: C.muted }}>
                Estimated daily cooling water
              </p>

              <h2 style={{ color: C.mint, fontSize: 32 }}>
                {Math.round(coolingWaterPerDay).toLocaleString("en-IN")} L/day
              </h2>

              <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.8 }}>
                Simple estimate: IT load × WUE × 24 hours. Actual facility
                measurements are needed for engineering decisions.
              </p>
            </div>
          </Panel>
        )}

        <Panel style={{ marginBottom: 24 }}>
          <Heading>Save Your Scenario</Heading>

          <p style={{ color: C.muted, lineHeight: 1.8 }}>
            Save your current inputs and estimated collection so you can revisit
            them from the Saved Scenarios page during this session.
          </p>

          <button onClick={saveScenario} style={btn}>
            Save Current Scenario
          </button>

          <button
            onClick={() => setPage("saved")}
            style={{
              ...btn,
              marginLeft: 10,
              background: "transparent",
              border: `1px solid ${C.green}`,
              color: C.mint,
            }}
          >
            View Saved Scenarios ({savedScenarios.length})
          </button>
        </Panel>

        <footer
          style={{
            textAlign: "center",
            padding: 25,
            color: C.muted,
          }}
        >
          <p style={{ color: C.mint, letterSpacing: 2, fontSize: 12 }}>
            SUSTAINABLE TODAY. SECURE TOMORROW.
          </p>

          <button onClick={goHome} style={btn}>
            ← Back to Home
          </button>
        </footer>
      </main>
    </div>
  );
}

const navStyle = {
  color: "#d8f6e6",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 700,
};

const headerStyle = {
  position: "sticky",
  top: 0,
  zIndex: 10,
  padding: "17px clamp(18px, 5vw, 60px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  background: "rgba(2, 35, 26, 0.96)",
  borderBottom: `1px solid ${C.border}`,
};

const mainStyle = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "32px 20px 55px",
};