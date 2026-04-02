import { apiFetch, apiFetchBlob, type BlobDownloadProgress } from "./api-client";
import { buildListQuery, normalizeListParams, type ListQueryParams } from "./list-query";
import type { LaravelPaginated } from "./types-api";

export type { ListQueryParams };

export async function fetchAdminBookings(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/bookings${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchAdminBooking(id: number) {
  return apiFetch<{ data: Record<string, unknown> }>(`/admin/bookings/${id}`, { method: "GET" });
}

export async function approveBooking(id: number) {
  return apiFetch(`/admin/bookings/${id}/approve`, { method: "POST", body: JSON.stringify({}) });
}

export async function rejectBooking(id: number, reason: string) {
  return apiFetch(`/admin/bookings/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function convertBookingToShipment(id: number) {
  return apiFetch<{ data?: Record<string, unknown>; message?: string }>(
    `/admin/bookings/${id}/convert-to-shipment`,
    { method: "POST", body: JSON.stringify({}) }
  );
}

export async function fetchAdminShipments(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/shipments${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchAdminShipment(id: number) {
  return apiFetch<{ data: Record<string, unknown> }>(`/admin/shipments/${id}`, { method: "GET" });
}

export async function updateAdminShipment(id: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/shipments/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function updateAdminShipmentTracking(id: number, formData: FormData) {
  return apiFetch(`/admin/shipments/${id}/tracking`, { method: "POST", body: formData });
}

export async function addAdminShipmentContainer(id: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/shipments/${id}/containers`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function addAdminContainerRack(containerId: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/containers/${containerId}/racks`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function addAdminShipmentItem(shipmentId: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/shipments/${shipmentId}/items`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminShipmentItem(itemId: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/shipment-items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminShipmentItem(itemId: number) {
  return apiFetch(`/admin/shipment-items/${itemId}`, { method: "DELETE" });
}

export async function downloadAdminWaybillPdf(shipmentId: number) {
  return apiFetchBlob(`/admin/shipments/${shipmentId}/waybill-pdf`, { method: "GET" });
}

export async function fetchAdminCompanies(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/companies${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchAdminCompany(id: number) {
  return apiFetch<{ data: Record<string, unknown> }>(`/admin/companies/${id}`, { method: "GET" });
}

export async function createAdminCompany(body: Record<string, unknown>) {
  return apiFetch<{ data: Record<string, unknown>; message?: string }>(`/admin/companies`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminCompany(id: number, body: Record<string, unknown>) {
  return apiFetch<{ data: Record<string, unknown>; message?: string }>(`/admin/companies/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminCompany(id: number) {
  return apiFetch(`/admin/companies/${id}`, { method: "DELETE" });
}

export async function approveAdminCompany(id: number) {
  return apiFetch(`/admin/companies/${id}/approve`, { method: "POST", body: JSON.stringify({}) });
}

export async function rejectAdminCompany(id: number, reason: string) {
  return apiFetch(`/admin/companies/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function fetchAdminCompanyBranches(companyId: number, input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/companies/${companyId}/branches${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function createAdminBranch(companyId: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/companies/${companyId}/branches`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminBranch(companyId: number, branchId: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/companies/${companyId}/branches/${branchId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminBranch(companyId: number, branchId: number) {
  return apiFetch(`/admin/companies/${companyId}/branches/${branchId}`, { method: "DELETE" });
}

export async function fetchAdminCustomerDiscounts(companyId: number, input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/companies/${companyId}/customer-discounts${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function createAdminCustomerDiscount(companyId: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/companies/${companyId}/customer-discounts`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminCustomerDiscount(
  companyId: number,
  discountId: number,
  body: Record<string, unknown>
) {
  return apiFetch(`/admin/companies/${companyId}/customer-discounts/${discountId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminCustomerDiscount(companyId: number, discountId: number) {
  return apiFetch(`/admin/companies/${companyId}/customer-discounts/${discountId}`, { method: "DELETE" });
}

export async function fetchAdminUsers(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/users${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchAdminUser(id: number) {
  return apiFetch<{ data: Record<string, unknown> }>(`/admin/users/${id}`, { method: "GET" });
}

export async function createAdminUser(body: Record<string, unknown>) {
  return apiFetch(`/admin/users`, { method: "POST", body: JSON.stringify(body) });
}

export async function updateAdminUser(id: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteAdminUser(id: number) {
  return apiFetch(`/admin/users/${id}`, { method: "DELETE" });
}

export async function fetchAdminInvoices(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/invoices${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchAdminInvoice(id: number) {
  return apiFetch<{ data: Record<string, unknown> }>(`/admin/invoices/${id}`, { method: "GET" });
}

export async function createAdminInvoice(body: Record<string, unknown>) {
  return apiFetch(`/admin/invoices`, { method: "POST", body: JSON.stringify(body) });
}

export async function updateAdminInvoice(id: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/invoices/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteAdminInvoice(id: number) {
  return apiFetch(`/admin/invoices/${id}`, { method: "DELETE" });
}

export async function fetchAdminPayments(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/payments${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchAdminPayment(id: number) {
  return apiFetch<{ data: Record<string, unknown> }>(`/admin/payments/${id}`, { method: "GET" });
}

export async function syncAdminPaymentMidtrans(id: number) {
  return apiFetch<{ message: string; data: Record<string, unknown> }>(
    `/admin/payments/${id}/sync-midtrans`,
    { method: "POST" }
  );
}

export async function verifyAdminPaymentManual(id: number, body?: { note?: string | null }) {
  return apiFetch<{ message: string; data: Record<string, unknown> }>(
    `/admin/payments/${id}/verify-manual`,
    { method: "POST", body: JSON.stringify(body ?? {}) }
  );
}

export async function fetchAdminOverdueInvoices() {
  return apiFetch(`/admin/payments/overdue-invoices`, { method: "GET" });
}

export async function fetchAdminVendors(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/vendors${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchAdminVendor(id: number) {
  return apiFetch<{ data: Record<string, unknown> }>(`/admin/vendors/${id}`, { method: "GET" });
}

export async function createAdminVendor(body: Record<string, unknown>) {
  return apiFetch(`/admin/vendors`, { method: "POST", body: JSON.stringify(body) });
}

export async function updateAdminVendor(id: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/vendors/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteAdminVendor(id: number) {
  return apiFetch(`/admin/vendors/${id}`, { method: "DELETE" });
}

export async function createAdminVendorService(vendorId: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/vendors/${vendorId}/services`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function createAdminVendorPricing(vendorServiceId: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/vendor-services/${vendorServiceId}/pricings`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminPricing(pricingId: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/pricings/${pricingId}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function fetchAdminLocations(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/locations${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function createAdminLocation(body: Record<string, unknown>) {
  return apiFetch<{ data: Record<string, unknown> }>(`/admin/locations`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminLocation(id: number, body: Record<string, unknown>) {
  return apiFetch<{ data: Record<string, unknown> }>(`/admin/locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminLocation(id: number) {
  return apiFetch(`/admin/locations/${id}`, { method: "DELETE" });
}

export async function fetchAdminTransportModes(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/transport-modes${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function createAdminTransportMode(body: Record<string, unknown>) {
  return apiFetch(`/admin/transport-modes`, { method: "POST", body: JSON.stringify(body) });
}

export async function updateAdminTransportMode(id: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/transport-modes/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteAdminTransportMode(id: number) {
  return apiFetch(`/admin/transport-modes/${id}`, { method: "DELETE" });
}

export async function fetchAdminServiceTypes(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/service-types${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function createAdminServiceType(body: Record<string, unknown>) {
  return apiFetch(`/admin/service-types`, { method: "POST", body: JSON.stringify(body) });
}

export async function updateAdminServiceType(id: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/service-types/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteAdminServiceType(id: number) {
  return apiFetch(`/admin/service-types/${id}`, { method: "DELETE" });
}

export async function fetchAdminContainerTypes(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/container-types${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function createAdminContainerType(body: Record<string, unknown>) {
  return apiFetch(`/admin/container-types`, { method: "POST", body: JSON.stringify(body) });
}

export async function updateAdminContainerType(id: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/container-types/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteAdminContainerType(id: number) {
  return apiFetch(`/admin/container-types/${id}`, { method: "DELETE" });
}

export async function fetchAdminAdditionalServices(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/additional-services${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function createAdminAdditionalService(body: Record<string, unknown>) {
  return apiFetch(`/admin/additional-services`, { method: "POST", body: JSON.stringify(body) });
}

export async function updateAdminAdditionalService(id: number, body: Record<string, unknown>) {
  return apiFetch(`/admin/additional-services/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteAdminAdditionalService(id: number) {
  return apiFetch(`/admin/additional-services/${id}`, { method: "DELETE" });
}

export async function downloadAdminInvoicePdf(
  invoiceId: number,
  opts?: { onProgress?: (p: BlobDownloadProgress) => void }
) {
  return apiFetchBlob(`/admin/invoices/${invoiceId}/pdf`, {
    method: "GET",
    onProgress: opts?.onProgress,
  });
}
