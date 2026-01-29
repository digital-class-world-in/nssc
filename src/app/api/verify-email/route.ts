
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jsonUrl = searchParams.get('url');

  if (!jsonUrl) {
    return NextResponse.json({ error: 'URL parameter is missing' }, { status: 400 });
  }

  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from URL: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Assuming the JSON structure is { "user_email_id": "..." }
    const email = data.user_email_id;

    if (!email) {
      return NextResponse.json({ error: 'Email not found in the provided JSON data' }, { status: 404 });
    }

    return NextResponse.json({ email });
  } catch (error: any) {
    console.error('Error fetching or parsing JSON from URL:', error);
    return NextResponse.json({ error: error.message || 'An unknown error occurred' }, { status: 500 });
  }
}
