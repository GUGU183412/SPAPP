import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Dumbbell, HeartPulse, Mic, MicOff, MonitorSmartphone, Pause, Play, ShieldCheck, Sparkles, Volleyball, Waves, XCircle } from "lucide-react";

type RouteId = "entry" | "goal" | "equipment" | "intake" | "recommendation" | "prep" | "session" | "feedback" | "next-step";
type GoalId = "posture_relief" | "shoulder_relief" | "starter_tone";
type EquipmentId = "yoga_ball" | "resistance_band" | "yoga_mat" | "dumbbell" | "none";
type ExperienceId = "beginner" | "returning" | "active";
type DurationId = "8" | "12" | "18";
type IntensityId = "gentle" | "steady" | "energized";
type DiscomfortId = "none" | "upper_back" | "shoulder" | "core_confidence";
type FeedbackOutcomeId = "great" | "too_hard" | "need_review" | "stopped_early";
type RecoveryActionId = "repeat_easier" | "continue_track" | "review_prep" | "contact_support";
type TrackingEventName = "entry_open" | "goal_select" | "equipment_select" | "intake_complete" | "plan_recommend" | "plan_accept" | "prep_ready" | "session_start" | "exercise_step_complete" | "timer_use" | "voice_prompt_use" | "mirror_mode_use" | "session_interrupt" | "session_complete" | "session_feedback" | "next_step_route" | "flow_exit";
type TrackingEvent = { name: TrackingEventName; payload: Record<string, string | number | boolean | null>; timestamp: string };
type IntakeState = { experience: ExperienceId | null; duration: DurationId | null; discomfort: DiscomfortId | null; intensity: IntensityId | null };
type SessionStep = { id: string; title: string; type: "work" | "rest"; durationSec: number; cue: string };
type SessionPlan = { id: string; title: string; goalId: GoalId; primaryEquipment: EquipmentId; why: string; estimatedMinutes: number; safetyNote: string; prepChecklist: string[]; summary: string[]; steps: SessionStep[] };

type FeedbackState = { outcome: FeedbackOutcomeId | null; note: string };
type NextStepState = { action: RecoveryActionId | null };

const DEFAULT_ASIN = "B0BXJLTRSH";
const TRACKER_KEY = "spapp_stage3_events";
const ROUTES: RouteId[] = ["entry", "goal", "equipment", "intake", "recommendation", "prep", "session", "feedback", "next-step"];
const ROUTE_LABEL: Record<RouteId, string> = { entry: "开始", goal: "目标", equipment: "器材", intake: "状态", recommendation: "方案", prep: "准备", session: "跟练", feedback: "反馈", "next-step": "下一步" };

const goals = [
  { id: "posture_relief" as GoalId, title: "久坐舒缓", subtitle: "打开上背和胸廓", desc: "适合久坐后发紧、想快速活动身体的人。", icon: <Waves size={20} /> },
  { id: "shoulder_relief" as GoalId, title: "肩颈放松", subtitle: "先找回安全感", desc: "适合肩颈紧张、肩部不适、想先做轻量训练的人。", icon: <HeartPulse size={20} /> },
  { id: "starter_tone" as GoalId, title: "入门塑形", subtitle: "先做稳定和激活", desc: "适合想开始建立核心稳定和全身参与感的人。", icon: <Dumbbell size={20} /> }
];

const equipmentOptions = [
  { id: "yoga_ball" as EquipmentId, title: "瑜伽球", detail: "阶段三优先模板", icon: <Volleyball size={20} />, priority: true },
  { id: "resistance_band" as EquipmentId, title: "弹力带", detail: "适合轻量激活和拉伸", icon: <Sparkles size={20} /> },
  { id: "yoga_mat" as EquipmentId, title: "瑜伽垫", detail: "适合地面训练", icon: <ShieldCheck size={20} /> },
  { id: "dumbbell" as EquipmentId, title: "哑铃", detail: "适合基础力量补充", icon: <Dumbbell size={20} /> },
  { id: "none" as EquipmentId, title: "无器材", detail: "也能开始训练", icon: <MonitorSmartphone size={20} /> }
];

const experienceOptions = [{ id: "beginner" as ExperienceId, title: "第一次尝试" }, { id: "returning" as ExperienceId, title: "重新开始" }, { id: "active" as ExperienceId, title: "平时有训练" }];
const durationOptions = [{ id: "8" as DurationId, title: "8 分钟", detail: "轻量" }, { id: "12" as DurationId, title: "12 分钟", detail: "标准" }, { id: "18" as DurationId, title: "18 分钟", detail: "完整一轮" }];
const discomfortOptions = [{ id: "none" as DiscomfortId, title: "今天没有明显不适" }, { id: "upper_back" as DiscomfortId, title: "上背 / 胸椎发紧" }, { id: "shoulder" as DiscomfortId, title: "肩颈 / 肩部不舒服" }, { id: "core_confidence" as DiscomfortId, title: "核心稳定感不足" }];
const intensityOptions = [{ id: "gentle" as IntensityId, title: "先轻一点" }, { id: "steady" as IntensityId, title: "标准强度" }, { id: "energized" as IntensityId, title: "更有激活感" }];
const feedbackOptions = [
  { id: "great" as FeedbackOutcomeId, title: "完成得不错", detail: "节奏合适，我愿意继续下一轮。", tone: "positive", icon: <CheckCircle2 size={18} /> },
  { id: "too_hard" as FeedbackOutcomeId, title: "有点偏难", detail: "我想先降一点强度再练一遍。", tone: "warning", icon: <Pause size={18} /> },
  { id: "need_review" as FeedbackOutcomeId, title: "还想回看准备说明", detail: "动作、器材或姿势还有不确定。", tone: "neutral", icon: <ShieldCheck size={18} /> },
  { id: "stopped_early" as FeedbackOutcomeId, title: "我中途停下了", detail: "需要更明确或更安全的下一步。", tone: "caution", icon: <XCircle size={18} /> }
];
const nextStepCopy: Record<RecoveryActionId, { title: string; detail: string; badge: string; icon: React.ReactNode }> = {
  repeat_easier: { title: "重复更轻版本", detail: "保留当前目标，自动降低时长或强度。", badge: "推荐", icon: <Pause size={18} /> },
  continue_track: { title: "进入下一次训练", detail: "沿着当前目标继续，进入第二轮基础计划。", badge: "继续", icon: <ArrowRight size={18} /> },
  review_prep: { title: "回看准备页", detail: "重新确认摆位、节奏和安全提示。", badge: "复查", icon: <ShieldCheck size={18} /> },
  contact_support: { title: "联系支持", detail: "如果仍不适合，转入人工支持或运营跟进。", badge: "支持", icon: <HeartPulse size={18} /> }
};

