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

const BOTS: { color: AgentColor; state: OrbState; shape: string; accent: string; en: string; ar: string; task: { en: string; ar: string } }[] = [
  { color: "mint", state: "tool", shape: "round", accent: "#dcfc7c", en: "Browser & Cloud PC", ar: "المتصفح والكمبيوتر", task: { en: "Opens sites, fills forms and finishes tasks", ar: "بيفتح مواقع ويملأ فورمات ويخلّص شغلك" } },
  { color: "ocean", state: "talking", shape: "squircle", accent: "#86ece8", en: "Phone & Calls", ar: "الهاتف والمكالمات", task: { en: "Talks with you live by voice or video", ar: "بيكلمك صوت وفيديو وينفّذ أوامرك فورًا" } },
  { color: "ember", state: "thinking", shape: "soft", accent: "#fca27a", en: "All Your Apps", ar: "كل تطبيقاتك", task: { en: "Runs Gmail, Slack, Notion and Calendar", ar: "بيشغّل Gmail وSlack وNotion والتقويم" } },
  { color: "aurora", state: "hello", shape: "pill", accent: "#c4a8ff", en: "Projects & Trading", ar: "المشاريع والتداول", task: { en: "Watches markets and your team 24/7", ar: "بيتابع السوق وفريقك طول اليوم" } },
];

const PRO = [
  { n: "01", en: "Cloud Computer", ar: "كمبيوتر سحابي", d: { en: "Browses & finishes tasks for you", ar: "يتصفح ويخلّص المهام بدالك" } },
  { n: "02", en: "Team of Bots", ar: "فريق بوتات", d: { en: "Specialists working together", ar: "بوتات متخصصة بتشتغل سوا" } },
  { n: "03", en: "Every App Linked", ar: "كل تطبيقاتك", d: { en: "Gmail, Slack, Notion & more", ar: "Gmail وSlack وNotion وغيرهم" } },
  { n: "04", en: "Runs 24/7", ar: "شغّال 24/7", d: { en: "Works while you sleep", ar: "بيشتغل وانت نايم لوحده" } },
];

export function WelcomeTour({ ar, force, onDone }: { ar: boolean; force?: boolean; onDone?: () => void }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [pick, setPick] = useState(0);
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
            <div className="wt-bots">
              {BOTS.map(({ color, state, shape, accent, en, ar: a, task }, i) => (
                <button key={en} type="button" className={`wt-bot${pick === i ? " on" : ""}`} style={{ ["--c" as string]: accent, animationDelay: `${0.08 + i * 0.1}s` }} onClick={() => setPick(i)}>
                  <span className={`wt-bot-orb wt-shape-${shape}`}>
                    <AgentOrb color={color} state={pick === i ? "hello" : state} size={46} />
                  </span>
                  <div className="wt-bot-txt">
                    <b>{ar ? a : en}</b>
                    <span>{ar ? task.ar : task.en}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="wt-head wt-head-big">
              <h2>{t("شغّال على كل تطبيقاتك.", "Works across all your apps.")}</h2>
              <p>{t("عنده متصفح وهاتف وكمبيوتر خاص بيه، ومتربط بكل تطبيقات شغلك.", "Its own browser, phone and cloud PC, connected to every app you use.")}</p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="wt-head wt-head-pro">
              <div className="wt-brand">CEYO <span>PRO</span></div>
              <div className="wt-limited">{t("متاح لعدد محدود من المستخدمين فقط", "Open to a limited number of users only")}</div>
            </div>
            <ul className="wt-progrid">
              {PRO.map(({ n, en, ar: a, d }, i) => (
                <li key={en} style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
                  <i>{n}</i>
                  <b>{ar ? a : en}</b>
                  <small>{ar ? d.ar : d.en}</small>
                </li>
              ))}
            </ul>
          </>
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
