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
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  if (!apiBaseUrl) {
    throw new ApiError("Set NEXT_PUBLIC_API_BASE_URL to connect the backend.", 0);
  }

  const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
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
