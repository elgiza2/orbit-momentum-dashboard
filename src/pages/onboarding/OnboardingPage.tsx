/** First-run setup: profile → what you do → create your primary bot. */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, User, Code, Palette, GraduationCap, Briefcase, FilmSlate, Sparkle, CaretLeft, Check, At, Users } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { forceDarkTheme } from "@/lib/theme";
import { AgentForm, type AgentFormValue } from "@/pages/agent/hub/HubPanels";
import { Button } from "@/components/ui/button";
import { loadPaywallFont } from "@/lib/paywallFont";
import "@/styles/onboarding.css";
import { toAvatar } from "@/lib/profile/avatar";
import { peopleApi, normalizeUsername, USERNAME_RE } from "@/lib/people/peopleApi";

const TYPES = [
  { id: "developer", t: "Developer", I: Code, tone: "lime" },
  { id: "designer", t: "Designer", I: Palette, tone: "pink" },
  { id: "student", t: "Student", I: GraduationCap, tone: "sky" },
  { id: "business", t: "Business owner", I: Briefcase, tone: "peach" },
  { id: "creator", t: "Content creator", I: FilmSlate, tone: "lavender" },
  { id: "other", t: "Something else", I: Sparkle, tone: "sun" },
];
const TOTAL_STEPS = 5;
const AGES = Array.from({ length: 108 }, (_, i) => i + 13);
const ROW = 52;

