import { SetupNotice } from "../SetupNotice";
import { deleteDonation, markDonationVerified } from "../actions";
import { formatDateTime } from "@/lib/content";
import { canEdit } from "@/lib/admin-role";
import { supabaseEnabled } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  name: string;
  email: string;
  amount: number;
  mode: string;
  reference: string | null;
  note: string | null;
  verified: boolean;
  created_at: string;
};

export default async function AdminDonations() {
  if (!supabaseEnabled) return <SetupNotice />;

  const supabase = await getServerSupabase();
  const { data } = await supabase!
    .from("donations")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    // Tie-break so rows sharing a timestamp keep a fixed order between loads.
    .order("id", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as Row[];
  const editable = await canEdit();

  const total = rows.filter((r) => r.verified).reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <>
      <div className="admin-head">
        <h1>Donations</h1>
        <p className="hint" style={{ fontVariantNumeric: "tabular-nums" }}>
          ₹{total.toLocaleString("en-IN")} verified to date
        </p>
      </div>

      <p className="flag" style={{ marginBottom: "1.4rem" }}>
        These are donor self-reports. Check each amount against the bank statement before marking it
        verified or issuing an 80G receipt.
      </p>

      <div className="rows">
        {rows.length === 0 ? (
          <p className="empty">No donations reported yet.</p>
        ) : (
          rows.map((row) => (
            <div className="row" key={row.id}>
              <div>
                <div className="row-title" style={{ fontVariantNumeric: "tabular-nums" }}>
                  ₹{Number(row.amount).toLocaleString("en-IN")} - {row.name}
                </div>
                <div className="hint">
                  {row.mode} · {row.reference || "no reference"} · {formatDateTime(row.created_at)} ·{" "}
                  {row.email}
                </div>
              </div>
              <span className={row.verified ? "pill live" : "pill"}>
                {row.verified ? "Verified" : "To check"}
              </span>
              <div style={{ display: "flex", gap: ".4rem" }}>
                {row.verified || !editable ? null : (
                  <form action={markDonationVerified}>
                    <input type="hidden" name="id" value={row.id} />
                    <button className="btn btn-ghost btn-sm" type="submit">
                      Mark verified
                    </button>
                  </form>
                )}
                {editable ? (
                  <form action={deleteDonation}>
                    <input type="hidden" name="id" value={row.id} />
                    <button className="btn btn-ghost btn-sm" type="submit">
                      Delete
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
