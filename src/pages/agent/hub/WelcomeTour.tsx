import { useEffect, useState } from "react";
import "@/styles/welcome-tour.css";
import { loadPaywallFont } from "@/lib/paywallFont";

const KEY = "ceyo.welcome.v1";

const BUBBLES = {
  en: ["Reply to my pending messages", "Compare TV prices", "Find recipes with what I have", "Tell me when my order arrives", "Summarize today's emails", "Book a table for four on Friday", "Tell me if the flight gets cheaper"],
  ar: ["رد على رسايلي اللي مستنية", "قارن أسعار التلفزيونات", "لاقيلي وصفات باللي عندي", "قولي لما طلبي يوصل", "لخّص إيميلات النهارده", "احجز ترابيزة لأربعة يوم الجمعة", "نبهني لو سعر الطيارة نزل"],
};
const COLORS = ["#a8648f", "#86ece8", "#f3e3cf", "#dcfc7c", "#fcd27e", "#fca27a", "#ee92d8"];
const APPS = ["Gmail", "Calendar", "Drive", "Slack", "Notion", "GitHub", "WhatsApp", "Telegram", "Sheets"];

export function WelcomeTour({ ar }: { ar: boolean }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  useEffect(() => {
    try { if (!localStorage.getItem(KEY)) { loadPaywallFont(); setOpen(true); } } catch { /* storage blocked */ }
  }, []);
  if (!open) return null;
  const done = () => { try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ } setOpen(false); };
  const next = () => (step < 2 ? setStep(step + 1) : done());
  const t = (a: string, e: string) => (ar ? a : e);

  return (
    <div className="wt" dir={ar ? "rtl" : "ltr"} role="dialog" aria-modal="true" aria-label={t("أهلاً بيك", "Welcome")}>
      <button type="button" className="wt-skip" onClick={done}>{t("تخطي", "Skip")}</button>
      <div className="wt-stage" key={step}>
        {step === 0 && (
          <div className="wt-bubbles">
            {(ar ? BUBBLES.ar : BUBBLES.en).map((b, i) => (
              <div key={b} className="wt-bubble" style={{ background: COLORS[i], animationDelay: `${i * 0.12}s` }}>{b}</div>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="wt-chat">
            <div className="wt-msg wt-user">{t("من الاتنين للجمعة الساعة 8 الصبح قولي الطقس وسعر الدولار وملخص مواعيدي.", "Monday to Friday at 8 AM, tell me the weather, the dollar rate and a summary of my calendar.")}</div>
            <p className="wt-msg wt-ai">{t("تمام، من بكرة الساعة 8:00 هبعتلك التفاصيل اللي طلبتها.", "Got it — starting tomorrow at 08:00 I'll send you what you asked for.")}</p>
            <div className="wt-msg wt-card"><span className="wt-chip">↻ {t("أيام الأسبوع، 8:00 ص", "Weekdays, 08:00 AM")}</span><strong>{t("الطقس، سعر الدولار، وملخص المواعيد", "Weather, dollar rate and calendar summary")}</strong></div>
          </div>
        )}
        {step === 2 && (
          <div className="wt-apps">
            {APPS.map((a, i) => <span key={a} className="wt-app" style={{ background: COLORS[i % COLORS.length], animationDelay: `${i * 0.07}s` }}>{a}</span>)}
          </div>
        )}
      </div>
      <div className="wt-copy" key={`c${step}`}>
        {step === 0 && <><div className="wt-brand">CEYO</div><p>{t("قوله اللي عايزه، وهو يعمله عنك.", "Tell it what you need — it gets it done for you.")}</p></>}
        {step === 1 && <><h2>{t("معلوماتك جاهزة كل يوم.", "Your information, ready every day.")}</h2><p>{t("حدد مهام متكررة وCeyo يبعتلك ملخص تلقائي في ميعاده.", "Set routines and Ceyo sends you an automatic summary on time.")}</p></>}
        {step === 2 && <><h2>{t("متوصل بكل تطبيقاتك.", "Connected to all your apps.")}</h2><p>{t("اربط Gmail والتقويم وSlack وغيرهم، وخلّي بوتاتك تشتغل عليهم بإذنك.", "Link Gmail, Calendar, Slack and more, and let your bots act on them with your approval.")}</p></>}
      </div>
      <div className="wt-dots">{[0, 1, 2].map((i) => <i key={i} className={i === step ? "on" : ""} />)}</div>
      <button type="button" className="wt-next" onClick={next}>{step < 2 ? t("التالي", "Continue") : t("يلا نبدأ", "Get started")}</button>
    </div>
  );
}
