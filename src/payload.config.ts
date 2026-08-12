
// // 📂 src/payload.config.ts

// import { mongooseAdapter } from "@payloadcms/db-mongodb";
// import { lexicalEditor } from "@payloadcms/richtext-lexical";
// import path from "path";
// import { buildConfig } from "payload";
// import { fileURLToPath } from "url";
// import sharp from "sharp";

// // ================================================================
// // 🔥 PAYLOAD COLLECTIONS
// // ================================================================
// import { Users } from "./collections/Users";
// import { Categories } from "./collections/Categories";
// import { Media } from "./collections/Media";
// import { Brands } from "./collections/Brands";
// import { Campaigns } from "./collections/Campaigns";
// import { Products } from "./collections/Products";
// import { Reviews } from "./collections/Reviews";
// import { Coupons } from "./collections/Coupons";
// import { Pages } from "./collections/Pages";
// import { CouponBanners } from "./collections/CouponBanners";
// import { HeroCarousel } from "./collections/HeroCarousel";
// import { AuditLogs } from "./collections/AuditLogs";
// import { Settings } from "./globals/Settings";
// import { FAQ } from "./globals/FAQ";
// import { Homepage } from "./globals/Homepage";
// import {
//   createAuditAfterChangeHook,
//   createAuditAfterDeleteHook,
// } from "./hooks/auditHook";

// const filename = fileURLToPath(import.meta.url);
// const dirname = path.dirname(filename);

// function wrapCollectionWithAudit(collection: any): any {
//   if (collection.slug === "audit-logs") return collection;
//   const existingHooks = collection.hooks || {};
//   const afterChange = existingHooks.afterChange || [];
//   const afterDelete = existingHooks.afterDelete || [];
//   return {
//     ...collection,
//     hooks: {
//       ...existingHooks,
//       afterChange: [
//         ...(Array.isArray(afterChange) ? afterChange : [afterChange]),
//         createAuditAfterChangeHook(collection.slug),
//       ],
//       afterDelete: [
//         ...(Array.isArray(afterDelete) ? afterDelete : [afterDelete]),
//         createAuditAfterDeleteHook(collection.slug),
//       ],
//     },
//   };
// }

// export default buildConfig({
//   admin: {
//     user: Users.slug,
//     importMap: {
//       baseDir: path.resolve(dirname),
//     },
//     components: {
//       afterNav: [
//         "/app/features/admin/inventory-cms/components/main/CustomNavLink",
//         "/app/features/admin/inventory-cms/components/main/CustomCategoryNavLink",
//         "/app/features/admin/inventory-cms/components/main/CustomDeletionNavLink",
//         "/app/features/admin/inventory-cms/components/main/CustomPaymentSettingsNavLink",
//         "/app/features/admin/order-fulfillment/components/orders/CustomOrdersNavLink",
//         "/app/features/admin/inventory-cms/components/payload-products/CustomProductsNavLink",
//         "/app/features/admin/inventory-cms/components/categories/CustomCategoryExplorerNavLink",
//         "/app/features/admin/order-fulfillment/components/returns/CustomReturnsNavLink",
//         "/app/features/admin/inventory-cms/components/payload-users/CustomUsersNavLink",
//         "/app/features/admin/staff-management/components/CustomStaffNavLink",
//         "/app/features/admin/inventory-cms/components/main/CustomCourierSettingsNavLink",
//         "/app/features/admin/analytics-telemetry/components/CustomAuditNavLink",
//         "/app/features/admin/loyalty-intelligence/components/CustomLoyaltyNavLink",
//         // ✅ NEW: Reports Sidebar Link
//         "/app/features/admin/reports/components/CustomReportsNavLink",
//         // ✅ 🆕 NEW: Customer Requests Custom Sidebar Link added!
//         "/app/features/admin/customer-requests/components/CustomCustomerRequestsNavLink",
//       ],
//       views: {
//         // ================================================================
//         // 🔥 ALL 27 VIEWS (FULLY SYNCED & HARDENED)
//         // ================================================================

//         // 1. AnalyticsDashboard (Default)
//         dashboard: {
//           Component: "./app/(payload)/admin/views/AnalyticsDashboard",
//           path: "/",
//         },

//         // 2. BehavioralIntelligenceView
//         BehavioralIntelligence: {
//           Component: "./app/(payload)/admin/views/BehavioralIntelligenceView",
//           path: "/behavioral-intelligence",
//         },

//         // 3. CategoryExplorer
//         CategoryExplorer: {
//           Component: "./app/(payload)/admin/views/CategoryExplorer",
//           path: "/category-explorer",
//         },

