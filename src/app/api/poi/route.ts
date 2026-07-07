import { NextRequest, NextResponse } from "next/server";
import { filterPois, getAllPois } from "@/lib/poi";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  const commune = request.nextUrl.searchParams.get("commune");

  const pois = filterPois(getAllPois(), { category, commune });
  return NextResponse.json({ data: pois });
}
