import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ success: true, streak: 1, skipped: true });
    }

    const serverClient = createSupabaseServerClient();
    const { data: { user }, error: authError } = await serverClient.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ success: true, streak: 1, skipped: true });
    }
    
    if (user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase = createSupabaseServiceClient() || serverClient;
    
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
