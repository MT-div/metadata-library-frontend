// src/features/admin/ManageUsersPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C, fonts } from "../../utils/theme";
import { GoldBtn } from "../../components/ui/GoldBtn";
import { OutlineBtn } from "../../components/ui/OutlineBtn";
import { api } from "../../services/api";
import type { UserResponse } from "../../types/user.types";
import {
  Users,
  Shield,
  Search,
  Edit,
  Trash2,
  UserPlus,
  ShieldAlert,
  UserCircle,
  X,
  Save,
  BookOpen,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

// الأدوار المتاحة في النظام
const AVAILABLE_ROLES = ["Admin", "Librarian", "User", "Guest"];

// تمديد الواجهة لتشمل حالة الحذف
interface ExtendedUserResponse extends UserResponse {
  isDeleted?: boolean;
}

export const ManageUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<ExtendedUserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Filters State ──
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "deleted" | "all"
  >("active");

  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  // ── Role Modal State ──
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ExtendedUserResponse | null>(
    null
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    // 👇 استخدام الـ API الذي يجلب الكل بما فيهم المحذوفين
    api
      .get<ExtendedUserResponse[]>("/api/users/withDeleted")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "هل أنت متأكد من حذف هذا المستخدم؟ (سيتم إيقاف الحساب / Soft Delete)"
      )
    )
      return;

    setIsProcessing(id);
    try {
      await api.delete(`/api/users/${id}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isDeleted: true } : u))
      );
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("حدث خطأ أثناء الحذف.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRestore = async (id: number) => {
    if (!confirm("هل تريد استرجاع حساب هذا المستخدم؟")) return;

    setIsProcessing(id);
    try {
      // إرسال { id } في الـ Body كما تعودنا في كل عمليات الـ Undelete
      await api.put(`/api/users/Undelet/${id}`, { id });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isDeleted: false } : u))
      );
    } catch (error) {
      console.error("Error restoring user:", error);
      alert("حدث خطأ أثناء الاسترجاع.");
    } finally {
      setIsProcessing(null);
    }
  };

  const openRoleModal = (user: ExtendedUserResponse) => {
    if (user.isDeleted) return;
    setEditingUser(user);
    setSelectedRoles(user.roles || []);
    setIsRoleModalOpen(true);
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const submitRoleChange = async () => {
    if (!editingUser) return;
    setIsProcessing(editingUser.id);

    try {
      const command = {
        id: editingUser.id,
        roleNames: selectedRoles,
      };

      const res = await api.put(`/api/users/${editingUser.id}/roles`, command);

      if (res.status === 200 || res.status === 204) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id ? { ...u, roles: selectedRoles } : u
          )
        );
        setIsRoleModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating roles:", error);
      alert("حدث خطأ أثناء تحديث الصلاحيات.");
    } finally {
      setIsProcessing(null);
    }
  };

  // ── الإحصائيات (تُحسب للمستخدمين النشطين فقط) ──
  const activeUsers = users.filter((u) => !u.isDeleted);
  const totalUsers = activeUsers.length;
  const adminCount = activeUsers.filter((u) =>
    u.roles?.includes("Admin")
  ).length;
  const librarianCount = activeUsers.filter((u) =>
    u.roles?.includes("Librarian")
  ).length;
  const normalCount = totalUsers - adminCount - librarianCount;

  // ── الفلترة ──
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.externalId.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "all" || (u.roles && u.roles.includes(roleFilter));

    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = !u.isDeleted;
    if (statusFilter === "deleted") matchesStatus = u.isDeleted === true;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div style={{ fontFamily: fonts.sans, color: C.ink }}>
      {/* ── Page header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 28,
          paddingBottom: 24,
          borderBottom: `1.5px solid ${C.goldBorder}`,
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: C.gold,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Admin · Access Control
          </p>
          <h1
            style={{
              fontFamily: fonts.serif,
              fontSize: "1.8rem",
              fontWeight: 800,
              color: C.ink,
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            User Management
          </h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: C.inkSoft }}>
            Manage staff, researchers, system roles, and account statuses.
          </p>
        </div>

        <GoldBtn
          onClick={() => navigate("/admin/users/new")}
          style={{ padding: "10px 20px", fontSize: "0.85rem" }}
        >
          <UserPlus size={16} /> Add New User
        </GoldBtn>
      </div>

      {/* ── Stats row ── */}
      <div
        style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}
      >
        {[
          {
            label: "Active Users",
            value: totalUsers,
            icon: <Users size={22} color={C.goldDark} />,
          },
          {
            label: "Admins",
            value: adminCount,
            icon: <ShieldAlert size={22} color={C.danger} />,
          },
          {
            label: "Librarians",
            value: librarianCount,
            icon: <BookOpen size={22} color={C.gold} />,
          },
          {
            label: "Regular Users",
            value: normalCount,
            icon: <UserCircle size={22} color={C.inkSoft} />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: C.surface,
              border: `1.5px solid ${C.goldBorder}`,
              borderRadius: 14,
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              flex: "1 1 200px",
            }}
          >
            <div
              style={{ background: C.goldLight, padding: 10, borderRadius: 10 }}
            >
              {stat.icon}
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.68rem",
                  color: C.inkSoft,
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: C.ink,
                  fontFamily: fonts.serif,
                }}
              >
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search & Filters ── */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}
      >
        {/* Search */}
        <div
          style={{
            background: C.surface,
            border: `1.5px solid ${C.goldBorder}`,
            borderRadius: 12,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: "1 1 300px",
            maxWidth: 480,
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <Search size={17} color={C.inkSoft} style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: fonts.sans,
              fontSize: "0.88rem",
              color: C.ink,
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: C.inkSoft,
                fontSize: 18,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Role Filter */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              appearance: "none",
              background: C.surface,
              border: `1.5px solid ${C.goldBorder}`,
              borderRadius: 12,
              padding: "10px 36px 10px 14px",
              fontFamily: fonts.sans,
              fontSize: "0.85rem",
              color: C.inkMid,
              outline: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admins Only</option>
            <option value="Librarian">Librarians Only</option>
            <option value="User">Users Only</option>
          </select>
          <span
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: C.inkSoft,
              fontSize: 12,
            }}
          >
            ▾
          </span>
        </div>

        {/* Status Filter */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "deleted")
            }
            style={{
              appearance: "none",
              background: C.surface,
              border: `1.5px solid ${C.goldBorder}`,
              borderRadius: 12,
              padding: "10px 36px 10px 14px",
              fontFamily: fonts.sans,
              fontSize: "0.85rem",
              color: statusFilter === "deleted" ? C.danger : C.inkMid,
              outline: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <option value="active">Active Users</option>
            <option value="deleted">Suspended / Deleted</option>
            <option value="all">Show All</option>
          </select>
          <span
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: C.inkSoft,
              fontSize: 12,
            }}
          >
            ▾
          </span>
        </div>
      </div>

      {/* ── Users Table ── */}
      <div
        style={{
          background: C.surface,
          border: `1.5px solid ${C.goldBorder}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        {loading ? (
          <div
            style={{
              padding: 60,
              textAlign: "center",
              color: C.inkSoft,
              fontStyle: "italic",
            }}
          >
            Loading users data...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <Users
              size={32}
              color={C.gold}
              style={{ opacity: 0.5, margin: "0 auto 12px" }}
            />
            <p
              style={{
                fontFamily: fonts.serif,
                fontSize: "1.1rem",
                color: C.inkMid,
                margin: "0 0 6px",
              }}
            >
              No users found
            </p>
            <p style={{ color: C.inkSoft, fontSize: "0.85rem", margin: 0 }}>
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#fdfaf6",
                    borderBottom: `1.5px solid ${C.goldBorder}`,
                  }}
                >
                  {[
                    "User",
                    "External ID / Email",
                    "Role",
                    "Bio",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "14px 20px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: C.inkSoft,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => {
                  const isAdmin = user.roles?.includes("Admin");
                  const isLibrarian = user.roles?.includes("Librarian");
                  const isDeleted = user.isDeleted;

                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom:
                          idx < filteredUsers.length - 1
                            ? `1px solid ${C.goldBorder}`
                            : "none",
                        transition: "background 0.15s",
                        background: isDeleted ? "#fafafa" : "transparent",
                        opacity: isDeleted ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = isDeleted
                          ? "#f1f1f1"
                          : "#fdfaf6")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = isDeleted
                          ? "#fafafa"
                          : "transparent")
                      }
                    >
                      {/* User Info (Avatar + Name) */}
                      <td
                        style={{
                          padding: "14px 20px",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div style={{ position: "relative" }}>
                          {user.profilePicturePath ? (
                            <img
                              src={
                                api.defaults.baseURL + user.profilePicturePath
                              }
                              alt="avatar"
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: `1px solid ${C.goldBorder}`,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: C.goldLight,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: C.goldDark,
                                fontWeight: "bold",
                              }}
                            >
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {isDeleted && (
                            <div
                              style={{
                                position: "absolute",
                                bottom: -2,
                                right: -2,
                                background: C.surface,
                                borderRadius: "50%",
                              }}
                            >
                              <AlertCircle
                                size={14}
                                color={C.danger}
                                fill={C.dangerBg}
                              />
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            fontFamily: fonts.serif,
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: isDeleted ? C.inkSoft : C.ink,
                            textDecoration: isDeleted ? "line-through" : "none",
                          }}
                        >
                          {user.fullName}
                        </span>
                      </td>

                      {/* Email / ID */}
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.8rem",
                            color: C.inkSoft,
                          }}
                        >
                          {user.externalId}
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: isAdmin
                              ? C.dangerBg
                              : isLibrarian
                              ? C.goldMid
                              : "#f1f5f9",
                            color: isAdmin
                              ? C.danger
                              : isLibrarian
                              ? C.goldDark
                              : "#475569",
                            padding: "4px 10px",
                            borderRadius: 6,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            border: `1px solid ${
                              isAdmin
                                ? "rgba(192,57,43,0.2)"
                                : isLibrarian
                                ? C.goldBorder
                                : "#cbd5e1"
                            }`,
                          }}
                        >
                          {isAdmin ? (
                            <ShieldAlert size={12} />
                          ) : isLibrarian ? (
                            <Shield size={12} />
                          ) : (
                            <UserCircle size={12} />
                          )}
                          {user.roles?.join(", ") || "User"}
                        </span>
                      </td>

                      {/* Bio */}
                      <td style={{ padding: "14px 20px", maxWidth: 200 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            color: C.inkMid,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={user.bio || ""}
                        >
                          {user.bio || "—"}
                        </p>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            title="Manage Roles"
                            onClick={() => openRoleModal(user)}
                            disabled={isDeleted}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: isDeleted ? "#e0e0e0" : C.goldLight,
                              border: "none",
                              color: isDeleted ? "#9e9e9e" : C.goldDark,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: isDeleted ? "not-allowed" : "pointer",
                              transition: "opacity 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              if (!isDeleted)
                                e.currentTarget.style.opacity = "0.75";
                            }}
                            onMouseLeave={(e) => {
                              if (!isDeleted)
                                e.currentTarget.style.opacity = "1";
                            }}
                          >
                            <Shield size={15} />
                          </button>

                          <button
                            title="Edit Profile"
                            disabled={isDeleted}
                            onClick={() => alert("تعديل الملف الشخصي")}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: isDeleted ? "#e0e0e0" : C.goldLight,
                              border: "none",
                              color: isDeleted ? "#9e9e9e" : C.goldDark,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: isDeleted ? "not-allowed" : "pointer",
                              transition: "opacity 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              if (!isDeleted)
                                e.currentTarget.style.opacity = "0.75";
                            }}
                            onMouseLeave={(e) => {
                              if (!isDeleted)
                                e.currentTarget.style.opacity = "1";
                            }}
                          >
                            <Edit size={15} />
                          </button>

                          {isDeleted ? (
                            <button
                              title="Restore User"
                              onClick={() => handleRestore(user.id)}
                              disabled={isProcessing === user.id}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: C.successBg,
                                border: "none",
                                color: C.success,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor:
                                  isProcessing === user.id
                                    ? "not-allowed"
                                    : "pointer",
                                transition: "opacity 0.15s",
                                opacity: isProcessing === user.id ? 0.5 : 1,
                              }}
                            >
                              <RefreshCw size={15} />
                            </button>
                          ) : (
                            <button
                              title="Suspend User"
                              onClick={() => handleDelete(user.id)}
                              disabled={isProcessing === user.id || isAdmin}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: C.dangerBg,
                                border: "none",
                                color: C.danger,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor:
                                  isProcessing === user.id || isAdmin
                                    ? "not-allowed"
                                    : "pointer",
                                transition: "opacity 0.15s",
                                opacity:
                                  isProcessing === user.id || isAdmin ? 0.5 : 1,
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Role Management Modal ── */}
      {isRoleModalOpen && editingUser && !editingUser.isDeleted && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: C.surface,
              borderRadius: 16,
              width: "100%",
              maxWidth: 400,
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: C.goldLight,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: `1.5px solid ${C.goldBorder}`,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: fonts.serif,
                  fontWeight: 700,
                  color: C.ink,
                }}
              >
                Manage Roles: {editingUser.fullName}
              </h3>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: C.inkSoft,
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: "0.85rem",
                  color: C.inkSoft,
                }}
              >
                Select the access roles for this user. A user can have multiple
                roles.
              </p>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {AVAILABLE_ROLES.map((role) => (
                  <label
                    key={role}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                      padding: "10px 14px",
                      border: `1.5px solid ${
                        selectedRoles.includes(role) ? C.gold : C.goldBorder
                      }`,
                      borderRadius: 10,
                      background: selectedRoles.includes(role)
                        ? C.goldLight
                        : C.bg,
                      transition: "all 0.15s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                      style={{ accentColor: C.goldDark, width: 16, height: 16 }}
                    />
                    <span
                      style={{
                        fontWeight: 600,
                        color: C.ink,
                        fontSize: "0.9rem",
                      }}
                    >
                      {role}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: "16px 20px",
                background: C.bg,
                borderTop: `1.5px solid ${C.goldBorder}`,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <OutlineBtn
                onClick={() => setIsRoleModalOpen(false)}
                style={{ padding: "8px 16px" }}
              >
                Cancel
              </OutlineBtn>

              <GoldBtn
                onClick={submitRoleChange}
                disabled={isProcessing === editingUser.id}
                style={{ padding: "8px 16px", fontSize: "0.9rem" }}
              >
                <Save size={16} /> Save Roles
              </GoldBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