//         // 4. GeospatialIntelligenceView
//         GeospatialIntelligence: {
//           Component: "./app/(payload)/admin/views/GeospatialIntelligenceView",
//           path: "/geospatial-intelligence",
//         },

//         // 5. ImportCategories
//         ImportCategories: {
//           Component: "./app/(payload)/admin/views/ImportCategories",
//           path: "/import-categories",
//         },

//         // 6. ImportProducts
//         ImportProducts: {
//           Component: "./app/(payload)/admin/views/ImportProducts",
//           path: "/import-products",
//         },

//         // 7. InactiveCustomersView
//         InactiveCustomers: {
//           Component: "./app/(payload)/admin/views/InactiveCustomersView",
//           path: "/inactive-customers",
//         },

//         // 8. InventoryForecastView
//         InventoryForecast: {
//           Component: "./app/(payload)/admin/views/InventoryForecastView",
//           path: "/inventory-forecast",
//         },

//         // 9. InventoryRiskList
//         InventoryRisk: {
//           Component: "./app/(payload)/admin/views/InventoryRiskList",
//           path: "/inventory-risk",
//         },

//         // 10. MarketingHubView
//         MarketingHub: {
//           Component: "./app/(payload)/admin/views/MarketingHubView",
//           path: "/marketing-hub",
//         },

//         // 11. OperationalIntelligenceView
//         OperationalIntelligence: {
//           Component: "./app/(payload)/admin/views/OperationalIntelligenceView",
//           path: "/operational-intelligence",
//         },

//         // 12. OrderDetail
//         OrderDetail: {
//           Component: "./app/(payload)/admin/views/OrderDetail",
//           path: "/orders/:id",
//         },

//         // 13. OrdersList
//         OrdersList: {
//           Component: "./app/(payload)/admin/views/OrdersList",
//           path: "/orders",
//           exact: true,
//         },

//         // 14. PaymentSettings
//         PaymentSettings: {
//           Component: "./app/(payload)/admin/views/PaymentSettings",
//           path: "/payment-settings",
//         },

//         // 15. ProductIntelligenceView
//         ProductIntelligence: {
//           Component: "./app/(payload)/admin/views/ProductIntelligenceView",
//           path: "/product-intelligence",
//         },

//         // 16. ProductsList (mapped as ProductExplorer)
//         ProductExplorer: {
//           Component: "./app/(payload)/admin/views/ProductsList",
//           path: "/product-explorer",
//         },

//         // 17. ReferralIntelligenceView (mapped as LoyaltyIntelligence)
//         LoyaltyIntelligence: {
//           Component: "./app/(payload)/admin/views/ReferralIntelligenceView",
//           path: "/loyalty-intelligence",
//         },

//         // 18. ReportsIndex
//         ReportsIndex: {
//           Component: "./app/(payload)/admin/views/ReportsIndex",
//           path: "/reports-index",
//           exact: true,
//         },

//         // 19. ReportDetailView
//         ReportDetailView: {
//           Component: "./app/(payload)/admin/views/ReportDetailView",
//           path: "/reports-index/:slug",
//         },

//         // 20. ReturnDetail
//         ReturnDetail: {
//           Component: "./app/(payload)/admin/views/ReturnDetail",
//           path: "/returns/:id",
//         },

//         // 21. ReturnsList
//         ReturnsList: {
//           Component: "./app/(payload)/admin/views/ReturnsList",
//           path: "/returns",
//           exact: true,
//         },

//         // 22. SegmentBuilderView
//         SegmentBuilder: {
//           Component: "./app/(payload)/admin/views/SegmentBuilderView",
//           path: "/segment-builder",
//         },

//         // 23. StaffManagement
//         StaffManagement: {
//           Component: "./app/(payload)/admin/views/StaffManagement",
//           path: "/staff-management",
//         },

//         // 24. UserDetail
//         UserDetail: {
//           Component: "./app/(payload)/admin/views/UserDetail",
//           path: "/users-explorer/:id",
//         },

//         // 25. UsersList (mapped as UsersExplorer)
//         UsersExplorer: {
//           Component: "./app/(payload)/admin/views/UsersList",
//           path: "/users-explorer",
//           exact: true,
//         },

//         // 26. CourierSettings
//         CourierSettings: {
//           Component: "./app/(payload)/admin/views/CourierSettings",
//           path: "/courier-settings",
//         },

//         // ✅ 🆕 27. CUSTOMER REQUESTS PAGE VIEW (Direct Cluster A Access)
//         CustomerRequestsView: {
//           Component: "./app/(payload)/admin/views/CustomerRequestsView",
//           path: "/customer-requests",
//         },
//       },
//     },
//   },

//   editor: lexicalEditor({}),

