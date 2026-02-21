import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const adminEmail = "admin@techwithcisco.com";
    
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      return NextResponse.json({ 
        message: "Admin already exists",
        email: adminEmail,
        password: "admin123"
      });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        username: "admin",
        password: hashedPassword,
        role: "ADMIN",
        isApproved: true,
        isActive: true,
      },
    });

    await prisma.userProfile.create({
      data: {
        userId: (await prisma.user.findUnique({ where: { email: adminEmail } }))!.id,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "Admin user created",
      email: adminEmail,
      password: "admin123"
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}
