
// /sanity/lib/client.ts

import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// Determine if the CDN should be used based on the environment.
// In development, we want fresh data. In production, we want cached data for speed.
const useCdn = process.env.NODE_ENV === 'production';

/**
 * The primary, read-only, and cached Sanity client.
 * This client is used for all public-facing data fetching (e.g., in Server Components for pages).
 * It leverages the Sanity CDN for maximum performance and does NOT have a token.
 * This client is SAFE to use anywhere in the application.
 */
export const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  // useCdn,
  // No token is provided, making this a read-only client.
  
  useCdn: false,  // <-- YEH SABSE ZAROORI HAI! Write operations CDN se nahi ho sakti.
  token: process.env.SANITY_API_WRITE_TOKEN, // <-- Token yahan use karna hai server actions ke liye.
});


