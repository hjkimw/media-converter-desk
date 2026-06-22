import { NextResponse } from "next/server";
import { notImplemented } from "@/lib/server/adapters";

export async function POST() {
  return NextResponse.json(notImplemented("ai_image_enhancement"), { status: 501 });
}
