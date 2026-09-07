import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let key = searchParams.get('key');
  const rawUrl = searchParams.get('url');

  if (!key && rawUrl) {
    const bucketSplit = rawUrl.split('/ibisapp/');
    if (bucketSplit.length > 1) {
      key = bucketSplit[1];
    } else {
      try {
        const parsed = new URL(rawUrl);
        key = parsed.pathname.replace(/^\/([^\/]+)\//, '');
      } catch {
        key = rawUrl;
      }
    }
  }

  if (!key) {
    return new NextResponse('Storage key is required', { status: 400 });
  }

  // Clean key of leading slashes
  key = key.replace(/^\/+/, '');

  try {
    const backendUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3001/api/v1';

    const targetUrl = `${backendUrl}/upload/file/${key}`;
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': request.headers.get('accept') || '*/*',
      },
      // Cache settings for performance
      cache: 'force-cache',
    });

    if (!res.ok) {
      return new NextResponse('File not found', { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    console.error('Error in storage proxy route:', error);
    return new NextResponse('Internal server error proxying storage file', { status: 502 });
  }
}
