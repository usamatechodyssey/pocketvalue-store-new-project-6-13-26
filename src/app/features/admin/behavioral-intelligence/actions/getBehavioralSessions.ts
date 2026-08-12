// // 📂 src/app/features/admin/behavioral-intelligence/actions/getBehavioralSessions.ts

// "use server";

// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
// import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";
// import UserSession from "@/models/UserSession";
// import UserEvent from "@/models/UserEvent";
// import { format, addDays } from "date-fns";
// import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// // ================================================================
// // ✅ TYPES (100% Preserved)
// // ================================================================
// export interface SessionBreakdown {
//   device: { label: string; count: number; percentage: number }[];
//   os: { label: string; count: number; percentage: number }[];
//   browser: { label: string; count: number; percentage: number }[];
//   city: { label: string; count: number; percentage: number }[];
//   country: { label: string; count: number; percentage: number }[];
// }

// export interface SessionTrendPoint {
//   date: string;
//   sessions: number;
//   activeSessions: number;
//   newSessions: number;
// }

// export interface SessionListItem {
//   _id: string;
//   sessionId: string;
//   visitorId: string;
//   userId?: string;
//   device: string;
//   os: string;
//   browser: string;
//   city?: string;
//   country?: string;
//   isActive: boolean;
//   lastPulse: string;
//   createdAt: string;
// }

// export interface BehavioralSessionsResponse {
//   summary: {
//     activeSessions: number;
//     totalSessions: number;
//     newSessions: number;
//     uniqueVisitors: number;
//     avgSessionDuration: number;
//   };
//   breakdown: SessionBreakdown;
//   trend: SessionTrendPoint[];
//   sessions: SessionListItem[];
//   totalDocs: number;
//   totalPages: number;
//   currentPage: number;
//   limit: number;
//   generatedAt: string;
// }

// // ================================================================
// // 🛡️ CACHE STAMPEDE PROTECTION
// // ================================================================
// const LUA_RELEASE_LOCK = `
//   if redis.call("get", KEYS[1]) == ARGV[1] then
//     return redis.call("del", KEYS[1])
//   else
//     return 0
//   end
// `;

// const releaseLock = async (lockKey: string, requestId: string): Promise<void> => {
//   try {
//     const result = await redis.eval(LUA_RELEASE_LOCK, [lockKey], [requestId]);
//     if (result === 1) console.log(`🔓 Sessions Lock released (${requestId}).`);
//   } catch (error) { console.error("Sessions Lock release error:", error); }
// };

// // ================================================================
// // 🚀 MAIN FUNCTION — Enterprise Ready
// // ================================================================
// export async function getBehavioralSessions(
//   range: { from: Date; to: Date },
//   page: number = 1,
//   limit: number = 25
// ): Promise<BehavioralSessionsResponse> {
//   const fromStr = format(range.from, "yyyy-MM-dd");
//   const toStr = format(range.to, "yyyy-MM-dd");
//   const cacheKey = `analytics_behavioral_sessions_v3:${fromStr}_${toStr}:page_${page}`;

//   try {
//     await verifyAdminAccess();
//     await connectMongoose();

//     // ✅ 1. Cache Check
//     const cachedData = await redis.get(cacheKey);
//     const parsed = safeParse<BehavioralSessionsResponse>(cachedData as string | null);
//     if (parsed) {
//       console.log(`⚡ Redis Cache Hit: Behavioral Sessions (Page ${page})`);
//       return parsed;
//     }

//     // ✅ 2. Cache Stampede Protection (SETNX Lock)
//     const LOCK_TTL = 30;
//     const lockKey = `lock:${cacheKey}`;
//     const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
//     const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

//     if (!lockAcquired) {
//       console.log("⏳ Cache Stampede Detected. Waiting 500ms...");
//       await new Promise((resolve) => setTimeout(resolve, 500));
//       const retryCache = await redis.get(cacheKey);
//       const retryParsed = safeParse<BehavioralSessionsResponse>(retryCache as string | null);
//       if (retryParsed) {
//         console.log("⚡ Served stale sessions cache.");
//         return retryParsed;
//       }
//     }

//     try {
//       console.log(`🔒 Sessions Lock acquired (${requestId}). Generating sessions intelligence...`);

