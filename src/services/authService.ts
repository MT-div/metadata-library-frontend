// src/services/authService.ts
import { api } from "./api";
import type { LoginRequest, AuthResponse } from "../types/auth";
import type { UserResponse } from "../types/user.types";

export const authService = {
  login: (request: LoginRequest) => {
    return api.post<AuthResponse>("/api/Auth/login", request);
  },

  register: (request: unknown) => {
    return api.post<AuthResponse>("/api/Auth/register", request);
  },

  loginWithGoogle: (idToken: string) => {
    return api.post<AuthResponse>("/api/Auth/login-google", { idToken });
  },

  // ── Users Administration ──
  getUsers: (withDeleted = false) => {
    const url = withDeleted ? "/api/users/withDeleted" : "/api/users";
    return api.get<UserResponse[]>(url);
  },

  deleteUser: (id: number) => {
    return api.delete(`/api/users/${id}`);
  },

  restoreUser: (id: number) => {
    return api.put(`/api/users/Undelete/${id}`, { id });
  },

  updateUserRoles: (userId: number, roles: string[]) => {
    return api.put(`/api/users/${userId}/roles`, {
      id: userId,
      roleNames: roles,
    });
  },
};
