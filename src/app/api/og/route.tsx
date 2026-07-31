// src/app/api/og/route.tsx
// ================================================================
// 🎨 ENTERPRISE OG IMAGE GENERATOR (FULLY DYNAMIC)
// ================================================================
// Generates rich social sharing images with:
// - Product title, brand, price (original + sale)
// - Star rating + review count
// - Discount badge (if on sale)
// - Video badge (if video exists)
// - Stock status indicator
// - Brand logo (optional)
// - All data passed dynamically from product page
// ================================================================

import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// ✅ Font configuration (Inter for consistent typography)
const interBold = fetch(
  new URL('https://fonts.googleapis.com/css2?family=Inter:wght@700;900&display=swap', import.meta.url)
).then((res) => res.arrayBuffer());

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // --- Extract dynamic parameters from URL (all optional, fallback provided) ---
    const title = searchParams.get('title')?.slice(0, 80) || 'PocketValue Store';
    const brand = searchParams.get('brand')?.slice(0, 30) || 'PocketValue';
    const price = searchParams.get('price') || '0';
    const salePrice = searchParams.get('salePrice') || null;
    const rating = parseFloat(searchParams.get('rating') || '0');
    const reviewCount = parseInt(searchParams.get('reviewCount') || '0');
    const videoUrl = searchParams.get('videoUrl') || null;
    const isOnDeal = searchParams.get('isOnDeal') === 'true';
    const image = searchParams.get('image') || '';
    const stock = parseInt(searchParams.get('stock') || '999');
    const isInStock = searchParams.get('inStock') !== 'false';

    // --- Calculate discount percentage ---
    let discountPercent = 0;
    if (salePrice && parseFloat(salePrice) < parseFloat(price)) {
      discountPercent = Math.round(
        ((parseFloat(price) - parseFloat(salePrice)) / parseFloat(price)) * 100
      );
    }

    // --- Determine stock status message ---
    let stockStatus = '';
    if (!isInStock) {
      stockStatus = 'Out of Stock';
    } else if (stock <= 10) {
      stockStatus = `🔥 Only ${stock} left!`;
    } else {
      stockStatus = '✅ In Stock';
    }

    // --- Determine if video badge should show ---
    const hasVideo = videoUrl && videoUrl.trim() !== '';

    // --- Star rating rendering ---
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const totalStars = 5;

    // Generate star SVG elements (via background or inline)
    const starRatingHTML = Array.from({ length: totalStars }, (_, i) => {
      let fill = '#d1d5db'; // empty star (gray)
      if (i < fullStars) fill = '#f59e0b'; // gold
      else if (i === fullStars && hasHalfStar) fill = 'url(#half-star)'; // half star
      return `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;margin-right:2px;">
                <defs>
                  <linearGradient id="half-star" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="50%" style="stop-color:#f59e0b;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#d1d5db;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <path fill="${fill}" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" stroke="${fill}" stroke-width="1"/>
              </svg>`;
    }).join('');

    // --- Build discount badge text ---
    let discountBadge = '';
    if (isOnDeal && discountPercent > 0) {
      discountBadge = `SAVE ${discountPercent}%`;
    } else if (isOnDeal && salePrice) {
      // If on deal but no price diff? show generic sale
      discountBadge = '🔥 SALE';
    }

    // --- Build display prices ---
    const displayPrice = parseFloat(price).toLocaleString();
    const displaySalePrice = salePrice ? parseFloat(salePrice).toLocaleString() : null;

    // --- Main image rendering ---
    const imageUrl = image && image.startsWith('http') ? image : '';

    // --- Load font ---
    const fontData = await interBold;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            fontFamily: 'Inter',
            position: 'relative',
          }}
        >
          {/* Background gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            }}
          />

          {/* Left side: Product details */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '55%',
              padding: '50px 40px',
              zIndex: 10,
            }}
          >
            {/* Brand name (small) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
                color: '#ff8f32',
                fontSize: 20,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#ff8f32',
                }}
              />
              {brand}
            </div>

            {/* Product title */}
            <h1
              style={{
                fontSize: 52,
                fontWeight: 900,
                color: '#0f172a',
                margin: 0,
                lineHeight: 1.1,
                marginBottom: 16,
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 3,
                overflow: 'hidden',
              }}
            >
              {title}
            </h1>

            {/* Rating stars + count */}
            {rating > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                  dangerouslySetInnerHTML={{ __html: starRatingHTML }}
                />
                <span
                  style={{
                    fontSize: 18,
                    color: '#475569',
                    fontWeight: 500,
                  }}
                >
                  ({reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price section */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 16,
                flexWrap: 'wrap',
              }}
            >
              {displaySalePrice ? (
                <>
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: 700,
                      color: '#ef4444',
                      backgroundColor: '#fee2e2',
                      padding: '8px 20px',
                      borderRadius: 40,
                    }}
                  >
                    Rs. {displaySalePrice}
                  </span>
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 400,
                      color: '#94a3b8',
                      textDecoration: 'line-through',
                    }}
                  >
                    Rs. {displayPrice}
                  </span>
                </>
              ) : (
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: '#0f172a',
                    backgroundColor: '#e2e8f0',
                    padding: '8px 20px',
                    borderRadius: 40,
                  }}
                >
                  Rs. {displayPrice}
                </span>
              )}
            </div>

            {/* Discount badge (if on sale) */}
            {discountBadge && (
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 20,
                  padding: '6px 18px',
                  borderRadius: 30,
                  marginBottom: 12,
                }}
              >
                {discountBadge}
              </div>
            )}

            {/* Stock status + Video badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginTop: 8,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: isInStock ? '#16a34a' : '#dc2626',
                }}
              >
                {stockStatus}
              </span>

              {hasVideo && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#2563eb',
                    backgroundColor: '#dbeafe',
                    padding: '4px 14px',
                    borderRadius: 20,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" fill="#2563eb" />
                  </svg>
                  Watch Video
                </span>
              )}
            </div>
          </div>

          {/* Right side: Product image */}
          <div
            style={{
              display: 'flex',
              width: '45%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#f0f7ff',
              borderLeft: '1px solid #d1d5db',
              position: 'relative',
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                style={{
                  width: '80%',
                  height: '80%',
                  objectFit: 'contain',
                  borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: 100,
                  opacity: 0.5,
                }}
              >
                🛍️
              </div>
            )}

            {/* Brand logo watermark (optional) — could be dynamic if provided */}
            {brand && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 20,
                  right: 20,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#94a3b8',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  padding: '4px 12px',
                  borderRadius: 12,
                }}
              >
                {brand}
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: fontData,
            style: 'normal',
            weight: 700,
          },
          {
            name: 'Inter',
            data: fontData,
            style: 'normal',
            weight: 900,
          },
        ],
      }
    );
  } catch (e: any) {
    console.error('OG Image Generation Error:', e.message);
    return new Response('Failed to generate image', { status: 500 });
  }
}