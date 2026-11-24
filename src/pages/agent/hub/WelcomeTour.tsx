import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Rocket, ChartLineUp, Briefcase, MagnifyingGlass, UsersThree, Wallet, Cpu, CheckCircle, Lightning, PlugsConnected, Brain, Crown, Check } from "@phosphor-icons/react";
import "@/styles/welcome-tour.css";
import { loadPaywallFont } from "@/lib/paywallFont";

const KEY = "ceyo.welcome.v1";

const TASKS = [
  { Icon: Rocket, c: "#dcfc7c", en: "Run my whole project launch, start to finish", ar: "امسك إطلاق مشروعي كله من الأول للآخر" },
  { Icon: ChartLineUp, c: "#86ece8", en: "Watch my wallet and trade on liquidity moves", ar: "راقب محفظتي واتداول مع حركة السيولة" },
  { Icon: Briefcase, c: "#f3e3cf", en: "Handle my emails, contracts and calendar", ar: "أدر إيميلاتي وعقودي ومواعيدي" },
  { Icon: MagnifyingGlass, c: "#fcd27e", en: "Find the gaps my competitors missed", ar: "طلّع الثغرات اللي المنافسين سابوها" },
  { Icon: UsersThree, c: "#fca27a", en: "Track my team's work around the clock", ar: "تابع شغل فريقي طول اليوم" },
];

const SCEN = {
  launch: {
    en: "Launch", ar: "إطلاق مشروع", Icon: Rocket,
    ask: { en: "Take over the launch of my new product.", ar: "امسك إطلاق المنتج الجديد." },
    steps: [
      { en: "Building the launch plan", ar: "ببني خطة الإطلاق" },
      { en: "Assigning tasks to the team on Slack", ar: "بوزّع المهام على الفريق في Slack" },
      { en: "Drafting contracts in Drive", ar: "بجهز العقود في Drive" },
      { en: "Scheduling follow-ups every morning", ar: "بجدول متابعة كل صبح" },
    ],
  },
  trade: {
    en: "Trading", ar: "تداول", Icon: Wallet,
    ask: { en: "Watch my wallet and act when liquidity moves.", ar: "راقب محفظتي واتحرك لما السيولة تتحرك." },
    steps: [
      { en: "Connecting the wallet", ar: "بربط المحفظة" },
      { en: "Scanning liquidity on 3 markets", ar: "بفحص السيولة في 3 أسواق" },
      { en: "Setting entry and exit alerts", ar: "بظبط تنبيهات الدخول والخروج" },
      { en: "Asking you before every trade", ar: "باخد إذنك قبل أي صفقة" },
    ],
  },
} as const;
type ScenKey = keyof typeof SCEN;

const PRO = [
  { Icon: Crown, en: "Runs whole projects on its own", ar: "بيدير مشاريع كاملة لوحده", d: { en: "Plans, assigns, follows up and reports back.", ar: "بيخطط ويوزع ويتابع ويرجعلك بالنتيجة." } },
  { Icon: ChartLineUp, en: "Wallet and trading tools", ar: "أدوات المحفظة والتداول", d: { en: "Live prices, alerts and trades you approve.", ar: "أسعار حية وتنبيهات وصفقات بموافقتك." } },
  { Icon: PlugsConnected, en: "Connects 1000+ apps", ar: "بيتربط بأكتر من 1000 تطبيق", d: { en: "Gmail, Slack, Notion, Drive and more.", ar: "Gmail وSlack وNotion وDrive وغيرهم." } },
  { Icon: Brain, en: "Up to x10 more usage", ar: "استخدام أكتر لحد x10", d: { en: "Deeper thinking for the heavy work.", ar: "تفكير أعمق للشغل التقيل." } },
];

