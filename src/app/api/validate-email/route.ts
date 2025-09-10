import { NextRequest } from 'next/server';

interface AbstractApiResponse {
  deliverability?: string;
  is_valid_format?: {
    value?: boolean;
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ valid: false, reason: 'invalid_format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.ABSTRACT_API_KEY;
    if (!apiKey) {
      console.error('ABSTRACT_API_KEY is not set');
      return new Response(
        JSON.stringify({ valid: false, reason: 'server_misconfigured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${encodeURIComponent(apiKey)}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return new Response(
        JSON.stringify({ valid: false, reason: `upstream_${res.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data: AbstractApiResponse = await res.json();
    const deliverable = (data && data.deliverability) === 'DELIVERABLE';
    const formatOk = data?.is_valid_format?.value === true;
    const valid = Boolean(deliverable && formatOk);

    return new Response(
      JSON.stringify({ valid, reason: valid ? 'ok' : 'not_deliverable' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('validate-email route error:', err);
    return new Response(
      JSON.stringify({ valid: false, reason: 'server_error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