//       // ================================================================
//       // 🔥 1. AGGREGATION: Summary + Breakdowns + Trend + Avg Duration
//       // ================================================================
//       const aggregationResult = await UserSession.aggregate([
//         {
//           $match: {
//             createdAt: { $gte: range.from, $lte: range.to },
//           },
//         },
//         {
//           $facet: {
//             summary: [
//               {
//                 $group: {
//                   _id: null,
//                   totalSessions: { $sum: 1 },
//                   activeSessions: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
//                   uniqueVisitors: { $addToSet: "$visitorId" },
//                   totalDurationMs: { $sum: { $subtract: ["$lastPulse", "$createdAt"] } },
//                   sessionCount: { $sum: 1 },
//                 },
//               },
//               {
//                 $project: {
//                   totalSessions: 1,
//                   activeSessions: 1,
//                   uniqueVisitors: { $size: "$uniqueVisitors" },
//                   // ✅ FIX 1: Nested division arrays to comply with MongoDB $divide 2-argument strict limit
//                   avgDurationSec: {
//                     $cond: [
//                       { $eq: ["$sessionCount", 0] },
//                       0,
//                       {
//                         $divide: [
//                           { $divide: ["$totalDurationMs", "$sessionCount"] },
//                           1000
//                         ]
//                       },
//                     ],
//                   },
//                 },
//               },
//             ],
//             deviceBreakdown: [
//               { $group: { _id: "$device", count: { $sum: 1 } } },
//               { $sort: { count: -1 } },
//             ],
//             osBreakdown: [
//               { $group: { _id: "$os", count: { $sum: 1 } } },
//               { $sort: { count: -1 } },
//             ],
//             browserBreakdown: [
//               { $group: { _id: "$browser", count: { $sum: 1 } } },
//               { $sort: { count: -1 } },
//             ],
//             cityBreakdown: [
//               { $match: { city: { $ne: null } } },
//               { $group: { _id: "$city", count: { $sum: 1 } } },
//               { $sort: { count: -1 } },
//               { $limit: 5 },
//             ],
//             countryBreakdown: [
//               { $match: { country: { $ne: null } } },
//               { $group: { _id: "$country", count: { $sum: 1 } } },
//               { $sort: { count: -1 } },
//               { $limit: 5 },
//             ],
//             trend: [
//               {
//                 $group: {
//                   _id: {
//                     $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
//                   },
//                   sessions: { $sum: 1 },
//                   activeSessions: {
//                     $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
//                   },
//                 },
//               },
//               { $sort: { _id: 1 } },
//             ],
//           },
//         },
//       ]);

//       const result = aggregationResult[0];
//       const summaryData = result.summary[0] || {
//         totalSessions: 0,
//         activeSessions: 0,
//         uniqueVisitors: 0,
//         avgDurationSec: 0,
//       };
//       const totalSessions = summaryData.totalSessions || 0;
//       const activeSessions = summaryData.activeSessions || 0;
//       const uniqueVisitors = summaryData.uniqueVisitors || 0;
//       const avgSessionDuration = Math.round(summaryData.avgDurationSec || 0);

//       // ✅ FIX 2: New Sessions (from `session_start` events)
//       const newSessionsCount = await UserEvent.countDocuments({
//         eventType: "session_start",
//         createdAt: { $gte: range.from, $lte: range.to },
//       });

//       // ✅ FIX 3: New Sessions Trend (Daily new sessions)
//       const newSessionTrend = await UserEvent.aggregate([
//         {
//           $match: {
//             eventType: "session_start",
//             createdAt: { $gte: range.from, $lte: range.to },
//           },
//         },
//         {
//           $group: {
//             _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//             count: { $sum: 1 },
//           },
//         },
//         { $sort: { _id: 1 } },
//       ]);
//       const newSessionMap = new Map(newSessionTrend.map((t: any) => [t._id, t.count]));

//       // ================================================================
//       // 🔥 2. PAGINATED SESSION LIST
//       // ================================================================
//       const [sessionList, totalDocs] = await Promise.all([
//         UserSession.find({
//           createdAt: { $gte: range.from, $lte: range.to },
//         })
//           .sort({ lastPulse: -1 })
//           .skip((page - 1) * limit)
//           .limit(limit)
//           .select("_id sessionId visitorId userId device os browser city country isActive lastPulse createdAt")
//           .lean(),
//         UserSession.countDocuments({
//           createdAt: { $gte: range.from, $lte: range.to },
//         }),
//       ]);

//       // ================================================================
//       // 🧠 3. FORMAT BREAKDOWNS (with percentages)
//       // ================================================================
//       const formatBreakdown = (items: any[], total: number) => {
//         return items.map((item) => ({
//           label: item._id || "Unknown",
//           count: item.count,
//           percentage: total > 0 ? Number(((item.count / total) * 100).toFixed(1)) : 0,
//         }));
//       };

