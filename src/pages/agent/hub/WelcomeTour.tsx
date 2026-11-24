import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AgentOrb, type OrbState } from "@/components/agent/AgentOrb";
import type { AgentColor } from "@/lib/agentsky/client";
import "@/styles/agent.css";
import "@/styles/welcome-tour.css";
import { loadPaywallFont } from "@/lib/paywallFont";

const KEY = "ceyo.welcome.v1";

const TASKS = [
  { c: "#dcfc7c", en: "Run my whole project launch, start to finish", ar: "امسك إطلاق مشروعي كله من الأول للآخر" },
  { c: "#86ece8", en: "Watch my wallet and trade on liquidity moves", ar: "راقب محفظتي واتداول مع حركة السيولة" },
  { c: "#f3e3cf", en: "Handle my emails, contracts and calendar", ar: "أدر إيميلاتي وعقودي ومواعيدي" },
  { c: "#fcd27e", en: "Find the gaps my competitors missed", ar: "طلّع الثغرات اللي المنافسين سابوها" },
  { c: "#fca27a", en: "Track my team's work around the clock", ar: "تابع شغل فريقي طول اليوم" },
];

const GROUP_MSGS: { color: AgentColor; state: OrbState; accent: string; en: string; ar: string; msg: { en: string; ar: string } }[] = [
  { color: "mint", state: "tool", accent: "#dcfc7c", en: "Browser", ar: "المتصفح", msg: { en: "Opened the site, filled the form and booked it.", ar: "فتحت الموقع وملأت الفورم وحجزت الموعد." } },
  { color: "ocean", state: "talking", accent: "#86ece8", en: "Phone", ar: "الهاتف", msg: { en: "Called the client — confirmed for 3:00 PM.", ar: "كلمت العميل وأكدنا الميعاد الساعة 3 العصر." } },
  { color: "ember", state: "thinking", accent: "#fca27a", en: "Apps", ar: "التطبيقات", msg: { en: "Sent the recap on Gmail and updated Notion.", ar: "بعتّ الملخص على Gmail وحدّثت Notion." } },
  { color: "aurora", state: "hello", accent: "#c4a8ff", en: "Markets", ar: "الأسواق", msg: { en: "Watching liquidity 24/7. Ready when you are.", ar: "براقب السيولة 24/7 وجاهز لأمرك." } },
];

export function WelcomeTour({ ar, force, onDone }: { ar: boolean; force?: boolean; onDone?: () => void }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [sent, setSent] = useState<number | null>(null);
  const touch = useRef<number | null>(null);

  useEffect(() => {
    try { if (force || !localStorage.getItem(KEY)) { loadPaywallFont(); setOpen(true); } } catch { /* storage blocked */ }
  }, [force]);

  if (!open) return null;
  const t = (a: string, e: string) => (ar ? a : e);
  const close = () => { try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ } setOpen(false); onDone?.(); };
  const go = (n: number) => { if (n < 0 || n > 2) return; setDir(n > step ? 1 : -1); setStep(n); };
  const goPlans = () => { close(); nav({ to: "/settings/plans" }); };
  const send = (i: number) => { if (sent != null) return; navigator.vibrate?.(10); setSent(i); setTimeout(() => { setSent(null); go(1); }, 520); };
  const fwd = ar ? -1 : 1;

  return (
    <div className="wt" dir={ar ? "rtl" : "ltr"} role="dialog" aria-modal="true" aria-label={t("أهلاً بيك", "Welcome")}
      onTouchStart={(e) => { touch.current = e.touches[0]?.clientX ?? null; }}
      onTouchEnd={(e) => {
        const x0 = touch.current; const x1 = e.changedTouches[0]?.clientX; touch.current = null;
        if (x0 == null || x1 == null) return; const dx = (x0 - x1) * fwd;
        if (dx > 50) go(step + 1); else if (dx < -50) go(step - 1);
      }}>
      <div className="wt-glow" data-step={step} />
      <div className="wt-top">
        <div className="wt-bars">{[0, 1, 2].map((i) => <button key={i} type="button" aria-label={`${i + 1}`} onClick={() => go(i)} className={i < step ? "done" : i === step ? "on" : ""}><i /></button>)}</div>
        
      </div>

      <div className={`wt-stage ${dir > 0 ? "in-next" : "in-prev"}`} key={step}>
        {step === 0 && (
          <>
            <div className="wt-bubbles">
              {TASKS.map(({ c, en, ar: a }, i) => (
                <button key={en} type="button" className={`wt-bub${i % 2 ? " r" : ""}${sent === i ? " sent" : sent != null ? " fade" : ""}`} style={{ ["--c" as string]: c, animationDelay: `${0.1 + i * 0.16}s` }} onClick={() => send(i)}>
                  {ar ? a : en}
                </button>
              ))}
            </div>
            <div className="wt-head">
              <div className="wt-brand">CEYO</div>
              <h2>{t("مش بوت دردشة. شريك بيشتغل بدالك.", "Not a chatbot. A partner that does the work.")}</h2>
              <div className="wt-hint">{t("اختار مهمة وشوف Ceyo بينفذها", "Pick a job and watch Ceyo run it")}</div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="wt-group">
              <div className="wt-group-head">
                <div className="wt-group-orbs">
                  {GROUP_MSGS.map(({ color, en }) => <AgentOrb key={en} color={color} state="idle" size={24} />)}
                </div>
                <div>
                  <b>{t("فريق Ceyo", "Ceyo Team")}</b>
                  <span>{t("4 بوتات شغّالين دلوقتي", "4 bots active now")}</span>
                </div>
              </div>
              <div className="wt-group-feed">
                {GROUP_MSGS.map(({ color, state, accent, en, ar: a, msg }, i) => (
                  <div key={en} className="wt-gmsg" style={{ ["--c" as string]: accent, animationDelay: `${0.15 + i * 0.45}s` }}>
                    <div className="wt-gorb"><AgentOrb color={color} state={state} size={40} /></div>
                    <div className="wt-gbub">
                      <b>{ar ? a : en}</b>
                      <p>{ar ? msg.ar : msg.en}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="wt-head wt-head-big">
              <h2>{t("فريق كامل في شات واحد.", "A whole team in one chat.")}</h2>
              <p>{t("متصفح وهاتف وتطبيقاتك كلها — بيتكلموا مع بعض ويخلّصوا شغلك.", "Browser, phone and all your apps — talking together to get it done.")}</p>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="wt-pro-hero">
            <div className="wt-pro-orb">
              <AgentOrb color="mint" state="hello" size={140} />
            </div>
            <div className="wt-brand">CEYO <span>PRO</span></div>
            <div className="wt-limited">{t("متاح لعدد محدود من المستخدمين فقط", "Open to a limited number of users only")}</div>
            <p className="wt-pro-sub">{t("فريق ذكاء اصطناعي شغّال بدالك 24/7.", "Your own AI team working for you 24/7.")}</p>
          </div>
        )}
      </div>

      {step < 2 ? (
        <button type="button" className="wt-next" onClick={() => go(step + 1)}>{t("كمّل", "Continue")}</button>
      ) : (
        <div className="wt-pro-actions">
          <button type="button" className="wt-pro-btn" onClick={goPlans}>{t("شوف الباقات", "See plans")}</button>
          <button type="button" className="wt-free" onClick={close}>{t("كمّل بالنسخة المجانية", "Continue with free plan")}</button>
        </div>
      )}
    </div>
  );
}
