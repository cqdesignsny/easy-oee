import { notFound, redirect } from "next/navigation";
import { getOperatorSession } from "@/lib/auth/operator-session";
import { getShiftForOperator } from "@/server/actions/shifts";
import { LiveShift } from "./live-shift";

export const metadata = { title: "Live Shift | Easy OEE" };
export const dynamic = "force-dynamic";

export default async function ShiftPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getOperatorSession();
  if (!session) redirect("/pin");
  const { id } = await params;

  const data = await getShiftForOperator(id);
  if (!data || !data.shift) notFound();
  if (data.shift.status === "complete") redirect(`/shift/${id}/summary`);

  return <LiveShift shiftId={id} initialShift={data.shift} line={data.line} stops={data.stops} />;
}
