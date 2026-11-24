import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Desktop, UsersThree, Plugs, MoonStars } from "@phosphor-icons/react";
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

const RUNS = [
  { reply: { en: "On it. I'll build the plan, split tasks with your team and follow up every morning.", ar: "استلمته. هبني الخطة وأوزع المهام على فريقك وأتابع كل صبح." }, badge: { en: "Daily, 09:00 AM", ar: "يوميًا، 09:00 ص" }, card: { en: "Launch plan, team tasks and morning progress report", ar: "خطة الإطلاق ومهام الفريق وتقرير التقدم الصبح" } },
  { reply: { en: "Watching 3 markets now. I'll alert you on every move and ask before any trade.", ar: "براقب 3 أسواق دلوقتي. هنبهك مع كل حركة وآخد إذنك قبل أي صفقة." }, badge: { en: "Live, 24/7", ar: "مباشر، 24/7" }, card: { en: "Liquidity watch, entry and exit alerts", ar: "مراقبة السيولة وتنبيهات الدخول والخروج" } },
  { reply: { en: "Done. I sorted your inbox, flagged 2 contracts to sign and cleared your afternoon.", ar: "تم. رتبت الإيميلات وحددت عقدين للتوقيع وفضّيت بعد الضهر." }, badge: { en: "Weekdays, 08:00 AM", ar: "أيام الشغل، 08:00 ص" }, card: { en: "Inbox, contracts and calendar summary", ar: "ملخص الإيميلات والعقود والمواعيد" } },
  { reply: { en: "Scanning your competitors now. You'll get the gaps and a plan to win them.", ar: "بفحص منافسينك دلوقتي. هتوصلك الثغرات وخطة تكسب بيها." }, badge: { en: "Every Monday", ar: "كل اتنين" }, card: { en: "Competitor gaps and weekly opportunities", ar: "ثغرات المنافسين وفرص الأسبوع" } },
  { reply: { en: "Connected to Slack and Notion. I'll track every task and flag what's late.", ar: "اتربطت بـ Slack وNotion. هتابع كل مهمة وأنبهك على المتأخر." }, badge: { en: "Daily, 06:00 PM", ar: "يوميًا، 06:00 م" }, card: { en: "Team progress and late tasks", ar: "تقدم الفريق والمهام المتأخرة" } },
];

const PRO = [
  { Icon: Desktop, en: "Its own computer in the cloud", ar: "كمبيوتر خاص بيه على السحابة", d: { en: "Browses, fills forms and finishes tasks for you.", ar: "بيتصفح ويملأ الفورمات ويخلّص المهام بدالك." } },
  { Icon: UsersThree, en: "A team of bots that work together", ar: "فريق بوتات بيشتغلوا مع بعض", d: { en: "Each bot has a role, Ceyo coordinates them.", ar: "كل بوت ليه دور، وCeyo بينسّق بينهم." } },
  { Icon: Plugs, en: "Your apps, connected", ar: "تطبيقاتك كلها متربطة", d: { en: "Gmail, Calendar, Slack, Notion and more.", ar: "Gmail وCalendar وSlack وNotion وغيرهم." } },
  { Icon: MoonStars, en: "Works while you sleep", ar: "بيشتغل وانت نايم", d: { en: "Daily routines and long jobs run on their own.", ar: "روتين يومي ومهام طويلة بتتنفذ لوحدها." } },
];

export function WelcomeTour({ ar, force, onDone }: { ar: boolean; force?: boolean; onDone?: () => void }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [pick, setPick] = useState(0);
  const [sent, setSent] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const touch = useRef<number | null>(null);

  useEffect(() => {
    try { if (force || !localStorage.getItem(KEY)) { loadPaywallFont(); setOpen(true); } } catch { /* storage blocked */ }
  }, [force]);

  useEffect(() => {
    if (step !== 1) return;
    setRun(0);
    const t1 = setTimeout(() => setRun(1), 1100);
    const t2 = setTimeout(() => setRun(2), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [step, pick]);

  if (!open) return null;
  const t = (a: string, e: string) => (ar ? a : e);
  const close = () => { try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ } setOpen(false); onDone?.(); };
  const go = (n: number) => { if (n < 0 || n > 2) return; setDir(n > step ? 1 : -1); setStep(n); };
  const goPlans = () => { close(); nav({ to: "/settings/plans" }); };
  const send = (i: number) => { if (sent != null) return; navigator.vibrate?.(10); setSent(i); setPick(i); setTimeout(() => { setSent(null); go(1); }, 520); };
  const task = TASKS[pick] ?? TASKS[0]!;
  const r = RUNS[pick] ?? RUNS[0]!;
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
            <div className="wt-chat" key={pick} style={{ ["--c" as string]: task.c }}>
              <div className="wt-msg me">{ar ? task.ar : task.en}</div>
              {run === 0 ? <div className="wt-typing"><i /><i /><i /></div> : <p className="wt-ai">{(ar ? r.reply.ar : r.reply.en).split(" ").map((w, i) => <span key={i} style={{ animationDelay: `${i * 0.04}s` }}>{w} </span>)}</p>}
              {run > 1 && (
                <div className="wt-job">
                  <span className="wt-badge">{ar ? r.badge.ar : r.badge.en}</span>
                  <p>{ar ? r.card.ar : r.card.en}</p>
                  <div className="wt-bar"><i /></div>
                </div>
              )}
            </div>
            <div className="wt-head wt-head-big">
              <h2>{t("أنت بتطلب، Ceyo بيكمّل للآخر.", "You ask. Ceyo runs it to the end.")}</h2>
              <p>{t("بيشتغل لوحده كل يوم ويرجعلك بالنتيجة، من غير ما تفكره.", "It works on its own every day and reports back, no reminders needed.")}</p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="wt-head wt-head-pro">
              <div className="wt-limited">{t("متاح لعدد محدود من المستخدمين فقط", "Limited to a few users only")}</div>
              <div className="wt-brand">CEYO <span>PRO</span></div>
              <p>{t("سلّم شغلك وحياتك لعقل بيشتغل من غير حدود.", "Hand your work and life to a mind with no limits.")}</p>
            </div>
            <div className="wt-procard">
              <ul>{PRO.map(({ Icon, en, ar: a, d }, i) => <li key={en} style={{ animationDelay: `${0.15 + i * 0.08}s` }}><Icon weight="fill" /><div><b>{ar ? a : en}</b><small>{ar ? d.ar : d.en}</small></div></li>)}</ul>
              <button type="button" className="wt-pro-btn" onClick={goPlans}>{t("شوف الباقات", "See plans")}</button>
            </div>
          </>
        )}
      </div>

      {step < 2 ? (
        <button type="button" className="wt-next" onClick={() => go(step + 1)}>{t("كمّل", "Continue")}</button>
      ) : (
        <>
          <button type="button" className="wt-free" onClick={close}>{t("كمّل بالنسخة المجانية المحدودة", "Continue with the limited free plan")}</button>
        </>
      )}
    </div>
  );
}
