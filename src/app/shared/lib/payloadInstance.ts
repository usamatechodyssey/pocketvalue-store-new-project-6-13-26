// // // @/app/shared/lib/payloadinstance.ts

// import mongoose from "mongoose";
// import { getPayload } from "payload"; // ✅ Unified non-deprecated stable import
// import configPromise from "@payload-config";

// // ✅ Connection helper for Cluster A (Transactions DB)
// import connectMongoose from "@/app/shared/lib/checkout/mongoose";

// let cached = (global as any).payloadInstance;

// if (!cached) {
//   cached = (global as any).payloadInstance = { client: null, promise: null };
// }

// export async function getSafePayload() {
//   const isDisconnected =
//     typeof window === "undefined" &&
//     mongoose.connection.readyState !== 1 &&
//     mongoose.connection.readyState !== 2;

//   // 1. Agar connection dead hai, toh globally cache ko reset karein
//   if (isDisconnected) {
//     console.warn("⚠️ [Database Sync] MongoDB connection closed or disconnected. Invalidating Payload cache to reconnect...");
//     cached.client = null;
//     cached.promise = null;
//   }

//   // 2. Agar connection pehle se active hai, toh instance fauran return karein
//   if (cached.client) {
//     return cached.client;
//   }

//   // 3. MASTER PROMISE PIPELINE (Concurrency Lock)
//   // Is check ki wajah se Promise.all() ki saari requests dobara duplicate connections banane ke bajaye
//   // isi ek single initialization promise ka wait karengi, jo race condition ko completely khatam karta hai.
//   if (!cached.promise) {
//     cached.promise = (async () => {
//       // Step A: Pehle check karein ke Cluster A (Mongoose) connected hai
//       if (isDisconnected) {
//         try {
//           await connectMongoose();
//           console.log("✅ [Database Sync] Mongoose (Cluster A) reconnected successfully.");
//         } catch (connError) {
//           console.error("❌ [Database Sync] Failed to reconnect Mongoose:", connError);
//           throw connError;
//         }
//       }

//       // Step B: Standard non-deprecated getPayload se client initialize karein
//       const payloadInstance = await getPayload({ config: configPromise });
//       cached.client = payloadInstance;
//       return payloadInstance;
//     })().catch((err) => {
//       // Rejection par cache reset karein taake next requests retry kar sakein
//       cached.promise = null;
//       cached.client = null;
//       throw err;
//     });
//   }

//   return cached.promise;
// }
// 📂 src/app/shared/lib/payloadInstance.ts (UPDATED WITH ACTIVE-CONNECTION PIPELINE SECURITY)

import mongoose from "mongoose";
import { getPayload } from "payload"; // ✅ Unified non-deprecated stable import
import configPromise from "@payload-config";

// ✅ Connection helper for Cluster A (Transactions DB)
import connectMongoose from "@/app/shared/lib/checkout/mongoose";

let cached = (global as any).payloadInstance;

if (!cached) {
  cached = (global as any).payloadInstance = { client: null, promise: null };
}

export async function getSafePayload() {
  // ✅ Strictly check if Mongoose is NOT fully active and connected (readyState !== 1)
  const isNotConnected =
    typeof window === "undefined" &&
    mongoose.connection.readyState !== 1;

  // 1. Agar connection fully active nahi hai, toh globally cache ko reset karein taake reconnect ho sake
  if (isNotConnected) {
    console.warn(`⚠️ [Database Sync] MongoDB connection not active (readyState: ${mongoose.connection.readyState}). Invalidating Payload cache to reconnect...`);
    cached.client = null;
    cached.promise = null;
  }

  // 2. Agar connection pehle se active hai, toh instance fauran return karein
  if (cached.client) {
    return cached.client;
  }

  // 3. MASTER PROMISE PIPELINE (Concurrency Lock)
  // Is check ki wajah se Promise.all() ki saari requests dobara duplicate connections banane ke bajaye
  // isi ek single initialization promise ka wait karengi, jo race condition ko completely khatam karta hai.
  if (!cached.promise) {
    cached.promise = (async () => {
      // Step A: Pehle check karein ke Cluster A (Mongoose) connected hai
      if (isNotConnected) {
        try {
          await connectMongoose();
          console.log("✅ [Database Sync] Mongoose (Cluster A) reconnected successfully.");
        } catch (connError) {
          console.error("❌ [Database Sync] Failed to reconnect Mongoose:", connError);
          throw connError;
        }
      }

      // Step B: Standard non-deprecated getPayload se client initialize karein
      const payloadInstance = await getPayload({ config: configPromise });
      cached.client = payloadInstance;
      return payloadInstance;
    })().catch((err) => {
      // Rejection par cache reset karein taake next requests retry kar sakein
      cached.promise = null;
      cached.client = null;
      throw err;
    });
  }

  return cached.promise;
}