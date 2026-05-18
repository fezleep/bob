import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api";
import { getLeads, statuses, type LeadStatus } from "@/lib/leads";
import { getAuthToken } from "@/lib/server-auth";

const sortableFields = ["createdAt", "updatedAt", "name", "status", "company"] as const;

function parseNumber(value: string | null) {
  return value ? Number(value) : undefined;
}

function parseSort(value: string | null) {
  return sortableFields.includes(value as (typeof sortableFields)[number])
    ? (value as (typeof sortableFields)[number])
    : undefined;
}

function parseDirection(value: string | null) {
  return value === "asc" || value === "desc" ? value : undefined;
}

function parseStatus(value: string | null) {
  return statuses.includes(value as LeadStatus) ? (value as LeadStatus) : undefined;
}

export async function GET(request: NextRequest) {
  const authToken = await getAuthToken();

  if (!authToken) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  const page = request.nextUrl.searchParams.get("page");
  const size = request.nextUrl.searchParams.get("size");

  try {
    const response = await getLeads({
      authToken,
      page: parseNumber(page),
      size: parseNumber(size),
      sort: parseSort(request.nextUrl.searchParams.get("sort")),
      direction: parseDirection(request.nextUrl.searchParams.get("direction")),
      status: parseStatus(request.nextUrl.searchParams.get("status")),
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, fields: error.fields },
        { status: error.status || 500 }
      );
    }

    throw error;
  }
}
