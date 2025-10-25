import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  RotateCw,
  AlertCircle,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

interface User {
  uid: string;
  email?: string;
  provider?: string;
  createdAt?: string;
  lastSignIn?: string;
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "http://127.0.0.1:5001/ridelink-26c32/us-central1/getUsers"
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch users");
      }

      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.provider?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const googleUsersCount = useMemo(
    () => users.filter((u) => u.provider === "google.com").length,
    [users]
  );
  const emailPasswordUsersCount = useMemo(
    () => users.filter((u) => u.provider === "password").length,
    [users]
  );

  const handleAddUser = async () => {
    const email = prompt("Enter email:");
    const password = prompt("Enter password:");
    const displayName = prompt("Enter display name:");

    if (email && password && displayName) {
      try {
        await fetch(
          "http://127.0.0.1:5001/ridelink-26c32/us-central1/createUser",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, displayName })
          }
        );
        fetchUsers();
      } catch (error) {
        console.error("Error creating user:", error);
        setError("Failed to create user.");
      }
    }
  };

  const handleEditUser = async (uid: string) => {
    const displayName = prompt("Enter new display name:");
    if (displayName) {
      try {
        await fetch(
          "http://127.0.0.1:5001/ridelink-26c32/us-central1/updateUser",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid, displayName })
          }
        );
        fetchUsers();
      } catch (error) {
        console.error("Error updating user:", error);
        setError("Failed to update user.");
      }
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await fetch(
          "http://127.0.0.1:5001/ridelink-26c32/us-central1/deleteUser",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid })
          }
        );
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        setError("Failed to delete user.");
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-64 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  // Main UI
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddUser}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B7285] text-white hover:bg-[#085a6b] transition"
            >
              <Plus className="w-5 h-5" />
              Add User
            </button>
            <button
              onClick={fetchUsers}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              title="Refresh list"
            >
              <RotateCw className="w-5 h-5 text-gray-600" />
            </button>

            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B7285] focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              Google Sign-In Users
            </p>
            <p className="text-2xl font-bold text-blue-900">
              {googleUsersCount}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              Email/Password Users
            </p>
            <p className="text-2xl font-bold text-green-900">
              {emailPasswordUsersCount}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Last Sign-In
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((u) => (
              <tr key={u.uid} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {u.email || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {u.provider || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {u.createdAt || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {u.lastSignIn || "—"}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditUser(u.uid)}
                      className="p-2 text-gray-500 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.uid)}
                      className="p-2 text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersList;
