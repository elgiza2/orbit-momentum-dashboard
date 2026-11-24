import { useEffect, useState, type CSSProperties } from "react";
import { BellRinging, MapPin, UsersThree } from "@phosphor-icons/react";
import { loadPaywallFont } from "@/lib/paywallFont";
import { toast } from "sonner";
import { ensureNotificationPermission } from "@/lib/notifyJobComplete";
import { isNativeApp } from "@/lib/native/bridge";
import { phoneOpenSettings } from "@/lib/native/assistantBridge";
import "@/styles/permission-prompt.css";

export type PermissionPromptKind = "notifications" | "contacts" | "location";

const PROMPT_DONE_KEY = "ceyo.perm.prompt.v1";

type Note = { title: string; body: string; time: string };
type Copy = { notes: Note[]; heading: string; sub: string; cta: string; later: string };

function copyFor(kind: PermissionPromptKind, ar: boolean): Copy {
  const later = ar ? "مش دلوقتي" : "Not now";
  if (kind === "contacts") {
    return ar
      ? {
          notes: [
            { title: "Ceyo", body: "اتصلت بماما وأكدت معاد العشا الساعة 8", time: "الآن" },
            { title: "Ceyo", body: "بعت لأحمد ملف العرض على واتساب", time: "منذ دقيقتين" },
            { title: "Ceyo", body: "ذكّرت سارة بعيد ميلاد كريم", time: "منذ ساعة" },
          ],
          heading: "يكلّم الناس نيابة عنك.",
          sub: "يبعت رسايل، يتصل، وينسّق مواعيدك مع الناس من غير ما تكتب رقم.",
          cta: "السماح بجهات الاتصال",
          later,
        }
      : {
          notes: [
            { title: "Ceyo", body: "Called Mom and confirmed dinner at 8", time: "now" },
            { title: "Ceyo", body: "Sent Ahmed the pitch deck on WhatsApp", time: "2m ago" },
            { title: "Ceyo", body: "Reminded Sara about Karim's birthday", time: "1h ago" },
          ],
          heading: "It talks to people for you.",
          sub: "Messages, calls and scheduling with your contacts — no numbers to type.",
          cta: "Allow contacts",
          later,
        };
  }
  if (kind === "location") {
    return ar
      ? {
          notes: [
            { title: "Ceyo", body: "انت جنب الصيدلية — متنساش الدوا", time: "الآن" },
            { title: "Ceyo", body: "هتمطر بعد ساعة، خد شمسية", time: "منذ 5 دقائق" },
            { title: "Ceyo", body: "الطريق زحمة، اتحرك بدري 15 دقيقة", time: "منذ ساعة" },
          ],
          heading: "مساعدة على حسب مكانك.",
          sub: "تذكيرات لما توصل مكان، أماكن قريبة منك، وتنبيهات الزحمة والجو.",
          cta: "السماح بالموقع",
          later,
        }
      : {
          notes: [
            { title: "Ceyo", body: "You're near the pharmacy — grab your meds", time: "now" },
            { title: "Ceyo", body: "Rain in an hour, take an umbrella", time: "5m ago" },
            { title: "Ceyo", body: "Traffic ahead, leave 15 minutes early", time: "1h ago" },
          ],
          heading: "Help that knows where you are.",
          sub: "Arrival reminders, nearby places, traffic and weather alerts.",
          cta: "Allow location",
          later,
        };
  }
  return ar
    ? {
        notes: [
          { title: "Ceyo", body: "فاتورة الكهرباء مستحقة النهاردة — أدفعها؟", time: "الآن" },
          { title: "Ceyo", body: "سعر تذكرة دبي نزل 18%", time: "منذ 10 دقائق" },
          { title: "Ceyo", body: "خلّصت تقرير المبيعات الأسبوعي", time: "منذ ساعة" },
        ],
        heading: "اعرف أول بأول لما يحصل حاجة مهمة.",
        sub: "تذكيرات، نزول أسعار، ردود، ومهام خلصت وانت مش فاتح التطبيق.",
        cta: "تفعيل الإشعارات",
        later,
      }
    : {
        notes: [
          { title: "Ceyo", body: "Electricity bill is due today — pay it?", time: "now" },
          { title: "Ceyo", body: "Flight to Dubai dropped 18%", time: "10m ago" },
          { title: "Ceyo", body: "Finished your weekly sales report", time: "1h ago" },
        ],
        heading: "Know the moment something matters.",
        sub: "Reminders, price drops, replies and finished tasks — even when the app is closed.",
        cta: "Turn on notifications",
        later,
      };
}

