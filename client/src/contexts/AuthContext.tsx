import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/types";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  supervisorName?: string;
  status: "ativo" | "inativo";
  lastAccess: string;
  avatarUrl?: string;
}

interface AuthContextType {
  currentUser: User | null;
  usersList: User[];
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  addUser: (userData: Omit<User, "id" | "lastAccess">) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  forgotPassword: (email: string) => Promise<boolean>;
}

const DEFAULT_USERS: User[] = [
  {
    id: "usr-admin-1",
    name: "Valeska Souza (Admin)",
    email: "admin@datacrazy.com",
    role: "admin",
    department: "Diretoria",
    supervisorName: "-",
    status: "ativo",
    lastAccess: "Hoje às 17:00",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "usr-sup-1",
    name: "Carlos Eduardo (Supervisor)",
    email: "carlos.sup@datacrazy.com",
    role: "supervisor",
    department: "Comercial",
    supervisorName: "Valeska Souza",
    status: "ativo",
    lastAccess: "Hoje às 16:30",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "usr-att-1",
    name: "Ana Carol",
    email: "anacarol@datacrazy.com",
    role: "attendant",
    department: "Comercial",
    supervisorName: "Carlos Eduardo",
    status: "ativo",
    lastAccess: "Hoje às 16:45",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "usr-att-2",
    name: "Bruno Costa",
    email: "bruno.costa@datacrazy.com",
    role: "attendant",
    department: "Suporte",
    supervisorName: "Carlos Eduardo",
    status: "ativo",
    lastAccess: "Ontem às 18:10",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "usr-view-1",
    name: "Auditoria (Visualizador)",
    email: "viewer@datacrazy.com",
    role: "viewer",
    department: "Auditoria",
    supervisorName: "Valeska Souza",
    status: "ativo",
    lastAccess: "Há 3 dias",
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_CURRENT_USER = "next_leads_auth_user_v2";
const STORAGE_KEY_USERS_LIST = "next_leads_users_list_v2";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usersList, setUsersList] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS_LIST);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse stored users", e);
    }
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse stored current user", e);
    }
    // Default logged in as Admin for instant access
    return DEFAULT_USERS[0];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(usersList));
    } catch (e) {}
  }, [usersList]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      }
    } catch (e) {}
  }, [currentUser]);

  const login = (email: string, _password: string, _remember = true): boolean => {
    const trimmed = email.trim().toLowerCase();
    const found = usersList.find((u) => u.email.toLowerCase() === trimmed);
    if (found) {
      const updated = { ...found, lastAccess: "Agora" };
      setCurrentUser(updated);
      setUsersList((prev) =>
        prev.map((u) => (u.id === found.id ? updated : u))
      );
      return true;
    }
    // If not found in usersList, allow admin creation
    if (trimmed.includes("admin")) {
      const adminUser = DEFAULT_USERS[0];
      setCurrentUser(adminUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;
    const matching = usersList.find((u) => u.role === role);
    if (matching) {
      setCurrentUser(matching);
    } else {
      setCurrentUser({
        ...currentUser,
        role,
      });
    }
  };

  const addUser = (userData: Omit<User, "id" | "lastAccess">) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      lastAccess: "Nunca",
    };
    setUsersList((prev) => [newUser, ...prev]);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...userData } : u))
    );
    if (currentUser && currentUser.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...userData } : null));
    }
  };

  const deleteUser = (id: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== id));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(null);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 600));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        isAuthenticated: !!currentUser,
        login,
        logout,
        switchRole,
        addUser,
        updateUser,
        deleteUser,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
