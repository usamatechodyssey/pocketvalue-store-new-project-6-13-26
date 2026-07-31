// src/sanity/lib/queries.ts

import { client } from "./client";
import groq from "groq";

// =========================================================
// 🔥 BLOG QUERIES (Only blog-related functions kept)
// =========================================================

const POSTS_PER_PAGE = 16;

export const GET_TOTAL_POST_COUNT = groq`count(*[_type == "post"])`;

export const getPaginatedPosts = async (page: number = 1) => {
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = page * POSTS_PER_PAGE;

  const query = groq`
    *[_type == "post"] | order(publishedAt desc) [${start}...${end}] {
      _id,
      title,
      "slug": slug.current,
      mainImage,
      excerpt,
      publishedAt,
      "authorName": author->name,
      "authorImage": author->image
    }
  `;
  return await client.fetch(query);
};

export const GET_SINGLE_POST_FOR_PAGE = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    _updatedAt,
    title,
    "slug": slug.current,
    mainImage,
    body,
    publishedAt,
    excerpt,
    "author": author->{ name, image, bio },
    "categories": categories[]->{ _id, name, "slug": slug.current },
    "relatedProductSlugs": relatedProductSlugs,
    seo
  }
`;