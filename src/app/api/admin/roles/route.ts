import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;
  return (session.user as any).role === "ADMIN";
}

export async function GET(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roles = await prisma.userRole.findMany({
      orderBy: { name: "asc" }
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, permissions, color, isDefault } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Role name required" }, { status: 400 });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.userRole.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    const role = await prisma.userRole.upsert({
      where: { name },
      update: { description, permissions: JSON.stringify(permissions), color, isDefault },
      create: { name, description, permissions: JSON.stringify(permissions), color, isDefault }
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roleId, userId, action, defaultRoleId } = await req.json();
    const adminId = (await getServerSession(authOptions))?.user?.email;

    if (action === "assign_role" && roleId && userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { customRoleId: roleId }
      });

      // Create notification
      const role = await prisma.userRole.findUnique({ where: { id: roleId } });
      await prisma.notification.create({
        data: {
          userId,
          type: "ROLE_CHANGE",
          title: "Role Updated",
          message: `Admin has assigned you the ${role?.name} role`,
        }
      });

      return NextResponse.json({ success: true });
    }

    if (action === "revoke_role" && userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { customRoleId: null }
      });

      await prisma.notification.create({
        data: {
          userId,
          type: "ROLE_CHANGE",
          title: "Role Revoked",
          message: `Admin has removed your custom role`,
        }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in role management:", error);
    return NextResponse.json({ error: "Failed to manage role" }, { status: 500 });
  }
}
