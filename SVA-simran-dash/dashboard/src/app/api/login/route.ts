import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const body = await request.json();
    const { password } = body;

    if (password === process.env.DASHBOARD_PASSWORD) {
        (await cookies()).set("auth_token", "authenticated", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        });

        return NextResponse.json({ success: true });
    }

    return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
    );
}
