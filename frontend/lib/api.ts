const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(path: string): Promise<T> {
  if (!apiBaseUrl) {
    throw new ApiError("Set NEXT_PUBLIC_API_BASE_URL to connect the backend.", 0);
  }

  const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}${path}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}.`, response.status);
  }

  return response.json() as Promise<T>;
}
