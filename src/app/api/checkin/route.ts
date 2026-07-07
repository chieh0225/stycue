import { NextResponse } from 'next/server';

// Mock endpoint: in-memory only, resets on server restart. Swap for a real
// check-in table (keyed by user + date) once the API exists.
let claimedToday = false;

export async function GET() {
  return NextResponse.json({ claimedToday });
}

export async function POST() {
  claimedToday = true;
  return NextResponse.json({ claimedToday });
}
