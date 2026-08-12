// 📂 src/sanity/structure.ts

import type { StructureResolver } from "sanity/structure";
import { BookText, FolderOpen, Users, FileText } from "lucide-react";

// ================================================================
// 🏆 SANITY STUDIO STRUCTURE RESOLVER (RECONCILED & CLEANED)
// ================================================================
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content Management")
    .items([
      // Blog & Book Content Section
      S.listItem()
        .title("Blog Content")
        .icon(BookText)
        .child(
          S.list()
            .title("Blog Management")
            .items([
              // 1. All Book Chapters / Posts
              S.listItem()
                .title("All Chapters / Posts")
                .icon(FileText)
                .schemaType("post")
                .child(S.documentTypeList("post").title("All Chapters")),
              
              // 2. Book Volumes / Categories
              S.listItem()
                .title("Book Volumes / Categories")
                .icon(FolderOpen)
                .schemaType("category")
                .child(S.documentTypeList("category").title("Book Volumes")),

              // 3. Authors / Contributors
              S.listItem()
                .title("Authors / Contributors")
                .icon(Users)
                .schemaType("author")
                .child(S.documentTypeList("author").title("Authors")),
            ]),
        ),

      S.divider(),
      // Filter out explicitly structured items to prevent duplication at the bottom
      ...S.documentTypeListItems().filter(
        (listItem) =>
          !["post", "author", "category"].includes(listItem.getId()!),
      ),
    ]);