import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Desktop, UsersThree, Plugs, MoonStars, Globe, PhoneCall, EnvelopeSimple, CalendarBlank, ChatCircleDots, Notebook, Code, FolderSimple } from "@phosphor-icons/react";
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

const TOOLS = [
  { Icon: Globe, c: "#dcfc7c", en: "Browser", ar: "متصفح", d: { en: "Opens sites, fills forms and gets things done", ar: "بيفتح مواقع ويملأ فورمات ويخلّص شغلك" } },
  { Icon: PhoneCall, c: "#86ece8", en: "Phone", ar: "هاتف", d: { en: "Talk to Ceyo live by voice or video", ar: "كلّم Ceyo صوت أو فيديو في أي وقت" } },
  { Icon: Desktop, c: "#f3e3cf", en: "Cloud PC", ar: "كمبيوتر", d: { en: "Its own computer running tasks in the cloud", ar: "كمبيوتر خاص بيه بيشتغل على السحابة" } },
  { Icon: EnvelopeSimple, c: "#fca27a", en: "Gmail", ar: "Gmail", d: { en: "Reads, sorts and replies to your emails", ar: "بيقرأ ويرتب ويرد على إيميلاتك" } },
  { Icon: CalendarBlank, c: "#fcd27e", en: "Calendar", ar: "التقويم", d: { en: "Books meetings and protects your time", ar: "بيحجز مواعيدك وينظّم يومك" } },
  { Icon: ChatCircleDots, c: "#c4a8ff", en: "Slack", ar: "Slack", d: { en: "Follows up with your team automatically", ar: "بيتابع مع فريقك أول بأول" } },
  { Icon: Notebook, c: "#f3e3cf", en: "Notion", ar: "Notion", d: { en: "Updates docs, notes and project boards", ar: "بيحدّث ملفاتك ومشاريعك تلقائيًا" } },
  { Icon: Code, c: "#86ece8", en: "GitHub", ar: "GitHub", d: { en: "Tracks repos, issues and releases", ar: "بيتابع الكود والمهام والإصدارات" } },
  { Icon: FolderSimple, c: "#dcfc7c", en: "Drive", ar: "Drive", d: { en: "Finds, reads and organizes your files", ar: "بيلاقي ويقرأ ويرتب ملفاتك" } },
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
  const tool = TOOLS[pick] ?? TOOLS[0]!;
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
            <div className="wt-tools-wrap">
              <div className="wt-tools">
                {TOOLS.map(({ Icon, c, en, ar: a }, i) => (
                  <button key={en} type="button" className={`wt-tool${pick === i ? " on" : ""}`} style={{ ["--c" as string]: c, animationDelay: `${0.06 + i * 0.05}s` }} onClick={() => setPick(i)}>
                    <Icon weight="fill" />
                    <span>{ar ? a : en}</span>
                  </button>
                ))}
              </div>
              <div className="wt-tool-note" key={pick} style={{ ["--c" as string]: tool.c }}>
                <b>{ar ? tool.ar : tool.en}</b>
                <span>{ar ? tool.d.ar : tool.d.en}</span>
              </div>
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
            <ul className="wt-prolist">
              {PRO.map(({ Icon, en, ar: a, d }, i) => (
                <li key={en} style={{ animationDelay: `${0.12 + i * 0.07}s` }}>
                  <span className="wt-pro-ico"><Icon weight="fill" /></span>
                  <div><b>{ar ? a : en}</b><small>{ar ? d.ar : d.en}</small></div>
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
