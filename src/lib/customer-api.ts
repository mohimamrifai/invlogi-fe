import { apiFetch, apiFetchBlob, type BlobDownloadProgress } from "./api-client";
import { buildListQuery, normalizeListParams, type ListQueryParams } from "./list-query";
import type { LaravelPaginated } from "./types-api";

export type { ListQueryParams };

export async function fetchCustomerShipments(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/customer/shipments${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchCustomerInvoices(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/customer/invoices${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchCustomerPayments(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/customer/payments${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchCustomerBookings(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/customer/bookings${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchCustomerMasterLocations() {
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/customer/master/locations?per_page=500`,
    { method: "GET" }
  );
}

export async function fetchCustomerMasterTransportModes() {
  return apiFetch<{ data: unknown[] }>(`/customer/master/transport-modes`, { method: "GET" });
}

export async function fetchCustomerMasterServiceTypes(transportModeId?: number) {
  const q = transportModeId ? `?transport_mode_id=${transportModeId}` : "";
  return apiFetch<{ data: unknown[] }>(`/customer/master/service-types${q}`, { method: "GET" });
}

export async function fetchCustomerMasterContainerTypes() {
  return apiFetch<{ data: unknown[] }>(`/customer/master/container-types`, { method: "GET" });
}

export async function fetchCustomerMasterAdditionalServices() {
  return apiFetch<{ data: unknown[] }>(`/customer/master/additional-services`, { method: "GET" });
}

export async function estimateBookingPrice(payload: Record<string, unknown>) {
  return apiFetch<{ data: unknown }>(`/customer/bookings/estimate-price`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createCustomerBooking(payload: Record<string, unknown>) {
  return apiFetch(`/customer/bookings`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function payInvoice(invoiceId: number) {
  return apiFetch<{ message: string; data: { token: string; redirect_url?: string | null; order_id: string } }>(
    `/customer/invoices/${invoiceId}/pay`,
    { method: "POST", body: JSON.stringify({}) }
  );
}

export async function downloadCustomerInvoicePdf(
  invoiceId: number,
  opts?: { onProgress?: (p: BlobDownloadProgress) => void }
) {
  return apiFetchBlob(`/customer/invoices/${invoiceId}/pdf`, {
    method: "GET",
    onProgress: opts?.onProgress,
  });
}
