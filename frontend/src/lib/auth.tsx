import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type StudentSession = {
  id: string;
  username: string;
  fullName: string;
  email: string;
};

type AdminSession = {
  username: string;
};

interface AuthContextValue {
  student: StudentSession | null;
  admin: AdminSession | null;
  loginStudent: (student: StudentSession) => void;
  logoutStudent: () => void;
  loginAdmin: (admin: AdminSession) => void;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STUDENT_KEY = "crh:studentSession";
const ADMIN_KEY = "crh:adminSession";

function readStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, value: T | null) {
  if (typeof window === "undefined") return;
  if (value === null) {
    window.localStorage.removeItem(key);
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function hasStudentSession() {
  return !!readStorage<StudentSession>(STUDENT_KEY);
}

export function hasAdminSession() {
  return !!readStorage<AdminSession>(ADMIN_KEY);
}

export function getStoredStudentSession() {
  return readStorage<StudentSession>(STUDENT_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [admin, setAdmin] = useState<AdminSession | null>(null);

  useEffect(() => {
    setStudent(readStorage<StudentSession>(STUDENT_KEY));
    setAdmin(readStorage<AdminSession>(ADMIN_KEY));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      student,
      admin,
      loginStudent: (session) => {
        setStudent(session);
        writeStorage(STUDENT_KEY, session);
      },
      logoutStudent: () => {
        setStudent(null);
        writeStorage(STUDENT_KEY, null);
      },
      loginAdmin: (session) => {
        setAdmin(session);
        writeStorage(ADMIN_KEY, session);
      },
      logoutAdmin: () => {
        setAdmin(null);
        writeStorage(ADMIN_KEY, null);
      },
    }),
    [student, admin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
