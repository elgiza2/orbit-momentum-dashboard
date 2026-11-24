import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import "@/styles/welcome-tour.css";
import { loadPaywallFont } from "@/lib/paywallFont";

const KEY = "ceyo.welcome.v1";

const BUBBLES = {
  en: [
    "Build the full launch plan for my project and track execution",
    "Watch my trading wallet and execute on liquidity moves",
    "Manage all my emails, contracts and schedule — work and personal",
    "Analyze my competitors and surface market gaps automatically",
    "Track my team's KPIs and workflows 24/7",
    "Organize my budget and send me a weekly financial report",
  ],
  ar: [
    "ابنِ خطة إطلاق المشروع كاملة وتابع تنفيذها",
    "راقب محفظة التداول ونفّذ الصفقات مع حركة السيولة",
    "أدر كل مراسلاتي وعقودي ومواعيدي — شغل وشخصي",
    "حلل المنافسين واستخرج ثغرات السوق تلقائيًا",
    "تابع مؤشرات أداء فريقي وسير العمليات 24/7",
    "نظّم ميزانيتي وابعتلي تقرير مالي أسبوعي",
  ],
};
const COLORS = ["#a8648f", "#86ece8", "#f3e3cf", "#dcfc7c", "#fcd27e", "#fca27a"];

export function WelcomeTour({ ar, force, onDone }: { ar: boolean; force?: boolean; onDone?: () => void }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  useEffect(() => {
    try { if (force || !localStorage.getItem(KEY)) { loadPaywallFont(); setOpen(true); } } catch { /* storage blocked */ }
  }, [force]);
  if (!open) return null;
  const done = () => { try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ } setOpen(false); onDone?.(); };
  const next = () => (step < 2 ? setStep(step + 1) : done());
  const goPlans = () => { try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ } setOpen(false); onDone?.(); nav({ to: "/settings/plans" }); };
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
            <div className="wt-msg wt-user">{t("امسك إطلاق المشروع الجديد: نسّق مع الفريق على Slack، جهز العقود، وراقب صفقات التداول في محفظتي أول ما السيولة تتحرك.", "Take over the new project launch: coordinate with the team on Slack, prepare the contracts, and watch my trading wallet the moment liquidity moves.")}</div>
            <p className="wt-msg wt-ai">{t("شغال عليها: مهام الفريق اتحدثت، مسودات العقود جاهزة في Drive، ورادار المحفظة بيراقب صفقات الدخول 24/7.", "On it: team tasks updated, contract drafts ready in Drive, and the wallet radar is watching entry setups 24/7.")}</p>
            <div className="wt-msg wt-card">
              <span className="wt-chip">⚡ {t("إدارة مستقلة نشطة", "Autonomous management active")}</span>
              <strong>{t("المشروع: إطلاق 2026 (مربوط ومجدول)", "Project: 2026 launch (linked & scheduled)")}</strong>
              <strong>{t("المحفظة: رادار التداول مفعّل", "Wallet: trading radar enabled")}</strong>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="wt-pro">
            <div className="wt-pro-word">PRO</div>
            <ul className="wt-pro-list">
              <li>{t("👑 إدارة مشاريع كاملة ومستقلة 24/7", "👑 Full autonomous project management 24/7")}</li>
              <li>{t("📈 أدوات تداول ومحفظة متقدمة وتنبيهات سيولة", "📈 Advanced trading & wallet tools with liquidity alerts")}</li>
              <li>{t("🌐 تكامل كامل مع كل تطبيقاتك وسيرفراتك", "🌐 Full integration with all your apps and servers")}</li>
              <li>{t("⚡ أولوية استجابة ونماذج تفكير عميق فائقة السرعة", "⚡ Priority responses and deep-thinking models")}</li>
            </ul>
          </div>
        )}
      </div>
      <div className="wt-copy" key={`c${step}`}>
        {step === 0 && <><div className="wt-brand">CEYO</div><p>{t("مش بوت دردشة.. شريكك التنفيذي المستقل. فوّضه إدارة مشاريعك واستثماراتك وحياتك بالكامل.", "Not a chatbot — your autonomous executive partner. Delegate your projects, investments and entire life to it.")}</p></>}
        {step === 1 && <><h2>{t("أعمالك ومحفظتك.. تشتغل وانت نايم.", "Your business and wallet work while you sleep.")}</h2><p>{t("بيربط أدواتك، بينفذ المهام التقيلة، وبيتحرك بقرارات ذكية من غير ما ترفع صباعك.", "It connects your tools, executes the heavy work, and acts on smart decisions without you lifting a finger.")}</p></>}
        {step === 2 && <><h2>{t("افتح القوة الكاملة لـ Ceyo PRO", "Unlock the full power of Ceyo PRO")}</h2><p>{t("النسخة المجانية محدودة — PRO بيفتحلك الإدارة المستقلة الكاملة.", "The free plan is limited — PRO unlocks full autonomous management.")}</p></>}
      </div>
      <div className="wt-dots">{[0, 1, 2].map((i) => <i key={i} className={i === step ? "on" : ""} />)}</div>
      {step < 2 ? (
        <button type="button" className="wt-next" onClick={next}>{t("التالي", "Continue")}</button>
      ) : (
        <>
          <button type="button" className="wt-next wt-next-pro" onClick={goPlans}>{t("امتلك Ceyo PRO الآن", "Get Ceyo PRO now")}</button>
          <button type="button" className="wt-free" onClick={done}>{t("أو المتابعة بالنسخة المجانية المحدودة", "Or continue with the limited free plan")}</button>
        </>
      )}
    </div>
  );
}
