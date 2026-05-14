import type {
  DashboardSummary,
  Notification,
  Reservation,
  ReservationStatus,
  Resource,
  Student,
  Tag,
} from "./types";

export const API_BASE =
  (typeof window !== "undefined" && (window as any).__API_BASE__) ||
  "http://localhost:8080/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return (await res.text()) as unknown as T;
  return res.json();
}

export const api = {
  dashboard: {
    summary: () => request<DashboardSummary>("/dashboard/summary"),
  },
  students: {
    list: () => request<Student[]>("/students"),
    get: (id: number) => request<Student>(`/students/${id}`),
    search: (keyword: string) =>
      request<Student[]>(`/students/search?keyword=${encodeURIComponent(keyword)}`),
    login: (data: { email: string; password: string }) =>
      request<Student>("/students/login", { method: "POST", body: JSON.stringify(data) }),
    create: (data: Partial<Student>) =>
      request<Student>("/students", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Student>) =>
      request<Student>(`/students/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/students/${id}`, { method: "DELETE" }),
  },
  tags: {
    list: () => request<Tag[]>("/tags"),
    search: (keyword: string) =>
      request<Tag[]>(`/tags/search?keyword=${encodeURIComponent(keyword)}`),
    create: (data: Partial<Tag>) =>
      request<Tag>("/tags", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Tag>) =>
      request<Tag>(`/tags/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/tags/${id}`, { method: "DELETE" }),
  },
  resources: {
    list: () => request<Resource[]>("/resources"),
    available: () => request<Resource[]>("/resources/available"),
    searchType: (type: string) =>
      request<Resource[]>(`/resources/search/type?type=${encodeURIComponent(type)}`),
    searchTag: (name: string) =>
      request<Resource[]>(`/resources/search/tag?name=${encodeURIComponent(name)}`),
    create: (data: { name: string; type: string; assetCode: string; quantity: number; tagIds: number[] }) =>
      request<Resource>("/resources", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: { name: string; type: string; assetCode: string; quantity: number; tagIds: number[] }) =>
      request<Resource>(`/resources/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/resources/${id}`, { method: "DELETE" }),
  },
  reservations: {
    list: () => request<Reservation[]>("/reservations"),
    byStudent: (id: number) => request<Reservation[]>(`/reservations/student/${id}`),
    byResource: (id: number) => request<Reservation[]>(`/reservations/resource/${id}`),
    byStatus: (status: ReservationStatus) =>
      request<Reservation[]>(`/reservations/status/${status}`),
    overdue: () => request<Reservation[]>("/reservations/overdue/list"),
    create: (data: {
      studentId: number;
      resourceId: number;
      startDate: string;
      durationDays?: number;
      purpose?: string;
    }) =>
      request<Reservation>("/reservations", { method: "POST", body: JSON.stringify(data) }),
    createStudentRequest: (data: {
      studentId: number;
      resourceId: number;
      startDate: string;
      durationDays?: number;
      purpose?: string;
    }) =>
      request<Reservation>("/reservations/request/student", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createRequest: (data: {
      username: string;
      email: string;
      password: string;
      fullName: string;
      phone: string;
      department: string;
      level: string;
      resourceId: number;
      durationDays?: number;
      purpose?: string;
    }) =>
      request<Reservation>("/reservations/request", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    approve: (id: number) =>
      request<Reservation>(`/reservations/${id}/approve`, { method: "PUT" }),
    markReturned: (id: number) =>
      request<Reservation>(`/reservations/${id}/return`, { method: "PUT" }),
    remove: (id: number) => request<void>(`/reservations/${id}`, { method: "DELETE" }),
  },
  notifications: {
    byStudent: (studentId: number) =>
      request<Notification[]>(`/notifications/student/${studentId}`),
    markRead: (id: number) =>
      request<Notification>(`/notifications/${id}/read`, { method: "PUT" }),
    markAllRead: (studentId: number) =>
      request<void>(`/notifications/student/${studentId}/read-all`, { method: "PUT" }),
    sendReturnAlert: (reservationId: number, data?: { message?: string }) =>
      request<Notification>(`/notifications/reservations/${reservationId}/alert`, {
        method: "POST",
        body: JSON.stringify(data ?? {}),
      }),
  },
};
