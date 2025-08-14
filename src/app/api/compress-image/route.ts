import { NextRequest, NextResponse } from 'next/server';
import Tinify from 'tinify';

// Initialize Tinify with your API key
Tinify.key = process.env.TINIFY_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Compress image using Tinify
    const result = await Tinify.fromBuffer(buffer).toBuffer();

    // Return compressed image as blob
    return new NextResponse(Buffer.from(result), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': result.length.toString(),
      },
    });
  } catch (error) {
    console.error('Image compression error:', error);
    return NextResponse.json(
      { error: 'Failed to compress image' },
      { status: 500 }
    );
  }
}
