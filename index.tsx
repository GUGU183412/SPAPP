import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  DoorOpen,
  Image,
  Info,
  ShieldCheck,
  Wrench,
  XCircle
} from "lucide-react";

type StepId = "landing" | "step1" | "step2" | "step3" | "feedback" | "unresolved";
type TutorialStepId = "step1" | "step2" | "step3";
type UnresolvedReason =
  | "still_slips"
  | "not_sure_locked"
  | "stitching_safety"
  | "wrong_placement"
  | "door_damage_worry"
  | "door_not_fit";

type TrackingEventName =
  | "pwa_entry"
  | "sku_view"
  | "tutorial_start"
  | "step_view"
  | "step_complete"
  | "safety_trust_click"
  | "resolved_status"
  | "unresolved_reason_submit"
  | "dropout_step";

type TrackingEvent = {
  name: TrackingEventName;
  payload: Record<string, string | number | boolean | null>;
  timestamp: string;
};

type GuideStep = {
  id: TutorialStepId;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  mediaTitle: string;
  mediaSubtitle: string;
};

const GUIDE = {
  asin: "B0BXJLTRSH",
  landing: {
    title: "3-step safety installation for your Door Anchor Strap",
    body:
      "Confirm the model, lock the buckle correctly, verify stitching trust, and place it safely on the hinge side before you start your first rehab set.",
    cta: "Start 3-step safety guide"
  },
  steps: [
    {
      id: "step1",
      label: "Step 1 of 3",
      eyebrow: "Slip Prevention",
      title: "Is it locked?",
      body:
        "Compare the wrong loading path against the correct locked position before you pull.",
      mediaTitle: "Wrong vs right buckle loading",
      mediaSubtitle: "This step is designed to eliminate the common slip error."
    },
    {
      id: "step2",
      label: "Step 2 of 3",
      eyebrow: "Safety Proof",
      title: "Why it is safe to trust",
      body:
        "Use close-up stitching proof and a clear load baseline to reduce safety anxiety.",
      mediaTitle: "Industrial X-stitch close-up",
      mediaSubtitle: "Confidence should come from proof, not from guesswork."
    },
    {
      id: "step3",
      label: "Step 3 of 3",
      eyebrow: "Door Protection",
      title: "Protect the door and place it on the hinge side",
      body:
        "Correct placement matters just as much as soft backing. Install on the hinge side and avoid the latch side.",
      mediaTitle: "Zero-damage polymer backing",
      mediaSubtitle: "Door protection and placement should be instantly clear."
    }
  ] satisfies GuideStep[]
};

const REASONS: Record<
  UnresolvedReason,
  { title: string; body: string; reviewTarget: "step1" | "step2" | "step3" | "support" }
> = {
  still_slips: {
    title: "It still slips",
    body: "The strap still loosens or moves when I pull.",
    reviewTarget: "step1"
  },
  not_sure_locked: {
    title: "I’m not sure it is locked",
    body: "I still can’t confirm the buckle is fully engaged.",
    reviewTarget: "step1"
  },
  stitching_safety: {
    title: "I still worry about stitching safety",
    body: "I’m not confident the stitched area is safe under tension.",
    reviewTarget: "step2"
  },
  wrong_placement: {
    title: "I’m not sure where to place it",
    body: "I still don’t know the correct side or position on the door.",
    reviewTarget: "step3"
  },
  door_damage_worry: {
    title: "I’m worried it may damage the door",
    body: "I’m concerned it could leave marks or damage the surface.",
    reviewTarget: "step3"
  },
  door_not_fit: {
    title: "My door does not fit",
    body: "The door won’t close properly or the anchor doesn’t sit right.",
    reviewTarget: "support"
  }
};

const STEP_INDEX: Record<TutorialStepId, number> = { step1: 1, step2: 2, step3: 3 };

function getAsin() {
  return new URLSearchParams(window.location.search).get("asin") || GUIDE.asin;
}

function readStepFromHash(): StepId {
  const raw = window.location.hash.replace("#", "");
  const candidate = raw as StepId;
  return ["landing", "step1", "step2", "step3", "feedback", "unresolved"].includes(candidate)
    ? candidate
    : "landing";
}

function getStepName(step: TutorialStepId) {
  return step === "step1" ? "lock_check" : step === "step2" ? "safety_check" : "door_placement";
}

function isTutorialStep(step: StepId): step is TutorialStepId {
  return step === "step1" || step === "step2" || step === "step3";
}

