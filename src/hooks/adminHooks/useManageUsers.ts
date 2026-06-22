// src/hooks/useManageUsers.ts
import { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import type { UserResponse } from "../../types/user.types";

interface ExtendedUserResponse extends UserResponse {
  isDeleted?: boolean;
}

export const useManageUsers = () => {
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
    // جلب قائمة الحسابات (مع المحذوفة) عبر الخدمة الموحدة
    authService
      .getUsers(true)
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
      await authService.deleteUser(id);
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
      await authService.restoreUser(id);
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
      const res = await authService.updateUserRoles(
        editingUser.id,
        selectedRoles
      );

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

  // الإحصائيات (تُحسب للمستخدمين النشطين فقط)
  const activeUsers = users.filter((u) => !u.isDeleted);
  const totalUsers = activeUsers.length;
  const adminCount = activeUsers.filter((u) =>
    u.roles?.includes("Admin")
  ).length;
  const librarianCount = activeUsers.filter((u) =>
    u.roles?.includes("Librarian")
  ).length;
  const normalCount = totalUsers - adminCount - librarianCount;

  // منطق الفلترة والبحث المشتق
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

  return {
    users,
    loading,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    isProcessing,
    isRoleModalOpen,
    setIsRoleModalOpen,
    editingUser,
    selectedRoles,
    handleDelete,
    handleRestore,
    openRoleModal,
    toggleRole,
    submitRoleChange,
    activeUsers,
    totalUsers,
    adminCount,
    librarianCount,
    normalCount,
    filteredUsers,
  };
};