const plans: SessionPlan[] = [
  { id: "yoga-ball-posture", title: "瑜伽球姿态舒缓首练", goalId: "posture_relief", primaryEquipment: "yoga_ball", why: "你选择了久坐舒缓，且身边有瑜伽球。系统优先给你一套更容易建立安全感的轻量首练。", estimatedMinutes: 12, safetyNote: "保持呼吸稳定；如果肩部出现刺痛，立刻暂停并改为更轻版本。", prepChecklist: ["把瑜伽球固定在不打滑的位置，最好靠墙。", "预留一臂距离，避免球滚动时碰到家具。", "第一轮只追求顺畅，不追求幅度。"], summary: ["4 个动作", "约 12 分钟", "球上激活 + 地面放松"], steps: [{ id: "breath", title: "球上胸廓呼吸打开", type: "work", durationSec: 45, cue: "双手扶头后方，慢慢打开胸口。" }, { id: "rest-1", title: "调整呼吸", type: "rest", durationSec: 20, cue: "鼻吸口呼，让肩膀自然放松。" }, { id: "pelvis", title: "骨盆前后滚动", type: "work", durationSec: 40, cue: "动作小一点，重点找回骨盆控制。" }, { id: "rest-2", title: "短暂休息", type: "rest", durationSec: 20, cue: "感受腰背是否更轻松。" }, { id: "wall", title: "靠墙球上肩胛激活", type: "work", durationSec: 45, cue: "肩胛轻轻向下，不要耸肩。" }, { id: "rest-3", title: "恢复站姿", type: "rest", durationSec: 20, cue: "准备最后一个动作。" }, { id: "finish", title: "地面收尾放松", type: "work", durationSec: 50, cue: "让背部自然延展，完成第一轮。" }] },
  { id: "yoga-ball-shoulder", title: "瑜伽球肩颈放松首练", goalId: "shoulder_relief", primaryEquipment: "yoga_ball", why: "你选择了肩颈放松。瑜伽球能帮助你降低负担，让肩带动作更平滑，适合作为第一次训练。", estimatedMinutes: 10, safetyNote: "任何刺痛或麻感都不属于正常训练反馈，出现时请立即停止。", prepChecklist: ["将球固定在身体前方，避免滚离中线。", "动作范围保持在舒适区间，不追求高度。", "颈部保持放松，优先保证节奏。"], summary: ["3 个动作", "约 10 分钟", "肩带激活 + 轻呼吸"], steps: [{ id: "slide", title: "球前滑肩带激活", type: "work", durationSec: 40, cue: "轻推球向前，感受肩胛滑动。" }, { id: "rest-1", title: "回到中立位", type: "rest", durationSec: 20, cue: "放松颈部，下巴微收。" }, { id: "circle", title: "球上小幅画圈", type: "work", durationSec: 45, cue: "画小圈，先稳再扩大。" }, { id: "rest-2", title: "恢复呼吸", type: "rest", durationSec: 20, cue: "感觉良好再进入最后一组。" }, { id: "reach", title: "靠墙上举引导", type: "work", durationSec: 50, cue: "举到舒服位置即可，不必过头。" }] },
  { id: "starter-mat", title: "瑜伽球 / 地面入门塑形", goalId: "starter_tone", primaryEquipment: "yoga_ball", why: "你选择了入门塑形，系统优先给出稳定感更强、节奏更易跟上的基础计划。", estimatedMinutes: 14, safetyNote: "先找稳定，不追求速度。失去平衡时立刻双脚落地。", prepChecklist: ["双脚踩稳地面，球和髋部保持一条线。", "第一次先小幅激活，确认器材不会打滑。", "保持腹部轻收，不要憋气。"], summary: ["4 个动作", "约 14 分钟", "稳定 + 核心激活"], steps: [{ id: "march", title: "球上交替抬脚", type: "work", durationSec: 45, cue: "保持骨盆稳定，轻轻离地即可。" }, { id: "rest-1", title: "整理姿势", type: "rest", durationSec: 20, cue: "感受核心是否开始参与。" }, { id: "reach", title: "球上交替前伸", type: "work", durationSec: 45, cue: "手臂前伸时，躯干保持稳定。" }, { id: "rest-2", title: "放松肩膀", type: "rest", durationSec: 20, cue: "准备进入第三步。" }, { id: "squat", title: "靠墙辅助深蹲", type: "work", durationSec: 45, cue: "动作慢一点，重心放在双脚中间。" }, { id: "rest-3", title: "短休息", type: "rest", durationSec: 20, cue: "最后一组保持平稳。" }, { id: "finish", title: "仰卧收尾", type: "work", durationSec: 50, cue: "四肢慢慢伸展，腰背保持贴地。" }] },
  { id: "bodyweight-shoulder", title: "无器材肩颈放松", goalId: "shoulder_relief", primaryEquipment: "none", why: "即使没有器材，也可以先做一版低负担的肩颈放松训练。", estimatedMinutes: 8, safetyNote: "只在舒适区间活动，不要压到痛点。", prepChecklist: ["站直或坐直都可以。", "肩膀放松，下巴微收。", "先求顺畅，不求幅度。"], summary: ["3 个动作", "约 8 分钟", "无器材即可开始"], steps: [{ id: "neck", title: "颈部点头热身", type: "work", durationSec: 35, cue: "范围小一点即可。" }, { id: "rest-1", title: "调整呼吸", type: "rest", durationSec: 15, cue: "放松肩膀。" }, { id: "scap", title: "肩胛滑动", type: "work", durationSec: 40, cue: "耸肩后慢慢下沉。" }, { id: "rest-2", title: "恢复中立", type: "rest", durationSec: 15, cue: "准备最后一步。" }, { id: "wall", title: "墙边上举引导", type: "work", durationSec: 40, cue: "高度以舒适为准。" }] }
];

