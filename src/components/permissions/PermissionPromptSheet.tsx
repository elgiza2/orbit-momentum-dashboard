import { useEffect, useState } from "react";
import { Bell, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { ensureNotificationPermission } from "@/lib/notifyJobComplete";
import { isNativeApp } from "@/lib/native/bridge";
import { phoneOpenSettings } from "@/lib/native/assistantBridge";
import "@/styles/permission-prompt.css";

export type PermissionPromptKind = "notifications" | "contacts" | "location";

const PROMPT_DONE_KEY = "ceyo.perm.prompt.v1";

type Copy = {
  bannerTitle: string;
  bannerBody: string;
  heading: string;
  sub: string;
  cta: string;
  later: string;
};

function copyFor(kind: PermissionPromptKind, ar: boolean): Copy {
  if (kind === "contacts") {
    return ar
      ? {
          bannerTitle: "جهات الاتصال",
          bannerBody: "ابعت رسالة لأحمد أو اتصل بماما فورًا",
          heading: "خلّي البوت يوصل لجهات اتصالك.",
          sub: "عشان يقدر يبعت رسايل، يرن على الناس، ويرتب مواعيدك من غير ما تكتب أرقام.",
          cta: "السماح لجهات الاتصال",
          later: "اسألني لاحقًا",
        }
      : {
          bannerTitle: "Contacts",
          bannerBody: "Message Ahmed or call Mom right away",
          heading: "Let your bot reach your contacts.",
          sub: "Send messages, place calls, and schedule with people without typing numbers.",
          cta: "Allow contacts",
          later: "Ask me later",
        };
  }
  if (kind === "location") {
    return ar
      ? {
          bannerTitle: "موقعك الحالي",
          bannerBody: "أقرب كافيه، حالة الجو، ومواعيد مشاويرك",
          heading: "مساعدة أذكى حسب مكانك.",
          sub: "تذكيرات حسب المكان، اقتراحات قريبة منك، وتنبيهات الزحمة والطقس.",
          cta: "السماح بالموقع",
          later: "اسألني لاحقًا",
        }
      : {
          bannerTitle: "Your location",
          bannerBody: "Nearby places, weather, and commute alerts",
          heading: "Smarter help based on where you are.",
          sub: "Location reminders, nearby places, traffic, and local weather updates.",
          cta: "Allow location",
          later: "Ask me later",
        };
  }
  return ar
    ? {
        bannerTitle: "لا تنسى",
        bannerBody: "فاتورة الكهرباء مستحقة النهاردة",
        heading: "خليك أول من يعرف لما يحصل حاجة مهمة.",
        sub: "تنبيهات الأسعار، التذكيرات، الردود، والمهام اللي خلصت.",
        cta: "تفعيل الإشعارات",
        later: "اسألني لاحقًا",
      }
    : {
        bannerTitle: "Don't forget",
        bannerBody: "Your electricity bill is due today",
        heading: "Get notified when something important happens.",
        sub: "Price drops, reminders, replies, completed tasks.",
        cta: "Turn on notifications",
        later: "Ask me later",
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
  const Icon = kind === "contacts" ? Users : kind === "location" ? MapPin : Bell;

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
    <div className="perm-overlay" role="dialog" aria-modal="true" dir={ar ? "rtl" : "ltr"}>
      <div className="perm-phone-stage" aria-hidden="true">
        <div className="perm-phone-frame">
          <div className="perm-phone-notch" />
          <div className="perm-banner">
            <div className="perm-banner-icon" data-kind={kind}>
              <Icon size={20} strokeWidth={2.2} />
            </div>
            <div className="perm-banner-text">
              <strong>{copy.bannerTitle}</strong>
              <span>{copy.bannerBody}</span>
            </div>
          </div>
          <div className="perm-app-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div className="perm-app-tile" key={i} />
            ))}
          </div>
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