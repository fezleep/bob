const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export type ApiFieldError = {
  field: string;
  message: string;
};

type ApiErrorBody = {
  message?: string;
  fields?: ApiFieldError[];
};

export class ApiError extends Error {
  status: number;
  fields: ApiFieldError[];

  constructor(message: string, status: number, fields: ApiFieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

type ApiFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
  authToken?: string;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { authToken, ...fetchOptions } = options;
  const isBrowserRequest = typeof window !== "undefined" && !authToken;

  if (!apiBaseUrl && !isBrowserRequest) {
    throw new ApiError("Set NEXT_PUBLIC_API_BASE_URL to connect the backend.", 0);
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  new Headers(fetchOptions.headers).forEach((value, key) => {
    headers[key] = value;
  });

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const url = isBrowserRequest ? path : `${apiBaseUrl?.replace(/\/$/, "")}${path}`;
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let errorBody: ApiErrorBody | null = null;

    try {
      errorBody = (await response.json()) as ApiErrorBody;
    } catch {
      errorBody = null;
    }

    throw new ApiError(
      errorBody?.message || `Request failed with status ${response.status}.`,
      response.status,
      errorBody?.fields || []
    );
  }

  return response.json() as Promise<T>;
}
