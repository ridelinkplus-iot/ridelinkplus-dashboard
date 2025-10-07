import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";
import logo from "../public/ChatGPT Image Oct 7, 2025, 07_15_54 PM (1).png";

// Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    background:
      "linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #581c87 50%, #1e1b4b 75%, #0f172a 100%)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    overflow: "hidden"
  },
  header: {
    position: "relative",
    background: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(24px)",
    borderBottom: "1px solid rgba(139, 92, 246, 0.3)",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
    zIndex: 100
  },
  headerGradient: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(124, 58, 237, 0.15), rgba(168, 85, 247, 0.15), rgba(192, 38, 211, 0.15))",
    opacity: 0.6
  },
  headerContent: {
    position: "relative",
    padding: "20px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "100%"
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "20px"
  },
  logoIcon: {
    width: "50px",
    height: "50px",
    color: "white",
    borderRadius: "8px",
    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "white",
    margin: 0,
    letterSpacing: "-1px",
    textShadow: "0 2px 10px rgba(139, 92, 246, 0.5)"
  },
  subtitle: {
    fontSize: "13px",
    color: "#c4b5fd",
    margin: "4px 0 0 0",
    fontWeight: "500",
    letterSpacing: "0.5px"
  },
  statsContainer: {
    display: "flex",
    gap: "16px"
  },
  mainContent: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
    position: "relative"
  },
  sidebar: {
    width: "420px",
    background: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(30px)",
    borderRight: "1px solid rgba(139, 92, 246, 0.25)",
    display: "flex",
    flexDirection: "column",
    boxShadow: "4px 0 24px rgba(0, 0, 0, 0.3)",
    position: "relative",
    zIndex: 50
  },
  sidebarGlow: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "1px",
    height: "100%",
    background:
      "linear-gradient(180deg, transparent, rgba(139, 92, 246, 0.5), transparent)",
    pointerEvents: "none"
  },
  sidebarContent: {
    flex: 1,
    overflowY: "auto",
    padding: "28px",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(139, 92, 246, 0.5) rgba(255, 255, 255, 0.05)"
  },
  panel: {
    background: "rgba(30, 27, 75, 0.6)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    padding: "24px",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    boxShadow:
      "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    marginBottom: "24px",
    position: "relative",
    overflow: "hidden"
  },
  panelGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.6), transparent)"
  },
  panelTitle: {
    color: "white",
    fontWeight: "700",
    fontSize: "18px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    letterSpacing: "-0.3px"
  },
  input: {
    width: "100%",
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    borderRadius: "14px",
    padding: "14px 14px 14px 48px",
    color: "white",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    marginBottom: "14px",
    boxSizing: "border-box"
  },
  button: {
    width: "100%",
    background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
    color: "white",
    fontWeight: "700",
    padding: "16px 24px",
    borderRadius: "14px",
    border: "none",
    boxShadow:
      "0 10px 30px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontSize: "15px",
    letterSpacing: "0.3px",
    position: "relative",
    overflow: "hidden"
  },
  busCard: {
    background:
      "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(88, 28, 135, 0.15) 100%)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "18px",
    border: "1px solid rgba(139, 92, 246, 0.25)",
    marginBottom: "14px",
    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden"
  },
  mapContainer: {
    flex: 1,
    position: "relative",
    height: "100%"
  },
  legend: {
    position: "absolute",
    bottom: "32px",
    left: "32px",
    background: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(24px)",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    boxShadow:
      "0 10px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    zIndex: 1000,
    minWidth: "220px"
  },
  inputWrapper: {
    position: "relative",
    marginBottom: "14px"
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#a78bfa",
    pointerEvents: "none",
    zIndex: 1
  },
  quickStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "16px"
  },
  quickStatCard: {
    background: "rgba(139, 92, 246, 0.1)",
    borderRadius: "12px",
    padding: "14px",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    textAlign: "center"
  },
  smallBadge: {
    background: "rgba(16,185,129,0.12)",
    color: "#10b981",
    fontWeight: 700,
    fontSize: "12px",
    padding: "4px 8px",
    borderRadius: "9999px",
    border: "1px solid rgba(16,185,129,0.2)"
  }
};

