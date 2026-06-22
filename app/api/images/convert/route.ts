import { NextResponse } from "next/server";
import { notImplemented } from "@/lib/server/adapters";

export async function POST() {
  return NextResponse.json(notImplemented("server_image_convert"), { status: 501 });
}