//   db: mongooseAdapter({
//     url: process.env.PAYLOAD_MONGODB_URI || "",
//     connectOptions: {
//       maxPoolSize: 10,
//       maxIdleTimeMS: 270000,
//       minPoolSize: 1,                 
//       serverSelectionTimeoutMS: 30000, 
//     },
//   }),

//   onInit: async (payload) => {
//     console.log("✅ Payload initialized successfully.");
//   },

//   collections: [
//     ...[
//       Users,
//       Categories,
//       Media,
//       Products,
//       Brands,
//       Campaigns,
//       Reviews,
//       Coupons,
//       Pages,
//       CouponBanners,
//       HeroCarousel,
//       AuditLogs,
//       // ✅ Removed old CustomerRequests collection (Cluster B decoupled!)
//     ].map(wrapCollectionWithAudit),
//   ],

//   globals: [Settings, FAQ, Homepage],

//   secret: process.env.PAYLOAD_SECRET || "",
//   sharp,
//   typescript: {
//     outputFile: path.resolve(dirname, "payload-types.ts"),
//   },
// });
// 📂 src/payload.config.ts

import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

// ✅ NODEMAILER SMTP ADAPTER
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";

// ================================================================
// 🔥 PAYLOAD COLLECTIONS
// ================================================================
import { Users } from "./collections/Users";
import { Categories } from "./collections/Categories";
import { Media } from "./collections/Media";
import { Brands } from "./collections/Brands";
import { Campaigns } from "./collections/Campaigns";
import { Products } from "./collections/Products";
import { Reviews } from "./collections/Reviews";
import { Coupons } from "./collections/Coupons";
import { Pages } from "./collections/Pages";
import { CouponBanners } from "./collections/CouponBanners";
import { HeroCarousel } from "./collections/HeroCarousel";
import { AuditLogs } from "./collections/AuditLogs";
import { Settings } from "./globals/Settings";
import { FAQ } from "./globals/FAQ";
import { Homepage } from "./globals/Homepage";
import {
  createAuditAfterChangeHook,
  createAuditAfterDeleteHook,
} from "./hooks/auditHook";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

