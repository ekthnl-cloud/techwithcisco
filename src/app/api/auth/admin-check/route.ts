import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ isAdmin: false });
    }

    const role = (session.user as any).role;
    return NextResponse.json({ isAdmin: role === "ADMIN" });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
