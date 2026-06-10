import { Suspense } from "react";
import { VoucherCard } from "@/components/voucher-card";

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Inner async component so searchParams await is inside a <Suspense> boundary,
// which is required when `cacheComponents` (Turbopack) is enabled.
async function VoucherContent({ searchParams }: HomePageProps) {
  const params = await searchParams;

  const merchantName = String(params.merchant_name ?? "");
  const rewardName = String(params.reward_name ?? "");
  const token = String(params.token ?? "");

  const hasMissingParams = !merchantName && !rewardName && !token;

  if (hasMissingParams) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white px-6 py-10 text-center shadow-md dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-4xl">🎁</p>
        <h1 className="mt-3 text-xl font-bold text-neutral-900 dark:text-white">
          No voucher data found
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Please scan a valid QR code to load the voucher details.
        </p>
      </div>
    );
  }

  return (
    <VoucherCard
      merchantName={merchantName}
      rewardName={rewardName}
      token={token}
    />
  );
}

export default function Home({ searchParams }: HomePageProps) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6">
      <Suspense
        fallback={
          <div className="text-sm text-neutral-500 animate-pulse">
            Loading voucher…
          </div>
        }
      >
        <VoucherContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

