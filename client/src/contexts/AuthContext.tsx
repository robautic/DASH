import React, { createContext, useContext, useEffect, useState } from "react";
import { UserRole } from "@/types";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  forgotPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const utils = trpc.useUtils();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);

  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = trpc.auth.login.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    if (user) {
      setCurrentUser(user as User);
    } else {
      setCurrentUser(null);
    }
  }, [user]);

  const login = async (email: string, password: string, remember = true): Promise<boolean> => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.success && result.user) {
        setCurrentUser(result.user as User);
        utils.auth.me.setData(undefined, result.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login falhou:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setCurrentUser(null);
      utils.auth.me.setData(undefined, null);
    } catch (error) {
      console.error("Logout falhou:", error);
    }
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      role,
    });
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
        isLoading,
        login,
        logout,
        switchRole,
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
