import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

type StudentSession = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  token: string;
};

type AdminSession = {
  username: string;
  displayName?: string;
  token: string;
};

interface AuthContextValue {
  ready: boolean;
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
  return !!readStorage<StudentSession>(STUDENT_KEY)?.token;
}

export function hasAdminSession() {
  return !!readStorage<AdminSession>(ADMIN_KEY)?.token;
}

export function getStoredStudentSession() {
  return readStorage<StudentSession>(STUDENT_KEY);
}

export function getStoredAuthToken() {
  const admin = readStorage<AdminSession>(ADMIN_KEY);
  const student = readStorage<StudentSession>(STUDENT_KEY);

  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
    return admin?.token || null;
  }

  return student?.token || null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [admin, setAdmin] = useState<AdminSession | null>(null);

  useEffect(() => {
    const storedStudent = readStorage<StudentSession>(STUDENT_KEY);
    const storedAdmin = readStorage<AdminSession>(ADMIN_KEY);
    setStudent(storedStudent?.token ? storedStudent : null);
    setAdmin(storedAdmin?.token ? storedAdmin : null);
    if (storedStudent && !storedStudent.token) writeStorage(STUDENT_KEY, null);
    if (storedAdmin && !storedAdmin.token) writeStorage(ADMIN_KEY, null);
    setReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
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
    [ready, student, admin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRequireAdmin() {
  const navigate = useNavigate();
  const { admin, ready } = useAuth();

  useEffect(() => {
    if (ready && !admin) {
      navigate({ to: "/admin/auth", replace: true });
    }
  }, [admin, ready, navigate]);

  return { admin, ready };
}

export function useRequireStudent() {
  const navigate = useNavigate();
  const { student, ready } = useAuth();

  useEffect(() => {
    if (ready && !student) {
      navigate({ to: "/", replace: true });
    }
  }, [student, ready, navigate]);

  return { student, ready };
}
