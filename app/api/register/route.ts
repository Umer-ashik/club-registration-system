import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("students")
      .insert([body])
      .select();

    if (error) {
      console.log("Supabase Error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.log("Server Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
