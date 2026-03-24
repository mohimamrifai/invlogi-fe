/** Query params for Laravel paginated list endpoints */
export type ListQueryParams = {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  companyId?: number;
  /** Location `type` (port, city, hub, warehouse) */
  type?: string;
  transportModeId?: number;
  /** Additional service `category` */
  category?: string;
};

export function buildListQuery(params?: ListQueryParams): string {
  const q = new URLSearchParams();
  if (params?.page != null && params.page > 0) q.set("page", String(params.page));
  if (params?.perPage != null && params.perPage > 0) q.set("per_page", String(params.perPage));
  const s = params?.search?.trim();
  if (s) q.set("search", s);
  const st = params?.status?.trim();
  if (st) q.set("status", st);
  if (params?.companyId != null) q.set("company_id", String(params.companyId));
  const ty = params?.type?.trim();
  if (ty) q.set("type", ty);
  if (params?.transportModeId != null) q.set("transport_mode_id", String(params.transportModeId));
  const cat = params?.category?.trim();
  if (cat) q.set("category", cat);
  const str = q.toString();
  return str ? `?${str}` : "";
}

export function rowNumber(page: number, perPage: number, index: number): number {
  return (page - 1) * perPage + index + 1;
}

export function normalizeListParams(input?: number | ListQueryParams): ListQueryParams | undefined {
  if (input == null) return undefined;
  if (typeof input === "number") return { perPage: input };
  return input;
}
