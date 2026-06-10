"use client";

import { useState, useTransition } from "react";
import { validateVoucher, type ValidationResult } from "@/app/actions";

interface VoucherCardProps {
  merchantName: string;
  rewardName: string;
  token: string;
}

/** Format "ABCD1234EFGH" → "ABCD-1234-EFGH" (display only, every 4 chars) */
function formatToken(raw: string): string {
  return raw.replace(/(.{4})(?=.)/g, "$1-");
}

export function VoucherCard({ merchantName, rewardName, token }: VoucherCardProps) {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const displayToken = formatToken(token);

  function handleValidate() {
    startTransition(async () => {
      const res = await validateVoucher(token);
      setResult(res);
    });
  }

  const isValidated = result?.success === true;
  const isFailed = result?.success === false;

  return (
    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-md dark:border-neutral-700 dark:bg-neutral-900">
      {/* Header */}
      <div className="rounded-t-2xl bg-neutral-900 px-6 py-4 dark:bg-neutral-800">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Gift Voucher
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">{rewardName || "—"}</h1>
      </div>

      {/* Body */}
      <div className="space-y-4 px-6 py-5">
        <Field label="Merchant" value={merchantName} />
        <Field label="Reward" value={rewardName} />
        <Field label="Token" value={displayToken} mono />
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-dashed border-neutral-200 dark:border-neutral-700" />

      {/* Action */}
      <div className="px-6 py-5 space-y-3">
        <button
          onClick={handleValidate}
          disabled={isPending || isValidated}
          className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {isPending ? "Validating…" : isValidated ? "✓ Validated" : "Validate Voucher"}
        </button>

        {isValidated && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300">
            ✅ Voucher is valid and has been redeemed successfully.
          </div>
        )}

        {isFailed && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300">
            ❌ {(result as { success: false; error: string }).error}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
        {label}
      </p>
      <p
        className={`mt-0.5 text-base font-semibold text-neutral-900 dark:text-white ${
          mono ? "font-mono break-all" : ""
        }`}
      >
        {value || <span className="text-neutral-400 font-normal italic">—</span>}
      </p>
    </div>
  );
}