export function WelcomeTour({ ar, force, onDone }: { ar: boolean; force?: boolean; onDone?: () => void }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [picked, setPicked] = useState<number[]>([]);
  const [scen, setScen] = useState<ScenKey>("launch");
  const [run, setRun] = useState(0);
  const [feat, setFeat] = useState(0);
  const touch = useRef<number | null>(null);

  useEffect(() => {
    try { if (force || !localStorage.getItem(KEY)) { loadPaywallFont(); setOpen(true); } } catch { /* storage blocked */ }
  }, [force]);

  useEffect(() => {
    if (step !== 1) return;
    setRun(0);
    const id = setInterval(() => setRun((r) => (r >= 4 ? r : r + 1)), 700);
    return () => clearInterval(id);
  }, [step, scen]);

  if (!open) return null;
  const t = (a: string, e: string) => (ar ? a : e);
  const close = () => { try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ } setOpen(false); onDone?.(); };
  const go = (n: number) => { if (n < 0 || n > 2) return; setDir(n > step ? 1 : -1); setStep(n); };
  const goPlans = () => { close(); nav({ to: "/settings/plans" }); };
  const toggle = (i: number) => { navigator.vibrate?.(8); setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i])); };
  const s = SCEN[scen];
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
        <button type="button" className="wt-skip" onClick={close}>{t("تخطي", "Skip")}</button>
      </div>

      <div className={`wt-stage ${dir > 0 ? "in-next" : "in-prev"}`} key={step}>
        {step === 0 && (
          <>
            <div className="wt-head">
              <div className="wt-brand">CEYO</div>
              <h2>{t("اختار اللي عايز تفوّضه", "Pick what you'd hand off")}</h2>
              <p>{t("مش بوت دردشة. شريك بيشتغل بدالك.", "Not a chatbot. A partner that does the work.")}</p>
            </div>
            <div className="wt-tasks">
              {TASKS.map(({ Icon, c, en, ar: a }, i) => {
                const on = picked.includes(i);
                return (
                  <button key={en} type="button" aria-pressed={on} className={`wt-task${on ? " on" : ""}`} style={{ ["--c" as string]: c, animationDelay: `${0.15 + i * 0.09}s` }} onClick={() => toggle(i)}>
                    <span className="wt-task-ic"><Icon weight="bold" /></span>
                    <span className="wt-task-tx">{ar ? a : en}</span>
                    <span className="wt-task-ck">{on ? <Check weight="bold" /> : null}</span>
                  </button>
                );
              })}
            </div>
            <div className="wt-count" key={picked.length}>{picked.length ? t(`${picked.length} مهام جاهزة لـ Ceyo`, `${picked.length} ready for Ceyo`) : t("اضغط على أي مهمة", "Tap any task")}</div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="wt-head">
              <h2>{t("شوفه وهو شغال", "Watch it work")}</h2>
              <p>{t("اختار مهمة وشوف Ceyo بينفذها.", "Pick a job and watch Ceyo run it.")}</p>
            </div>
            <div className="wt-seg" role="tablist">
              {(Object.keys(SCEN) as ScenKey[]).map((k) => {
                const { Icon } = SCEN[k];
                return <button key={k} type="button" role="tab" aria-selected={scen === k} className={scen === k ? "on" : ""} onClick={() => setScen(k)}><Icon weight="bold" />{ar ? SCEN[k].ar : SCEN[k].en}</button>;
              })}
              <span className="wt-seg-pill" style={{ ["--x" as string]: scen === "launch" ? "0%" : "100%" }} />
            </div>
            <div className="wt-console" key={scen}>
              <div className="wt-ask">{ar ? s.ask.ar : s.ask.en}</div>
              <div className="wt-live"><span className="wt-pulse" /><Cpu weight="bold" />{run >= 4 ? t("خلصت وبتابع", "Done, keeps watching") : t("شغال دلوقتي", "Working now")}</div>
              <ol className="wt-steps">
                {s.steps.map((st, i) => (
                  <li key={st.en} className={i < run ? "ok" : i === run ? "now" : ""}>
                    <span className="wt-step-ic">{i < run ? <CheckCircle weight="fill" /> : <span className="wt-spin" />}</span>
                    {ar ? st.ar : st.en}
                  </li>
                ))}
              </ol>
              <div className="wt-bar"><i style={{ width: `${(run / 4) * 100}%` }} /></div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="wt-head">
              <div className="wt-pro-word">PRO</div>
              <h2>{t("افتح Ceyo بالكامل", "Unlock all of Ceyo")}</h2>
            </div>
            <div className="wt-feats">
              {PRO.map(({ Icon, en, ar: a, d }, i) => (
                <button key={en} type="button" aria-expanded={feat === i} className={`wt-feat${feat === i ? " on" : ""}`} style={{ animationDelay: `${0.1 + i * 0.08}s` }} onClick={() => setFeat(i)}>
                  <span className="wt-feat-ic"><Icon weight="bold" /></span>
                  <span className="wt-feat-body"><b>{ar ? a : en}</b><small>{ar ? d.ar : d.en}</small></span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {step < 2 ? (
        <button type="button" className="wt-next" onClick={() => go(step + 1)}>{t("كمّل", "Continue")}</button>
      ) : (
        <>
          <button type="button" className="wt-next wt-next-pro" onClick={goPlans}><Lightning weight="fill" />{t("ابدأ Ceyo PRO", "Start Ceyo PRO")}</button>
          <button type="button" className="wt-free" onClick={close}>{t("كمّل بالنسخة المجانية المحدودة", "Continue with the limited free plan")}</button>
        </>
      )}
    </div>
  );
}
