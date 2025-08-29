export function calculateScoresAndGaps(data: any) {
  const scores = {
    financial: data.financial_details?.total_value ? 30 : 0,
    party: data.parties?.customer && data.parties?.vendor ? 25 : 0,
    payment: data.payment_structure?.terms ? 20 : 0,
    sla: data.sla?.metrics?.length ? 15 : 0,
    contact: data.account_info?.contact_email ? 10 : 0,
  };

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  const gaps: string[] = [];
  if (!data.financial_details?.total_value)
    gaps.push("Missing total contract value");
  if (!data.parties?.customer || !data.parties?.vendor)
    gaps.push("Missing party details");
  if (!data.payment_structure?.terms) gaps.push("Missing payment terms");
  if (!data.sla?.metrics?.length) gaps.push("Missing SLA metrics");
  if (!data.account_info?.contact_email)
    gaps.push("Missing contact information");

  return { scores: { ...scores, total }, gaps };
}
