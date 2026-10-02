import { getSnapshot } from "@/lib/data";
import { exportCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { transactions } = await getSnapshot();
    return new Response(exportCsv(transactions), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="allowance-transactions.csv"',
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(
      "Could not export your history. Check that MySQL is running in XAMPP and try again.",
      { status: 503 },
    );
  }
}