function getCompletedStepCount(step: StepId) {
  if (step === "landing" || step === "step1") return 0;
  if (step === "step2") return 1;
  if (step === "step3") return 2;
  return 3;
}

function createTracker() {
  const key = "spapp_poc_events";
  const listeners = new Set<(events: TrackingEvent[]) => void>();
  const read = () => JSON.parse(window.localStorage.getItem(key) || "[]") as TrackingEvent[];
  const write = (events: TrackingEvent[]) => {
    window.localStorage.setItem(key, JSON.stringify(events));
    listeners.forEach((listener) => listener(events));
  };

  return {
    track(name: TrackingEventName, payload: TrackingEvent["payload"]) {
      write([...read(), { name, payload, timestamp: new Date().toISOString() }]);
    },
    subscribe(listener: (events: TrackingEvent[]) => void) {
      listeners.add(listener);
      listener(read());
      return () => listeners.delete(listener);
    },
    clear() {
      write([]);
    }
  };
}

const tracker = createTracker();

const App = () => {
  const [asin] = useState(getAsin);
  const [currentStep, setCurrentStep] = useState<StepId>(readStepFromHash);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [resolved, setResolved] = useState<"yes" | "no" | null>(null);
  const [selectedReason, setSelectedReason] = useState<UnresolvedReason | null>(null);
  const [note, setNote] = useState("");
  const [enteredAt, setEnteredAt] = useState<Record<string, number>>({});
  const [flowSubmitted, setFlowSubmitted] = useState(false);
  const dropoutTrackedRef = useRef(false);

  useEffect(() => tracker.subscribe(setEvents), []);

  useEffect(() => {
    tracker.track("pwa_entry", {
      asin,
      qr_source: new URLSearchParams(window.location.search).get("src") || "direct",
      channel: "qr"
    });
    tracker.track("sku_view", { asin, page: "landing" });
  }, [asin]);

  useEffect(() => {
    if (isTutorialStep(currentStep)) {
      tracker.track("step_view", {
        asin,
        step_id: STEP_INDEX[currentStep],
        step_name: getStepName(currentStep)
      });
      setEnteredAt((prev) => ({ ...prev, [currentStep]: Date.now() }));
    }
  }, [asin, currentStep]);

  useEffect(() => {
    const nextHash = `#${currentStep}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, "", nextHash);
    }
  }, [currentStep]);

  useEffect(() => {
    const onHashChange = () => setCurrentStep(readStepFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const onPageHide = () => {
      if (dropoutTrackedRef.current || flowSubmitted || currentStep === "landing") {
        return;
      }

      tracker.track("dropout_step", {
        asin,
        page: currentStep,
        step_id: isTutorialStep(currentStep) ? STEP_INDEX[currentStep] : null,
        step_name: isTutorialStep(currentStep) ? getStepName(currentStep) : currentStep,
        completed_steps: getCompletedStepCount(currentStep),
        duration_ms:
          isTutorialStep(currentStep) && enteredAt[currentStep]
            ? Date.now() - enteredAt[currentStep]
            : 0,
        resolved_state: resolved,
        selected_reason: selectedReason,
        note_present: note.trim().length > 0
      });
      dropoutTrackedRef.current = true;
    };

    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [asin, currentStep, enteredAt, flowSubmitted, note, resolved, selectedReason]);

  const goBack = () => {
    if (currentStep === "step1") setCurrentStep("landing");
    if (currentStep === "step2") setCurrentStep("step1");
    if (currentStep === "step3") setCurrentStep("step2");
    if (currentStep === "feedback") setCurrentStep("step3");
    if (currentStep === "unresolved") setCurrentStep("feedback");
  };

  const startTutorial = () => {
    tracker.track("tutorial_start", { asin, entry_page: "landing" });
    setCurrentStep("step1");
  };

  const completeStep = (step: TutorialStepId) => {
    tracker.track("step_complete", {
      asin,
      step_id: STEP_INDEX[step],
      step_name: getStepName(step),
      duration_ms: enteredAt[step] ? Date.now() - enteredAt[step] : 0
    });
    if (step === "step1") setCurrentStep("step2");
    if (step === "step2") setCurrentStep("step3");
    if (step === "step3") setCurrentStep("feedback");
  };

  const submitResolved = (value: "yes" | "no") => {
    setResolved(value);
    tracker.track("resolved_status", { asin, resolved: value });
    if (value === "yes") {
      setFlowSubmitted(true);
      window.alert("Thanks. This PoC session is marked as resolved.");
      return;
    }
    setCurrentStep("unresolved");
  };

  const submitUnresolved = () => {
    if (!selectedReason) return;
    const target = REASONS[selectedReason].reviewTarget;
    setFlowSubmitted(true);
    tracker.track("unresolved_reason_submit", {
      asin,
      reason: selectedReason,
      note_present: note.trim().length > 0,
      recommended_review: target
    });
    if (target === "support") {
      window.alert("Recommended next step: Contact support.");
      return;
    }
    setCurrentStep(target);
  };

  const step = GUIDE.steps.find((item) => item.id === currentStep);
  const recommendation = selectedReason ? REASONS[selectedReason].reviewTarget : null;

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="topbar">
          <button className="icon-btn" onClick={goBack} disabled={currentStep === "landing"}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="eyebrow">Door Anchor Guide</div>
            <div className="top-title">
              {currentStep === "landing"
                ? "Ready to begin"
                : currentStep === "feedback"
                  ? "Tutorial complete"
                  : currentStep === "unresolved"
                    ? "Follow-up"
                    : step?.label}
            </div>
          </div>
          <div className="chip">{asin}</div>
        </header>

        <main className="layout">
          {currentStep === "landing" && (
            <section className="card hero">
              <span className="eyebrow accent">Verified Hardware</span>
              <h1>{GUIDE.landing.title}</h1>
              <p>{GUIDE.landing.body}</p>
              <div className="panel">
                <div>
                  <span className="label">Confirmed ASIN</span>
                  <strong>{asin}</strong>
                </div>
                <CheckCircle2 size={28} />
              </div>
              <button className="primary" onClick={startTutorial}>
                {GUIDE.landing.cta}
                <ArrowRight size={18} />
              </button>
            </section>
          )}

          {step && (currentStep === "step1" || currentStep === "step2" || currentStep === "step3") && (
            <section className="page-stack">
              <section className="card">
                <span className="eyebrow">{step.eyebrow}</span>
                <h1>{step.title}</h1>
                <p>{step.body}</p>
              </section>

              <section className="card">
                <div className="split-head">
                  <div>
                    <strong>{step.mediaTitle}</strong>
                    <p>{step.mediaSubtitle}</p>
                  </div>
                  {currentStep === "step2" ? (
                    <button
                      className="secondary"
                      onClick={() => {
                        tracker.track("safety_trust_click", {
                          asin,
                          step_id: 2,
                          target_type: "stitching_proof_modal"
                        });
                        window.alert("PoC event logged: safety_trust_click");
                      }}
                    >
                      <Image size={16} />
                      Open proof
                    </button>
                  ) : null}
                </div>

                {currentStep === "step1" && (
                  <div className="grid two">
                    <div className="tone danger">
                      <XCircle size={24} />
                      <strong>Wrong loading</strong>
                      <p>Rests above the teeth and can slip.</p>
                    </div>
                    <div className="tone success">
                      <CheckCircle2 size={24} />
                      <strong>Correct lock</strong>
                      <p>Teeth grip the strap under tension.</p>
                    </div>
                  </div>
                )}

                {currentStep === "step2" && (
                  <div className="grid two">
                    <div className="tone neutral">
                      <ShieldCheck size={24} />
                      <strong>500 kg baseline</strong>
                      <p>Use a clear load baseline to answer safety anxiety.</p>
                    </div>
                    <div className="tone success">
                      <Info size={24} />
                      <strong>Stop if damaged</strong>
                      <p>Do not continue if the stitched area looks frayed or torn.</p>
                    </div>
                  </div>
                )}

                {currentStep === "step3" && (
                  <div className="door-map">
                    <div className="door-side hinge">Hinge</div>
                    <div className="door-leaf" />
                    <div className="door-side latch">Latch</div>
                    <div className="door-marker">Install here</div>
                  </div>
                )}
              </section>

              <button className="primary sticky" onClick={() => completeStep(currentStep)}>
                {currentStep === "step3" ? "Done, let's start!" : "Next"}
                <ArrowRight size={18} />
              </button>
            </section>
          )}

          {currentStep === "feedback" && (
            <section className="page-stack">
              <section className="card">
                <span className="eyebrow">Session Review</span>
                <h1>Problem resolved?</h1>
                <p>Select the answer that best matches what happened after the 3-step guide.</p>
              </section>
              <div className="grid two">
                <button
                  className={`decision success ${resolved === "yes" ? "selected" : ""}`}
                  onClick={() => submitResolved("yes")}
                >
                  <CheckCircle2 size={40} />
                  <strong>Yes</strong>
                  <span>The setup feels secure and ready for use.</span>
                </button>
                <button
                  className={`decision danger ${resolved === "no" ? "selected" : ""}`}
                  onClick={() => submitResolved("no")}
                >
                  <CircleAlert size={40} />
                  <strong>No, still not solved</strong>
                  <span>I still need help with lock, safety, or placement.</span>
                </button>
              </div>
            </section>
          )}

          {currentStep === "unresolved" && (
            <section className="page-stack">
              <section className="card">
                <span className="eyebrow">Follow-up</span>
                <h1>What is still not resolved?</h1>
                <p>Select the issue that still feels wrong. We’ll guide you to the most relevant next step.</p>
              </section>

              <div className="stack">
                {(Object.entries(REASONS) as Array<[UnresolvedReason, (typeof REASONS)[UnresolvedReason]]>).map(
                  ([key, item]) => (
                    <button
                      key={key}
                      className={`reason ${selectedReason === key ? "selected" : ""}`}
                      onClick={() => setSelectedReason(key)}
                    >
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.body}</span>
                      </div>
                      <ArrowRight size={18} />
                    </button>
                  )
                )}
              </div>

              {recommendation ? (
                <div className={`banner ${recommendation === "support" ? "danger" : ""}`}>
                  <Info size={16} />
                  <span>
                    Recommended next step:{" "}
                    {recommendation === "step1" && "Review Step 1 - Lock check"}
                    {recommendation === "step2" && "Review Step 2 - Safety check"}
                    {recommendation === "step3" && "Review Step 3 - Door placement"}
                    {recommendation === "support" && "Contact support"}
                  </span>
                </div>
              ) : null}

              <label className="field">
                <span>Anything else?</span>
                <textarea
                  rows={3}
                  value={note}
                  placeholder="Add a short note if needed."
                  onChange={(event) => setNote(event.target.value)}
                />
              </label>

              <button className="primary sticky" disabled={!selectedReason} onClick={submitUnresolved}>
                Submit and review
                <ArrowRight size={18} />
              </button>
            </section>
          )}
        </main>

        <aside className="console">
          <div className="console-head">
            <strong>PoC Event Log</strong>
            <button className="text-btn" onClick={() => tracker.clear()}>
              Clear
            </button>
          </div>
          <div className="stack compact">
            {events.length === 0 ? (
              <p className="muted">No events yet.</p>
            ) : (
              events
                .slice()
                .reverse()
                .map((event, index) => (
                  <div className="event" key={`${event.timestamp}-${index}`}>
                    <strong>{event.name}</strong>
                    <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                    <code>{JSON.stringify(event.payload)}</code>
                  </div>
                ))
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

const styles = `
  :root{--primary:#000;--surface:#f8f9fa;--surface-low:#f3f4f5;--surface-card:#fff;--text:#191c1d;--muted:#44474e;--green:#006e24;--green-soft:#50ff71;--red:#ba1a1a;--red-soft:#ffdad6;--shadow:0 18px 40px rgba(25,28,29,.06)}
  *{box-sizing:border-box} body{margin:0;background:linear-gradient(180deg,#fff 0%,var(--surface) 100%);color:var(--text);font-family:"Public Sans",sans-serif} button,textarea{font:inherit}
  .app{min-height:100vh;padding-bottom:240px}.topbar{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;background:rgba(248,249,250,.92);backdrop-filter:blur(18px)}
  .icon-btn,.chip,.card,.console,.decision,.reason,.banner{box-shadow:var(--shadow)} .icon-btn{height:48px;width:48px;border:none;border-radius:999px;background:#fff;display:grid;place-items:center}.icon-btn:disabled{opacity:.35}
  .eyebrow{display:inline-flex;font-family:"Lexend",sans-serif;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--green)} .eyebrow.accent{padding:8px 12px;border-radius:999px;background:rgba(80,255,113,.18)}
  .top-title{margin-top:6px;font-family:"Lexend",sans-serif;font-weight:800;letter-spacing:-.03em}.chip{padding:10px 14px;border-radius:999px;background:#fff;font-family:"Lexend",sans-serif;font-size:12px;font-weight:800;letter-spacing:.08em}
  .layout{display:flex;justify-content:center;padding:12px 16px 0}.page-stack{width:min(100%,960px);display:flex;flex-direction:column;gap:20px}.card,.console{border-radius:28px;background:#fff;padding:28px}
  h1{margin:12px 0;font-family:"Lexend",sans-serif;font-size:clamp(2.5rem,6.5vw,4.4rem);line-height:.95;letter-spacing:-.06em} p{color:var(--muted);line-height:1.7}
  .panel{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 20px;margin:16px 0 8px;background:var(--surface-low);border-radius:22px}.label{display:block;margin-bottom:6px;color:var(--muted);font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.panel strong{font-family:"Lexend",sans-serif;font-size:1.35rem}
  .primary,.secondary{border:none;display:inline-flex;align-items:center;justify-content:center;gap:10px;border-radius:18px;font-family:"Lexend",sans-serif;font-weight:800}.primary{min-height:56px;width:100%;padding:16px 22px;background:linear-gradient(135deg,#000 0%,#2e3132 100%);color:#fff}.primary:disabled{opacity:.45}
  .secondary{padding:12px 16px;background:var(--surface-low);color:var(--text)} .split-head{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:20px}.split-head strong{display:block;font-family:"Lexend",sans-serif;font-size:1.08rem}
  .grid{display:grid;gap:18px}.grid.two{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}.tone,.decision,.reason,.banner,.event{border-radius:22px;padding:22px}.tone,.decision,.reason{display:flex;gap:14px;align-items:flex-start;text-align:left}
  .tone strong,.decision strong,.reason strong{font-family:"Lexend",sans-serif;font-size:1.3rem}.tone.success,.banner{background:rgba(80,255,113,.18);color:var(--green)} .tone.danger,.decision.danger,.banner.danger{background:var(--red-soft);color:#93000a}.tone.neutral{background:var(--surface-low)}
  .decision{min-height:220px;flex-direction:column;justify-content:space-between}.decision.success{background:rgba(80,255,113,.34);color:var(--green)} .decision.selected{outline:3px solid rgba(0,0,0,.08)}
  .door-map{position:relative;width:min(100%,360px);aspect-ratio:4/3;border-radius:28px;background:var(--surface-low);overflow:hidden;margin:0 auto}.door-leaf{position:absolute;top:50%;left:14%;width:68%;height:16px;border-radius:999px;background:var(--primary);transform:translateY(-50%) rotate(-12deg)}
  .door-side{position:absolute;top:0;bottom:0;width:68px;display:flex;align-items:center;justify-content:center;font-family:"Lexend",sans-serif;font-size:.75rem;font-weight:800;text-transform:uppercase}.door-side.hinge{left:0;background:rgba(80,255,113,.18);color:var(--green)}.door-side.latch{right:0;background:var(--red-soft);color:var(--red)}
  .door-marker{position:absolute;top:50%;left:84px;transform:translateY(-50%);padding:8px 12px;border-radius:999px;background:var(--green-soft);color:var(--green);font-family:"Lexend",sans-serif;font-size:.72rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
  .stack{display:flex;flex-direction:column;gap:16px}.reason{justify-content:space-between;background:var(--surface-low)} .reason.selected{background:var(--primary);color:#fff}.reason.selected span{color:rgba(255,255,255,.78)}
  .field{display:flex;flex-direction:column;gap:10px;color:var(--muted);font-family:"Lexend",sans-serif;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.field textarea{width:100%;border:none;border-radius:22px;background:#edeeef;padding:18px;resize:vertical;color:var(--text)}
  .sticky{position:sticky;bottom:16px;z-index:5}.console{position:fixed;right:16px;bottom:16px;width:min(360px,calc(100vw - 32px));max-height:42vh;background:rgba(255,255,255,.96);backdrop-filter:blur(18px);z-index:20}
  .console-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px;font-family:"Lexend",sans-serif}.text-btn{border:none;background:transparent;color:var(--muted);font-family:"Lexend",sans-serif;font-weight:700}
  .compact{max-height:28vh;overflow:auto}.event strong,.event span{display:block;font-size:.8rem}.event span,.muted{color:var(--muted)} .event code{display:block;margin-top:8px;white-space:pre-wrap;word-break:break-word;font-size:.72rem}
  @media (max-width:768px){.chip{display:none}.card,.console{padding:22px;border-radius:24px}.console{position:static;width:100%;max-height:none;margin:0 16px 24px}}
`;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
