
***

# Project Status Update: Video Integration & Future Blueprint

Is document mein current video system ki implementation aur future automated YouTube upload feature ka detailed blueprint shaamil hai.

---

## 1. Current System Readiness

Filhal system manual video URLs ko support karta hai. Neeche modules ki current state aur compatibility di gayi hai:

| Component | Status | Technical Details |
| :--- | :--- | :--- |
| **Database Schema** | Ready | `src/collections/Products.ts` mein `videoUrl` field available hai. |
| **Admin Input Field** | Ready | Payload Admin Panel mein "Product Video URL" text field active hai. |
| **Frontend Renderer** | Ready | `ProductGallery.tsx` video URL detect karke YouTube iframe ya direct HTML5 video tag render karta hai. |
| **Video Upload API** | Pending | Direct admin panel se YouTube par auto-upload ka system abhi active nahi hai (is ka blueprint Section 4 mein hai). |

---

## 2. Admin Guide: Manual Video URL Entry

Admin panel mein videos add karne ke liye product form par "Product Video URL" field ka istemal karein.

### URL Formats

| Source | Input Type | Example |
| :--- | :--- | :--- |
| **YouTube** | Browser address bar ya "Copy video URL" option. | `https://www.youtube.com/watch?v=example` |
| **Direct Video File** | CDN, Cloudinary, ya Cloudflare R2 ka direct `.mp4` link. | `https://cdn.pocketvalue.com/video.mp4` |

> ⚠️ **Important:** Input field mein `<iframe>` code (embed code) paste na karein. System sirf plain text URL accept karta hai.

### YouTube Share Options Explained

| Share Option | Action | Outcome |
| :--- | :--- | :--- |
| **Copy video URL** | Recommended | System automatically video ID extract karke player render kar dega. |
| **Copy embed code** | Avoid | Yeh HTML markup (`<iframe>`) hai, jo validation error trigger karega. |
| **Copy URL at current time** | Supported | Agar video ko specific timestamp se start karna ho toh use kiya ja sakta hai. |

---

## 3. Current Progress (Done vs Pending)

| Module | Status | Scope |
| :--- | :--- | :--- |
| **Manual URL Entry (Backend & Frontend)** | Operational | Manual inputs aur rendering ready hain. |
| **YouTube + Direct Video Rendering** | Operational | Frontend player dynamic rendering handle karta hai. |
| **Direct Video Upload Adapter (YouTube API)** | Planned | Future phase ke liye scheduled hai. |

---

## 4. Future Blueprint: Direct Admin Upload to YouTube

Yeh architecture aur file structure future implementation (Phase 2) ke liye design kiya gaya hai taake Vercel serverless functions par excessive load na aaye.

### Architecture Workflow (Zero Vercel Load)

```text
1. Admin uploads video file (Browser)
   │
   ▼
2. Vercel API Route (/api/admin/video/upload)
   ├── File validation (size, mime type)
   └── Pushes job to Redis Queue (BullMQ)
   │
   ▼
3. Background Worker (Hugging Face / GitHub Actions)
   ├── YouTube OAuth 2.0 Authentication
   ├── Uploads video to YouTube (Resumable upload)
   ├── Returns video URL / ID
   └── Updates Product.videoUrl in Payload Database
   │
   ▼
4. Admin Notification → Video URL auto-filled in product form
```

### Required Files for Future Implementation

| # | File Path | Purpose |
| :--- | :--- | :--- |
| 1 | `src/lib/adapters/media/youtube.adapter.ts` | YouTube API integration (OAuth, resumable upload logic). |
| 2 | `src/app/api/admin/video/upload/route.ts` | API route jo file receive karke queue mein push karegi. |
| 3 | `src/app/features/admin/media/components/VideoUploader.tsx` | Drag-and-drop admin UI component. |
| 4 | `worker/video-upload-worker.ts` | External background worker code. |
| 5 | `src/app/api/webhooks/video-upload/route.ts` | Webhook receiver jo DB mein status update karega. |
| 6 | `.github/workflows/video-upload-cron.yml` | Optional GitHub Actions workflow file. |

### Required Environment Variables (YouTube Data API v3)

Google Cloud Console par OAuth Credentials create karne ke baad `.env` file mein yeh keys configure karni hongi:

```bash
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REFRESH_TOKEN=your_refresh_token
YOUTUBE_CHANNEL_ID=your_channel_id
```

***

**Next Step:** Kya is video upload system ke blueprint ko save karne ke baad hum **Reports Module** ki implementation shuru karein?