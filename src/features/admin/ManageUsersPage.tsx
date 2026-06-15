import { useState, useEffect } from "react";
import { api } from "../../services/api";
import type { UserResponse } from "../../types/metadata";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

const C = {
  bg: "#F7F3ED",
  surface: "#FFFFFF",
  gold: "#c8a96e",
  goldLight: "#f0e8d8",
  goldMid: "rgba(200,169,110,0.15)",
  goldBorder: "rgba(200,169,110,0.28)",
  goldDark: "#b8965a",
  ink: "#1a1208",
  inkMid: "#5c4a30",
  inkSoft: "#9a8060",
  danger: "#c0392b",
  dangerBg: "#fdf0ee",
};
const serif = "'Georgia','Times New Roman',serif";
const sans = "'Poppins',system-ui,sans-serif";

// الأدوار المتاحة في النظام (طابقها مع C# SystemRoles)
const AVAILABLE_ROLES = ["Admin", "Librarian", "User", "Guest"];

export const ManageUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  // ── حالات النافذة المنبثقة لتعديل الأدوار ──
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    api
      .get<UserResponse[]>("/api/users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "هل أنت متأكد من حذف هذا المستخدم نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
      )
    )
      return;

    setIsProcessing(id);
    try {
      await api.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("حدث خطأ أثناء الحذف.");
    } finally {
      setIsProcessing(null);
    }
  };

  // فتح نافذة تعديل الأدوار
  const openRoleModal = (user: UserResponse) => {
    setEditingUser(user);
    setSelectedRoles(user.roles || []);
    setIsRoleModalOpen(true);
  };

  // تغيير حالة الـ Checkbox للأدوار
  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  // إرسال طلب PUT لتحديث الأدوار
  const submitRoleChange = async () => {
    if (!editingUser) return;
    setIsProcessing(editingUser.id);

    try {
      // بناء ה- Command ليتطابق مع الـ Swagger تماماً
      const command = {
        id: editingUser.id,
        roleNames: selectedRoles,
      };

      const res = await api.put(`/api/users/${editingUser.id}/roles`, command);

      if (res.status === 200 || res.status === 204) {
        // تحديث حالة الواجهة لتظهر الأدوار الجديدة فوراً
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

  // إحصائيات سريعة
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.roles?.includes("Admin")).length;
  const librarianCount = users.filter((u) =>
    u.roles?.includes("Librarian")
  ).length;
  const normalCount = totalUsers - adminCount - librarianCount;

  // تطبيق الفلاتر
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.externalId.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "all" || (u.roles && u.roles.includes(roleFilter));

    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ fontFamily: sans, color: C.ink }}>
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
              fontFamily: serif,
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
            Manage staff, researchers, and system roles.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/users/new")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: C.gold,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 20px",
            fontFamily: sans,
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "background 0.15s",
            boxShadow: "0 2px 10px rgba(200,169,110,0.3)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.goldDark)}
          onMouseLeave={(e) => (e.currentTarget.style.background = C.gold)}
        >
          <UserPlus size={16} /> Add New User
        </button>
      </div>

      {/* ── Stats row ── */}
      <div
        style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}
      >
        {[
          {
            label: "Total Users",
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
                  fontFamily: serif,
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
        style={{
          background: C.surface,
          border: `1.5px solid ${C.goldBorder}`,
          borderRadius: 14,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
          boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
        }}
      >
        <Search size={18} color={C.inkSoft} />
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
            fontFamily: sans,
            fontSize: "0.9rem",
            color: C.ink,
          }}
        />
        <div
          style={{
            width: "1px",
            height: "24px",
            background: C.goldBorder,
            margin: "0 8px",
          }}
        ></div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: sans,
            fontSize: "0.85rem",
            color: C.inkMid,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <option value="all">All Roles</option>
          <option value="Admin">Admins Only</option>
          <option value="Librarian">Librarians Only</option>
          <option value="User">Users Only</option>
        </select>
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
                fontFamily: serif,
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

                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom:
                          idx < filteredUsers.length - 1
                            ? `1px solid ${C.goldBorder}`
                            : "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fdfaf6")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
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
                        {user.profilePicturePath ? (
                          <img
                            src={api.defaults.baseURL + user.profilePicturePath}
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
                        <span
                          style={{
                            fontFamily: serif,
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: C.ink,
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
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: C.goldLight,
                              border: "none",
                              color: C.goldDark,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "opacity 0.15s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.opacity = "0.75")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.opacity = "1")
                            }
                          >
                            <Shield size={15} />
                          </button>

                          <button
                            title="Edit Profile"
                            onClick={() =>
                              alert(
                                "تعديل الملف الشخصي (يحتاج Endpoint PUT /api/users/{id})"
                              )
                            }
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: C.goldLight,
                              border: "none",
                              color: C.goldDark,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "opacity 0.15s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.opacity = "0.75")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.opacity = "1")
                            }
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            title="Delete User"
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
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.opacity = "0.75")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.opacity = "1")
                            }
                          >
                            <Trash2 size={15} />
                          </button>
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
      {isRoleModalOpen && editingUser && (
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
                  fontFamily: serif,
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
              <button
                onClick={() => setIsRoleModalOpen(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "transparent",
                  border: `1.5px solid ${C.goldBorder}`,
                  color: C.inkMid,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitRoleChange}
                disabled={isProcessing === editingUser.id}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: C.gold,
                  border: "none",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Save size={16} /> Save Roles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
