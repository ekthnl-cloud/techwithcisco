import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, username: true, image: true, role: true }
        }
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { username, name, bio, phone, location, website, socialLinks, image } = await req.json();

    // Check if username is taken
    if (username) {
      const existing = await prisma.user.findFirst({
        where: { username, id: { not: userId } }
      });
      if (existing) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: { username, name, image }
    });

    // Update or create profile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: { bio, phone, location, website, socialLinks: socialLinks ? JSON.stringify(socialLinks) : undefined },
      create: { userId, bio, phone, location, website, socialLinks: socialLinks ? JSON.stringify(socialLinks) : undefined }
    });

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
