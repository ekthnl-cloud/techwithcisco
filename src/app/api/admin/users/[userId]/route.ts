import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await params;
    const { action } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    switch (action) {
      case "approve":
        await prisma.user.update({
          where: { id: userId },
          data: { isApproved: true },
        });
        
        // Create notification for user
        await prisma.notification.create({
          data: {
            userId: userId,
            type: "GENERAL",
            title: "Account Approved",
            message: "Your account has been approved! You can now login.",
          },
        });
        
        // Create activity log
        await prisma.activityLog.create({
          data: {
            userId,
            userEmail: user.email,
            action: "USER_APPROVED",
            description: `User ${user.email} was approved by admin`,
          },
        });
        break;

      case "deny":
        await prisma.user.update({
          where: { id: userId },
          data: { isApproved: false },
        });
        
        await prisma.notification.create({
          data: {
            userId: userId,
            type: "GENERAL",
            title: "Account Denied",
            message: "Your registration has been denied. Contact admin for more information.",
          },
        });
        
        await prisma.activityLog.create({
          data: {
            userId,
            userEmail: user.email,
            action: "USER_DENIED",
            description: `User ${user.email} was denied by admin`,
          },
        });
        break;

      case "suspend":
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: false },
        });
        
        await prisma.notification.create({
          data: {
            userId: userId,
            type: "GENERAL",
            title: "Account Suspended",
            message: "Your account has been suspended. Contact admin.",
          },
        });
        
        await prisma.activityLog.create({
          data: {
            userId,
            userEmail: user.email,
            action: "USER_SUSPENDED",
            description: `User ${user.email} was suspended by admin`,
          },
        });
        break;

      case "activate":
        await prisma.user.update({
          where: { id: userId },
          data: { isActive: true },
        });
        
        await prisma.notification.create({
          data: {
            userId: userId,
            type: "GENERAL",
            title: "Account Activated",
            message: "Your account has been reactivated.",
          },
        });
        
        await prisma.activityLog.create({
          data: {
            userId,
            userEmail: user.email,
            action: "USER_ACTIVATED",
            description: `User ${user.email} was activated by admin`,
          },
        });
        break;

      case "logout":
        await prisma.activityLog.create({
          data: {
            userId,
            userEmail: user.email,
            action: "FORCE_LOGOUT",
            description: `User ${user.email} was force logged out by admin`,
          },
        });
        
        await prisma.notification.create({
          data: {
            userId: userId,
            type: "GENERAL",
            title: "Force Logout",
            message: "You have been logged out by admin. Please login again.",
          },
        });
        break;

      case "delete":
        await prisma.activityLog.create({
          data: {
            userEmail: user.email,
            action: "USER_DELETED",
            description: `User ${user.email} was deleted by admin`,
          },
        });
        
        await prisma.user.delete({
          where: { id: userId },
        });
        return NextResponse.json({ success: true, message: "User deleted" });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User action error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
