import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import landingHtml from "./docs/ui-mockups/landing-page-v1.html?raw";
import step1Html from "./docs/ui-mockups/step1-v2.html?raw";
import step2Html from "./docs/ui-mockups/step2-v1.html?raw";
import step3Html from "./docs/ui-mockups/step3-v2.html?raw";
import feedbackHtml from "./docs/ui-mockups/feedback-v1.html?raw";
import unresolvedHtml from "./docs/ui-mockups/unresolved-reason-v2.html?raw";
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

const DEFAULT_ASIN = "B0BXJLTRSH";

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
  return new URLSearchParams(window.location.search).get("asin") || DEFAULT_ASIN;
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
  const read = () => JSON.parse(window.localStorage.getItem(key) || "[]") as TrackingEvent[];
  const write = (events: TrackingEvent[]) => {
    window.localStorage.setItem(key, JSON.stringify(events));
  };

  return {
    track(name: TrackingEventName, payload: TrackingEvent["payload"]) {
      write([...read(), { name, payload, timestamp: new Date().toISOString() }]);
    },
    clear() {
      write([]);
    }
  };
}

const tracker = createTracker();

function withBridge(html: string, script: string) {
  return html.replace("</body>", `<script>${script}</script></body>`);
}

const landingDoc = withBridge(
  landingHtml,
  `
    (() => {
      const post = (action, payload = {}) => parent.postMessage({ type: "spapp-ui-action", action, ...payload }, "*");
      document.querySelectorAll('button').forEach((button) => {
        const text = (button.textContent || "").toLowerCase();
        if (text.includes("3-step safety") || text.includes("next")) {
          button.addEventListener("click", (event) => {
            event.preventDefault();
            post("start");
          });
        }
      });
      document.querySelectorAll('a[href="#"]').forEach((link) => {
        link.addEventListener("click", (event) => event.preventDefault());
      });
    })();
  `
);

const step1Doc = withBridge(
  step1Html,
  `
    (() => {
      const post = (action) => parent.postMessage({ type: "spapp-ui-action", action }, "*");
      document.querySelectorAll('button, div[class*="cursor-pointer"]').forEach((node) => {
        const text = (node.textContent || "").trim().toLowerCase();
        if (text.includes("back")) {
          node.addEventListener("click", () => post("back"));
        }
        if (text.includes("next step")) {
          node.addEventListener("click", () => post("next-step1"));
        }
      });
    })();
  `
);

const step2Doc = withBridge(
  step2Html,
  `
    (() => {
      const post = (action) => parent.postMessage({ type: "spapp-ui-action", action }, "*");
      document.querySelector('[data-icon="close"]')?.addEventListener("click", () => post("back"));
      document.querySelectorAll('button, div[class*="cursor-pointer"]').forEach((node) => {
        const text = (node.textContent || "").trim().toLowerCase();
        if (text.includes("back")) {
          node.addEventListener("click", () => post("back"));
        }
        if (text.includes("next")) {
          node.addEventListener("click", () => post("next-step2"));
        }
      });
      document.querySelector("main section .relative.overflow-hidden")?.addEventListener("click", () => post("safety-proof"));
    })();
  `
);

const step3Doc = withBridge(
  step3Html,
  `
    (() => {
      const post = (action) => parent.postMessage({ type: "spapp-ui-action", action }, "*");
      document.querySelector('[data-icon="close"]')?.addEventListener("click", () => post("back"));
      document.querySelectorAll("button").forEach((node) => {
        const text = (node.textContent || "").trim().toLowerCase();
        if (text.includes("back")) {
          node.addEventListener("click", () => post("back"));
        }
        if (text.includes("done")) {
          node.addEventListener("click", () => post("next-step3"));
        }
      });
    })();
  `
);

const feedbackDoc = withBridge(
  feedbackHtml,
  `
    (() => {
      const post = (action, payload = {}) => parent.postMessage({ type: "spapp-ui-action", action, ...payload }, "*");
      document.querySelectorAll("button").forEach((node) => {
        const text = (node.textContent || "").trim().toLowerCase();
        if (text.includes("back")) {
          node.addEventListener("click", () => post("back"));
        }
        if (text.includes("yes")) {
          node.addEventListener("click", () => post("resolved", { value: "yes" }));
        }
        if (text.includes("no, still slip")) {
          node.addEventListener("click", () => post("resolved", { value: "no" }));
        }
      });
    })();
  `
);

