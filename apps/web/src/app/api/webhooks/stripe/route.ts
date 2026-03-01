import { NextRequest, NextResponse } from 'next/server';

// This webhook is handled by the backend API directly.
// This route exists only for documentation/fallback purposes.
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'Use the API endpoint /api/v1/webhooks/stripe instead' },
    { status: 308 },
  );
}