function AgeWheel({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  useEffect(() => { const el = ref.current; if (el) { el.scrollTop = AGES.indexOf(value) * ROW; setScrollTop(el.scrollTop); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const onScroll = () => {
    const el = ref.current; if (!el) return;
    setScrollTop(el.scrollTop);
    const n = AGES[Math.round(el.scrollTop / ROW)];
    if (n && n !== value) onChange(n);
  };
  return (
    <div className="ob-wheel">
      <div className="ob-wheel-band" aria-hidden />
      <div ref={ref} className="ob-wheel-scroll" onScroll={onScroll} role="listbox" aria-label="Age">
        <div style={{ height: ROW }} />
        {AGES.map((a, i) => {
          const d = Math.min(Math.abs(i * ROW - scrollTop) / ROW, 2.5);
          return (
            <Button variant="ghost" key={a} type="button" role="option" aria-selected={a === value} className="ob-wheel-item"
              style={{ opacity: 1 - d * 0.32, transform: `scale(${1 - d * 0.1}) rotateX(${(i * ROW - scrollTop) / ROW * -18}deg)` }}
              onClick={() => ref.current?.scrollTo({ top: i * ROW, behavior: "smooth" })}>{a}</Button>
          );
        })}
        <div style={{ height: ROW }} />
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const nav = useNavigate();
  const [uid, setUid] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [age, setAge] = useState(22);
  const [type, setType] = useState("");
  const [username, setUsername] = useState("");
  const [hadUsername, setHadUsername] = useState(false);
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

  const saveIdentity = async () => {
    if (!uid || busy) return;
    setBusy(true); setErr("");
    try {
      if (!hadUsername) { await peopleApi.setUsername(username); setHadUsername(true); }
      const { error } = await supabase.from("profiles").update({ group_invites: invites } as never).eq("id", uid);
      if (error) throw error;
      goStep(2);
    } catch (e) { setErr(e instanceof Error && /taken|exist|duplicate/i.test(e.message) ? "That username is taken. Try another." : "Couldn't save. Try again."); }
    finally { setBusy(false); }
  };

  const finish = async (v: AgentFormValue) => {
    if (!uid || busy) return;
    setBusy(true); setErr("");
    try {
      const { data, error } = await supabase.rpc("complete_onboarding", {
        p_name: name.trim(), p_avatar: avatar ?? "", p_age: age, p_type: type,
        p_bot_name: v.name, p_description: v.description ?? "", p_instructions: v.prompt ?? "", p_look: (v.look ?? {}) as never,
      });
      if (error || !data) throw new Error("Setup failed");
      nav("/", { replace: true });
    } catch { setErr("Couldn't finish setup. Your changes weren't partially saved. Try again."); }
    finally { setBusy(false); }
  };

  if (loading || loadError) return <div className="ob"><main className="ob-main ob-recovery">
    <h1>Ceyo</h1>{loadError ? <p role="alert" className="ob-sub">{loadError}</p> : <div role="status" aria-label="Preparing setup" className="my-6 h-8 w-8 animate-pulse rounded-full bg-muted" />}
    {loadError && <Button variant="neutral" className="ob-btn" onClick={() => setRetry((v) => v + 1)}>Retry</Button>}
  </main></div>;

  return (
    <div className="ob" dir="ltr">
      <header className="ob-top">
        {step > 0 ? <Button variant="ghost" size="icon" className="ob-back" disabled={busy} onClick={() => goStep(step - 1)} aria-label="Back"><CaretLeft size={20} weight="bold" /></Button> : <span className="ob-spacer" />}
        <div className="ob-bars" aria-hidden="true">{Array.from({ length: TOTAL_STEPS }, (_, d) => <span key={d} className={d < step ? "done" : d === step ? "on" : ""}><i /></span>)}</div>
        <span className="ob-step-num">{step + 1}/{TOTAL_STEPS}</span>
      </header>
      {step === 4 && (
        <main className={`ob-main ob-bot ${dir > 0 ? "in-next" : "in-prev"}`} key={step}>
          <div className="ob-head">
            <h1>Create your main bot</h1>
            <p className="ob-sub">Your personal AI assistant. You can customize it anytime.</p>
          </div>
          <AgentForm lang="en" title="" cta="Create & Start" busy={busy} error={err} onSubmit={(v) => void finish(v)} onCancel={() => goStep(3)} />
        </main>
      )}
      {step < 4 && <main className={`ob-main ${dir > 0 ? "in-next" : "in-prev"}`} key={step}>
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
              <label className="ob-user">
                <span className="ob-user-at"><At size={18} weight="bold" /></span>
                <input value={username} onChange={(e) => setUsername(normalizeUsername(e.target.value))} placeholder="username" autoCapitalize="none" autoCorrect="off" maxLength={20} disabled={hadUsername} aria-label="Username" autoFocus />
                {USERNAME_RE.test(username) && <span className="ob-user-ok"><Check size={16} weight="bold" /></span>}
              </label>
              <p className="ob-hint">{hadUsername ? "Your username is set" : "3–20 lowercase letters, numbers or _"}</p>
              <div className="ob-card">
                <p className="ob-label"><Users size={15} weight="duotone" /> Who can add you to groups?</p>
                <div className="ob-seg" role="radiogroup" aria-label="Who can add you to groups">
                  {([["everyone", "Everyone"], ["contacts", "Contacts"], ["nobody", "Nobody"]] as const).map(([v, t]) => <button type="button" key={v} role="radio" aria-checked={invites === v} className={invites === v ? "on" : ""} onClick={() => setInvites(v)}>{t}</button>)}
                </div>
              </div>
            </div>
            <Button variant="neutral" className="ob-btn" disabled={busy || !USERNAME_RE.test(username)} onClick={() => void saveIdentity()}>{busy ? "Saving…" : "Continue"}</Button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="ob-head">
              <h1>How old are you?</h1>
              <p className="ob-sub">Helps tailor your experience and safety settings.</p>
            </div>
            <div className="ob-body ob-body-center">
              <div className="ob-age-pill" aria-live="polite">{age} <span>years</span></div>
              <AgeWheel value={age} onChange={setAge} />
            </div>
            <Button variant="neutral" className="ob-btn" onClick={() => goStep(3)}>Continue</Button>
          </>
        )}
        {step === 3 && (
          <>
            <div className="ob-head">
              <h1>What do you do?</h1>
              <p className="ob-sub">We'll tune your bots to match your workflow.</p>
            </div>
            <div className="ob-body">
              <div className="ob-opts">
                {TYPES.map(({ id, t, I, tone }, i) => (
                  <Button variant="ghost" key={id} aria-pressed={type === id} data-tone={tone} className={`ob-opt ${type === id ? "on" : ""}`} style={{ animationDelay: `${0.04 + i * 0.05}s` }} onClick={() => setType(id)}>
                    <span className="ob-opt-ico"><I size={22} weight="duotone" /></span>
                    <span className="ob-opt-txt">{t}</span>
                    <span className="ob-opt-chk" aria-hidden="true"><Check size={13} weight="bold" /></span>
                  </Button>
                ))}
              </div>
            </div>
            <Button variant="neutral" className="ob-btn" disabled={!type} onClick={() => goStep(4)}>Continue</Button>
          </>
        )}
      </main>}
    </div>
  );
}
