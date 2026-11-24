/** Home promo carousel for free accounts: bright plan cards with a block wordmark, like the plans page. */
import { useEffect } from "react";
import { toast } from "sonner";
import { loadPaywallFont } from "@/lib/paywallFont";
import "@/styles/hub-promo.css";

type Promo = { id: string; word: string; tone: "pro" | "win"; cta: { en: string; ar: string }; to: string | null };

const PROMOS: Promo[] = [
  { id: "pro", word: "PRO", tone: "pro", cta: { en: "See plans", ar: "شوف الباقات" }, to: "/settings/plans" },
  // What Win Pro does is not decided yet; the card shows "coming soon" until then.
  { id: "win", word: "WIN", tone: "win", cta: { en: "Win Pro", ar: "اكسب Pro" }, to: null },
];

export function HubPromoCards({ ar, onOpen }: { ar: boolean; onOpen: (to: string) => void }) {
  useEffect(() => { loadPaywallFont(); }, []);
  return (
    <div className="hub-promo" data-count={PROMOS.length} role="list" aria-label={ar ? "عروض" : "Offers"}>
      {PROMOS.map((p) => (
        <button key={p.id} type="button" role="listitem" className="hub-promo-card" data-tone={p.tone} onClick={() => (p.to ? onOpen(p.to) : toast(ar ? "قريبًا" : "Coming soon"))} aria-label={`${p.word} — ${ar ? p.cta.ar : p.cta.en}`}>
          <span className="hub-promo-word" dir="ltr" aria-hidden>{p.word.split("").map((c, i) => <i key={i}>{c}</i>)}</span>
          <span className="hub-promo-cta">{ar ? p.cta.ar : p.cta.en}</span>
        </button>
      ))}
    </div>
  );
}
