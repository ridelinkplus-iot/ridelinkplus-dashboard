import React, { useEffect, useState } from "react";
import "./OwnerDashboard.css";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import { getDatabase, ref, onValue, update } from "firebase/database";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { Bus, TrendingUp, Users, DollarSign, Activity } from "lucide-react";

interface OwnerData {
  ownerId: string;
  fullName: string;
  email: string;
  mobile: string;
  address: string;
  nic: string;
  permitId: string;
}

interface BusData {
  busId: string;
  routeId: string;
  ownerId: string;
  status?: string;
}

interface TripData {
  day: string;
  trips: number;
  completed: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

const AdvancedOwnerDashboard: React.FC = () => {
  const [ownerData, setOwnerData] = useState<OwnerData | null>(null);
  const [buses, setBuses] = useState<BusData[]>([]);
  useState<any[]>([]);
  const [trips, setTrips] = useState<TripData[]>([]);
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState<string | "all">("all");
  const [selectedDay, setSelectedDay] = useState<string | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<string | "all">("all");
  const [selectedYear, setSelectedYear] = useState<string | "all">("all");
  const [busSearchTerm, setBusSearchTerm] = useState("");
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editableOwnerData, setEditableOwnerData] = useState<OwnerData | null>(
    null
  );
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    if (isEditProfileModalOpen && ownerData) {
      setEditableOwnerData(ownerData);
    }
  }, [isEditProfileModalOpen, ownerData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchDashboardData(user.email);
      } else {
        navigate("/owner-login");
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const fetchDashboardData = (userEmail: string | null) => {
    const db = getDatabase();

    const ownersRef = ref(db, "owners");
    onValue(ownersRef, (snapshot) => {
      const owners = snapshot.val();
      const currentOwner = Object.values(owners || {}).find(
        (owner: any) => owner.email === userEmail
      ) as OwnerData;

      if (currentOwner) {
        setOwnerData(currentOwner);

        const busesRef = ref(db, "buses");
        onValue(busesRef, (busSnapshot) => {
          const allBuses = busSnapshot.val();
          const ownerBuses = Object.values(allBuses || {}).filter(
            (bus: any) => bus.ownerId === currentOwner.ownerId
          ) as BusData[];
          setBuses(ownerBuses);
        });

        const routesRef = ref(db, "routes");
        onValue(routesRef, (routeSnapshot) => {
          routeSnapshot.val();
        });

        const tripsRef = ref(db, "trips");
        onValue(tripsRef, (tripSnapshot) => {
          const allTrips = tripSnapshot.val();
          const ownerTrips = Object.values(allTrips || {}).filter(
            (trip: any) => trip.ownerId === currentOwner.ownerId
          ) as TripData[];
          setTrips(ownerTrips);
        });

        const revenueRef = ref(db, "revenue");
        onValue(revenueRef, (revSnapshot) => {
          const allRevenue = revSnapshot.val();
          const ownerRevenue = Object.values(allRevenue || {}).filter(
            (rev: any) => rev.ownerId === currentOwner.ownerId
          ) as RevenueData[];
          setRevenue(ownerRevenue);
        });

        const passengersRef = ref(db, "passengers");
        onValue(passengersRef, (passSnapshot) => {
          const allPassengers = passSnapshot.val();
          setPassengers(Object.values(allPassengers || {}));
        });

        setLoading(false);
      }
    });
  };

  const handleProfileUpdate = () => {
    if (editableOwnerData) {
      const db = getDatabase();
      const ownerRef = ref(db, `owners/${editableOwnerData.ownerId}`);
      update(ownerRef, editableOwnerData)
        .then(() => {
          setOwnerData(editableOwnerData);
          setIsEditProfileModalOpen(false);
          alert("Profile updated successfully!");
        })
        .catch((error) => {
          console.error("Error updating profile: ", error);
          alert("Failed to update profile.");
        });
    }
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password should be at least 6 characters long.");
      return;
    }

    const user = auth.currentUser;
    if (user && user.email) {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      reauthenticateWithCredential(user, credential)
        .then(() => {
          updatePassword(user, newPassword)
            .then(() => {
              setIsChangePasswordModalOpen(false);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              alert("Password updated successfully!");
            })
            .catch((error) => {
              console.error("Error updating password: ", error);
              alert("Failed to update password.");
            });
        })
        .catch((error) => {
          console.error("Error re-authenticating: ", error);
          alert("Incorrect current password.");
        });
    }
  };

  const calculateStats = () => {
    const totalBuses = buses.length;
    const activeBuses = buses.filter((bus) => bus.status === "active").length;
    const totalTrips = trips.reduce((sum, t) => sum + (t.trips || 0), 0);
    const totalRevenue = revenue.reduce((sum, r) => sum + (r.revenue || 0), 0);
    const avgPassengers = Math.floor(passengers.length / (totalBuses || 1));

    return { totalBuses, activeBuses, totalTrips, totalRevenue, avgPassengers };
  };

  const getBusStatusData = () => {
    const filteredBuses =
      selectedBus === "all"
        ? buses
        : buses.filter((bus) => bus.busId === selectedBus);

    const active = filteredBuses.filter((b) => b.status === "active").length;
    const inactive = filteredBuses.filter(
      (b) => b.status === "inactive"
    ).length;
    const maintenance = filteredBuses.filter(
      (b) => b.status === "maintenance"
    ).length;

    return [
      { name: "Active", value: active, color: "#10b981" },
      { name: "Inactive", value: inactive, color: "#ef4444" },
      { name: "Maintenance", value: maintenance, color: "#f59e0b" }
    ];
  };

  const getFilteredPassengers = () => {
    return passengers.filter((passenger) => {
      const date = new Date(passenger.timestamp);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      if (selectedDay !== "all" && day !== parseInt(selectedDay)) {
        return false;
      }
      if (selectedMonth !== "all" && month !== parseInt(selectedMonth)) {
        return false;
      }
      if (selectedYear !== "all" && year !== parseInt(selectedYear)) {
        return false;
      }
      return true;
    });
  };

  const getRoutePerformance = () => {
    const routeMap: { [key: string]: number } = {};
    buses.forEach((bus) => {
      if (bus.routeId) {
        routeMap[bus.routeId] = (routeMap[bus.routeId] || 0) + 1;
      }
    });

    return Object.entries(routeMap).map(([routeId, count]) => ({
      route: `Route ${routeId}`,
      buses: count,
      passengers: Math.floor(Math.random() * 500) + 100
    }));
  };

  const stats = calculateStats();
  const busStatusData = getBusStatusData();
  const routePerformance = getRoutePerformance();
  const filteredPassengers = getFilteredPassengers();
  const filteredBuses = buses.filter((bus) =>
    bus.busId.toLowerCase().includes(busSearchTerm.toLowerCase())
  );

  const StatCard: React.FC<{
    icon: React.ComponentType<any>;
    title: string;
    value: string | number;
    change?: number;
    color: string;
  }> = ({ icon: Icon, title, value, change, color }) => (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className={`stat-card-icon ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <span
            className={`text-sm font-semibold ${
              change > 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {change > 0 ? "↑" : "↓"} {Math.abs(change)}%
          </span>
        )}
      </div>
      <h3 className="stat-card-title">{title}</h3>
      <p className="stat-card-value">{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-container flex items-center justify-center">
        <div className="text-2xl">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Owner Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome back, {ownerData?.fullName || "Owner"}
            </p>
          </div>
          <div className="header-buttons">
            <button onClick={() => setIsEditProfileModalOpen(true)}>
              Edit Profile
            </button>
            <button onClick={() => setIsChangePasswordModalOpen(true)}>
              Change Password
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            icon={Bus}
            title="Total Buses"
            value={stats.totalBuses}
            change={12}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={Activity}
            title="Active Buses"
            value={stats.activeBuses}
            change={8}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={TrendingUp}
            title="Total Trips"
            value={stats.totalTrips}
            change={15}
            color="from-medium-teal to-dark-teal"
          />
          <StatCard
            icon={DollarSign}
            title="Revenue"
            value={`$${(stats.totalRevenue / 1000).toFixed(1)}K`}
            change={23}
            color="from-yellow-gold to-orange"
          />
          <StatCard
            icon={Users}
            title="Avg Passengers"
            value={stats.avgPassengers}
            change={5}
            color="from-orange to-red"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="charts-grid">
          {/* Revenue Chart */}
          <div className="chart-container">
            <h2 className="chart-title">Revenue & Expenses</h2>
            <ResponsiveContainer
              width="100%"
              height={250}
              className="md:h-[300px]"
            >
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--medium-teal)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--medium-teal)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="colorExpenses"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--red)"
                      stopOpacity={0.8}
                    />
                    <stop offset="95%" stopColor="var(--red)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "14px" }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--medium-teal)"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="var(--red)"
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bus Status */}
          <div className="chart-container">
            <div className="flex justify-between items-center mb-4">
              <h2 className="chart-title">Bus Status Distribution</h2>
              <select
                value={selectedBus}
                onChange={(e) => setSelectedBus(e.target.value)}
                className="modal-input"
              >
                <option value="all">All Buses</option>
                {buses.map((bus) => (
                  <option key={bus.busId} value={bus.busId}>
                    {bus.busId}
                  </option>
                ))}
              </select>
            </div>
            <ResponsiveContainer
              width="100%"
              height={250}
              className="md:h-[300px]"
            >
              <PieChart>
                <Pie
                  data={busStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {busStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: "14px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="charts-grid">
          {/* Passenger Count */}
          <div className="chart-container">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
              <h2 className="chart-title">Passenger Count</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium mr-2">
                  Filter by Date:
                </span>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="modal-input"
                >
                  <option value="all">All Days</option>
                  {[...Array(31)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="modal-input"
                >
                  <option value="all">All Months</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", {
                        month: "long"
                      })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="modal-input"
                >
                  <option value="all">All Years</option>
                  {[...Array(5)].map((_, i) => (
                    <option
                      key={new Date().getFullYear() - i}
                      value={new Date().getFullYear() - i}
                    >
                      {new Date().getFullYear() - i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <ResponsiveContainer
              width="100%"
              height={250}
              className="md:h-[300px]"
            >
              <BarChart data={filteredPassengers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "14px" }} />
                <Bar
                  dataKey="passengers"
                  fill="var(--medium-teal)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Route Performance */}
          <div className="chart-container">
            <h2 className="chart-title">Route Performance</h2>
            <ResponsiveContainer
              width="100%"
              height={250}
              className="md:h-[300px]"
            >
              <LineChart data={routePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="route"
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "14px" }} />
                <Line
                  type="monotone"
                  dataKey="buses"
                  stroke="var(--medium-teal)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="passengers"
                  stroke="var(--yellow-gold)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bus List Table */}
        <div className="table-container">
          <div className="table-header">
            <h2 className="table-title">My Buses</h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search by Bus ID..."
                value={busSearchTerm}
                onChange={(e) => setBusSearchTerm(e.target.value)}
                className="search-input"
              />
              <button
                onClick={() => setBusSearchTerm("")}
                className="header-buttons"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Bus ID</th>
                  <th>Route ID</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuses.length > 0 ? (
                  filteredBuses.map((bus, index) => (
                    <tr key={index}>
                      <td>{bus.busId}</td>
                      <td>{bus.routeId}</td>
                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            bus.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : bus.status === "maintenance"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {bus.status || "Active"}
                        </span>
                      </td>
                      <td>{new Date().toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center">
                      No buses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isEditProfileModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">Edit Profile</h2>
              {editableOwnerData && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editableOwnerData.fullName}
                      onChange={(e) =>
                        setEditableOwnerData({
                          ...editableOwnerData,
                          fullName: e.target.value
                        })
                      }
                      className="modal-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mobile
                    </label>
                    <input
                      type="text"
                      value={editableOwnerData.mobile}
                      onChange={(e) =>
                        setEditableOwnerData({
                          ...editableOwnerData,
                          mobile: e.target.value
                        })
                      }
                      className="modal-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={editableOwnerData.address}
                      onChange={(e) =>
                        setEditableOwnerData({
                          ...editableOwnerData,
                          address: e.target.value
                        })
                      }
                      className="modal-input"
                    />
                  </div>
                </div>
              )}
              <div className="modal-buttons">
                <button
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="header-buttons"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileUpdate}
                  className="header-buttons"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {isChangePasswordModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="modal-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="modal-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="modal-input"
                  />
                </div>
              </div>
              <div className="modal-buttons">
                <button
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="header-buttons"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="header-buttons"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedOwnerDashboard;
