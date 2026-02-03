import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_MANUAL_BUCKET_PATH = '/storage/v1/object/public/engine-manuals';

/**
 * GET /api/manual/manuals/69730.pdf (or /api/manual/69730.pdf)
 * Redirects to the Supabase storage public URL for that manual so "Open in new tab" doesn't 404.
 * Use when manual_url is stored as a path like /manuals/69730.pdf and the app has no static file there.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  const path = pathSegments?.length ? pathSegments.join('/') : '';

  if (!path || path.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json(
      { error: 'Manual storage not configured' },
      { status: 503 }
    );
  }

  // Ensure path is under manuals/ for the bucket
  const storagePath = path.startsWith('manuals/') ? path : `manuals/${path}`;
  const base = supabaseUrl.replace(/\/$/, '');
  const redirectUrl = `${base}${SUPABASE_MANUAL_BUCKET_PATH}/${storagePath}`;

  return NextResponse.redirect(redirectUrl, 302);
}
