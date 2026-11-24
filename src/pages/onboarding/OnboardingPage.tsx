/** First-run setup: name & photo → @username & group privacy. */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, User, CaretLeft, Check, X, CircleNotch, At, Users } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { forceDarkTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { loadPaywallFont } from "@/lib/paywallFont";
import "@/styles/onboarding.css";
import { toAvatar } from "@/lib/profile/avatar";
import { peopleApi, normalizeUsername, USERNAME_RE } from "@/lib/people/peopleApi";

const TOTAL_STEPS = 2;
const INVITES = [["everyone", "Everyone"], ["contacts", "Contacts"], ["nobody", "Nobody"]] as const;
type UserStatus = "idle" | "checking" | "available" | "taken";

export default function OnboardingPage() {
  const nav = useNavigate();
  const [uid, setUid] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [hadUsername, setHadUsername] = useState(false);
  const [uStatus, setUStatus] = useState<UserStatus>("idle");
  const [invites, setInvites] = useState<"everyone" | "contacts" | "nobody">("everyone");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const file = useRef<HTMLInputElement>(null);

  const goStep = (n: number) => { setDir(n >= step ? 1 : -1); setStep(n); };
  useEffect(() => { loadPaywallFont(); return forceDarkTheme(); }, []);
  useEffect(() => {
    let alive = true;
    setLoading(true); setLoadError("");
    void (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!alive) return;
        if (error) throw error;
        if (!data.user) return nav("/auth?mode=signup", { replace: true });
        const { data: p, error: profileError } = await supabase.from("profiles").select("display_name,avatar_url,onboarding_completed,username").eq("id", data.user.id).maybeSingle();
        if (profileError || !p) throw new Error("Profile unavailable");
        if (!alive) return;
        if (p.onboarding_completed) return nav("/", { replace: true });
        const { count } = await supabase.from("bots").select("id", { count: "exact", head: true }).eq("owner_id", data.user.id);
        if (!alive) return;
        if ((count ?? 0) > 0) return nav("/", { replace: true });
        setUid(data.user.id);
        if (p.display_name) setName(p.display_name);
        if (p.avatar_url) setAvatar(p.avatar_url);
        if (p.username) { setUsername(p.username); setHadUsername(true); }
      } catch { if (alive) setLoadError("Couldn't load your account. Try again."); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [nav, retry]);

  useEffect(() => {
    if (hadUsername) { setUStatus("available"); return; }
    if (!USERNAME_RE.test(username)) { setUStatus("idle"); return; }
    let alive = true;
    setUStatus("checking");
    const t = window.setTimeout(async () => {
      try {
        const rows = await peopleApi.search(username);
        if (!alive) return;
        const taken = rows.some((r) => r.username?.toLowerCase() === username && r.id !== uid);
        setUStatus(taken ? "taken" : "available");
      } catch {
        if (alive) setUStatus("idle");
      }
    }, 320);
    return () => { alive = false; window.clearTimeout(t); };
  }, [username, hadUsername, uid]);

  const finish = async () => {
    if (!uid || busy) return;
    setBusy(true); setErr("");
    try {
      if (!hadUsername) { await peopleApi.setUsername(username); setHadUsername(true); }
      const { error: invErr } = await supabase.from("profiles").update({ group_invites: invites } as never).eq("id", uid);
      if (invErr) throw invErr;
      const { data, error } = await supabase.rpc("complete_onboarding", {
        p_name: name.trim(), p_avatar: avatar ?? "", p_age: 22, p_type: "other",
        p_bot_name: "Ceyo", p_description: "", p_instructions: "", p_look: {} as never,
      });
      if (error || !data) throw new Error("Setup failed");
      nav("/", { replace: true });
    } catch (e) {
      const taken = e instanceof Error && /taken|exist|duplicate/i.test(e.message);
      if (taken) setUStatus("taken");
      setErr(taken ? "That username is taken. Try another." : "Couldn't finish setup. Try again.");
    }
    finally { setBusy(false); }
  };

  if (loading || loadError) return <div className="ob"><main className="ob-main ob-recovery">
    <h1>Ceyo</h1>{loadError ? <p role="alert" className="ob-sub">{loadError}</p> : <div role="status" aria-label="Preparing setup" className="my-6 h-8 w-8 animate-pulse rounded-full bg-muted" />}
    {loadError && <Button variant="neutral" className="ob-btn" onClick={() => setRetry((v) => v + 1)}>Retry</Button>}
  </main></div>;

  const invIdx = Math.max(0, INVITES.findIndex(([v]) => v === invites));
  const canFinish = !busy && USERNAME_RE.test(username) && uStatus !== "taken" && uStatus !== "checking";

  return (
    <div className="ob" dir="ltr">
      <header className="ob-top">
        {step > 0 ? <Button variant="ghost" size="icon" className="ob-back" disabled={busy} onClick={() => goStep(step - 1)} aria-label="Back"><CaretLeft size={20} weight="bold" /></Button> : <span className="ob-spacer" />}
        <div className="ob-bars" aria-hidden="true">{Array.from({ length: TOTAL_STEPS }, (_, d) => <span key={d} className={d < step ? "done" : d === step ? "on" : ""}><i /></span>)}</div>
        <span className="ob-step-num">{step + 1}/{TOTAL_STEPS}</span>
      </header>
      <main className={`ob-main ${dir > 0 ? "in-next" : "in-prev"}`} key={step}>
        {step === 0 && (
          <>
            <div className="ob-head">
              <h1>What should we call you?</h1>
              <p className="ob-sub">Add your name and a photo so your bots recognize you.</p>
            </div>
            <div className="ob-body">
              <Button variant="ghost" type="button" className="ob-photo" onClick={() => file.current?.click()} aria-label="Your photo">
                {avatar ? <img src={avatar} alt="" /> : <span className="ob-initial">{name.trim()[0]?.toUpperCase() || <User size={38} weight="duotone" />}</span>}
                <span className="ob-photo-badge"><Camera size={15} weight="bold" /></span>
              </Button>
              <input ref={file} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { setAvatar(await toAvatar(f)); setErr(""); } catch { setErr("Couldn't open this photo. Choose another image."); } } }} />
              {err && <p role="alert" className="ob-err">{err}</p>}
              <input className="ob-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={40} autoFocus />
            </div>
            <Button variant="neutral" className="ob-btn" disabled={name.trim().length < 2} onClick={() => { setErr(""); goStep(1); }}>Continue</Button>
          </>
        )}
        {step === 1 && (
          <>
            <div className="ob-head">
              <h1>Pick your handle</h1>
              <p className="ob-sub">People use it to find you and invite you to groups.</p>
            </div>
            <div className="ob-body">
              {err && <p role="alert" className="ob-err">{err}</p>}
              <label className={`ob-user ${uStatus === "taken" ? "is-taken" : uStatus === "available" ? "is-ok" : ""}`}>
                <span className="ob-user-at"><At size={18} weight="bold" /></span>
                <input value={username} onChange={(e) => { setErr(""); setUsername(normalizeUsername(e.target.value)); }} placeholder="username" autoCapitalize="none" autoCorrect="off" maxLength={20} disabled={hadUsername} aria-label="Username" autoFocus />
                {uStatus === "checking" && <span className="ob-user-spin"><CircleNotch size={18} weight="bold" /></span>}
                {uStatus === "available" && <span className="ob-user-ok"><Check size={15} weight="bold" /></span>}
                {uStatus === "taken" && <span className="ob-user-no"><X size={15} weight="bold" /></span>}
              </label>
              <p className={`ob-hint ${uStatus === "taken" ? "is-taken" : uStatus === "available" ? "is-ok" : ""}`}>
                {hadUsername ? "Your username is set" : uStatus === "checking" ? "Checking availability…" : uStatus === "taken" ? `@${username} is already taken` : uStatus === "available" ? `@${username} is available` : "3–20 lowercase letters, numbers or _"}
              </p>
              <div className="ob-card">
                <p className="ob-label"><Users size={15} weight="duotone" /> Who can add you to groups?</p>
                <div className="ob-seg" role="radiogroup" aria-label="Who can add you to groups">
                  <span className="ob-seg-thumb" style={{ transform: `translateX(${invIdx * 100}%)` }} aria-hidden="true" />
                  {INVITES.map(([v, t]) => <button type="button" key={v} role="radio" aria-checked={invites === v} className={invites === v ? "on" : ""} onClick={() => setInvites(v)}>{t}</button>)}
                </div>
              </div>
            </div>
            <Button variant="neutral" className="ob-btn" disabled={!canFinish} onClick={() => void finish()}>{busy ? "Starting…" : "Get Started"}</Button>
          </>
        )}
      </main>
    </div>
  );
}
