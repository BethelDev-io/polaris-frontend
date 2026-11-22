import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

function timeUntil(date: Date): string {
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return "closed";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }
  if (hours >= 1) return `${hours}h`;
  const minutes = Math.max(1, Math.floor(diff / (1000 * 60)));
  return `${minutes}m`;
}

export default async function MarketsPage() {
  const markets = await prisma.market.findMany({
    where: { status: "OPEN" },
    orderBy: { closesAt: "asc" },
    include: {
      _count: { select: { positions: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Markets</h1>
        <p className="text-sm text-muted-foreground">
          Browse open markets and place your predictions.
        </p>
      </div>

      {markets.length === 0 ? (
        <p className="text-sm text-muted-foreground">No open markets yet.</p>
      ) : (
        <div
          role="table"
          aria-label="Open markets"
          className="divide-y rounded-lg border"
        >
          <div
            role="row"
            className="flex items-center gap-4 px-4 py-2 text-xs font-medium text-muted-foreground"
          >
            <span role="columnheader" className="flex-1">
              Market
            </span>
            <span role="columnheader" className="w-16 shrink-0 text-right">
              Yes
            </span>
            <span role="columnheader" className="w-16 shrink-0 text-right">
              No
            </span>
            <span role="columnheader" className="w-16 shrink-0 text-right">
              Chg
            </span>
            <span role="columnheader" className="w-20 shrink-0 text-right">
              Status
            </span>
          </div>
          {markets.map((market) => {
            const yesPercent = Math.round(market.yesPrice * 100);
            const noPercent = 100 - yesPercent;
            const closesIn = timeUntil(market.closesAt);
            const accessibleName = `${market.symbol} at or above ${formatCurrency(
              market.threshold,
            )} — Yes ${yesPercent}%, closes in ${closesIn}`;

            return (
              <div
                key={market.id}
                role="row"
                className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50"
              >
                <div role="cell" className="flex min-w-0 flex-1 items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold"
                  >
                    XL
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/markets/${market.id}`}
                      aria-label={accessibleName}
                      className="block truncate font-medium hover:underline"
                    >
                      {market.symbol} ≥ {formatCurrency(market.threshold)}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Closes in {closesIn} · {market._count.positions} positions
                    </p>
                  </div>
                </div>
                <span
                  role="cell"
                  className="w-16 shrink-0 text-right text-sm"
                >
                  <span className="rounded bg-green-100 px-2 py-0.5 text-green-800">
                    {formatPercent(yesPercent)}
                  </span>
                </span>
                <span
                  role="cell"
                  className="w-16 shrink-0 text-right text-sm"
                >
                  <span className="rounded bg-red-100 px-2 py-0.5 text-red-800">
                    {formatPercent(noPercent)}
                  </span>
                </span>
                <span
                  role="cell"
                  className="w-16 shrink-0 text-right text-sm text-muted-foreground"
                >
                  —
                </span>
                <span
                  role="cell"
                  className="w-20 shrink-0 text-right text-sm text-muted-foreground"
                >
                  {closesIn}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
