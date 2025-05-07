import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Cookie name to clear
const COOKIE_NAME = "audiocloud_auth";

export async function POST() {
  try {
    // Clear auth cookie
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);

    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to logout. Please try again." },
      { status: 500 }
    );
  }
}