export async function requestDevicePermission(kind: PermissionPromptKind, ar: boolean): Promise<boolean> {
  if (kind === "notifications") {
    if (isNativeApp()) {
      phoneOpenSettings("notifications");
      return true;
    }
    const ok = await ensureNotificationPermission();
    if (!ok) toast(ar ? "الإشعارات مقفولة من إعدادات المتصفح" : "Notifications are blocked in browser settings");
    return ok;
  }
  if (kind === "location") {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      toast(ar ? "الموقع غير مدعوم على هذا الجهاز" : "Location is not supported on this device");
      return false;
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          try { localStorage.setItem("ceyo.perm.location", "granted"); } catch { /* ignore */ }
          toast.success(ar ? "تم تفعيل الموقع" : "Location enabled");
          resolve(true);
        },
        () => {
          toast(ar ? "لم يتم منح صلاحية الموقع" : "Location permission was not granted");
          resolve(false);
        },
        { timeout: 8000 }
      );
    });
  }
  // contacts
  const navContacts = typeof navigator !== "undefined" ? (navigator as unknown as { contacts?: { select?: (props: string[], opts?: { multiple?: boolean }) => Promise<unknown[]> } }).contacts : undefined;
  if (navContacts?.select) {
    try {
      await navContacts.select(["name", "tel"], { multiple: true });
      localStorage.setItem("ceyo.perm.contacts", "granted");
      toast.success(ar ? "تم ربط جهات الاتصال" : "Contacts access granted");
      return true;
    } catch {
      return false;
    }
  }
  if (isNativeApp()) {
    phoneOpenSettings("assistant");
    return true;
  }
  toast(ar ? "صلاحية جهات الاتصال متاحة على تطبيق أندرويد" : "Contacts access is available on the Android app");
  return false;
}

export function PermissionPromptSheet({
  kind,
  ar,
  onDone,
}: {
  kind: PermissionPromptKind;
  ar: boolean;
  onDone: (allowed: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const copy = copyFor(kind, ar);
  const Icon = kind === "contacts" ? UsersThree : kind === "location" ? MapPin : BellRinging;
  useEffect(() => { loadPaywallFont(); }, []);

  const allow = async () => {
    setBusy(true);
    try {
      const ok = await requestDevicePermission(kind, ar);
      onDone(ok);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="perm-overlay" data-kind={kind} role="dialog" aria-modal="true" dir={ar ? "rtl" : "ltr"}>
      <div className="perm-scene" aria-hidden="true">
        <div className="perm-glow" />
        <div className="perm-clock">
          <span>{new Date().toLocaleDateString(ar ? "ar-EG" : "en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
          <strong>9:41</strong>
        </div>
        <div className="perm-stack">
          {copy.notes.map((n, i) => (
            <div className="perm-note" key={i} style={{ "--i": i } as CSSProperties}>
              <span className="perm-note-icon"><Icon size={18} weight="fill" /></span>
              <span className="perm-note-text">
                <span className="perm-note-head"><strong>{n.title}</strong><em>{n.time}</em></span>
                <span>{n.body}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="perm-copy">
        <h1>{copy.heading}</h1>
        <p>{copy.sub}</p>
      </div>

      <div className="perm-actions">
        <button type="button" className="perm-primary" disabled={busy} onClick={() => void allow()}>
          {copy.cta}
        </button>
        <button type="button" className="perm-secondary" disabled={busy} onClick={() => onDone(false)}>
          {copy.later}
        </button>
      </div>
    </div>
  );
}

/** Gentle, one-time permission prompt queue after sign-in (replaces random pointerdown prompts). */
export function PermissionPromptQueue({ ar, ready }: { ar: boolean; ready: boolean }) {
  const [queue, setQueue] = useState<PermissionPromptKind[]>([]);

  useEffect(() => {
    if (!ready || typeof window === "undefined") return;
    try {
      if (localStorage.getItem(PROMPT_DONE_KEY)) return;
    } catch {
      return;
    }
    const steps: PermissionPromptKind[] = [];
    const notifDefault = typeof Notification !== "undefined" && Notification.permission === "default";
    if (notifDefault || isNativeApp()) steps.push("notifications");
    if (isNativeApp()) steps.push("contacts");
    if (steps.length > 0) setQueue(steps);
  }, [ready]);

  if (queue.length === 0) return null;
  const current = queue[0];
  if (!current) return null;

  const advance = () => {
    const rest = queue.slice(1);
    if (rest.length === 0) {
      try { localStorage.setItem(PROMPT_DONE_KEY, "1"); } catch { /* ignore */ }
    }
    setQueue(rest);
  };

  return <PermissionPromptSheet kind={current} ar={ar} onDone={advance} />;
}