const tracker = {
  read: () => JSON.parse(window.localStorage.getItem(TRACKER_KEY) || "[]") as TrackingEvent[],
  track(name: TrackingEventName, payload: TrackingEvent["payload"]) { window.localStorage.setItem(TRACKER_KEY, JSON.stringify([...this.read(), { name, payload, timestamp: new Date().toISOString() }])); }
};

const contextFromQuery = () => {
  const p = new URLSearchParams(window.location.search);
  return { asin: p.get("asin") || DEFAULT_ASIN, source: p.get("src") || "direct", campaign: p.get("campaign") || "stage3", productHint: p.get("product") || "yoga-ball" };
};
const routeFromHash = (): RouteId => { const hash = window.location.hash.replace("#", ""); return ROUTES.includes(hash as RouteId) ? (hash as RouteId) : "entry"; };
const pickPlan = (goal: GoalId | null, equipment: EquipmentId[], intake: IntakeState): SessionPlan | null => {
  if (!goal) return null;
  const preferred = equipment.find((x) => x === "yoga_ball") || equipment.find((x) => x !== "none") || "none";
  const base = plans.find((x) => x.goalId === goal && x.primaryEquipment === preferred) || plans.find((x) => x.goalId === goal && equipment.includes(x.primaryEquipment)) || plans.find((x) => x.goalId === goal && x.primaryEquipment === "none") || null;
  if (!base) return null;
  const durationFactor = intake.duration === "8" ? 0.85 : intake.duration === "18" ? 1.15 : 1;
  const intensityFactor = intake.intensity === "gentle" ? 0.85 : intake.intensity === "energized" ? 1.1 : 1;
  const scale = durationFactor * intensityFactor;
  const steps = base.steps.map((s) => ({ ...s, durationSec: s.type === "rest" ? Math.max(15, Math.round(s.durationSec * Math.min(scale, 1))) : Math.max(30, Math.round(s.durationSec * scale)) }));
  return { ...base, steps, estimatedMinutes: Math.max(6, Math.round(steps.reduce((n, s) => n + s.durationSec, 0) / 60)) };
};
const totalDuration = (plan: SessionPlan | null) => plan ? plan.steps.reduce((n, s) => n + s.durationSec, 0) : 0;
const totalWorkSteps = (plan: SessionPlan | null) => plan ? plan.steps.filter((s) => s.type === "work").length : 0;
const fmt = (s: number) => `${String(Math.floor(Math.max(0, s) / 60)).padStart(2, "0")}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;
const nextAction = (outcome: FeedbackOutcomeId): RecoveryActionId => outcome === "great" ? "continue_track" : outcome === "too_hard" ? "repeat_easier" : outcome === "need_review" ? "review_prep" : "contact_support";
const toneClass = (tone: string) => tone === "positive" ? "feedback-card positive" : tone === "warning" ? "feedback-card warning" : tone === "caution" ? "feedback-card caution" : "feedback-card";
const equipmentLabel = (id: EquipmentId) => id === "yoga_ball" ? "瑜伽球" : id === "resistance_band" ? "弹力带" : id === "yoga_mat" ? "瑜伽垫" : id === "dumbbell" ? "哑铃" : "无器材";

function MirrorPreview({ enabled }: { enabled: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  useEffect(() => {
    let active = true;
    if (!enabled) { setStatus("idle"); if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; if (videoRef.current) videoRef.current.srcObject = null; return; }
    if (!navigator.mediaDevices?.getUserMedia) { setStatus("error"); return; }
    setStatus("loading");
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false }).then((stream) => { if (!active) { stream.getTracks().forEach((t) => t.stop()); return; } streamRef.current = stream; if (videoRef.current) videoRef.current.srcObject = stream; setStatus("ready"); }).catch(() => setStatus("error"));
    return () => { active = false; if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; };
  }, [enabled]);
  const label = status === "ready" ? "已开启" : status === "loading" ? "启动中" : status === "error" ? "不可用" : "未开启";
  return <section className="sub-card"><div className="sub-head"><div><span className="kicker">辅助预览</span><h3>镜像预览</h3></div><span className={`status ${status}`}>{label}</span></div>{enabled ? status === "error" ? <div className="mirror-empty">摄像头权限不可用。你仍然可以继续标准跟练。</div> : <video ref={videoRef} className="mirror-video" autoPlay muted playsInline /> : <div className="mirror-empty">在准备页开启镜像预览后，这里会显示你的实时动作画面。</div>}</section>;
}
function App() {
  const context = contextFromQuery();
  const [route, setRoute] = useState<RouteId>(routeFromHash);
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [equipment, setEquipment] = useState<EquipmentId[]>(context.productHint === "yoga-ball" ? ["yoga_ball"] : []);
  const [intake, setIntake] = useState<IntakeState>({ experience: null, duration: "12", discomfort: null, intensity: "steady" });
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [mirrorEnabled, setMirrorEnabled] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({ outcome: null, note: "" });
  const [nextStep, setNextStep] = useState<NextStepState>({ action: null });
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [enteredAt, setEnteredAt] = useState<Record<RouteId, number>>({ entry: Date.now(), goal: 0, equipment: 0, intake: 0, recommendation: 0, prep: 0, session: 0, feedback: 0, "next-step": 0 });
  const [sessionInterrupted, setSessionInterrupted] = useState(false);
  const dropoutRef = useRef(false);
  const lastSpokenRef = useRef<string | null>(null);
  const plan = pickPlan(goal, equipment, intake);
  const currentStep = plan?.steps[stepIndex] || null;
  const completedWorkSteps = plan ? plan.steps.slice(0, stepIndex).filter((s) => s.type === "work").length : 0;

  useEffect(() => { document.title = "Shifu"; }, []);
  useEffect(() => { tracker.track("entry_open", { asin: context.asin, source: context.source, campaign: context.campaign, product_hint: context.productHint }); }, [context.asin, context.campaign, context.productHint, context.source]);
  useEffect(() => { const nextHash = `#${route}`; if (window.location.hash !== nextHash) window.history.replaceState(null, "", nextHash); setEnteredAt((p) => ({ ...p, [route]: Date.now() })); }, [route]);
  useEffect(() => { const onHash = () => setRoute(routeFromHash()); window.addEventListener("hashchange", onHash); return () => window.removeEventListener("hashchange", onHash); }, []);
  useEffect(() => { if (!sessionStarted || sessionPaused || !currentStep) return; const timer = window.setInterval(() => setRemainingSeconds((n) => { if (n <= 1) { window.clearInterval(timer); completeStep(); return 0; } return n - 1; }), 1000); return () => window.clearInterval(timer); }, [currentStep, sessionPaused, sessionStarted]);
  useEffect(() => { if (!voiceEnabled || !sessionStarted || !currentStep) return; if (lastSpokenRef.current === currentStep.id) return; lastSpokenRef.current = currentStep.id; tracker.track("voice_prompt_use", { route, enabled: true, step_id: currentStep.id }); if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(`${currentStep.type === "rest" ? "休息" : "开始"}，${currentStep.title}`); u.lang = "zh-CN"; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } }, [currentStep, route, sessionStarted, voiceEnabled]);
  useEffect(() => { if (mirrorEnabled) tracker.track("mirror_mode_use", { route, enabled: true }); }, [mirrorEnabled, route]);
  useEffect(() => { const onHide = () => { if (dropoutRef.current || route === "entry" || route === "next-step") return; tracker.track("flow_exit", { route, duration_ms: Date.now() - (enteredAt[route] || Date.now()), goal, equipment: equipment.join(",") || null, session_started: sessionStarted, session_interrupted: sessionInterrupted }); dropoutRef.current = true; }; window.addEventListener("pagehide", onHide); return () => window.removeEventListener("pagehide", onHide); }, [enteredAt, equipment, goal, route, sessionInterrupted, sessionStarted]);

  const canContinue = route === "entry" ? true : route === "goal" ? Boolean(goal) : route === "equipment" ? equipment.length > 0 : route === "intake" ? Boolean(intake.experience && intake.duration && intake.discomfort && intake.intensity) : route === "recommendation" ? Boolean(plan) : route === "prep" ? true : route === "feedback" ? Boolean(feedback.outcome) : route === "next-step" ? Boolean(nextStep.action) : false;
  const routeIndex = ROUTES.indexOf(route);
  const progress = route === "session" ? 0.72 : (routeIndex + 1) / ROUTES.length;
  const sessionProgress = plan ? (stepIndex + 1) / plan.steps.length : 0;

  const goTo = (r: RouteId) => setRoute(r);
  const goBack = () => { if (route === "goal") return goTo("entry"); if (route === "equipment") return goTo("goal"); if (route === "intake") return goTo("equipment"); if (route === "recommendation") return goTo("intake"); if (route === "prep") return goTo("recommendation"); if (route === "session") return goTo("prep"); if (route === "feedback") return goTo("session"); if (route === "next-step") return goTo("feedback"); };
  const toggleEquipment = (id: EquipmentId) => setEquipment((curr) => { if (id === "none") return curr.includes("none") ? [] : ["none"]; const list = curr.filter((x) => x !== "none"); return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]; });

  const startSession = () => {
    if (!plan) return;
    setSessionStarted(true); setSessionPaused(false); setSessionInterrupted(false); setStepIndex(0); setRemainingSeconds(plan.steps[0]?.durationSec || 0); lastSpokenRef.current = null;
    tracker.track("plan_recommend", { plan_id: plan.id, goal: plan.goalId, primary_equipment: plan.primaryEquipment, estimated_minutes: plan.estimatedMinutes });
    tracker.track("session_start", { plan_id: plan.id, total_steps: plan.steps.length, total_duration_sec: totalDuration(plan) });
    tracker.track("timer_use", { plan_id: plan.id, enabled: true });
    goTo("session");
  };

  const completeStep = () => {
    if (!plan || !currentStep) return;
    tracker.track("exercise_step_complete", { plan_id: plan.id, step_id: currentStep.id, step_type: currentStep.type, step_index: stepIndex });
    const next = stepIndex + 1;
    if (next >= plan.steps.length) { setSessionStarted(false); setSessionPaused(false); tracker.track("session_complete", { plan_id: plan.id, completed_steps: plan.steps.length, total_duration_sec: totalDuration(plan) }); goTo("feedback"); return; }
    setStepIndex(next); setRemainingSeconds(plan.steps[next].durationSec);
  };

  const exitSession = () => {
    if (!plan) return;
    setSessionInterrupted(true); setSessionStarted(false); setSessionPaused(true);
    tracker.track("session_interrupt", { plan_id: plan.id, step_id: currentStep?.id || null, step_index: stepIndex });
    setFeedback({ outcome: "stopped_early", note: "训练中途结束，需要更轻或更明确的下一步。" });
    goTo("feedback");
  };

  const nextFlow = () => {
    if (route === "entry") return goTo("goal");
    if (route === "goal" && goal) { tracker.track("goal_select", { goal, source: context.source, asin: context.asin }); return goTo("equipment"); }
    if (route === "equipment" && equipment.length) { tracker.track("equipment_select", { equipment: equipment.join(","), yoga_ball_selected: equipment.includes("yoga_ball") }); return goTo("intake"); }
    if (route === "intake" && intake.experience && intake.duration && intake.discomfort && intake.intensity) { tracker.track("intake_complete", { experience: intake.experience, duration: intake.duration, discomfort: intake.discomfort, intensity: intake.intensity }); return goTo("recommendation"); }
    if (route === "recommendation" && plan) { tracker.track("plan_accept", { plan_id: plan.id, primary_equipment: plan.primaryEquipment, estimated_minutes: plan.estimatedMinutes }); return goTo("prep"); }
    if (route === "prep" && plan) { tracker.track("prep_ready", { plan_id: plan.id, voice_enabled: voiceEnabled, mirror_enabled: mirrorEnabled }); return startSession(); }
    if (route === "feedback" && feedback.outcome) { const action = nextAction(feedback.outcome); setNextStep({ action }); tracker.track("session_feedback", { plan_id: plan?.id || null, outcome: feedback.outcome, note_present: feedback.note.trim().length > 0 }); tracker.track("next_step_route", { action, plan_id: plan?.id || null }); return goTo("next-step"); }
  };

  const footerLabel = route === "entry" ? "开始训练设置" : route === "recommendation" ? "使用这套方案" : route === "prep" ? "开始跟练" : route === "feedback" ? "生成下一步" : route === "next-step" ? "保留当前建议" : "继续";

  const ScreenWrap = ({ kicker, title, desc, children, compact = false }: { kicker?: string; title: string; desc: string; children: React.ReactNode; compact?: boolean }) => <section className={`screen ${compact ? "compact-screen" : ""}`}><div className={`screen-header ${compact ? "compact" : ""}`}>{kicker ? <span className="kicker">{kicker}</span> : null}<h2>{title}</h2><p>{desc}</p></div><div className="screen-body">{children}</div></section>;

  let body: React.ReactNode = null;
  if (route === "entry") body = <ScreenWrap kicker="Shifu" title="今天想解决什么问题？" desc="先告诉我目标、手边器材和今天的状态，我会给你一套可以马上开始的训练方案。"><div className="hero-card"><div className="hero-icon"><Sparkles size={24} /></div><div className="hero-copy"><h3>3 分钟内完成设置</h3><p>适合扫码进入后的首次体验。当前优先推荐瑜伽球模板，但不限制你只能用单一器材。</p></div></div></ScreenWrap>;
  if (route === "goal") body = <ScreenWrap kicker="目标选择" title="你今天更想先解决哪一类问题？" desc="选择一个主目标。先聚焦一件事，训练方案会更准确。"><div className="stack">{goals.map((item) => <button key={item.id} type="button" className={`card ${goal === item.id ? "selected" : ""}`} onClick={() => setGoal(item.id)}><span className="icon">{item.icon}</span><div className="copy"><strong>{item.title}</strong><span>{item.subtitle}</span><p>{item.desc}</p></div><CheckCircle2 size={18} className="check" /></button>)}</div></ScreenWrap>;
  if (route === "equipment") body = <ScreenWrap kicker="器材确认" title="你身边现在能用哪些器材？" desc="可以多选。瑜伽球会优先命中训练模板，但不是唯一入口。"><div className="stack">{equipmentOptions.map((item) => <button key={item.id} type="button" className={`card ${equipment.includes(item.id) ? "selected" : ""}`} onClick={() => toggleEquipment(item.id)}><span className="icon">{item.icon}</span><div className="copy"><div className="inline"><strong>{item.title}</strong>{item.priority ? <span className="tag">优先模板</span> : null}</div><p>{item.detail}</p></div><CheckCircle2 size={18} className="check" /></button>)}</div></ScreenWrap>;
  if (route === "intake") body = <ScreenWrap kicker="快速确认" title="20 秒确认状态" desc="补全 4 项信息，我会给你更稳的方案。" compact><div className="q"><h3>训练经验</h3><div className="pill-list">{experienceOptions.map((o) => <button key={o.id} type="button" className={`pill ${intake.experience === o.id ? "selected" : ""}`} onClick={() => setIntake((s) => ({ ...s, experience: o.id }))}>{o.title}</button>)}</div></div><div className="q"><h3>今天能练多久</h3><div className="pill-list">{durationOptions.map((o) => <button key={o.id} type="button" className={`pill detail ${intake.duration === o.id ? "selected" : ""}`} onClick={() => setIntake((s) => ({ ...s, duration: o.id }))}><strong>{o.title}</strong><span>{o.detail}</span></button>)}</div></div><div className="q"><h3>今天最想注意哪里</h3><div className="pill-list">{discomfortOptions.map((o) => <button key={o.id} type="button" className={`pill ${intake.discomfort === o.id ? "selected" : ""}`} onClick={() => setIntake((s) => ({ ...s, discomfort: o.id }))}>{o.title}</button>)}</div></div><div className="q"><h3>希望从什么强度开始</h3><div className="pill-list">{intensityOptions.map((o) => <button key={o.id} type="button" className={`pill ${intake.intensity === o.id ? "selected" : ""}`} onClick={() => setIntake((s) => ({ ...s, intensity: o.id }))}>{o.title}</button>)}</div></div></ScreenWrap>;
  if (route === "recommendation") body = <ScreenWrap kicker="推荐结果" title={plan ? plan.title : "暂时还没匹配到方案"} desc={plan ? plan.why : "请回到上一步补充目标、器材或状态信息。"}>{plan ? <div className="sub-card recommendation-card"><div className="recommendation-metrics"><div className="recommendation-metric"><span className="metric-label">预计时长</span><strong><Clock3 size={14} />{plan.estimatedMinutes} 分钟</strong></div><div className="recommendation-metric"><span className="metric-label">建议器材</span><strong>{equipmentLabel(plan.primaryEquipment)}</strong></div></div><div className="recommendation-summary"><span className="metric-label">训练结构</span><div className="summary-list">{plan.summary.map((x) => <span key={x} className="summary-pill">{x}</span>)}</div></div><div className="note recommendation-note"><ShieldCheck size={16} /><div className="note-copy"><strong>开始前提醒</strong><span>{plan.safetyNote}</span></div></div></div> : <div className="sub-card"><p>当前没有符合条件的训练计划。</p></div>}</ScreenWrap>;
  if (route === "prep") body = <ScreenWrap kicker="开始前" title="准备一下再进入跟练" desc="这里只保留真正影响开始训练的内容：准备清单、语音、镜像预览。">{plan ? <><section className="sub-card"><div className="sub-head"><div><span className="kicker">准备清单</span><h3>先确认这 3 件事</h3></div></div><ul className="list">{plan.prepChecklist.map((item) => <li key={item}><CheckCircle2 size={16} /><span>{item}</span></li>)}</ul></section><section className="sub-card"><div className="sub-head"><div><span className="kicker">运行支持</span><h3>按你的习惯打开辅助功能</h3></div></div><button type="button" className={`toggle ${voiceEnabled ? "active" : ""}`} onClick={() => setVoiceEnabled((v) => !v)}><div className="copy"><strong>语音播报</strong><span>首次训练建议开启，减少盯屏负担。</span></div><span className="state">{voiceEnabled ? <Mic size={16} /> : <MicOff size={16} />}{voiceEnabled ? "已开启" : "已关闭"}</span></button><button type="button" className={`toggle ${mirrorEnabled ? "active" : ""}`} onClick={() => setMirrorEnabled((v) => !v)}><div className="copy"><strong>镜像预览</strong><span>辅助查看动作，不影响主流程。</span></div><span className="state"><MonitorSmartphone size={16} />{mirrorEnabled ? "已开启" : "未开启"}</span></button></section>{mirrorEnabled ? <MirrorPreview enabled={mirrorEnabled} /> : null}</> : null}</ScreenWrap>;
  if (route === "session") body = <ScreenWrap kicker="跟练中" title={currentStep ? currentStep.title : "跟练中"} desc={currentStep ? currentStep.cue : ""}>{plan && currentStep ? <><section className="sub-card runtime"><div className="runtime-top"><span className={`badge ${currentStep.type}`}>{currentStep.type === "rest" ? "休息" : "动作进行中"}</span><span className="badge muted">{completedWorkSteps}/{totalWorkSteps(plan)} 个动作完成</span></div><div className="timer"><div className="time">{fmt(remainingSeconds)}</div><span>{currentStep.type === "rest" ? "恢复时间" : "当前动作倒计时"}</span></div><div className="progress large"><div className="bar" style={{ width: `${Math.min(sessionProgress * 100, 100)}%` }} /></div><div className="meta"><span>本次训练进度</span><span>{plan.estimatedMinutes} 分钟计划</span></div><div className="session-actions"><button type="button" className="secondary" onClick={() => setSessionPaused((v) => !v)}>{sessionPaused ? <Play size={16} /> : <Pause size={16} />}{sessionPaused ? "继续" : "暂停"}</button><button type="button" className="primary inline" onClick={completeStep}><ArrowRight size={16} />下一步</button><button type="button" className="ghost danger" onClick={exitSession}><XCircle size={16} />提前结束</button></div></section>{mirrorEnabled ? <MirrorPreview enabled={mirrorEnabled} /> : null}</> : null}</ScreenWrap>;
  if (route === "feedback") body = <ScreenWrap kicker="训练反馈" title="这轮训练感觉怎么样？" desc="只要告诉我结果是否合适，我就能给出下一步建议。"><div className="stack">{feedbackOptions.map((item) => <button key={item.id} type="button" className={`${toneClass(item.tone)} ${feedback.outcome === item.id ? "selected" : ""}`} onClick={() => setFeedback((s) => ({ ...s, outcome: item.id }))}><div className="icon semantic">{item.icon}</div><div className="copy"><strong>{item.title}</strong><p>{item.detail}</p></div><CheckCircle2 size={18} className="check" /></button>)}</div><textarea className="note-input" placeholder="如果想补充哪里不确定、哪里不舒服，可以简单写一句。" value={feedback.note} onChange={(e) => setFeedback((s) => ({ ...s, note: e.target.value }))} /></ScreenWrap>;
  if (route === "next-step") body = <ScreenWrap kicker="下一步" title="接下来这样做更合适" desc="训练闭环不是结束，而是给你一个明确可继续的动作。">{nextStep.action ? <div className="hero-card success"><div className="hero-icon success"><CheckCircle2 size={24} /></div><div className="hero-copy"><h3>{nextStepCopy[nextStep.action].title}</h3><p>{nextStepCopy[nextStep.action].detail}</p></div></div> : null}<div className="stack">{(Object.keys(nextStepCopy) as RecoveryActionId[]).map((action) => <button key={action} type="button" className={`card action-card ${nextStep.action === action ? "selected" : ""}`} onClick={() => { setNextStep({ action }); tracker.track("next_step_route", { action, explicit_choice: true }); }}><span className="tag top">{nextStepCopy[action].badge}</span><div className="icon">{nextStepCopy[action].icon}</div><div className="copy"><strong>{nextStepCopy[action].title}</strong><p>{nextStepCopy[action].detail}</p></div><CheckCircle2 size={18} className="check" /></button>)}</div></ScreenWrap>;

  return <><style>{styles}</style><div className="app-bg"><div className="phone-shell"><header className="topbar"><div className="topbar-row">{route !== "entry" ? <button className="back-button" type="button" onClick={goBack}><ArrowLeft size={16} /></button> : <div className="back-placeholder" />}<div className="topbar-copy"><span className="brand">Shifu</span><strong>{ROUTE_LABEL[route]}</strong></div><span className="topbar-aside">{route === "session" ? "跟练中" : `${routeIndex + 1}/${ROUTES.length}`}</span></div><div className="progress"><div className="bar" style={{ width: `${Math.min(progress * 100, 100)}%` }} /></div></header><main className="main">{body}</main>{route !== "session" ? <footer className="footer"><button className={`primary footer-btn ${canContinue ? "" : "disabled"}`} type="button" onClick={nextFlow} disabled={!canContinue}><span>{footerLabel}</span><ArrowRight size={16} /></button></footer> : null}</div></div></>;
}