//       // ================================================================
//       // 🔥 4. CONTINUOUS DATE GAP FILLING (Zero warnings, smooth Recharts)
//       // ================================================================
//       const trendMap = new Map<string, any>(
//         result.trend.map((t: any) => [t._id, t])
//       );

//       const fullTrend: SessionTrendPoint[] = [];
//       let currentDate = range.from;

//       while (currentDate <= range.to) {
//         const dateStr = format(currentDate, "yyyy-MM-dd");
//         const existing = trendMap.get(dateStr);

//         fullTrend.push({
//           date: dateStr,
//           sessions: existing?.sessions || 0,
//           activeSessions: existing?.activeSessions || 0,
//           newSessions: newSessionMap.get(dateStr) || 0,
//         });

//         currentDate = addDays(currentDate, 1);
//       }

//       // ================================================================
//       // 🚀 5. RESPONSE
//       // ================================================================
//       const response: BehavioralSessionsResponse = {
//         summary: {
//           activeSessions,
//           totalSessions,
//           newSessions: newSessionsCount,
//           uniqueVisitors,
//           avgSessionDuration,
//         },
//         breakdown: {
//           device: formatBreakdown(result.deviceBreakdown, totalSessions),
//           os: formatBreakdown(result.osBreakdown, totalSessions),
//           browser: formatBreakdown(result.browserBreakdown, totalSessions),
//           city: formatBreakdown(result.cityBreakdown, totalSessions),
//           country: formatBreakdown(result.countryBreakdown, totalSessions),
//         },
//         trend: fullTrend, // ✅ Returns 100% continuous gap-filled trendpoints
//         sessions: sessionList.map((s: any) => ({
//           _id: s._id.toString(),
//           sessionId: s.sessionId,
//           visitorId: s.visitorId,
//           userId: s.userId || undefined,
//           device: s.device || "Unknown",
//           os: s.os || "Unknown",
//           browser: s.browser || "Unknown",
//           city: s.city || undefined,
//           country: s.country || undefined,
//           isActive: s.isActive || false,
//           lastPulse: s.lastPulse ? new Date(s.lastPulse).toISOString() : new Date().toISOString(),
//           createdAt: new Date(s.createdAt).toISOString(),
//         })),
//         totalDocs,
//         totalPages: Math.ceil(totalDocs / limit),
//         currentPage: page,
//         limit,
//         generatedAt: new Date().toISOString(),
//       };

//       // ✅ 6. Cache for 5 minutes (using safeStringify)
//       await redis.set(cacheKey, safeStringify(response), { ex: 300 });
//       console.log(`✅ Behavioral Sessions Cached (Page ${page}) — ${fullTrend.length} points`);

//       return response;
//     } finally {
//       await releaseLock(lockKey, requestId);
//     }
//   } catch (error: any) {
//     console.error("Behavioral Sessions Engine Error:", error.message);
//     return {
//       summary: {
//         activeSessions: 0,
//         totalSessions: 0,
//         newSessions: 0,
//         uniqueVisitors: 0,
//         avgSessionDuration: 0,
//       },
//       breakdown: { device: [], os: [], browser: [], city: [], country: [] },
//       trend: [],
//       sessions: [],
//       totalDocs: 0,
//       totalPages: 0,
//       currentPage: page,
//       limit,
//       generatedAt: new Date().toISOString(),
//     };
//   }
// }
// 📂 src/app/features/admin/behavioral-intelligence/actions/getBehavioralSessions.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";
import UserSession from "@/models/UserSession";
import UserEvent from "@/models/UserEvent";
import User from "@/models/User";
import { Types } from "mongoose";
import { format, addDays } from "date-fns";
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES (100% Preserved)
// ================================================================
export interface SessionBreakdown {
  device: { label: string; count: number; percentage: number }[];
  os: { label: string; count: number; percentage: number }[];
  browser: { label: string; count: number; percentage: number }[];
  city: { label: string; count: number; percentage: number }[];
  country: { label: string; count: number; percentage: number }[];
}

export interface SessionTrendPoint {
  date: string;
  sessions: number;
  activeSessions: number;
  newSessions: number;
}

export interface SessionListItem {
  _id: string;
  sessionId: string;
  visitorId: string;
  userId?: string;
  device: string;
  os: string;
  browser: string;
  city?: string;
  country?: string;
  isActive: boolean;
  lastPulse: string;
  createdAt: string;
}

