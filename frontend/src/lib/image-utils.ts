/**
 * Utility functions for handling images, MinIO SSL/HTTP proxying,
 * and high-quality SVG fallbacks without third-party placeholder dependencies.
 */

// Filter common academic and professional honorifics in Indonesia
const HONORIFICS = new Set([
  'dr.', 'dr', 'dra.', 'dra', 'drs.', 'drs', 'ir.', 'ir', 'prof.', 'prof',
  'm.m.', 'mm', 'm.t.', 'mt', 'm.kom.', 'mkom', 'm.sc.', 'msc', 'm.a.', 'ma',
  'ph.d', 'phd', 's.kom.', 'skom', 's.t.', 'st', 's.e.', 'se', 's.si.', 'ssi',
  's.pd.', 'spd', 'b.a.', 'ba', 'b.sc.', 'bsc', 'h.', 'hj.', 'ms.'
]);

export function getInitials(name?: string): string {
  if (!name || typeof name !== 'string') return '';
  
  // Clean name from brackets and commas
  const cleaned = name.replace(/[(),]/g, ' ').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);

  // Filter out known honorifics/titles
  const validParts = parts.filter(p => !HONORIFICS.has(p.toLowerCase()));
  const targetParts = validParts.length > 0 ? validParts : parts;

  if (targetParts.length === 1) {
    return targetParts[0].substring(0, 2).toUpperCase();
  } else if (targetParts.length > 1) {
    return (targetParts[0][0] + targetParts[targetParts.length - 1][0]).toUpperCase();
  }
  return '';
}

/**
 * Generate a modern SVG avatar data URI with a subtle gradient and initials/silhouette.
 */
export function getAvatarFallback(name?: string, size = 400): string {
  const initials = getInitials(name);
  
  // Gradient palette: deep navy to vibrant cyan/blue (matching IBIS branding)
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A2540" />
      <stop offset="50%" stop-color="#1E40AF" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" />
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.44}" stroke="rgba(255,255,255,0.12)" stroke-width="2" />
  ${
    initials
      ? `<text x="50%" y="54%" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${Math.round(
          size * 0.35
        )}" font-weight="700" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" filter="url(#shadow)" letter-spacing="1">${initials}</text>`
      : `<g fill="none" stroke="#FFFFFF" stroke-width="${Math.round(size * 0.04)}" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">
          <circle cx="${size / 2}" cy="${size * 0.4}" r="${size * 0.18}" />
          <path d="M${size * 0.22} ${size * 0.82}c0-${size * 0.22} ${size * 0.12}-${size * 0.28} ${size * 0.28}-${size * 0.28}s${size * 0.28} ${size * 0.06} ${size * 0.28} ${size * 0.28}" />
        </g>`
  }
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generate a modern SVG cover/banner fallback for events, courses, or articles.
 */
export function getCoverFallback(title?: string, width = 800, height = 450): string {
  const shortTitle = title ? (title.length > 40 ? title.substring(0, 37) + '...' : title) : 'IBIS';
  
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="40%" stop-color="#1E3A8A" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <rect width="${width}" height="${height}" fill="url(#grid)" />
  <circle cx="${width * 0.85}" cy="${height * 0.2}" r="${width * 0.25}" fill="#38BDF8" opacity="0.08" />
  <circle cx="${width * 0.15}" cy="${height * 0.85}" r="${width * 0.2}" fill="#818CF8" opacity="0.08" />
  <text x="${width / 2}" y="${height / 2}" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" opacity="0.9">${shortTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
  <text x="${width / 2}" y="${height / 2 + 36}" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="#94A3B8" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">IBIS TECH INCUBATOR</text>
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Transforms any image URL to ensure it loads reliably in the browser:
 * - Falls back to SVG data URI if empty, null, or placehold.co
 * - Rewrites MinIO URLs (s3.dev-apps.utycreative.cloud) to use our local proxy to prevent SSL & Mixed Content errors
 * - Leaves local (/images/...) and valid external URLs intact
 */
export function getSafeImageUrl(
  url?: string | null,
  fallbackName?: string,
  type: 'avatar' | 'cover' = 'avatar'
): string {
  if (!url || typeof url !== 'string' || url.trim() === '' || url.includes('placehold.co')) {
    return type === 'cover' ? getCoverFallback(fallbackName) : getAvatarFallback(fallbackName);
  }

  const trimmed = url.trim();

  // Local assets in public folder
  if (trimmed.startsWith('/') && !trimmed.startsWith('/api/storage-proxy')) {
    return trimmed;
  }

  // Data URLs
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // Check if it's a campus MinIO or local MinIO URL
  const isCampusMinio = trimmed.includes('s3.dev-apps.utycreative.cloud');
  const isLocalMinio = trimmed.includes('localhost:9000');

  if (isCampusMinio || isLocalMinio) {
    // Extract the bucket key: anything after '/ibisapp/'
    const bucketSplit = trimmed.split('/ibisapp/');
    if (bucketSplit.length > 1 && bucketSplit[1]) {
      const key = bucketSplit[1];
      return `/api/storage-proxy?key=${encodeURIComponent(key)}`;
    }
    // Fallback if bucket name differs
    return `/api/storage-proxy?url=${encodeURIComponent(trimmed)}`;
  }

  return trimmed;
}

/**
 * Alias for getSafeImageUrl to explicitly handle any storage file (PDF, documents, images)
 */
export const getSafeStorageUrl = getSafeImageUrl;