const styles = `
:root {
  color-scheme: light;
  --bg: #eef2f0;
  --surface: #fff;
  --soft: #f4f6f5;
  --tint: #edf2ef;
  --line: rgba(17, 24, 39, 0.08);
  --text: #111827;
  --muted: #5b6472;
  --muted2: #7f8794;
  --primary: #0f172a;
  --secondary: #0d8a43;
  --selected-ring: rgba(13, 138, 67, 0.34);
  --selected-fill: rgba(26, 213, 103, 0.08);
  --selected-shadow: rgba(13, 138, 67, 0.08);
  --shadow: 0 18px 60px rgba(17, 24, 39, 0.09);
  --shadow2: 0 10px 26px rgba(17, 24, 39, 0.06);
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
  background: radial-gradient(circle at top, #f9fbfa 0%, var(--bg) 46%, #e6ebe8 100%);
  color: var(--text);
  font-family: "Public Sans", sans-serif;
}

body {
  min-height: 100dvh;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

button,
textarea {
  font: inherit;
}

button {
  border: 0;
  background: none;
  padding: 0;
}

.app-bg {
  min-height: 100dvh;
  display: flex;
  justify-content: center;
}

.phone-shell {
  width: min(100%, 430px);
  min-height: 100dvh;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 249, 0.94) 100%);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: calc(18px + env(safe-area-inset-top)) 18px 14px;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
}

.topbar-row {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.back-button,
.back-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.back-button {
  cursor: pointer;
  background: var(--soft);
  color: var(--primary);
}

.topbar-copy {
  display: grid;
  gap: 2px;
}

.brand {
  font-family: "Lexend", sans-serif;
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted2);
  font-weight: 700;
}

.topbar-copy strong {
  font-family: "Lexend", sans-serif;
  font-size: 1.15rem;
  letter-spacing: -0.03em;
}

.topbar-aside,
.chip,
.tag,
.status,
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.topbar-aside,
.chip,
.status,
.badge.muted {
  background: var(--soft);
  color: var(--muted);
}

.progress,
.large {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.07);
  overflow: hidden;
}

.large {
  height: 10px;
}

.bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #1ad567 0%, #0d8a43 100%);
}

.main {
  flex: 1;
  padding: 18px 18px calc(112px + env(safe-area-inset-bottom));
}

.screen,
.screen-header,
.screen-body,
.copy,
.hero-copy {
  display: grid;
  gap: 14px;
}

.screen-header {
  gap: 10px;
}

.screen.compact-screen {
  gap: 12px;
}

.screen-header.compact {
  gap: 8px;
}

.kicker {
  font-family: "Lexend", sans-serif;
  font-size: 0.76rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--secondary);
  font-weight: 700;
}

.screen-header h2 {
  margin: 0;
  font-family: "Lexend", sans-serif;
  font-size: clamp(1.95rem, 7vw, 2.65rem);
  line-height: 0.96;
  letter-spacing: -0.06em;
}

.screen-header.compact h2 {
  font-size: clamp(1.7rem, 6vw, 2.15rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
}

.screen-header p,
.copy p,
.hero-copy p,
.mini-card span,
.note-input,
.mirror-empty {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
  font-size: 0.94rem;
}

.screen-header.compact p {
  font-size: 0.9rem;
  line-height: 1.5;
  max-width: 24rem;
}

.hero-card,
.sub-card,
.mini-card,
.card,
.feedback-card,
.pill.detail {
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow2);
}

.hero-card {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 14px;
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(180deg, #fff 0%, var(--tint) 100%);
}

.hero-card.success {
  background: linear-gradient(180deg, #fff 0%, rgba(26, 213, 103, 0.1) 100%);
}

.hero-icon,
.icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.08);
  color: var(--primary);
  transition: background 160ms ease, color 160ms ease;
}

.hero-icon.success {
  background: rgba(13, 138, 67, 0.14);
  color: var(--secondary);
}

.chip-row,
.summary,
.inline {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.mini-grid,
.stack,
.pill-list,
.session-actions {
  display: grid;
  gap: 12px;
}

.mini-grid {
  grid-template-columns: 1fr 1fr;
}

.mini-card,
.sub-card {
  padding: 16px;
  border-radius: 18px;
}

.recommendation-card {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.recommendation-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.recommendation-metric,
.recommendation-summary {
  display: grid;
  gap: 8px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(244, 246, 245, 0.92);
}

.recommendation-metric strong {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: "Lexend", sans-serif;
  font-size: 1rem;
  letter-spacing: -0.02em;
}

.metric-label {
  font-size: 0.75rem;
  line-height: 1.2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted2);
  font-weight: 700;
}

.recommendation-summary {
  gap: 10px;
}

.summary-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.summary-pill {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #fff;
  color: var(--primary);
  font-size: 0.88rem;
  font-weight: 700;
  box-shadow: inset 0 0 0 1px rgba(17, 24, 39, 0.06);
}

.mini-card strong,
.copy strong,
.hero-copy h3,
.sub-card h3 {
  margin: 0;
  font-family: "Lexend", sans-serif;
  font-size: 1.02rem;
  letter-spacing: -0.02em;
}

.card,
.feedback-card {
  width: 100%;
  text-align: left;
  padding: 16px;
  border-radius: 20px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: start;
  cursor: pointer;
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
  position: relative;
  isolation: isolate;
}

.card:hover,
.feedback-card:hover,
.pill:hover,
.toggle:hover,
.primary:hover,
.secondary:hover,
.ghost:hover {
  transform: translateY(-1px);
}

.card.selected,
.pill.selected,
.toggle.active {
  background: linear-gradient(180deg, #fff 0%, var(--selected-fill) 100%);
  border-color: var(--selected-ring);
  box-shadow: 0 12px 28px var(--selected-shadow), inset 0 0 0 1px rgba(13, 138, 67, 0.24);
}

.feedback-card.selected {
  background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(26, 213, 103, 0.12) 100%);
  border-color: var(--selected-ring);
  box-shadow: 0 12px 28px var(--selected-shadow), inset 0 0 0 1px rgba(13, 138, 67, 0.24);
}

.card.selected .icon,
.feedback-card.selected .icon,
.toggle.active .state {
  background: rgba(13, 138, 67, 0.14);
  color: var(--secondary);
}

.card.selected .copy strong,
.feedback-card.selected .copy strong,
.pill.selected,
.pill.selected strong,
.toggle.active .copy strong {
  color: var(--primary);
}

.card.selected .copy span,
.card.selected .copy p,
.feedback-card.selected .copy p,
.pill.selected span,
.toggle.active .copy span {
  color: var(--muted);
}

.copy span {
  color: var(--muted2);
  font-size: 0.88rem;
  font-weight: 600;
}

.semantic {
  background: rgba(15, 23, 42, 0.06);
}

.check {
  color: rgba(13, 138, 67, 0.22);
  opacity: 0.35;
  transform: scale(0.92);
  transition: color 160ms ease, opacity 160ms ease, transform 160ms ease;
}

.selected .check {
  color: var(--secondary);
  opacity: 1;
  transform: scale(1);
}

.tag {
  background: rgba(15, 23, 42, 0.06);
  color: var(--muted);
}

.tag.top {
  justify-self: start;
  grid-column: 1 / -1;
  margin-bottom: -4px;
}

.card.selected .tag {
  background: rgba(13, 138, 67, 0.12);
  color: var(--secondary);
}

.q {
  display: grid;
  gap: 12px;
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--line);
}

.q h3 {
  margin: 0;
  font-family: "Lexend", sans-serif;
  font-size: 1rem;
  letter-spacing: -0.02em;
}

.pill {
  width: 100%;
  min-height: 48px;
  border-radius: 16px;
  padding: 14px 16px;
  background: var(--soft);
  color: var(--text);
  text-align: left;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease;
  border: 1px solid transparent;
}

.pill.detail {
  display: grid;
  gap: 4px;
  padding: 15px 16px;
}

.pill.detail span {
  color: var(--muted);
  font-size: 0.84rem;
}

.note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 15px;
  border-radius: 18px;
  background: rgba(13, 138, 67, 0.08);
  color: var(--primary);
  line-height: 1.55;
}

.recommendation-note {
  margin-top: 2px;
}

.note-copy {
  display: grid;
  gap: 4px;
}

.note-copy strong {
  font-family: "Lexend", sans-serif;
  font-size: 0.92rem;
  letter-spacing: -0.02em;
}

.note-copy span {
  color: var(--muted);
}

.sub-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.55;
}

.list svg {
  color: var(--secondary);
  margin-top: 2px;
  flex-shrink: 0;
}

.toggle {
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px;
  border-radius: 18px;
  background: var(--soft);
  border: 1px solid transparent;
  cursor: pointer;
}

.state {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--muted);
  background: rgba(15, 23, 42, 0.06);
  white-space: nowrap;
}

.runtime-top,
.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.badge.work {
  background: rgba(13, 138, 67, 0.12);
  color: var(--secondary);
}

.badge.rest {
  background: #fff1de;
  color: #b16b00;
}

.timer {
  border-radius: 22px;
  padding: 28px 20px;
  background: linear-gradient(180deg, #f8fbf9 0%, #eef7f1 100%);
  border: 1px solid rgba(13, 138, 67, 0.14);
  display: grid;
  justify-items: center;
  gap: 10px;
}

.time {
  font-family: "Lexend", sans-serif;
  font-size: clamp(2.8rem, 12vw, 4rem);
  line-height: 1;
  letter-spacing: -0.06em;
}

.timer span,
.meta {
  color: var(--muted);
  font-size: 0.92rem;
}

.primary,
.secondary,
.ghost {
  width: 100%;
  min-height: 54px;
  padding: 14px 18px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 160ms ease, opacity 160ms ease, box-shadow 160ms ease;
}

.primary {
  background: linear-gradient(135deg, var(--primary) 0%, #1e293b 100%);
  color: #fff;
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.16);
  font-weight: 700;
}

.primary.disabled {
  opacity: 0.4;
  box-shadow: none;
  cursor: not-allowed;
}

.secondary {
  background: var(--soft);
  color: var(--primary);
  font-weight: 700;
}

.ghost {
  background: rgba(255, 255, 255, 0.74);
  color: var(--primary);
  box-shadow: inset 0 0 0 1px rgba(17, 24, 39, 0.14);
  font-weight: 700;
}

.ghost.danger {
  background: #ffe3df;
  color: #b42318;
  box-shadow: none;
}

.feedback-card.positive {
  background: linear-gradient(180deg, #fff 0%, rgba(26, 213, 103, 0.08) 100%);
}

.feedback-card.warning {
  background: linear-gradient(180deg, #fff 0%, rgba(255, 208, 133, 0.18) 100%);
}

.feedback-card.caution {
  background: linear-gradient(180deg, #fff 0%, rgba(255, 163, 153, 0.18) 100%);
}

.feedback-card.selected.positive {
  background: linear-gradient(180deg, #fff 0%, rgba(26, 213, 103, 0.16) 100%);
}

.feedback-card.selected.warning {
  background: linear-gradient(180deg, #fff 0%, rgba(255, 208, 133, 0.14) 62%, rgba(26, 213, 103, 0.1) 100%);
}

.feedback-card.selected.caution {
  background: linear-gradient(180deg, #fff 0%, rgba(255, 163, 153, 0.14) 62%, rgba(26, 213, 103, 0.1) 100%);
}

.note-input {
  width: 100%;
  min-height: 108px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--text);
  resize: vertical;
  box-shadow: var(--shadow2);
}

.note-input:focus {
  outline: none;
  border-color: rgba(13, 138, 67, 0.34);
  box-shadow: 0 10px 24px rgba(13, 138, 67, 0.07), inset 0 0 0 1px rgba(13, 138, 67, 0.2);
}

.footer {
  position: sticky;
  bottom: 0;
  z-index: 9;
  padding: 10px 18px calc(14px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 28%, rgba(255, 255, 255, 0.98) 100%);
  backdrop-filter: blur(18px);
}

.footer-btn {
  min-height: 58px;
  border-radius: 20px;
}

.status.ready {
  background: rgba(13, 138, 67, 0.12);
  color: var(--secondary);
}

.status.loading {
  background: rgba(15, 23, 42, 0.08);
  color: var(--primary);
}

.status.error {
  background: #ffe3df;
  color: #b42318;
}

.mirror-video,
.mirror-empty {
  width: 100%;
  min-height: 220px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f4f6f5 0%, #ebefed 100%);
  overflow: hidden;
}

.mirror-video {
  object-fit: cover;
  transform: scaleX(-1);
}

.mirror-empty {
  display: grid;
  place-items: center;
  padding: 20px;
  text-align: center;
}

@media (min-width: 431px) {
  .app-bg {
    padding: 24px;
  }

  .phone-shell {
    min-height: calc(100dvh - 48px);
    border-radius: 30px;
    overflow: hidden;
  }
}

@media (max-width: 360px) {
  .recommendation-metrics {
    grid-template-columns: 1fr;
  }
}
`;

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