export interface BehavioralSessionsResponse {
  summary: {
    activeSessions: number;
    totalSessions: number;
    newSessions: number;
    uniqueVisitors: number;
    avgSessionDuration: number;
  };
  breakdown: SessionBreakdown;
  trend: SessionTrendPoint[];
  sessions: SessionListItem[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  generatedAt: string;
}

// ================================================================
// 🛡️ CACHE STAMPEDE PROTECTION
// ================================================================
const LUA_RELEASE_LOCK = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

const releaseLock = async (lockKey: string, requestId: string): Promise<void> => {
  try {
    const result = await redis.eval(LUA_RELEASE_LOCK, [lockKey], [requestId]);
    if (result === 1) console.log(`🔓 Sessions Lock released (${requestId}).`);
  } catch (error) { console.error("Sessions Lock release error:", error); }
};

// ================================================================
// 🚀 MAIN FUNCTION — Enterprise Ready
// ================================================================
export async function getBehavioralSessions(
  range: { from: Date; to: Date },
  page: number = 1,
  limit: number = 25
): Promise<BehavioralSessionsResponse> {
  const fromStr = format(range.from, "yyyy-MM-dd");
  const toStr = format(range.to, "yyyy-MM-dd");
  const cacheKey = `analytics_behavioral_sessions_v4:${fromStr}_${toStr}:page_${page}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // 1. Cache Check
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<BehavioralSessionsResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Behavioral Sessions (Page ${page})`);
      return parsed;
    }

    // 2. Cache Stampede Protection (SETNX Lock)
    const LOCK_TTL = 30;
    const lockKey = `lock:${cacheKey}`;
    const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

    if (!lockAcquired) {
      console.log("⏳ Cache Stampede Detected. Waiting 500ms...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      const retryCache = await redis.get(cacheKey);
      const retryParsed = safeParse<BehavioralSessionsResponse>(retryCache as string | null);
      if (retryParsed) {
        console.log("⚡ Served stale sessions cache.");
        return retryParsed;
      }
    }

    try {
      console.log(`🔒 Sessions Lock acquired (${requestId}). Generating sessions intelligence...`);

      // 3. AGGREGATION: Summary + Breakdowns + Trend + Avg Duration
      const aggregationResult = await UserSession.aggregate([
        {
          $match: {
            createdAt: { $gte: range.from, $lte: range.to },
          },
        },
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  totalSessions: { $sum: 1 },
                  activeSessions: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
                  uniqueVisitors: { $addToSet: "$visitorId" },
                  totalDurationMs: { $sum: { $subtract: ["$lastPulse", "$createdAt"] } },
                  sessionCount: { $sum: 1 },
                },
              },
              {
                $project: {
                  totalSessions: 1,
                  activeSessions: 1,
                  uniqueVisitors: { $size: "$uniqueVisitors" },
                  avgDurationSec: {
                    $cond: [
                      { $eq: ["$sessionCount", 0] },
                      0,
                      {
                        $divide: [
                          { $divide: ["$totalDurationMs", "$sessionCount"] },
                          1000
                        ]
                      },
                    ],
                  },
                },
              },
            ],
            deviceBreakdown: [
              { $group: { _id: "$device", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
            osBreakdown: [
              { $group: { _id: "$os", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
            browserBreakdown: [
              { $group: { _id: "$browser", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
            ],
            cityBreakdown: [
              { $match: { city: { $ne: null } } },
              { $group: { _id: "$city", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 5 },
            ],
            countryBreakdown: [
              { $match: { country: { $ne: null } } },
              { $group: { _id: "$country", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 5 },
            ],
            trend: [
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                  },
                  sessions: { $sum: 1 },
                  activeSessions: {
                    $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                  },
                },
              },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]);

      const result = aggregationResult[0];
      const summaryData = result.summary[0] || {
        totalSessions: 0,
        activeSessions: 0,
        uniqueVisitors: 0,
        avgDurationSec: 0,
      };
      const totalSessions = summaryData.totalSessions || 0;
      const activeSessions = summaryData.activeSessions || 0;
      const uniqueVisitors = summaryData.uniqueVisitors || 0;
      const avgSessionDuration = Math.round(summaryData.avgDurationSec || 0);

      // New Sessions count
      const newSessionsCount = await UserEvent.countDocuments({
        eventType: "session_start",
        createdAt: { $gte: range.from, $lte: range.to },
      });

      // New Sessions Trend
      const newSessionTrend = await UserEvent.aggregate([
        {
          $match: {
            eventType: "session_start",
            createdAt: { $gte: range.from, $lte: range.to },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      const newSessionMap = new Map(newSessionTrend.map((t: any) => [t._id, t.count]));

      // 4. PAGINATED SESSION LIST
      const [sessionList, totalDocs] = await Promise.all([
        UserSession.find({
          createdAt: { $gte: range.from, $lte: range.to },
        })
          .sort({ lastPulse: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .select("_id sessionId visitorId userId device os browser city country isActive lastPulse createdAt")
          .lean(),
        UserSession.countDocuments({
          createdAt: { $gte: range.from, $lte: range.to },
        }),
      ]);

      // ✅ FIX: BSON Shield User Batch Lookup for Customer Names / Emails
      const rawUserIds = sessionList.map((s: any) => s.userId).filter(Boolean);
      const validUserObjectIds = rawUserIds.filter((id) => Types.ObjectId.isValid(String(id)));

      let userMap = new Map<string, string>();

      if (validUserObjectIds.length > 0) {
        try {
          const users = (await User.find(
            { _id: { $in: validUserObjectIds } },
            { name: 1, email: 1 }
          ).lean()) as any[];

          userMap = new Map(
            users.map((u) => [
              u._id.toString(),
              u.name || u.email || "Customer #" + u._id.toString().slice(-6).toUpperCase(),
            ])
          );
        } catch (uErr) {
          console.warn("⚠️ Failed to batch fetch user names for sessions:", uErr);
        }
      }

      // FORMAT BREAKDOWNS
      const formatBreakdown = (items: any[], total: number) => {
        return items.map((item) => ({
          label: item._id || "Unknown",
          count: item.count,
          percentage: total > 0 ? Number(((item.count / total) * 100).toFixed(1)) : 0,
        }));
      };

      // CONTINUOUS DATE GAP FILLING
      const trendMap = new Map<string, any>(
        result.trend.map((t: any) => [t._id, t])
      );

      const fullTrend: SessionTrendPoint[] = [];
      let currentDate = range.from;

      while (currentDate <= range.to) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        const existing = trendMap.get(dateStr);

        fullTrend.push({
          date: dateStr,
          sessions: existing?.sessions || 0,
          activeSessions: existing?.activeSessions || 0,
          newSessions: newSessionMap.get(dateStr) || 0,
        });

        currentDate = addDays(currentDate, 1);
      }

      // RESPONSE
      const response: BehavioralSessionsResponse = {
        summary: {
          activeSessions,
          totalSessions,
          newSessions: newSessionsCount,
          uniqueVisitors,
          avgSessionDuration,
        },
        breakdown: {
          device: formatBreakdown(result.deviceBreakdown, totalSessions),
          os: formatBreakdown(result.osBreakdown, totalSessions),
          browser: formatBreakdown(result.browserBreakdown, totalSessions),
          city: formatBreakdown(result.cityBreakdown, totalSessions),
          country: formatBreakdown(result.countryBreakdown, totalSessions),
        },
        trend: fullTrend,
        sessions: sessionList.map((s: any) => {
          const resolvedUser = s.userId ? (userMap.get(s.userId.toString()) || s.userId) : undefined;
          return {
            _id: s._id.toString(),
            sessionId: s.sessionId,
            visitorId: s.visitorId,
            userId: resolvedUser,
            device: s.device || "Unknown",
            os: s.os || "Unknown",
            browser: s.browser || "Unknown",
            city: s.city || undefined,
            country: s.country || undefined,
            isActive: s.isActive || false,
            lastPulse: s.lastPulse ? new Date(s.lastPulse).toISOString() : new Date().toISOString(),
            createdAt: new Date(s.createdAt).toISOString(),
          };
        }),
        totalDocs,
        totalPages: Math.ceil(totalDocs / limit),
        currentPage: page,
        limit,
        generatedAt: new Date().toISOString(),
      };

      await redis.set(cacheKey, safeStringify(response), { ex: 300 });
      console.log(`✅ Behavioral Sessions Cached (Page ${page}) — User Names Resolved`);

      return response;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Behavioral Sessions Engine Error:", error.message);
    return {
      summary: {
        activeSessions: 0,
        totalSessions: 0,
        newSessions: 0,
        uniqueVisitors: 0,
        avgSessionDuration: 0,
      },
      breakdown: { device: [], os: [], browser: [], city: [], country: [] },
      trend: [],
      sessions: [],
      totalDocs: 0,
      totalPages: 0,
      currentPage: page,
      limit,
      generatedAt: new Date().toISOString(),
    };
  }
}