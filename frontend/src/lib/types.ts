export interface Profile {
  id?: number;
  fullName: string;
  phone: string;
  department: string;
  level: string;
}

export interface Student {
  id: number;
  username: string;
  email: string;
  password?: string;
  profile: Profile;
}

export type UserRole = "ADMIN" | "STUDENT";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  displayName: string;
  role: UserRole;
  profile: Profile | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Tag {
  id: number;
  name: string;
  resourceCount?: number;
}

export interface Resource {
  id: number;
  name: string;
  type: string;
  assetCode: string;
  quantity: number;
  tags: Tag[];
}

export type ReservationStatus =
  | "PENDING"
  | "REJECTED"
  | "APPROVED"
  | "ACTIVE"
  | "RETURNED"
  | "OVERDUE";
export type NotificationType =
  | "RESERVATION_REQUESTED"
  | "RESERVATION_APPROVED"
  | "RESERVATION_REJECTED"
  | "AUTO_RETURN_REMINDER"
  | "ADMIN_RETURN_ALERT";

export interface Reservation {
  id: number;
  studentId: number;
  studentName: string;
  resourceId: number;
  resourceName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  weekdayDurationDays: number;
  checkoutDate: string | null;
  expectedReturnDate: string | null;
  actualReturnDate: string | null;
  purpose?: string | null;
  status: ReservationStatus;
}

export interface Notification {
  id: number;
  studentId: number;
  reservationId: number;
  resourceName: string;
  message: string;
  type: NotificationType;
  notificationDate: string;
  createdAt: string;
  read: boolean;
}

export interface DashboardSummary {
  totalStudents: number;
  totalResources: number;
  totalTags: number;
  activeReservations: number;
  overdueReservations: number;
  availableUnits: number;
}