const unresolvedDoc = withBridge(
  unresolvedHtml,
  `
    (() => {
      const post = (action, payload = {}) => parent.postMessage({ type: "spapp-ui-action", action, ...payload }, "*");
      const reasonMap = {
        "opt-1": "still_slips",
        "opt-2": "not_sure_locked",
        "opt-3": "stitching_safety",
        "opt-4": "wrong_placement",
        "opt-5": "door_damage_worry",
        "opt-6": "door_not_fit"
      };
      document.querySelector("header button")?.addEventListener("click", () => post("back"));
      document.querySelectorAll('input[name="reason"]').forEach((input) => {
        input.addEventListener("change", () => post("reason-change", { reason: reasonMap[input.id] }));
      });
      const note = document.getElementById("other-note");
      note?.addEventListener("input", () => post("note-change", { note: note.value }));
      document.querySelectorAll("button").forEach((button) => {
        const text = (button.textContent || "").trim().toLowerCase();
        if (text.includes("submit and review")) {
          button.addEventListener("click", (event) => {
            event.preventDefault();
            const checked = document.querySelector('input[name="reason"]:checked');
            post("submit-unresolved", {
              reason: checked ? reasonMap[checked.id] : null,
              note: note ? note.value : ""
            });
          });
        }
      });
    })();
  `
);

function ScreenFrame({ doc, title }: { doc: string; title: string }) {
  return (
    <iframe
      title={title}
      className="screen-frame"
      srcDoc={doc}
      referrerPolicy="no-referrer"
    />
  );
}

const App = () => {
  const [asin] = useState(getAsin);
  const [currentStep, setCurrentStep] = useState<StepId>(readStepFromHash);
  const [resolved, setResolved] = useState<"yes" | "no" | null>(null);
  const [selectedReason, setSelectedReason] = useState<UnresolvedReason | null>(null);
  const [note, setNote] = useState("");
  const [enteredAt, setEnteredAt] = useState<Record<string, number>>({});
  const [flowSubmitted, setFlowSubmitted] = useState(false);
  const dropoutTrackedRef = useRef(false);

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
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== "spapp-ui-action") return;

      if (data.action === "start") {
        startTutorial();
        return;
      }
      if (data.action === "back") {
        goBack();
        return;
      }
      if (data.action === "next-step1") {
        completeStep("step1");
        return;
      }
      if (data.action === "next-step2") {
        completeStep("step2");
        return;
      }
      if (data.action === "next-step3") {
        completeStep("step3");
        return;
      }
      if (data.action === "safety-proof") {
        tracker.track("safety_trust_click", {
          asin,
          step_id: 2,
          target_type: "stitching_proof_modal"
        });
        window.alert("PoC event logged: safety_trust_click");
        return;
      }
      if (data.action === "resolved" && (data.value === "yes" || data.value === "no")) {
        submitResolved(data.value);
        return;
      }
      if (data.action === "reason-change" && data.reason) {
        setSelectedReason(data.reason as UnresolvedReason);
        return;
      }
      if (data.action === "note-change") {
        setNote(typeof data.note === "string" ? data.note : "");
        return;
      }
      if (data.action === "submit-unresolved") {
        if (typeof data.note === "string") {
          setNote(data.note);
        }
        if (data.reason) {
          setSelectedReason(data.reason as UnresolvedReason);
        }
        const reason = (data.reason || selectedReason) as UnresolvedReason | null;
        if (!reason) return;
        const target = REASONS[reason].reviewTarget;
        setFlowSubmitted(true);
        tracker.track("unresolved_reason_submit", {
          asin,
          reason,
          note_present: ((typeof data.note === "string" ? data.note : note).trim().length > 0),
          recommended_review: target
        });
        if (target === "support") {
          window.alert("Recommended next step: Contact support.");
          return;
        }
        setCurrentStep(target);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [asin, note, selectedReason]);

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

  return (
    <>
      <style>{styles}</style>
      {currentStep === "landing" && <ScreenFrame doc={landingDoc} title="Landing" />}
      {currentStep === "step1" && <ScreenFrame doc={step1Doc} title="Step 1" />}
      {currentStep === "step2" && <ScreenFrame doc={step2Doc} title="Step 2" />}
      {currentStep === "step3" && <ScreenFrame doc={step3Doc} title="Step 3" />}
      {currentStep === "feedback" && <ScreenFrame doc={feedbackDoc} title="Feedback" />}
      {currentStep === "unresolved" && <ScreenFrame doc={unresolvedDoc} title="Unresolved" />}
    </>
  );
};

const styles = `
  * { box-sizing: border-box; }
  html, body, #root { margin: 0; min-height: 100%; background: #f8f9fa; }
  body { font-family: "Public Sans", sans-serif; overflow: hidden; }
  .screen-frame {
    display: block;
    width: 100%;
    height: 100vh;
    border: 0;
    background: #f8f9fa;
  }
`;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


