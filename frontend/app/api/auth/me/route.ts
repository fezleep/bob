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
      const status = error.status === 401 || error.status === 403 ? 401 : 503;
      const message =
        status === 401 ? "Authentication required." : "Session validation is temporarily unavailable.";

      return NextResponse.json(
        { message, fields: error.fields },
        {
          status,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    throw error;
  }
}
