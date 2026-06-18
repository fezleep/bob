const serverApiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

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

  let url = path;

  if (!isBrowserRequest) {
    if (!serverApiBaseUrl) {
      throw new ApiError("Set API_BASE_URL or NEXT_PUBLIC_API_BASE_URL to connect the backend.", 0);
    }

    url = `${serverApiBaseUrl.replace(/\/$/, "")}${path}`;
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

  let response: Response;

  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiError("The API is unavailable. Please try again later.", 0);
    }

    throw error;
  }

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
