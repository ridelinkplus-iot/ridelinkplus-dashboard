import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import CRUD from "../CRUD";
import {
  LineChart,
  Line,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Bus,
  Building2,
  Activity,
  AlertCircle,
  TrendingUp,
  Calendar,
  Search
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  userType: "passenger" | "owner";
  createdAt: string;
  status: "active" | "inactive";
}

interface Owner {
  id: string;
  ownerId: string;
  fullName: string;
  email: string;
  mobile?: string;
  createdAt: string;
  status: "active" | "inactive";
  busesOwned?: number;
}

interface Bus {
  id: string;
  busId: string;
  routeId: string;
  ownerId: string;
  lat?: number;
  lon?: number;
  status: "active" | "inactive" | "maintenance";
  createdAt?: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  getAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "buses" | "owners" | "manage"
  >("overview");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/admin-login");
    }
  }, [navigate]);

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Fetch Users
    const usersRef = ref(db, "users");
    const unsubUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const usersArray = data
        ? Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
            status: data[key].status || "active"
          }))
        : [];
      setUsers(usersArray);
    });
    unsubscribers.push(unsubUsers);

    // Fetch Owners
    const ownersRef = ref(db, "owners");
    const unsubOwners = onValue(ownersRef, (snapshot) => {
      const data = snapshot.val();
      const ownersArray = data
        ? Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
            status: data[key].status || "active"
          }))
        : [];
      setOwners(ownersArray);
    });
    unsubscribers.push(unsubOwners);

    // Fetch Buses
    const busesRef = ref(db, "buses");
    const unsubBuses = onValue(busesRef, (snapshot) => {
      const data = snapshot.val();
      const busesArray = data
        ? Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
            status: data[key].status || "active"
          }))
        : [];
      setBuses(busesArray);
      setLoading(false);
    });
    unsubscribers.push(unsubBuses);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  // Calculate comprehensive statistics
  const stats = {
    totalOwners: owners.length,
    totalBuses: buses.length,
    activeBuses: buses.filter((b) => b.status === "active").length,
    inactiveBuses: buses.filter((b) => b.status === "inactive").length,
    maintenanceBuses: buses.filter((b) => b.status === "maintenance").length,
    activeOwners: owners.filter((o) => o.status === "active").length
  };

  // Prepare chart data
  const busStatusData = [
    { name: "Active", value: stats.activeBuses, color: "#10B981" },
    { name: "Maintenance", value: stats.maintenanceBuses, color: "#F59E0B" },
    { name: "Inactive", value: stats.inactiveBuses, color: "#EF4444" }
  ];

  const monthlyData = generateMonthlyData(users, buses);

  const filteredBuses = buses.filter((bus) => {
    if (!searchTerm) return true;
    return (
      (bus.busId &&
        bus.busId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bus.routeId &&
        bus.routeId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const filteredOwners = owners.filter(
    (owner) =>
      (owner.fullName &&
        owner.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (owner.email &&
        owner.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const StatCard: React.FC<{
    icon: React.ComponentType<any>;
    title: string;
    value: string | number;
    gradient: string;
    subtitle?: string;
  }> = ({ icon: Icon, title, value, gradient, subtitle }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {subtitle && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-600">{subtitle}</p>
          </div>
        )}
      </div>
      <div
        className={`h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
      ></div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-12 h-12 text-[#0B7285] animate-spin" />
          <p className="text-lg font-medium text-gray-600">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#0B7285] to-[#0d8fa3] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-[#a8e6f0] text-sm font-medium">
                Welcome back, {localStorage.getItem("userName") || "Admin"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-xs text-white/80">Last updated</p>
                <p className="text-sm font-semibold text-white">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === "overview"
                  ? "text-[#0B7285] bg-[#0B7285]/5"
                  : "text-gray-600 hover:text-[#0B7285] hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <span className="flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Overview
              </span>
              {activeTab === "overview" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0B7285]"></div>
              )}
            </button>
            <button
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === "owners"
                  ? "text-[#0B7285] bg-[#0B7285]/5"
                  : "text-gray-600 hover:text-[#0B7285] hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("owners")}
            >
              <span className="flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4" />
                Owners ({stats.totalOwners})
              </span>
              {activeTab === "owners" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0B7285]"></div>
              )}
            </button>
            <button
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === "buses"
                  ? "text-[#0B7285] bg-[#0B7285]/5"
                  : "text-gray-600 hover:text-[#0B7285] hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("buses")}
            >
              <span className="flex items-center justify-center gap-2">
                <Bus className="w-4 h-4" />
                Buses ({stats.totalBuses})
              </span>
              {activeTab === "buses" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0B7285]"></div>
              )}
            </button>
            <button
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === "manage"
                  ? "text-[#0B7285] bg-[#0B7285]/5"
                  : "text-gray-600 hover:text-[#0B7285] hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("manage")}
            >
              <span className="flex items-center justify-center gap-2">
                <Activity className="w-4 h-4" />
                Manage
              </span>
              {activeTab === "manage" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0B7285]"></div>
              )}
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                icon={Building2}
                title="Total Owners"
                value={stats.totalOwners}
                gradient="from-[#0B7285] to-[#0d8fa3]"
                subtitle={`${stats.activeOwners} active owners`}
              />
              <StatCard
                icon={Bus}
                title="Total Buses"
                value={stats.totalBuses}
                gradient="from-[#F59E0B] to-[#ff8800]"
                subtitle={`${stats.activeBuses} buses currently active`}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bus Status Chart */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Bus Status Overview
                  </h2>
                  <div className="p-2 bg-[#0B7285]/10 rounded-lg">
                    <Bus className="w-5 h-5 text-[#0B7285]" />
                  </div>
                </div>
                {busStatusData.some((d) => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={busStatusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {busStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                    <AlertCircle className="w-12 h-12 mb-3" />
                    <p className="text-sm font-medium">No bus data available</p>
                  </div>
                )}
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Bus className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Active Buses
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.activeBuses}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-yellow-500 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Maintenance
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.maintenanceBuses}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-red-500 rounded-lg">
                      <Bus className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Inactive
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.inactiveBuses}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#0B7285]/10 to-[#0B7285]/20 rounded-xl p-6 border border-[#0B7285]/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-[#0B7285] rounded-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Active Owners
                  </p>
                  <p className="text-3xl font-bold text-[#0B7285]">
                    {stats.activeOwners}
                  </p>
                </div>
              </div>
            </div>

            {/* Growth Trends Chart */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Growth Trends
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Last 6 months performance
                  </p>
                </div>
                <div className="p-2 bg-[#0B7285]/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-[#0B7285]" />
                </div>
              </div>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Line
                      type="monotone"
                      dataKey="buses"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: "#10B981", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="owners"
                      stroke="#0B7285"
                      strokeWidth={3}
                      dot={{ fill: "#0B7285", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                  <Calendar className="w-12 h-12 mb-3" />
                  <p className="text-sm font-medium">No trend data available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Owners Tab */}
        {activeTab === "owners" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    All Owners
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage and monitor bus owners
                  </p>
                </div>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7285] focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>
              </div>
            </div>

            {filteredOwners.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Buses
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOwners.map((owner) => {
                      const ownerBuses = buses.filter(
                        (b) => b.ownerId === owner.ownerId
                      ).length;
                      return (
                        <tr
                          key={owner.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#0B7285] to-[#0d8fa3] rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {owner.fullName?.charAt(0).toUpperCase() ||
                                    "?"}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {owner.fullName || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {owner.email || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {owner.mobile || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                owner.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {owner.status || "active"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Bus className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">
                                {ownerBuses}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {owner.createdAt
                              ? new Date(owner.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                <Building2 className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">No owners found</p>
                <p className="text-sm mt-2">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>
        )}

        {/* Buses Tab */}
        {activeTab === "buses" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    All Buses
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Monitor fleet status and location
                  </p>
                </div>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Bus ID or Route..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7285] focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>
              </div>
            </div>

            {filteredBuses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Bus ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Route ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBuses.map((bus) => {
                      const owner = owners.find(
                        (o) => o.ownerId === bus.ownerId
                      );
                      return (
                        <tr
                          key={bus.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#F59E0B] to-[#ff8800] rounded-lg flex items-center justify-center">
                                <Bus className="w-5 h-5 text-white" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {bus.busId || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {bus.routeId || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {owner?.fullName || "Unknown"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {bus.lat && bus.lon ? (
                                <div className="flex flex-col">
                                  <span className="font-mono text-xs">
                                    Lat: {bus.lat.toFixed(4)}
                                  </span>
                                  <span className="font-mono text-xs">
                                    Lon: {bus.lon.toFixed(4)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">
                                  No location
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                bus.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : bus.status === "maintenance"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {bus.status || "active"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-20 flex flex-col items-center justify-center text-gray-400">
                <Bus className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">No buses found</p>
                <p className="text-sm mt-2">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === "manage" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Data Management
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Create, update, and delete records
              </p>
            </div>
            <CRUD />
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to generate monthly data
function generateMonthlyData(users: User[], buses: Bus[]) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const currentDate = new Date();

  return months.map((month, index) => {
    const monthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - (5 - index),
      1
    );
    const nextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - (5 - index) + 1,
      1
    );

    const busesCount = buses.filter((b) => {
      if (!b.createdAt) return false;
      const date = new Date(b.createdAt);
      return date >= monthDate && date < nextMonth;
    }).length;

    const ownersCount = users.filter((u) => {
      if (!u.createdAt || u.userType !== "owner") return false;
      const date = new Date(u.createdAt);
      return date >= monthDate && date < nextMonth;
    }).length;

    return {
      month,
      buses: busesCount,
      owners: ownersCount
    };
  });
}

export default AdminDashboard;
