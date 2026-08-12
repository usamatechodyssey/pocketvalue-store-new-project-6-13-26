// 📂 src/sanity/schemas/category.ts

import { defineField, defineType } from "sanity";
import { FolderOpen } from "lucide-react";

export default defineType({
  name: "category",
  title: "Category / Volume",
  type: "document",
  icon: FolderOpen,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
  ],
});