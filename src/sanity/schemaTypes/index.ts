// 📂 src/sanity/schemaTypes/index.ts

import { type SchemaTypeDefinition } from 'sanity'

import post from '../schemas/post'
import author from '../schemas/author'
import category from '../schemas/category' // ✅ ADDED: Registered category/volume schema safely
import blockContent from '../schemas/blockContent'
import seo from '../schemas/seo'

export const schema: { types: SchemaTypeDefinition[] } = {
  // ✅ ENHANCED: Added category to avoid "Unknown type: category" compilation crashes
  types: [post, author, category, blockContent, seo],
}