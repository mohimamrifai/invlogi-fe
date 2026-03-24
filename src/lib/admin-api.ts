import { apiFetch, apiFetchBlob } from "./api-client";
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
  return apiFetch(`/admin/bookings/${id}/convert-to-shipment`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function fetchAdminShipments(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/shipments${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchAdminCompanies(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/companies${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchAdminInvoices(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/invoices${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchAdminPayments(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/payments${buildListQuery(params)}`,
    { method: "GET" }
  );
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

export async function fetchAdminLocations(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/locations${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchAdminTransportModes(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/transport-modes${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchAdminServiceTypes(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/service-types${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchAdminContainerTypes(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/container-types${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function fetchAdminAdditionalServices(input?: number | ListQueryParams) {
  const params = normalizeListParams(input);
  return apiFetch<LaravelPaginated<Record<string, unknown>>>(
    `/admin/additional-services${buildListQuery(params)}`,
    { method: "GET" }
  );
}

export async function downloadAdminInvoicePdf(invoiceId: number) {
  return apiFetchBlob(`/admin/invoices/${invoiceId}/pdf`, { method: "GET" });
}
