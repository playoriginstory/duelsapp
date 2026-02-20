// app/api/verify-holder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkEligibility } from "@/lib/tokengate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const wallet = body.wallet as string;

    if (!wallet) {
      return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
    }

    const eligible = await checkEligibility(wallet as `0x${string}`);

    return NextResponse.json({ eligible });
  } catch (err) {
    console.error("Verify-holder error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
