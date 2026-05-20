import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getAuthToken } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const authToken = await getAuthToken();

  if (!authToken) {
    return NextResponse.json(
      { message: "Authentication required." },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  try {
    const user = await getCurrentUser(authToken);

    return NextResponse.json(user, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, fields: error.fields },
        {
          status: error.status || 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    throw error;
  }
}
