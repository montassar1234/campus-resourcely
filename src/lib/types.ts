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

export type ReservationStatus = "ACTIVE" | "RETURNED" | "OVERDUE";

export interface Reservation {
  id: number;
  studentId: number;
  studentName: string;
  resourceId: number;
  resourceName: string;
  checkoutDate: string;
  expectedReturnDate: string;
  actualReturnDate: string | null;
  purpose?: string | null;
  status: ReservationStatus;
}

export interface DashboardSummary {
  totalStudents: number;
  totalResources: number;
  totalTags: number;
  activeReservations: number;
  overdueReservations: number;
  availableUnits: number;
}
