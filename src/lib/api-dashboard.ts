// Bentuk response API yang diusulkan untuk integrasi dashboard
// Catatan: saat ini masih menggunakan data dummy di komponen, file ini hanya
// mendefinisikan shape agar FE & BE punya kontrak yang jelas.

export interface AdminDashboardSummary {
  bookingsToday: number;
  activeShipments: number;
  rackUtilization: number;
  overdueInvoices: number;
  activeCompanies: number;
  pendingCompanyApprovals: number;
  unpaidInvoices: number;
  paymentsToday: number;
}

export interface AdminBookingPendingItem {
  code: string;
  customer: string;
  route: string;
  serviceType: string;
}

export interface AdminShipmentItem {
  id: string;
  customer?: string;
  route: string;
  status: string;
}

export interface AdminInvoiceItem {
  number: string;
  customer: string;
  status: "unpaid" | "overdue" | "paid";
  dueDate: string;
  amount: number;
}

export interface AdminPaymentItem {
  ref: string;
  customer: string;
  method: string;
  amount: number;
}

export interface AdminDashboardResponse {
  summary: AdminDashboardSummary;
  pendingBookings: AdminBookingPendingItem[];
  activeShipments: AdminShipmentItem[];
  overdueInvoices: AdminInvoiceItem[];
  recentPayments: AdminPaymentItem[];
}

export interface CustomerDashboardSummary {
  activeBookings: number;
  activeShipments: number;
  unpaidInvoices: number;
  overdueInvoices: number;
}

export interface CustomerShipmentItem {
  id: string;
  route: string;
  status: string;
}

export interface CustomerInvoiceItem {
  number: string;
  status: "unpaid" | "overdue" | "paid";
  dueDate: string;
  amount: number;
}

export interface CustomerPaymentItem {
  ref: string;
  method: string;
  amount: number;
}

export interface CustomerDashboardResponse {
  summary: CustomerDashboardSummary;
  shipments: CustomerShipmentItem[];
  invoices: CustomerInvoiceItem[];
  recentPayments: CustomerPaymentItem[];
}

