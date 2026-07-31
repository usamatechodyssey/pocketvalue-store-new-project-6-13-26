import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import UserSession from "@/models/UserSession";
import { subMinutes } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 🛡️ 1. SECURITY GATING: Strict Admin session lookup via Next-Auth
    const session = await auth();
    const isAuthorized = session?.user && ["Super Admin", "Store Manager", "Content Editor"].includes(session.user.role);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied: Unauthorized staff." }, { status: 401 });
    }

    await connectMongoose();
    
    // Online threshold matching Milestone 1 (Pulse inactivity margin)
    const activeThreshold = subMinutes(new Date(), 2); 

    // Fetch active stats in parallel
    const [activeCount, deviceStats] = await Promise.all([
      UserSession.countDocuments({ lastPulse: { $gte: activeThreshold } }),
      UserSession.aggregate([
        { $match: { lastPulse: { $gte: activeThreshold } } },
        { $group: { _id: "$device", count: { $sum: 1 } } },
      ]),
    ]);

    // Map device statistics
    const deviceData = [
      { name: "DESKTOP", value: 0, fill: "#3b82f6" },
      { name: "MOBILE", value: 0, fill: "#10b981" },
      { name: "TABLET", value: 0, fill: "#f59e0b" },
    ];

    deviceStats.forEach((d) => {
      const name = (d._id || "desktop").toUpperCase();
      const match = deviceData.find((item) => item.name === name);
      if (match) match.value = d.count;
    });

    // 2. IMMEDIATE RESPONSE (No Serverless blocking, connection closes immediately)
    return NextResponse.json({
      activeCount,
      deviceData,
    });

  } catch (error: any) {
    console.error("Live Radar API Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}