export default function App() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [highlight, setHighlight] = useState([]); // [[lat, lon], ...] selected segment
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [searchStart, setSearchStart] = useState(null); // {lat, lon}
  const [searchEnd, setSearchEnd] = useState(null); // {lat, lon}
  const [userLoc, setUserLoc] = useState(null); // {lat, lon}
  const [selectedBusId, setSelectedBusId] = useState(null);

  const mapRef = useRef(null);

  useEffect(() => {
    const busesRef = ref(db, "buses");
    const routesRef = ref(db, "routes");
    const unsubs = [
      onValue(busesRef, (snap) => setBuses(Object.values(snap.val() || {}))),
      onValue(routesRef, (snap) => setRoutes(Object.values(snap.val() || {})))
    ];
    return () => unsubs.forEach((u) => typeof u === "function" && u());
  }, []);

  const activeBuses = useMemo(
    () => buses.filter((b) => isNum(b.lat) && isNum(b.lon)),
    [buses]
  );

  const visibleBuses = useMemo(() => {
    if (!selectedRoute) return activeBuses;
    return activeBuses.filter((b) => b.routeId === selectedRoute.routeId);
  }, [activeBuses, selectedRoute]);

  useEffect(() => {
    if (mapRef.current && highlight?.length > 1) {
      const bounds = L.latLngBounds(highlight.map(([lat, lon]) => [lat, lon]));
      mapRef.current.fitBounds(bounds, { padding: [80, 80] });
    }
  }, [highlight]);

  const handleSearch = (payload) => {
    const { start, end, route, segment } = payload;
    setSearchStart(start);
    setSearchEnd(end);
    setSelectedRoute(route);
    setHighlight(segment);
    setSelectedBusId(null);
  };

  const clearSelection = () => {
    setSelectedRoute(null);
    setHighlight([]);
    setSearchStart(null);
    setSearchEnd(null);
    setSelectedBusId(null);
  };

  const myPoint = userLoc || searchStart || null;

  const handleSelectBus = (bus) => {
    setSelectedBusId(bus.busId);
    // Pan slightly towards bus if a route is selected
    if (mapRef.current && isNum(bus.lat) && isNum(bus.lon)) {
      // Do not force fitBounds here to avoid overriding user view too much
      // mapRef.current.panTo([bus.lat, bus.lon]);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerGradient}></div>
        <div style={styles.headerContent}>
          <div style={styles.logoContainer}>
            <img src={logo} alt="Logo" style={styles.logoIcon} />
            <div>
              <h1 style={styles.title}>RideLink</h1>
              <p style={styles.subtitle}>
                Real-time Transit Intelligence Platform
              </p>
            </div>
          </div>

          <div style={styles.statsContainer}>
            <StatBadge
              label="Active Buses"
              value={activeBuses.length}
              icon={<BusIcon />}
              color="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            />
            <StatBadge
              label="Active Routes"
              value={routes.length}
              icon={<RouteIcon />}
              color="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
            />
          </div>
        </div>
      </header>

      <div style={styles.mainContent}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarGlow}></div>
          <div style={styles.sidebarContent}>
            {/* Search Panel */}
            <SearchPanel
              routes={routes}
              onSearch={handleSearch}
              onLocateMe={setUserLoc}
            />

            {/* Route Info Card */}
            {selectedRoute && (
              <div
                style={{
                  ...styles.panel,
                  background:
                    "linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(217, 70, 239, 0.25))",
                  animation: "slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  borderColor: "rgba(217, 70, 239, 0.4)"
                }}
              >
                <div style={styles.panelGlow}></div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px"
                  }}
                >
                  <h3
                    style={{
                      color: "white",
                      fontWeight: "700",
                      fontSize: "18px",
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <svg
                      style={{ width: "20px", height: "20px" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Selected Route
                  </h3>
                  <button
                    onClick={clearSelection}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "white",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      transition: "all 0.3s"
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.1)")
                    }
                  >
                    <svg
                      style={{ width: "18px", height: "18px" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div style={{ fontSize: "15px", color: "#e9d5ff" }}>
                  <InfoRow
                    label="Route ID"
                    value={selectedRoute.routeId}
                    valueColor="#fbbf24"
                  />
                  <InfoRow
                    label="Total Stops"
                    value={selectedRoute.stops?.length || 0}
                    valueColor="#34d399"
                  />
                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap"
                    }}
                  >
                    {searchStart && (
                      <span style={styles.smallBadge}>
                        Start: {searchStart.lat.toFixed(4)},{" "}
                        {searchStart.lon.toFixed(4)}
                      </span>
                    )}
                    {searchEnd && (
                      <span style={styles.smallBadge}>
                        End: {searchEnd.lat.toFixed(4)},{" "}
                        {searchEnd.lon.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats (kept simple; no passengers) */}
            <div style={styles.panel}>
              <div style={styles.panelGlow}></div>
              <h3 style={styles.panelTitle}>
                <svg
                  style={{ width: "20px", height: "20px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Quick Stats
              </h3>
              <div style={styles.quickStats}>
                <div style={styles.quickStatCard}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#a78bfa",
                      marginBottom: "6px",
                      fontWeight: "600"
                    }}
                  >
                    Online Buses
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#fbbf24"
                    }}
                  >
                    {activeBuses.length}
                  </div>
                </div>
                <div style={styles.quickStatCard}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#a78bfa",
                      marginBottom: "6px",
                      fontWeight: "600"
                    }}
                  >
                    Routes
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: "#34d399"
                    }}
                  >
                    {routes.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Bus Feed (filtered to selected route if any) */}
            <div style={styles.panel}>
              <div style={styles.panelGlow}></div>
              <h3 style={styles.panelTitle}>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    background: "#10b981",
                    borderRadius: "50%",
                    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.2)"
                  }}
                ></div>
                {selectedRoute ? "Route Buses" : "Live Bus Feed"}
                <div
                  style={{
                    marginLeft: "auto",
                    fontSize: "13px",
                    color: "#a78bfa",
                    fontWeight: "600"
                  }}
                >
                  {visibleBuses.length} Online
                </div>
              </h3>
              <div
                style={{
                  maxHeight: "420px",
                  overflowY: "auto",
                  paddingRight: "4px"
                }}
              >
                {visibleBuses.length === 0 ? (
                  <EmptyState />
                ) : (
                  visibleBuses.map((bus, i) => {
                    const dist =
                      myPoint && isNum(bus.lat) && isNum(bus.lon)
                        ? getDist(bus.lat, bus.lon, myPoint.lat, myPoint.lon)
                        : null;
                    return (
                      <BusCard
                        key={bus.busId || i}
                        bus={bus}
                        index={i}
                        onSelect={() => handleSelectBus(bus)}
                        isSelected={selectedBusId === bus.busId}
                        distanceMeters={dist}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Map */}
        <main style={styles.mapContainer}>
          <MapContainer
            center={[6.0535, 80.221]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            whenCreated={(map) => (mapRef.current = map)}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* All routes (faint) or only selected route depending on state */}
            {!selectedRoute &&
              routes.map(
                (r, i) =>
                  r.stops && (
                    <Polyline
                      key={r.routeId || i}
                      positions={r.stops.map((s) => [num(s.lat), num(s.lon)])}
                      pathOptions={{
                        color: "#8b5cf6",
                        weight: 3,
                        opacity: 0.3,
                        lineCap: "round",
                        lineJoin: "round"
                      }}
                    />
                  )
              )}

            {selectedRoute && selectedRoute.stops && (
              <Polyline
                positions={selectedRoute.stops.map((s) => [
                  num(s.lat),
                  num(s.lon)
                ])}
                pathOptions={{
                  color: "#8b5cf6",
                  weight: 3,
                  opacity: 0.25,
                  lineCap: "round",
                  lineJoin: "round"
                }}
              />
            )}

            {highlight.length > 0 && (
              <Polyline
                positions={highlight}
                pathOptions={{
                  color: "#ec4899",
                  weight: 7,
                  opacity: 0.9,
                  lineCap: "round",
                  lineJoin: "round"
                }}
              />
            )}

            {/* Start/End markers from search */}
            {searchStart && (
              <CircleMarker
                center={[searchStart.lat, searchStart.lon]}
                radius={8}
                pathOptions={{
                  color: "#10b981",
                  fillColor: "#10b981",
                  fillOpacity: 0.9
                }}
              >
                <Popup>
                  <strong>Start</strong>
                  <div style={{ fontSize: 12, color: "#555" }}>
                    {searchStart.lat.toFixed(5)}, {searchStart.lon.toFixed(5)}
                  </div>
                </Popup>
              </CircleMarker>
            )}
            {searchEnd && (
              <CircleMarker
                center={[searchEnd.lat, searchEnd.lon]}
                radius={8}
                pathOptions={{
                  color: "#f59e0b",
                  fillColor: "#f59e0b",
                  fillOpacity: 0.9
                }}
              >
                <Popup>
                  <strong>Destination</strong>
                  <div style={{ fontSize: 12, color: "#555" }}>
                    {searchEnd.lat.toFixed(5)}, {searchEnd.lon.toFixed(5)}
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* My location marker (browser geolocation) */}
            {userLoc && (
              <CircleMarker
                center={[userLoc.lat, userLoc.lon]}
                radius={10}
                pathOptions={{
                  color: "#22d3ee",
                  fillColor: "#22d3ee",
                  fillOpacity: 0.6
                }}
              >
                <Popup>
                  <strong>My Location</strong>
                  <div style={{ fontSize: 12, color: "#555" }}>
                    {userLoc.lat.toFixed(5)}, {userLoc.lon.toFixed(5)}
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* Bus markers (filtered) */}
            {visibleBuses.map((b, i) => {
              const key = b.busId || `${b.routeId}-${i}`;
              const dist =
                myPoint && isNum(b.lat) && isNum(b.lon)
                  ? getDist(b.lat, b.lon, myPoint.lat, myPoint.lon)
                  : null;
              return (
                <Marker
                  key={key}
                  position={[b.lat, b.lon]}
                  eventHandlers={{
                    click: () => handleSelectBus(b)
                  }}
                >
                  <Popup>
                    <div style={{ padding: "12px", minWidth: "220px" }}>
                      <div
                        style={{
                          fontWeight: "bold",
                          color: "#8b5cf6",
                          fontSize: "18px",
                          marginBottom: "10px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        <svg
                          style={{ width: "20px", height: "20px" }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                          />
                        </svg>
                        {b.busId || "Bus"}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#374151",
                          lineHeight: 1.6
                        }}
                      >
                        <div
                          style={{
                            marginBottom: "8px",
                            padding: "8px",
                            background: "#f3f4f6",
                            borderRadius: "6px"
                          }}
                        >
                          <span style={{ color: "#6b7280", fontWeight: 600 }}>
                            Route:{" "}
                          </span>
                          <span style={{ fontWeight: 700, color: "#8b5cf6" }}>
                            {b.routeId}
                          </span>
                        </div>

                        {myPoint && (
                          <div
                            style={{
                              padding: "8px",
                              background: "#ecfeff",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              gap: 8
                            }}
                          >
                            <DistanceIcon />
                            <div style={{ fontWeight: 700, color: "#06b6d4" }}>
                              {formatDistance(dist)} from you
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Legend */}
          <div style={styles.legend}>
            <h4
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: "16px",
                margin: "0 0 16px 0",
                letterSpacing: "-0.3px"
              }}
            >
              Map Legend
            </h4>
            <div style={{ fontSize: "13px" }}>
              {!selectedRoute && (
                <LegendRow color="#8b5cf6" label="Bus Routes" translucent />
              )}
              <LegendRow color="#ec4899" label="Selected Segment" />
              <LegendRow color="#10b981" label="Start" round />
              <LegendRow color="#f59e0b" label="Destination" round />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: 12
                }}
              >
                <img
                  src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png"
                  style={{ width: "16px", height: "24px" }}
                  alt="marker"
                />
                <span style={{ color: "#e9d5ff", fontWeight: "500" }}>
                  Bus (filtered)
                </span>
              </div>
              <LegendRow color="#22d3ee" label="My Location" round />
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        input:focus {
          border-color: rgba(139, 92, 246, 0.8) !important;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15), 0 8px 16px rgba(139, 92, 246, 0.2) !important;
        }
        input::placeholder {
          color: rgba(167, 139, 250, 0.5);
        }
        button:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 16px 40px rgba(139, 92, 246, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2) inset !important;
        }
        button:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        *::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
          border-radius: 10px;
        }
        *::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
          border: 2px solid rgba(15, 23, 42, 0.4);
        }
        *::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
}

/* Icons */
function BusIcon() {
  return (
    <svg
      style={{ width: 20, height: 20 }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
      />
    </svg>
  );
}
function RouteIcon() {
  return (
    <svg
      style={{ width: 20, height: 20 }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
    </svg>
  );
}
function DistanceIcon() {
  return (
    <svg
      style={{ width: 18, height: 18, color: "#06b6d4" }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 8v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8"
      />
    </svg>
  );
}

/* Small UI helpers */
function StatBadge({ label, value, icon, color }) {
  return (
    <div
      style={{
        background: color,
        borderRadius: "16px",
        padding: "16px 24px",
        boxShadow:
          "0 8px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        cursor: "pointer",
        minWidth: "160px",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
        e.currentTarget.style.boxShadow =
          "0 16px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow =
          "0 8px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "8px"
        }}
      >
        <div style={{ color: "rgba(255,255,255,0.9)" }}>{icon}</div>
        <div
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "12px",
            fontWeight: "600",
            letterSpacing: "0.5px",
            textTransform: "uppercase"
          }}
        >
          {label}
        </div>
      </div>
      <div
        style={{
          color: "white",
          fontSize: "28px",
          fontWeight: "900",
          letterSpacing: "-0.5px",
          textShadow: "0 2px 4px rgba(0,0,0,0.2)"
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueColor }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "10px",
        padding: "10px",
        background: "rgba(0,0,0,0.2)",
        borderRadius: "8px"
      }}
    >
      <span style={{ fontWeight: "500" }}>{label}:</span>
      <span style={{ fontWeight: "700", color: valueColor }}>{value}</span>
    </div>
  );
}

function LegendRow({ color, label, translucent, round }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "12px"
      }}
    >
      <div
        style={{
          width: round ? 12 : 24,
          height: round ? 12 : 4,
          background: color,
          opacity: translucent ? 0.5 : 1,
          borderRadius: round ? "50%" : "2px"
        }}
      ></div>
      <span style={{ color: "#e9d5ff", fontWeight: "500" }}>{label}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <svg
        style={{
          width: "64px",
          height: "64px",
          color: "#4c1d95",
          margin: "0 auto 16px"
        }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <p style={{ color: "#a78bfa", fontSize: "15px", margin: 0 }}>
        No active buses
      </p>
      <p style={{ color: "#6b7280", fontSize: "13px", margin: "8px 0 0 0" }}>
        Waiting for GPS signals...
      </p>
    </div>
  );
}

function BusCard({ bus, index, onSelect, isSelected, distanceMeters }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      onClick={onSelect}
      style={{
        ...styles.busCard,
        transform: isHovered
          ? "translateX(8px) scale(1.02)"
          : "translateX(0) scale(1)",
        boxShadow: isHovered
          ? "0 12px 32px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
          : "0 4px 12px rgba(0, 0, 0, 0.2)",
        borderColor: isSelected
          ? "rgba(6, 182, 212, 0.8)"
          : isHovered
          ? "rgba(139, 92, 246, 0.5)"
          : "rgba(139, 92, 246, 0.25)",
        outline: isSelected ? "2px solid rgba(6,182,212,0.5)" : "none",
        animationDelay: `${index * 50}ms`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)"
        }}
      ></div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 20px rgba(139, 92, 246, 0.5)",
              transition: "transform 0.3s"
            }}
          >
            <svg
              style={{ width: "24px", height: "24px", color: "white" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
          </div>
          <div>
            <div
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: "16px",
                letterSpacing: "-0.3px"
              }}
            >
              {bus.busId}
            </div>
            <div
              style={{
                color: "#c4b5fd",
                fontSize: "13px",
                fontWeight: "500",
                marginTop: "2px"
              }}
            >
              Route {bus.routeId}
            </div>
          </div>
        </div>
        <div
          style={{
            width: "10px",
            height: "10px",
            background: "#10b981",
            borderRadius: "50%",
            boxShadow:
              "0 0 12px rgba(16, 185, 129, 0.8), 0 0 0 3px rgba(16, 185, 129, 0.2)",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          }}
        ></div>
      </div>

      {isFiniteNumber(distanceMeters) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            background: "rgba(6,182,212,0.12)",
            borderRadius: "10px",
            border: "1px solid rgba(6,182,212,0.3)"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#67e8f9",
              fontWeight: "600"
            }}
          >
            <DistanceIcon />
            <span>Distance to you</span>
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "800",
              color: "#22d3ee",
              textShadow: "0 2px 8px rgba(34, 211, 238, 0.4)"
            }}
          >
            {formatDistance(distanceMeters)}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchPanel({ routes, onSearch, onLocateMe }) {
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const [loading, setLoading] = useState(false);
  const [usingMyLoc, setUsingMyLoc] = useState(false);
  const [myLoc, setMyLoc] = useState(null); // {lat, lon}

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setMyLoc(loc);
        setUsingMyLoc(true);
        onLocateMe && onLocateMe(loc);
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Unable to access your location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  };

  const search = async () => {
    if ((!startText && !usingMyLoc) || !endText) {
      alert("Please enter both start and destination (or use My Location).");
      return;
    }
    setLoading(true);
    try {
      const start = usingMyLoc && myLoc ? myLoc : await geocodeSafe(startText);
      const end = await geocodeSafe(endText);

      if (!start || !end) {
        alert(
          "Could not resolve one or both locations. Please refine your input."
        );
        setLoading(false);
        return;
      }

      const result = findBestRouteSegment(routes || [], start, end);
      if (!result) {
        alert("No matching route found for the given start and destination.");
        setLoading(false);
        return;
      }

      const { route, segment } = result;
      onSearch({ start, end, route, segment });
    } catch (e) {
      console.error(e);
      alert("Search failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.panel}>
      <div style={styles.panelGlow}></div>
      <h2 style={styles.panelTitle}>
        <svg
          style={{ width: 22, height: 22 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        Search Route
      </h2>

      <div style={styles.inputWrapper}>
        <div style={styles.inputIcon}>
          <svg
            style={{ width: 22, height: 22 }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <input
          style={styles.input}
          placeholder={
            usingMyLoc ? "Using My Location" : "Enter start location"
          }
          value={usingMyLoc ? "" : startText}
          onChange={(e) => {
            setStartText(e.target.value);
            setUsingMyLoc(false);
          }}
          disabled={usingMyLoc}
        />
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            type="button"
            onClick={handleLocateMe}
            style={{
              ...styles.button,
              padding: "10px 12px",
              width: "auto",
              fontSize: 13
            }}
          >
            <svg
              style={{ width: 18, height: 18 }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Use My Location
          </button>
          {usingMyLoc && (
            <span style={{ ...styles.smallBadge, alignSelf: "center" }}>
              Location ready
            </span>
          )}
        </div>
      </div>

      <div style={styles.inputWrapper}>
        <div style={styles.inputIcon}>
          <svg
            style={{ width: 22, height: 22 }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
        <input
          style={styles.input}
          placeholder="Enter destination"
          value={endText}
          onChange={(e) => setEndText(e.target.value)}
        />
      </div>

      <button onClick={search} disabled={loading} style={styles.button}>
        {loading ? (
          <>
            <svg
              style={{
                width: 22,
                height: 22,
                animation: "spin 1s linear infinite"
              }}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Searching…
          </>
        ) : (
          <>
            <svg
              style={{ width: 22, height: 22 }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Find Route
          </>
        )}
      </button>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* Search logic helpers */
function findBestRouteSegment(routes, start, end) {
  if (!routes?.length) return null;
  const NEAR_KM = 1.0; // allow up to 1km from stops
  let best = null;

  for (const route of routes) {
    const stops = (route.stops || [])
      .map((s) => ({ lat: num(s.lat), lon: num(s.lon) }))
      .filter((s) => isNum(s.lat) && isNum(s.lon));
    if (stops.length < 2) continue;

    const a = nearestStopIndex(stops, start);
    const b = nearestStopIndex(stops, end);

    if (!a || !b) continue;
    if (a.index === b.index) continue;
    if (a.dist > NEAR_KM * 1000 || b.dist > NEAR_KM * 1000) continue;

    // Prefer the shorter segment between a.index and b.index (non-circular assumption: keep natural order)
    const i1 = Math.min(a.index, b.index);
    const i2 = Math.max(a.index, b.index);
    const segment = stops.slice(i1, i2 + 1).map((p) => [p.lat, p.lon]);

    // Score: closeness to stops + segment length
    const segLen = polylineLengthMeters(segment);
    const score = a.dist + b.dist + segLen * 0.001; // small weight to prefer shorter segment

    if (!best || score < best.score) {
      best = { route, segment, score };
    }
  }

  return best;
}

function nearestStopIndex(stops, loc) {
  if (!stops?.length) return null;
  let bestIdx = -1;
  let bestDist = Infinity;
  stops.forEach((s, i) => {
    const d = getDist(s.lat, s.lon, loc.lat, loc.lon);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  });
  return bestIdx >= 0 ? { index: bestIdx, dist: bestDist } : null;
}

function polylineLengthMeters(latlngs) {
  if (!latlngs || latlngs.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < latlngs.length; i++) {
    const [aLat, aLon] = latlngs[i - 1];
    const [bLat, bLon] = latlngs[i];
    sum += getDist(aLat, aLon, bLat, bLon);
  }
  return sum;
}

/* Geo helpers */
const getDist = (a, b, c, d) => {
  const R = 6371e3;
  const φ1 = (a * Math.PI) / 180,
    φ2 = (c * Math.PI) / 180,
    Δφ = ((c - a) * Math.PI) / 180,
    Δλ = ((d - b) * Math.PI) / 180;
  const h =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

async function geocodeSafe(q) {
  if (!q || !q.trim()) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&q=${encodeURIComponent(
    q.trim()
  )}`;
  const r = await fetch(url, {
    headers: {
      "Accept-Language": "en"
    }
  });
  if (!r.ok) return null;
  const d = await r.json();
  if (!Array.isArray(d) || d.length === 0) return null;
  const lat = parseFloat(d[0].lat);
  const lon = parseFloat(d[0].lon);
  if (!isFiniteNumber(lat) || !isFiniteNumber(lon)) return null;
  return { lat, lon };
}

function formatDistance(m) {
  if (!isFiniteNumber(m)) return "-";
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  return `${Math.round(m)} m`;
}

function num(v) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return n;
}
function isNum(v) {
  return typeof v === "number" && isFinite(v);
}
function isFiniteNumber(v) {
  return typeof v === "number" && isFinite(v);
}
