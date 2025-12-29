import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 Increment views API called');
    
    if (!supabase) {
      console.error('❌ Supabase not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { id } = await params;
    const profileId = parseInt(id, 10);
    
    console.log('📝 Profile ID received:', profileId);

    if (!Number.isFinite(profileId) || profileId <= 0) {
      return NextResponse.json(
        { error: 'Invalid profile ID' },
        { status: 400 }
      );
    }

    // Get current views count - try to select views, but if column doesn't exist, handle gracefully
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, views')
      .eq('id', profileId)
      .single();

    if (fetchError) {
      // If column doesn't exist, the error will mention it
      if (fetchError.message?.includes('column') || fetchError.message?.includes('does not exist')) {
        console.warn('Views column may not exist yet:', fetchError.message);
        return NextResponse.json(
          { error: 'Views column not found. Please add a "views" column to the profiles table.', details: fetchError.message },
          { status: 400 }
        );
      }
      console.error('Failed to fetch profile:', fetchError);
      return NextResponse.json(
        { error: 'Profile not found', details: fetchError.message },
        { status: 404 }
      );
    }

    if (!currentProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const currentViews = typeof currentProfile.views === 'number' ? currentProfile.views : 0;

    // Increment views using direct update
    // First update without select to avoid PostgREST coercion issues
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ views: currentViews + 1 })
      .eq('id', profileId);

    if (updateError) {
      console.error('Failed to increment views:', {
        error: updateError,
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
      });
      
      // Check if it's a column issue
      if (updateError.message?.includes('column') || updateError.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Views column not found. Please add a "views" column to the profiles table.', details: updateError.message },
          { status: 400 }
        );
      }
      
      // Check if it's an RLS issue
      if (updateError.message?.includes('row-level security') || updateError.message?.includes('RLS')) {
        return NextResponse.json(
          { error: 'Permission denied. Please check RLS policies for the profiles table.', details: updateError.message },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to increment views', details: updateError.message, code: updateError.code },
        { status: 500 }
      );
    }

    // Fetch the updated profile to get the new views count
    const { data: updatedProfile, error: fetchUpdatedError } = await supabase
      .from('profiles')
      .select('views')
      .eq('id', profileId)
      .single();

    if (fetchUpdatedError) {
      console.error('Failed to fetch updated views:', fetchUpdatedError);
      // Still return success since the update worked, just use calculated value
      return NextResponse.json({
        success: true,
        views: currentViews + 1,
      });
    }

    return NextResponse.json({
      success: true,
      views: updatedProfile?.views ?? currentViews + 1,
    });
  } catch (error) {
    console.error('Error in increment-views API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

