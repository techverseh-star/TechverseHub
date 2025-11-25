import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ success: true, streak: 1, skipped: true });
    }

    const cookieStore = cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    if (accessToken) {
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(accessToken);
      
      if (user && user.id !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const supabase = supabaseServiceKey 
      ? createClient(supabaseUrl, supabaseServiceKey, {
          auth: { autoRefreshToken: false, persistSession: false }
        })
      : supabaseAuth;
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const { data: existingStreak } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!existingStreak) {
      const { data: newStreak, error: insertError } = await supabase.from("user_streaks").insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
        streak_start_date: today,
      }).select().single();

      if (insertError) {
        console.error("Failed to insert streak:", insertError);
        return NextResponse.json({ success: true, streak: 1 });
      }

      return NextResponse.json({ 
        success: true, 
        streak: 1,
        longest: 1,
        isNewStreak: true
      });
    }

    const lastActivity = existingStreak.last_activity_date;

    if (lastActivity === today) {
      return NextResponse.json({ 
        success: true, 
        streak: existingStreak.current_streak,
        longest: existingStreak.longest_streak,
        alreadyUpdated: true
      });
    }

    let newStreak = existingStreak.current_streak;
    let newLongest = existingStreak.longest_streak;
    let streakStart = existingStreak.streak_start_date;

    if (lastActivity === yesterday) {
      newStreak += 1;
      if (newStreak > newLongest) {
        newLongest = newStreak;
      }
    } else {
      newStreak = 1;
      streakStart = today;
    }

    const { error: updateError } = await supabase.from("user_streaks").update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_activity_date: today,
      streak_start_date: streakStart,
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId);

    if (updateError) {
      console.error("Failed to update streak:", updateError);
    }

    return NextResponse.json({ 
      success: true, 
      streak: newStreak,
      longest: newLongest,
      wasYesterday: lastActivity === yesterday
    });

  } catch (error: any) {
    console.error("Streak update error:", error);
    return NextResponse.json({ success: true, streak: 1 });
  }
}
