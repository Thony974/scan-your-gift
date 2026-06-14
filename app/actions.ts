"use server";

import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";

export type ValidationResult =
  | { success: true; voucher: Record<string, unknown> }
  | { success: false; error: string };

function hashToken(token: string): string {
  return createHash("sha256").update(token.trim()).digest("hex");
}

export async function validateVoucher(
  token: string,
): Promise<ValidationResult> {
  if (!token || token.trim() === "") {
    return { success: false, error: "No token provided." };
  }

  const tokenHash = hashToken(token);
  const supabase = await createClient();

  const { data: voucher, error } = await supabase
    .from("voucher")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!voucher) {
    return { success: false, error: "Bon cadeau introuvable." };
  }

  // Reject already-used vouchers before touching the DB
  if (voucher.used) {
    return { success: false, error: "Bon cadeau déjà utilisé." };
  }

  const usedAt = new Date().toISOString();

  // Conditional update: only update rows that are still unused (guards against
  // race conditions where two requests arrive at the same time).
  const { data: updatedRows, error: updateError } = await supabase
    .from("voucher")
    .update({ used: true, used_at: usedAt })
    .eq("token_hash", tokenHash)
    .eq("used", false)
    .select();

  if (updateError) {
    return {
      success: false,
      error: `Could not mark voucher as used: ${updateError.message}`,
    };
  }

  // Empty array means another request already redeemed it between our SELECT and UPDATE
  if (!updatedRows || updatedRows.length === 0) {
    return { success: false, error: "Bon cadeau déjà utilisé." };
  }

  return { success: true, voucher };
}