function wrapCollectionWithAudit(collection: any): any {
  if (collection.slug === "audit-logs") return collection;
  const existingHooks = collection.hooks || {};
  const afterChange = existingHooks.afterChange || [];
  const afterDelete = existingHooks.afterDelete || [];
  return {
    ...collection,
    hooks: {
      ...existingHooks,
      afterChange: [
        ...(Array.isArray(afterChange) ? afterChange : [afterChange]),
        createAuditAfterChangeHook(collection.slug),
      ],
      afterDelete: [
        ...(Array.isArray(afterDelete) ? afterDelete : [afterDelete]),
        createAuditAfterDeleteHook(collection.slug),
      ],
    },
  };
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      afterNav: [
        "/app/features/admin/inventory-cms/components/main/CustomNavLink",
        "/app/features/admin/inventory-cms/components/main/CustomCategoryNavLink",
        "/app/features/admin/inventory-cms/components/main/CustomDeletionNavLink",
        "/app/features/admin/inventory-cms/components/main/CustomPaymentSettingsNavLink",
        "/app/features/admin/order-fulfillment/components/orders/CustomOrdersNavLink",
        "/app/features/admin/inventory-cms/components/payload-products/CustomProductsNavLink",
        "/app/features/admin/inventory-cms/components/categories/CustomCategoryExplorerNavLink",
        "/app/features/admin/order-fulfillment/components/returns/CustomReturnsNavLink",
        "/app/features/admin/inventory-cms/components/payload-users/CustomUsersNavLink",
        "/app/features/admin/staff-management/components/CustomStaffNavLink",
        "/app/features/admin/inventory-cms/components/main/CustomCourierSettingsNavLink",
        "/app/features/admin/analytics-telemetry/components/CustomAuditNavLink",
        "/app/features/admin/loyalty-intelligence/components/CustomLoyaltyNavLink",
        "/app/features/admin/reports/components/CustomReportsNavLink",
        "/app/features/admin/customer-requests/components/CustomCustomerRequestsNavLink",
      ],
      views: {
        dashboard: {
          Component: "./app/(payload)/admin/views/AnalyticsDashboard",
          path: "/",
        },
        BehavioralIntelligence: {
          Component: "./app/(payload)/admin/views/BehavioralIntelligenceView",
          path: "/behavioral-intelligence",
        },
        CategoryExplorer: {
          Component: "./app/(payload)/admin/views/CategoryExplorer",
          path: "/category-explorer",
        },
        GeospatialIntelligence: {
          Component: "./app/(payload)/admin/views/GeospatialIntelligenceView",
          path: "/geospatial-intelligence",
        },
        ImportCategories: {
          Component: "./app/(payload)/admin/views/ImportCategories",
          path: "/import-categories",
        },
        ImportProducts: {
          Component: "./app/(payload)/admin/views/ImportProducts",
          path: "/import-products",
        },
        InactiveCustomers: {
          Component: "./app/(payload)/admin/views/InactiveCustomersView",
          path: "/inactive-customers",
        },
        InventoryForecast: {
          Component: "./app/(payload)/admin/views/InventoryForecastView",
          path: "/inventory-forecast",
        },
        InventoryRisk: {
          Component: "./app/(payload)/admin/views/InventoryRiskList",
          path: "/inventory-risk",
        },
        MarketingHub: {
          Component: "./app/(payload)/admin/views/MarketingHubView",
          path: "/marketing-hub",
        },
        OperationalIntelligence: {
          Component: "./app/(payload)/admin/views/OperationalIntelligenceView",
          path: "/operational-intelligence",
        },
        OrderDetail: {
          Component: "./app/(payload)/admin/views/OrderDetail",
          path: "/orders/:id",
        },
        OrdersList: {
          Component: "./app/(payload)/admin/views/OrdersList",
          path: "/orders",
          exact: true,
        },
        PaymentSettings: {
          Component: "./app/(payload)/admin/views/PaymentSettings",
          path: "/payment-settings",
        },
        ProductIntelligence: {
          Component: "./app/(payload)/admin/views/ProductIntelligenceView",
          path: "/product-intelligence",
        },
        ProductExplorer: {
          Component: "./app/(payload)/admin/views/ProductsList",
          path: "/product-explorer",
        },
        LoyaltyIntelligence: {
          Component: "./app/(payload)/admin/views/ReferralIntelligenceView",
          path: "/loyalty-intelligence",
        },
        ReportsIndex: {
          Component: "./app/(payload)/admin/views/ReportsIndex",
          path: "/reports-index",
          exact: true,
        },
        ReportDetailView: {
          Component: "./app/(payload)/admin/views/ReportDetailView",
          path: "/reports-index/:slug",
        },
        ReturnDetail: {
          Component: "./app/(payload)/admin/views/ReturnDetail",
          path: "/returns/:id",
        },
        ReturnsList: {
          Component: "./app/(payload)/admin/views/ReturnsList",
          path: "/returns",
          exact: true,
        },
        SegmentBuilder: {
          Component: "./app/(payload)/admin/views/SegmentBuilderView",
          path: "/segment-builder",
        },
        StaffManagement: {
          Component: "./app/(payload)/admin/views/StaffManagement",
          path: "/staff-management",
        },
        UserDetail: {
          Component: "./app/(payload)/admin/views/UserDetail",
          path: "/users-explorer/:id",
        },
        html: {
          Component: "./app/(payload)/admin/views/UsersList",
          path: "/users-explorer",
          exact: true,
        },
        CourierSettings: {
          Component: "./app/(payload)/admin/views/CourierSettings",
          path: "/courier-settings",
        },
        CustomerRequestsView: {
          Component: "./app/(payload)/admin/views/CustomerRequestsView",
          path: "/customer-requests",
        },
      },
    },
  },

  editor: lexicalEditor({}),

  db: mongooseAdapter({
    url: process.env.PAYLOAD_MONGODB_URI || "",
    connectOptions: {
      maxPoolSize: 10,
      maxIdleTimeMS: 270000,
      minPoolSize: 1,                 
      serverSelectionTimeoutMS: 30000, 
    },
  }),

  // ✅ ENTERPRISE SMTP EMAIL CONFIGURATION:
  // Dynamically uses environment variables with safe fallbacks to your Mailjet credentials!
  email: nodemailerAdapter({
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || "info@pocketvalue.pk",
    defaultFromName: process.env.EMAIL_FROM_NAME || "PocketValue",
    transportOptions: {
      host: process.env.SMTP_HOST || "in-v3.mailjet.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      auth: {
        user: process.env.SMTP_USER || "61338d1f5c8928a9035ff2ed673bf9c4",
        pass: process.env.SMTP_PASS || "b22a545a7be16893cd702949f630e910",
      },
    },
  }),

  onInit: async (payload) => {
    console.log("✅ Payload initialized successfully with SMTP Mailer active.");
  },

  collections: [
    ...[
      Users,
      Categories,
      Media,
      Products,
      Brands,
      Campaigns,
      Reviews,
      Coupons,
      Pages,
      CouponBanners,
      HeroCarousel,
      AuditLogs,
    ].map(wrapCollectionWithAudit),
  ],

  globals: [Settings, FAQ, Homepage],

  secret: process.env.PAYLOAD_SECRET || "",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});