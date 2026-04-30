import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "student" | "staff";

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
  studentId: string;
  setStudentId: (id: string) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

const ROLE_KEY = "crh:role";
const STUDENT_KEY = "crh:studentId";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("student");
  const [studentId, setStudentIdState] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const r = window.localStorage.getItem(ROLE_KEY) as Role | null;
    const s = window.localStorage.getItem(STUDENT_KEY);
    if (r === "student" || r === "staff") setRoleState(r);
    if (s) setStudentIdState(s);
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") window.localStorage.setItem(ROLE_KEY, r);
  };
  const setStudentId = (id: string) => {
    setStudentIdState(id);
    if (typeof window !== "undefined") window.localStorage.setItem(STUDENT_KEY, id);
  };

  return (
    <RoleContext.Provider value={{ role, setRole, studentId, setStudentId }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
