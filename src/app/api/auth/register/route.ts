import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, username, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        role: "STUDENT",
        isApproved: false,
        isActive: true,
      },
    });

    // Create user profile
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        onboardingComplete: false,
      },
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        type: "USER_SIGNUP",
        title: "New User Registration",
        message: `${name || email} has registered and is waiting for approval.`,
        data: JSON.stringify({ userId: user.id, email: user.email }),
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      message: "Registration successful! Please wait for admin approval.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
