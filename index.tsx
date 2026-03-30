import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Dumbbell,
  HeartPulse,
  Mic,
  MonitorPlay,
  Pause,
  Play,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Volleyball,
  Waves,
  XCircle
} from "lucide-react";

type RouteId =
  | "entry"
  | "goal"
  | "equipment"
  | "intake"
  | "recommendation"
  | "prep"
  | "session"
  | "feedback"
  | "next-step";

type GoalId = "posture_relief" | "shoulder_relief" | "starter_tone";
type EquipmentId = "yoga_ball" | "resistance_band" | "yoga_mat" | "dumbbell" | "none";
type ExperienceId = "beginner" | "returning" | "active";
type DurationId = "8" | "12" | "18";
type IntensityId = "gentle" | "steady" | "energized";
type DiscomfortId = "none" | "upper_back" | "shoulder" | "core_confidence";
type FeedbackOutcomeId = "great" | "too_hard" | "need_review" | "stopped_early";
type RecoveryActionId = "repeat_easier" | "continue_track" | "review_prep" | "contact_support";

type TrackingEventName =
  | "entry_open"
  | "goal_select"
  | "equipment_select"
  | "intake_complete"
  | "plan_recommend"
  | "plan_accept"
  | "prep_ready"
  | "session_start"
  | "exercise_step_complete"
  | "timer_use"
  | "voice_prompt_use"
  | "mirror_mode_use"
  | "session_interrupt"
  | "session_complete"
  | "session_feedback"
  | "next_step_route"
  | "flow_exit";

type TrackingEvent = {
  name: TrackingEventName;
  payload: Record<string, string | number | boolean | null>;
  timestamp: string;
};

type GoalOption = {
  id: GoalId;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  icon: React.ReactNode;
};

type IntakeState = {
  experience: ExperienceId | null;
  duration: DurationId | null;
  discomfort: DiscomfortId | null;
  intensity: IntensityId | null;
};

type SessionStep = {
  id: string;
  title: string;
  type: "work" | "rest";
  durationSec: number;
  cue: string;
};

type SessionPlan = {
  id: string;
  title: string;
  goalId: GoalId;
  primaryEquipment: EquipmentId;
  recommendedFor: string;
  why: string;
  estimatedMinutes: number;
  safetyNote: string;
  prepChecklist: string[];
  runtimeOptions: string[];
  summary: string[];
  steps: SessionStep[];
};

type EquipmentOption = {
  id: EquipmentId;
  title: string;
  detail: string;
  icon: React.ReactNode;
  priority?: "primary";
};

type FeedbackState = {
  outcome: FeedbackOutcomeId | null;
  note: string;
};

type NextStepState = {
  action: RecoveryActionId | null;
};

const DEFAULT_ASIN = "B0BXJLTRSH";
const TRACKER_KEY = "spapp_stage3_events";

const ROUTES: RouteId[] = [
  "entry",
  "goal",
  "equipment",
  "intake",
  "recommendation",
  "prep",
  "session",
  "feedback",
  "next-step"
];

const GOALS: GoalOption[] = [
  {
    id: "posture_relief",
    title: "久坐舒缓",
    subtitle: "释放上背僵硬，找回轻松姿态",
    description: "适合久坐办公、肩背发紧、想快速活动身体的人。",
    accent: "var(--accent-sage)",
    icon: <Waves size={22} />
  },
  {
    id: "shoulder_relief",
    title: "肩颈 / 肩部启动",
    subtitle: "先找回安全感，再开始训练",
    description: "适合肩颈紧张、肩部不适、希望从温和动作开始的人。",
    accent: "var(--accent-amber)",
    icon: <HeartPulse size={22} />
  },
  {
    id: "starter_tone",
    title: "入门塑形",
    subtitle: "建立核心和稳定性，完成第一轮训练",
    description: "适合想提升基础稳定与激活感的入门用户。",
    accent: "var(--accent-coral)",
    icon: <Dumbbell size={22} />
  }
];

const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  {
    id: "yoga_ball",
    title: "瑜伽球",
    detail: "阶段三首批重点模板库",
    icon: <Volleyball size={20} />,
    priority: "primary"
  },
  {
    id: "resistance_band",
    title: "弹力带",
    detail: "可做轻阻力激活和拉伸",
    icon: <Sparkles size={20} />
  },
  {
    id: "yoga_mat",
    title: "瑜伽垫",
    detail: "适合地面动作和放松",
    icon: <MonitorPlay size={20} />
  },
  {
    id: "dumbbell",
    title: "哑铃",
    detail: "适合基础力量补充",
    icon: <Dumbbell size={20} />
  },
  {
    id: "none",
    title: "无器材",
    detail: "依然可以继续流程",
    icon: <ShieldCheck size={20} />
  }
];

const EXPERIENCE_OPTIONS: Array<{ id: ExperienceId; title: string }> = [
  { id: "beginner", title: "第一次尝试" },
  { id: "returning", title: "以前练过，现在重新开始" },
  { id: "active", title: "平时有训练习惯" }
];

const DURATION_OPTIONS: Array<{ id: DurationId; title: string; detail: string }> = [
  { id: "8", title: "8 分钟", detail: "很轻量，适合第一次" },
  { id: "12", title: "12 分钟", detail: "标准 MVP 首训时长" },
  { id: "18", title: "18 分钟", detail: "想做完整一轮激活" }
];

const DISCOMFORT_OPTIONS: Array<{ id: DiscomfortId; title: string }> = [
  { id: "none", title: "今天没有明显不适" },
  { id: "upper_back", title: "上背 / 胸椎发紧" },
  { id: "shoulder", title: "肩颈 / 肩部不舒服" },
  { id: "core_confidence", title: "核心稳定感不足" }
];

const INTENSITY_OPTIONS: Array<{ id: IntensityId; title: string }> = [
  { id: "gentle", title: "先轻一点" },
  { id: "steady", title: "标准强度即可" },
  { id: "energized", title: "想要更有激活感" }
];

const FEEDBACK_OPTIONS: Array<{
  id: FeedbackOutcomeId;
  title: string;
  detail: string;
  tone: "positive" | "warning" | "neutral" | "caution";
}> = [
  {
    id: "great",
    title: "顺利完成，感觉不错",
    detail: "动作节奏合适，我愿意继续。",
    tone: "positive"
  },
  {
    id: "too_hard",
    title: "有点太难",
    detail: "想降一点强度，再练一遍。",
    tone: "warning"
  },
  {
    id: "need_review",
    title: "我还想回看准备说明",
    detail: "某些动作或器材设置还不确定。",
    tone: "neutral"
  },
  {
    id: "stopped_early",
    title: "我中途停下了",
    detail: "需要更安全或更明确的下一步。",
    tone: "caution"
  }
];

const NEXT_STEP_COPY: Record<
  RecoveryActionId,
  { title: string; detail: string; badge: string }
> = {
  repeat_easier: {
    title: "重复更轻版本",
    detail: "保留同一目标，自动降低时长与强度。",
    badge: "Recommended"
  },
  continue_track: {
    title: "继续下一套",
    detail: "沿着当前目标继续，做第二轮基础计划。",
    badge: "Next Session"
  },
  review_prep: {
    title: "回看训练准备",
    detail: "重新确认瑜伽球摆位、呼吸节奏和动作提示。",
    badge: "Review"
  },
  contact_support: {
    title: "联系支持",
    detail: "如果仍不适合，可转入人工支持与运营协助。",
    badge: "Support"
  }
};

const ROUTE_LABEL: Record<RouteId, string> = {
  entry: "进入",
  goal: "目标",
  equipment: "器材",
  intake: "状态",
  recommendation: "推荐",
  prep: "准备",
  session: "跟练",
  feedback: "反馈",
  "next-step": "下一步"
};

const PLAN_LIBRARY: SessionPlan[] = [
  {
    id: "yoga-ball-posture-reset",
    title: "瑜伽球姿态舒缓首训",
    goalId: "posture_relief",
    primaryEquipment: "yoga_ball",
    recommendedFor: "久坐后上背僵硬、想用瑜伽球打开胸廓的人",
    why: "你选择了久坐舒缓，并且手边有瑜伽球。先用球做胸椎打开和轻核心激活，最容易建立“有效又安全”的第一轮体验。",
    estimatedMinutes: 12,
    safetyNote: "保持呼吸稳定；如果肩部出现锐痛，立即暂停并切到更轻版本。",
    prepChecklist: [
      "把瑜伽球固定在不打滑的区域，最好靠墙。",
      "预留一臂距离，避免球滚动时撞到家具。",
      "第一轮只追求动作顺畅，不追求幅度。"
    ],
    runtimeOptions: ["建议开启语音播报", "镜像模式可作为下一步增强"],
    summary: ["4 个动作", "总计 12 分钟", "球上轻激活 + 地面放松"],
    steps: [
      { id: "breath-open", title: "球上胸廓呼吸打开", type: "work", durationSec: 45, cue: "双手扶头后方，慢慢打开胸口。" },
      { id: "rest-1", title: "调整呼吸", type: "rest", durationSec: 20, cue: "保持鼻吸口呼，让肩膀放松。" },
      { id: "pelvic-roll", title: "球上骨盆前后滚动", type: "work", durationSec: 40, cue: "动作小一点，重点找回骨盆控制。" },
      { id: "rest-2", title: "短暂休息", type: "rest", durationSec: 20, cue: "感受腰背是否更轻松。" },
      { id: "wall-support", title: "靠墙球上肩胛激活", type: "work", durationSec: 45, cue: "肩胛轻轻向下，不要耸肩。" },
      { id: "rest-3", title: "恢复站姿", type: "rest", durationSec: 20, cue: "准备最后一个动作。" },
      { id: "child-reset", title: "地面放松收尾", type: "work", durationSec: 50, cue: "让背部自然延展，结束第一轮。" }
    ]
  },
  {
    id: "yoga-ball-shoulder-ease",
    title: "瑜伽球肩颈启动首训",
    goalId: "shoulder_relief",
    primaryEquipment: "yoga_ball",
    recommendedFor: "肩颈紧张、想先找回安全感的人",
    why: "你选择了肩颈 / 肩部启动。瑜伽球可以帮你降低负担，让肩带动作更平滑，适合作为阶段三第一轮内容。",
    estimatedMinutes: 10,
    safetyNote: "任何刺痛或手臂麻感都不属于正常训练反馈，需立即停止。",
    prepChecklist: [
      "把球固定在身体前方，避免滚离中线。",
      "动作范围保持在舒服区间，不用追求高度。",
      "肩颈保持放松，优先保证节奏。"
    ],
    runtimeOptions: ["建议先开语音，再决定是否加镜像预览"],
    summary: ["3 个动作", "总计 10 分钟", "肩带激活 + 轻松呼吸"],
    steps: [
      { id: "ball-slide", title: "瑜伽球前滑肩带激活", type: "work", durationSec: 40, cue: "轻推球向前，感受肩胛滑动。" },
      { id: "rest-1", title: "回到中立位", type: "rest", durationSec: 20, cue: "放松颈部，保持下巴微收。" },
      { id: "ball-circle", title: "球上小幅画圈", type: "work", durationSec: 45, cue: "画小圈，不要急，先稳定。" },
      { id: "rest-2", title: "深呼吸恢复", type: "rest", durationSec: 20, cue: "如果感觉良好，再进入最后一组。" },
      { id: "wall-reach", title: "靠墙上举引导", type: "work", durationSec: 50, cue: "抬到舒服位置即可，不必过头。" }
    ]
  },
  {
    id: "yoga-ball-starter-core",
    title: "瑜伽球入门塑形首训",
    goalId: "starter_tone",
    primaryEquipment: "yoga_ball",
    recommendedFor: "想要轻激活核心与稳定性的新手",
    why: "你选择了入门塑形，瑜伽球可以帮助你更直观地感受核心稳定，这很适合第一版 MVP 的首训体验。",
    estimatedMinutes: 14,
    safetyNote: "先找稳定，不要追求速度。失去平衡时立刻双脚落地。",
    prepChecklist: [
      "双脚踩稳地面，球和髋部保持一条线。",
      "第一次先小幅度激活，确认球不会打滑。",
      "保持腹部轻收，不要憋气。"
    ],
    runtimeOptions: ["推荐计时与语音同时开启"],
    summary: ["4 个动作", "总计 14 分钟", "球上稳定 + 核心激活"],
    steps: [
      { id: "seated-march", title: "球上交替抬脚", type: "work", durationSec: 45, cue: "保持骨盆稳定，交替离地即可。" },
      { id: "rest-1", title: "整理姿势", type: "rest", durationSec: 20, cue: "感受核心是否开始工作。" },
      { id: "arm-reach", title: "球上交替前伸", type: "work", durationSec: 45, cue: "手臂向前伸，躯干保持稳定。" },
      { id: "rest-2", title: "放松肩膀", type: "rest", durationSec: 20, cue: "准备进入第三步。" },
      { id: "wall-squat", title: "靠墙球辅助深蹲", type: "work", durationSec: 45, cue: "动作缓慢，重心放在双脚中间。" },
      { id: "rest-3", title: "短休息", type: "rest", durationSec: 20, cue: "最后一组保持稳定。" },
      { id: "dead-bug-ball", title: "仰卧抱球死虫收尾", type: "work", durationSec: 50, cue: "慢慢伸展四肢，腰背保持贴地。" }
    ]
  },
  {
    id: "band-posture-reset",
    title: "弹力带久坐舒缓",
    goalId: "posture_relief",
    primaryEquipment: "resistance_band",
    recommendedFor: "手边没有瑜伽球，但想快速打开肩背",
    why: "你没有选择瑜伽球，我们改用弹力带做更轻量的姿态舒缓版本。",
    estimatedMinutes: 9,
    safetyNote: "弹力带张力以稳定为主，不要突然发力。",
    prepChecklist: ["确认弹力带无裂痕。", "双脚站稳，拉伸幅度适中。"],
    runtimeOptions: ["可静音使用"],
    summary: ["3 个动作", "总计 9 分钟", "站姿舒展"],
    steps: [
      { id: "band-open", title: "弹力带拉开", type: "work", durationSec: 40, cue: "肩胛向后下收。" },
      { id: "rest-1", title: "缓一下", type: "rest", durationSec: 20, cue: "呼吸不要停。" },
      { id: "band-row", title: "站姿划船", type: "work", durationSec: 45, cue: "保持胸口打开。" },
      { id: "rest-2", title: "恢复站姿", type: "rest", durationSec: 20, cue: "准备最后一步。" },
      { id: "band-reach", title: "头顶上举", type: "work", durationSec: 45, cue: "动作慢一点。" }
    ]
  },
  {
    id: "bodyweight-shoulder-ease",
    title: "无器材肩颈启动",
    goalId: "shoulder_relief",
    primaryEquipment: "none",
    recommendedFor: "手边没有器材，但仍想先活动肩颈",
    why: "即使没有器材，也可以先做一版低负担的肩颈启动训练。",
    estimatedMinutes: 8,
    safetyNote: "只在舒适区间活动，不要压到疼痛点。",
    prepChecklist: ["站直或坐直都可以。", "肩膀放松，下巴微收。"],
    runtimeOptions: ["推荐语音播报"],
    summary: ["3 个动作", "总计 8 分钟", "无器材即可开始"],
    steps: [
      { id: "neck-nod", title: "颈部点头热身", type: "work", durationSec: 35, cue: "范围小一点即可。" },
      { id: "rest-1", title: "调整呼吸", type: "rest", durationSec: 15, cue: "放松肩膀。" },
      { id: "scap-slide", title: "肩胛滑动", type: "work", durationSec: 40, cue: "耸肩后慢慢下沉。" },
      { id: "rest-2", title: "恢复中立", type: "rest", durationSec: 15, cue: "准备最后一步。" },
      { id: "wall-reach", title: "墙边上举引导", type: "work", durationSec: 40, cue: "高度以舒服为准。" }
    ]
  }
];

function createTracker() {
  const read = () => JSON.parse(window.localStorage.getItem(TRACKER_KEY) || "[]") as TrackingEvent[];
  const write = (events: TrackingEvent[]) => {
    window.localStorage.setItem(TRACKER_KEY, JSON.stringify(events));
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

function getContext() {
  const params = new URLSearchParams(window.location.search);
  return {
    asin: params.get("asin") || DEFAULT_ASIN,
    source: params.get("src") || "direct",
    campaign: params.get("campaign") || "stage3",
    productHint: params.get("product") || "yoga-ball"
  };
}

function readRouteFromHash(): RouteId {
  const hash = window.location.hash.replace("#", "");
  return ROUTES.includes(hash as RouteId) ? (hash as RouteId) : "entry";
}

function formatSeconds(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const mins = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (safeSeconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function pickPlan(
  goalId: GoalId | null,
  selectedEquipment: EquipmentId[],
  intake: IntakeState
): SessionPlan | null {
  if (!goalId) return null;

  const preferredEquipment =
    selectedEquipment.find((item) => item === "yoga_ball") ||
    selectedEquipment.find((item) => item !== "none") ||
    "none";

  const exact = PLAN_LIBRARY.find(
    (plan) => plan.goalId === goalId && plan.primaryEquipment === preferredEquipment
  );

  const fallbackByGoal = PLAN_LIBRARY.find(
    (plan) => plan.goalId === goalId && selectedEquipment.includes(plan.primaryEquipment)
  );

  const noEquipmentFallback = PLAN_LIBRARY.find(
    (plan) => plan.goalId === goalId && plan.primaryEquipment === "none"
  );

  const basePlan = exact || fallbackByGoal || noEquipmentFallback || null;
  if (!basePlan) return null;

  const durationFactor = intake.duration === "8" ? 0.85 : intake.duration === "18" ? 1.15 : 1;
  const intensityFactor =
    intake.intensity === "gentle" ? 0.85 : intake.intensity === "energized" ? 1.1 : 1;
  const scale = durationFactor * intensityFactor;

  const scaledSteps = basePlan.steps.map((step) => ({
    ...step,
    durationSec:
      step.type === "rest"
        ? Math.max(15, Math.round(step.durationSec * Math.min(scale, 1)))
        : Math.max(30, Math.round(step.durationSec * scale))
  }));

  const estimatedMinutes = Math.max(
    6,
    Math.round(scaledSteps.reduce((sum, step) => sum + step.durationSec, 0) / 60)
  );

  return {
    ...basePlan,
    estimatedMinutes,
    steps: scaledSteps
  };
}

function totalDuration(plan: SessionPlan | null) {
  return plan ? plan.steps.reduce((sum, step) => sum + step.durationSec, 0) : 0;
}

function totalWorkSteps(plan: SessionPlan | null) {
  return plan ? plan.steps.filter((step) => step.type === "work").length : 0;
}

function badgeClass(tone: "positive" | "warning" | "neutral" | "caution") {
  if (tone === "positive") return "option-card positive";
  if (tone === "warning") return "option-card warning";
  if (tone === "caution") return "option-card caution";
  return "option-card";
}

function defaultNextAction(outcome: FeedbackOutcomeId): RecoveryActionId {
  if (outcome === "great") return "continue_track";
  if (outcome === "too_hard") return "repeat_easier";
  if (outcome === "need_review") return "review_prep";
  return "contact_support";
}

function MirrorPreview({ enabled }: { enabled: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    let active = true;

    if (!enabled) {
      setStatus("idle");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return undefined;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      return undefined;
    }

    setStatus("loading");
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus("ready");
      })
      .catch(() => {
        setStatus("error");
      });

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [enabled]);

  return (
    <div className="mirror-panel">
      <div className="mirror-header">
        <span>镜像预览</span>
        <span className={`status-dot ${status}`} />
      </div>
      {enabled ? (
        status === "error" ? (
          <div className="mirror-empty">摄像头权限不可用，可先继续标准跟练。</div>
        ) : (
          <video ref={videoRef} className="mirror-video" autoPlay playsInline muted />
        )
      ) : (
        <div className="mirror-empty">在准备页开启镜像模式，可在这里看到自己的动作预览。</div>
      )}
    </div>
  );
}

function App() {
  const context = useMemo(getContext, []);
  const [route, setRoute] = useState<RouteId>(readRouteFromHash);
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [equipment, setEquipment] = useState<EquipmentId[]>(
    context.productHint === "yoga-ball" ? ["yoga_ball"] : []
  );
  const [intake, setIntake] = useState<IntakeState>({
    experience: null,
    duration: "12",
    discomfort: null,
    intensity: "steady"
  });
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [mirrorEnabled, setMirrorEnabled] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({ outcome: null, note: "" });
  const [nextStep, setNextStep] = useState<NextStepState>({ action: null });
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [sessionStepIndex, setSessionStepIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [enteredAt, setEnteredAt] = useState<Record<RouteId, number>>({
    entry: Date.now(),
    goal: 0,
    equipment: 0,
    intake: 0,
    recommendation: 0,
    prep: 0,
    session: 0,
    feedback: 0,
    "next-step": 0
  });
  const [sessionInterrupted, setSessionInterrupted] = useState(false);
  const dropoutTrackedRef = useRef(false);
  const lastSpokenStepRef = useRef<string | null>(null);

  const selectedGoal = GOALS.find((item) => item.id === goal) || null;
  const plan = useMemo(() => pickPlan(goal, equipment, intake), [goal, equipment, intake]);
  const currentRuntimeStep = plan?.steps[sessionStepIndex] || null;
  const completedWorkSteps = useMemo(() => {
    if (!plan) return 0;
    return plan.steps.slice(0, sessionStepIndex).filter((step) => step.type === "work").length;
  }, [plan, sessionStepIndex]);

  useEffect(() => {
    tracker.track("entry_open", {
      asin: context.asin,
      source: context.source,
      campaign: context.campaign,
      product_hint: context.productHint
    });
  }, [context.asin, context.campaign, context.productHint, context.source]);

  useEffect(() => {
    const nextHash = `#${route}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, "", nextHash);
    }
    setEnteredAt((prev) => ({ ...prev, [route]: Date.now() }));
  }, [route]);

  useEffect(() => {
    const onHashChange = () => setRoute(readRouteFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (!sessionStarted || sessionPaused || !currentRuntimeStep) return undefined;

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          completeRuntimeStep();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [currentRuntimeStep, sessionPaused, sessionStarted]);

  useEffect(() => {
    if (!voiceEnabled || !currentRuntimeStep || !sessionStarted) return;
    if (lastSpokenStepRef.current === currentRuntimeStep.id) return;

    lastSpokenStepRef.current = currentRuntimeStep.id;
    tracker.track("voice_prompt_use", {
      route,
      enabled: true,
      step_id: currentRuntimeStep.id
    });

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        `${currentRuntimeStep.type === "rest" ? "休息" : "开始"}，${currentRuntimeStep.title}`
      );
      utterance.lang = "zh-CN";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, [currentRuntimeStep, route, sessionStarted, voiceEnabled]);

  useEffect(() => {
    if (mirrorEnabled) {
      tracker.track("mirror_mode_use", {
        route,
        enabled: true
      });
    }
  }, [mirrorEnabled, route]);

  useEffect(() => {
    const onPageHide = () => {
      if (dropoutTrackedRef.current || route === "entry" || route === "next-step") return;
      tracker.track("flow_exit", {
        route,
        duration_ms: Date.now() - (enteredAt[route] || Date.now()),
        goal,
        equipment: equipment.join(",") || null,
        session_started: sessionStarted,
        session_interrupted: sessionInterrupted
      });
      dropoutTrackedRef.current = true;
    };

    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [enteredAt, equipment, goal, route, sessionInterrupted, sessionStarted]);

  const canContinue =
    route === "entry"
      ? true
      : route === "goal"
        ? Boolean(goal)
        : route === "equipment"
          ? equipment.length > 0
          : route === "intake"
            ? Boolean(intake.experience && intake.duration && intake.discomfort && intake.intensity)
            : route === "recommendation"
              ? Boolean(plan)
              : route === "prep"
                ? true
                : route === "feedback"
                  ? Boolean(feedback.outcome)
                  : route === "next-step"
                    ? Boolean(nextStep.action)
                    : false;

  const progressRatio = plan ? (sessionStepIndex + 1) / plan.steps.length : 0;

  function goTo(nextRoute: RouteId) {
    setRoute(nextRoute);
  }

  function goBack() {
    if (route === "goal") return goTo("entry");
    if (route === "equipment") return goTo("goal");
    if (route === "intake") return goTo("equipment");
    if (route === "recommendation") return goTo("intake");
    if (route === "prep") return goTo("recommendation");
    if (route === "session") return goTo("prep");
    if (route === "feedback") return goTo("session");
    if (route === "next-step") return goTo("feedback");
  }

  function continueFlow() {
    if (route === "entry") {
      goTo("goal");
      return;
    }
    if (route === "goal" && goal) {
      tracker.track("goal_select", {
        goal,
        source: context.source,
        asin: context.asin
      });
      goTo("equipment");
      return;
    }
    if (route === "equipment" && equipment.length > 0) {
      tracker.track("equipment_select", {
        equipment: equipment.join(","),
        yoga_ball_selected: equipment.includes("yoga_ball")
      });
      goTo("intake");
      return;
    }
    if (route === "intake" && intake.experience && intake.duration && intake.discomfort && intake.intensity) {
      tracker.track("intake_complete", {
        experience: intake.experience,
        duration: intake.duration,
        discomfort: intake.discomfort,
        intensity: intake.intensity
      });
      goTo("recommendation");
      return;
    }
    if (route === "recommendation" && plan) {
      tracker.track("plan_accept", {
        plan_id: plan.id,
        primary_equipment: plan.primaryEquipment,
        estimated_minutes: plan.estimatedMinutes
      });
      goTo("prep");
      return;
    }
    if (route === "prep" && plan) {
      tracker.track("prep_ready", {
        plan_id: plan.id,
        voice_enabled: voiceEnabled,
        mirror_enabled: mirrorEnabled
      });
      startSession();
      return;
    }
    if (route === "feedback" && feedback.outcome) {
      const action = defaultNextAction(feedback.outcome);
      setNextStep({ action });
      tracker.track("session_feedback", {
        plan_id: plan?.id || null,
        outcome: feedback.outcome,
        note_present: feedback.note.trim().length > 0
      });
      tracker.track("next_step_route", {
        action,
        plan_id: plan?.id || null
      });
      goTo("next-step");
    }
  }

  function startSession() {
    if (!plan) return;
    setSessionStarted(true);
    setSessionPaused(false);
    setSessionInterrupted(false);
    setSessionStepIndex(0);
    setRemainingSeconds(plan.steps[0]?.durationSec || 0);
    lastSpokenStepRef.current = null;
    tracker.track("plan_recommend", {
      plan_id: plan.id,
      goal: plan.goalId,
      primary_equipment: plan.primaryEquipment,
      estimated_minutes: plan.estimatedMinutes
    });
    tracker.track("session_start", {
      plan_id: plan.id,
      total_steps: plan.steps.length,
      total_duration_sec: totalDuration(plan)
    });
    tracker.track("timer_use", {
      plan_id: plan.id,
      enabled: true
    });
    goTo("session");
  }

  function completeRuntimeStep() {
    if (!plan || !currentRuntimeStep) return;
    tracker.track("exercise_step_complete", {
      plan_id: plan.id,
      step_id: currentRuntimeStep.id,
      step_type: currentRuntimeStep.type,
      step_index: sessionStepIndex
    });

    const nextIndex = sessionStepIndex + 1;
    if (nextIndex >= plan.steps.length) {
      setSessionStarted(false);
      setSessionPaused(false);
      tracker.track("session_complete", {
        plan_id: plan.id,
        completed_steps: plan.steps.length,
        total_duration_sec: totalDuration(plan)
      });
      goTo("feedback");
      return;
    }

    setSessionStepIndex(nextIndex);
    setRemainingSeconds(plan.steps[nextIndex].durationSec);
  }

  function toggleEquipment(nextEquipment: EquipmentId) {
    setEquipment((current) => {
      if (nextEquipment === "none") {
        return current.includes("none") ? [] : ["none"];
      }

      const withoutNone = current.filter((item) => item !== "none");
      if (withoutNone.includes(nextEquipment)) {
        return withoutNone.filter((item) => item !== nextEquipment);
      }
      return [...withoutNone, nextEquipment];
    });
  }

  function exitSession() {
    if (!plan) return;
    setSessionInterrupted(true);
    setSessionStarted(false);
    setSessionPaused(true);
    tracker.track("session_interrupt", {
      plan_id: plan.id,
      step_id: currentRuntimeStep?.id || null,
      step_index: sessionStepIndex
    });
    setFeedback({
      outcome: "stopped_early",
      note: "训练中途结束，需要更轻或更明确的下一步。"
    });
    goTo("feedback");
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app-shell">
        <div className="ambient ambient-left" />
        <div className="ambient ambient-right" />

        <header className="topbar">
          <div className="topbar-left">
            {route !== "entry" ? (
              <button className="ghost-button" onClick={goBack} type="button">
                <ArrowLeft size={16} />
                <span>返回</span>
              </button>
            ) : (
              <div className="brand-mark">
                <ScanLine size={16} />
                <span>Stage 3 MVP</span>
              </div>
            )}
          </div>
          <div className="topbar-center">
            <span className="eyebrow">目标驱动训练助手</span>
            <h1>{ROUTE_LABEL[route]}</h1>
          </div>
          <div className="context-chip">
            <span>{context.productHint === "yoga-ball" ? "瑜伽球上下文" : "通用入口"}</span>
            <strong>{context.asin}</strong>
          </div>
        </header>

        <main className="main-grid">
          <section className="stage-panel">
            {route === "entry" && <EntryScreen context={context} onStart={() => continueFlow()} />}
            {route === "goal" && (
              <SelectionScreen
                title="你今天想解决什么问题？"
                description="先从目标开始，而不是从单一产品说明开始。阶段三首版会先把高价值路径做深。"
              >
                <div className="goal-grid">
                  {GOALS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`goal-card ${goal === item.id ? "selected" : ""}`}
                      onClick={() => setGoal(item.id)}
                    >
                      <span className="goal-icon" style={{ background: item.accent }}>
                        {item.icon}
                      </span>
                      <div>
                        <h3>{item.title}</h3>
                        <p className="goal-subtitle">{item.subtitle}</p>
                        <p className="goal-desc">{item.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </SelectionScreen>
            )}
            {route === "equipment" && (
              <SelectionScreen
                title="你手边现在有哪些器材？"
                description="瑜伽球模板库会优先搭建，但这不是一个只服务瑜伽球的产品。你仍然可以选择其他器材或无器材。"
              >
                <div className="equipment-grid">
                  {EQUIPMENT_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`equipment-card ${equipment.includes(item.id) ? "selected" : ""}`}
                      onClick={() => toggleEquipment(item.id)}
                    >
                      <div className="equipment-head">
                        <span className={`equipment-icon ${item.priority === "primary" ? "primary" : ""}`}>
                          {item.icon}
                        </span>
                        {item.priority === "primary" && <span className="pill">Priority</span>}
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.detail}</p>
                    </button>
                  ))}
                </div>
              </SelectionScreen>
            )}
            {route === "intake" && (
              <SelectionScreen
                title="再用 20 秒确认一下今天的状态"
                description="只收集最少但最关键的信息，保证推荐足够轻、足够稳、不会把用户卡在长问卷里。"
              >
                <IntakeSection
                  title="训练经验"
                  options={EXPERIENCE_OPTIONS}
                  value={intake.experience}
                  onChange={(value) => setIntake((current) => ({ ...current, experience: value as ExperienceId }))}
                />
                <IntakeSection
                  title="今天可以练多久"
                  options={DURATION_OPTIONS}
                  value={intake.duration}
                  onChange={(value) => setIntake((current) => ({ ...current, duration: value as DurationId }))}
                />
                <IntakeSection
                  title="最想注意的身体状态"
                  options={DISCOMFORT_OPTIONS}
                  value={intake.discomfort}
                  onChange={(value) => setIntake((current) => ({ ...current, discomfort: value as DiscomfortId }))}
                />
                <IntakeSection
                  title="你想从什么节奏开始"
                  options={INTENSITY_OPTIONS}
                  value={intake.intensity}
                  onChange={(value) => setIntake((current) => ({ ...current, intensity: value as IntensityId }))}
                />
              </SelectionScreen>
            )}
            {route === "recommendation" && plan && (
              <SelectionScreen title="这是系统给你的第一套建议" description={plan.why}>
                <RecommendationCard plan={plan} />
              </SelectionScreen>
            )}
            {route === "prep" && plan && (
              <SelectionScreen
                title="开始前准备一下，会让第一次训练更稳"
                description="这里吸收了阶段二的安全说明能力，但它现在是训练准备模块，不再是整个产品主线。"
              >
                <div className="prep-grid">
                  <Card title="准备清单" icon={<ShieldCheck size={18} />}>
                    <ul className="list">
                      {plan.prepChecklist.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </Card>
                  <Card title="运行选项" icon={<Mic size={18} />}>
                    <div className="toggle-row">
                      <div>
                        <strong>语音播报</strong>
                        <p>建议首轮开启，降低盯屏负担。</p>
                      </div>
                      <button
                        className={`toggle ${voiceEnabled ? "active" : ""}`}
                        onClick={() => setVoiceEnabled((current) => !current)}
                        type="button"
                      >
                        {voiceEnabled ? "开启" : "关闭"}
                      </button>
                    </div>
                    <div className="toggle-row">
                      <div>
                        <strong>镜像预览</strong>
                        <p>作为阶段三增强能力，可选开启。</p>
                      </div>
                      <button
                        className={`toggle ${mirrorEnabled ? "active" : ""}`}
                        onClick={() => setMirrorEnabled((current) => !current)}
                        type="button"
                      >
                        {mirrorEnabled ? "开启" : "关闭"}
                      </button>
                    </div>
                  </Card>
                </div>
              </SelectionScreen>
            )}
            {route === "session" && plan && currentRuntimeStep && (
              <SelectionScreen
                title="跟练执行页"
                description="这一页是阶段三 MVP 的核心执行面，不只是内容展示，而是完整的跟练运行时。"
              >
                <div className="session-layout">
                  <div className="session-main-card">
                    <div className="session-badge-row">
                      <span className={`session-badge ${currentRuntimeStep.type}`}>
                        {currentRuntimeStep.type === "rest" ? "休息" : "动作进行中"}
                      </span>
                      <span className="session-badge neutral">
                        {completedWorkSteps}/{totalWorkSteps(plan)} 动作完成
                      </span>
                    </div>
                    <h3>{currentRuntimeStep.title}</h3>
                    <p className="session-cue">{currentRuntimeStep.cue}</p>
                    <div className="timer-ring">
                      <div className="timer-value">{formatSeconds(remainingSeconds)}</div>
                      <span>{currentRuntimeStep.type === "rest" ? "恢复时间" : "当前动作倒计时"}</span>
                    </div>
                    <div className="progress-track large">
                      <div className="progress-bar" style={{ width: `${Math.min(progressRatio * 100, 100)}%` }} />
                    </div>
                    <div className="session-actions">
                      <button
                        className="secondary-button"
                        onClick={() => setSessionPaused((current) => !current)}
                        type="button"
                      >
                        {sessionPaused ? <Play size={16} /> : <Pause size={16} />}
                        <span>{sessionPaused ? "继续" : "暂停"}</span>
                      </button>
                      <button className="primary-button" onClick={completeRuntimeStep} type="button">
                        <ArrowRight size={16} />
                        <span>下一步</span>
                      </button>
                      <button className="ghost-button danger" onClick={exitSession} type="button">
                        <XCircle size={16} />
                        <span>提前结束</span>
                      </button>
                    </div>
                  </div>
                  <MirrorPreview enabled={mirrorEnabled} />
                </div>
              </SelectionScreen>
            )}
            {route === "feedback" && (
              <SelectionScreen
                title="这轮训练感觉怎么样？"
                description="这里不再问“问题解决了吗”，而是回收“完成得如何、合不合适、接下来该怎么走”。"
              >
                <div className="feedback-grid">
                  {FEEDBACK_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`${badgeClass(item.tone)} ${feedback.outcome === item.id ? "selected" : ""}`}
                      onClick={() => setFeedback((current) => ({ ...current, outcome: item.id }))}
                    >
                      <h3>{item.title}</h3>
                      <p>{item.detail}</p>
                    </button>
                  ))}
                </div>
                <textarea
                  className="note-input"
                  placeholder="如果想补充哪一步不确定、哪里不舒服，可以简单写一句。"
                  value={feedback.note}
                  onChange={(event) => setFeedback((current) => ({ ...current, note: event.target.value }))}
                />
              </SelectionScreen>
            )}
            {route === "next-step" && (
              <SelectionScreen
                title="系统建议的下一步"
                description="阶段三闭环的终点不是结束，而是让用户有一个明确、可继续的下一步。"
              >
                <div className="next-step-grid">
                  {(Object.keys(NEXT_STEP_COPY) as RecoveryActionId[]).map((action) => (
                    <button
                      key={action}
                      type="button"
                      className={`equipment-card ${nextStep.action === action ? "selected" : ""}`}
                      onClick={() => {
                        setNextStep({ action });
                        tracker.track("next_step_route", {
                          action,
                          explicit_choice: true
                        });
                      }}
                    >
                      <div className="equipment-head">
                        <span className="pill">{NEXT_STEP_COPY[action].badge}</span>
                      </div>
                      <h3>{NEXT_STEP_COPY[action].title}</h3>
                      <p>{NEXT_STEP_COPY[action].detail}</p>
                    </button>
                  ))}
                </div>
                {nextStep.action && (
                  <div className="summary-banner">
                    <CheckCircle2 size={18} />
                    <span>当前建议：{NEXT_STEP_COPY[nextStep.action].title}</span>
                  </div>
                )}
              </SelectionScreen>
            )}
          </section>

          <aside className="side-panel">
            <Card title="MVP 总体架构" icon={<Sparkles size={18} />}>
              <div className="journey-monolith">
                {ROUTES.map((item, index) => (
                  <div key={item} className={`journey-step ${route === item ? "active" : ""}`}>
                    <span>{index + 1}</span>
                    <strong>{ROUTE_LABEL[item]}</strong>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="当前上下文" icon={<Clock3 size={18} />}>
              <dl className="context-list">
                <div>
                  <dt>目标</dt>
                  <dd>{selectedGoal?.title || "未选择"}</dd>
                </div>
                <div>
                  <dt>器材</dt>
                  <dd>
                    {equipment.length > 0
                      ? equipment
                          .map((item) => EQUIPMENT_OPTIONS.find((option) => option.id === item)?.title || item)
                          .join(" / ")
                      : "未选择"}
                  </dd>
                </div>
                <div>
                  <dt>推荐方案</dt>
                  <dd>{plan?.title || "等待生成"}</dd>
                </div>
                <div>
                  <dt>3 天反馈节奏</dt>
                  <dd>流转壳 -&gt; 内容模板 -&gt; runtime -&gt; 联调验收</dd>
                </div>
              </dl>
            </Card>

            <Card title="阶段三首批重点" icon={<TimerReset size={18} />}>
              <ul className="list">
                <li>瑜伽球模板库优先搭建</li>
                <li>保留其他器材与无器材入口</li>
                <li>2~3 周实现 MVP 主闭环</li>
                <li>每 3 天反馈一次当前进度与偏差</li>
              </ul>
            </Card>

            {plan && (
              <Card title="推荐摘要" icon={<ShieldCheck size={18} />}>
                <ul className="list compact">
                  {plan.summary.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Card>
            )}
          </aside>
        </main>

        <footer className="bottom-bar">
          <div className="bottom-left">
            <span className="footnote">当前页面：{ROUTE_LABEL[route]}</span>
            <span className="footnote subtle">多目标 / 多器材 / 规则化推荐 / 跟练执行</span>
          </div>
          <button
            className={`primary-button large ${canContinue ? "" : "disabled"}`}
            type="button"
            onClick={continueFlow}
            disabled={!canContinue}
          >
            <span>
              {route === "entry"
                ? "开始今天训练"
                : route === "recommendation"
                  ? "进入训练准备"
                  : route === "prep"
                    ? "开始跟练"
                    : route === "feedback"
                      ? "生成下一步建议"
                      : route === "next-step"
                        ? "保留当前建议"
                        : "继续"}
            </span>
            <ArrowRight size={16} />
          </button>
        </footer>
      </div>
    </>
  );
}

function EntryScreen({
  context,
  onStart
}: {
  context: ReturnType<typeof getContext>;
  onStart: () => void;
}) {
  return (
    <section className="entry-hero">
      <div className="entry-copy">
        <span className="eyebrow">Stage 3 MVP</span>
        <h2>从“我该练什么”开始，而不是从说明书开始。</h2>
        <p>
          这是阶段三正式开发后的第一版训练助手壳。用户先说目标、再说器材和状态，系统再给出一套可执行的训练建议。
        </p>
        <div className="entry-actions">
          <button className="primary-button hero" onClick={onStart} type="button">
            <Play size={16} />
            <span>开始今天训练</span>
          </button>
          <div className="mini-chip">
            <ScanLine size={14} />
            <span>扫码来源：{context.source}</span>
          </div>
        </div>
      </div>
      <div className="entry-card-stack">
        <div className="hero-card dark">
          <strong>核心闭环</strong>
          <p>目标 -&gt; 器材 -&gt; 推荐 -&gt; 跟练 -&gt; 反馈 -&gt; 下一步</p>
        </div>
        <div className="hero-card">
          <strong>首批深挖方向</strong>
          <p>瑜伽球优先，但仍支持其他器材和无器材路径。</p>
        </div>
        <div className="hero-card accent">
          <strong>进度节奏</strong>
          <p>2~3 周实施窗口，每 3 天反馈一次关键进展。</p>
        </div>
      </div>
    </section>
  );
}

function SelectionScreen({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="screen-body">
      <div className="screen-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="screen-content">{children}</div>
    </div>
  );
}

function Card({
  title,
  icon,
  children
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="info-card">
      <div className="info-card-head">
        <span className="icon-wrap">{icon}</span>
        <h3>{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function IntakeSection<T extends string>({
  title,
  options,
  value,
  onChange
}: {
  title: string;
  options: Array<{ id: T; title: string; detail?: string }>;
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <div className="intake-block">
      <h3>{title}</h3>
      <div className="intake-options">
        {options.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`pill-option ${value === item.id ? "selected" : ""}`}
            onClick={() => onChange(item.id)}
          >
            <strong>{item.title}</strong>
            {item.detail && <span>{item.detail}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ plan }: { plan: SessionPlan }) {
  return (
    <div className="recommendation-card">
      <div className="recommendation-head">
        <div>
          <span className="pill">Recommended Plan</span>
          <h3>{plan.title}</h3>
        </div>
        <div className="recommendation-meta">
          <span>{plan.estimatedMinutes} 分钟</span>
          <span>{plan.primaryEquipment === "yoga_ball" ? "瑜伽球优先模板" : "可替代模板"}</span>
        </div>
      </div>
      <p className="recommendation-for">{plan.recommendedFor}</p>
      <div className="recommendation-grid">
        <Card title="为什么推荐这套" icon={<Sparkles size={18} />}>
          <p>{plan.why}</p>
        </Card>
        <Card title="安全提醒" icon={<ShieldCheck size={18} />}>
          <p>{plan.safetyNote}</p>
        </Card>
      </div>
      <div className="summary-banner">
        <Clock3 size={18} />
        <span>共 {plan.steps.length} 个步骤，总时长约 {plan.estimatedMinutes} 分钟。</span>
      </div>
    </div>
  );
}

const styles = `
  :root {
    --surface: #f8f9fa;
    --surface-low: #f3f4f5;
    --surface-lowest: #ffffff;
    --surface-high: #e7e8e9;
    --surface-highest: #e1e3e4;
    --primary: #000000;
    --primary-container: #001b3d;
    --secondary: #006e24;
    --secondary-container: #50ff71;
    --error: #ba1a1a;
    --error-container: #ffdad6;
    --text: #191c1d;
    --muted: #44474e;
    --ghost-border: rgba(196, 198, 207, 0.15);
    --shadow-soft: 0 18px 32px rgba(25, 28, 29, 0.06);
  }

  * { box-sizing: border-box; }
  html, body, #root {
    margin: 0;
    min-height: 100%;
    background:
      radial-gradient(circle at top left, rgba(80, 255, 113, 0.08), transparent 28%),
      radial-gradient(circle at 88% 12%, rgba(0, 110, 36, 0.08), transparent 22%),
      linear-gradient(180deg, #fbfbfb 0%, var(--surface) 100%);
    color: var(--text);
    font-family: "Public Sans", sans-serif;
  }

  body { min-height: 100vh; }
  button, textarea { font: inherit; }
  button { border: 0; }

  .app-shell {
    position: relative;
    min-height: 100vh;
    padding: 32px;
    overflow: hidden;
  }

  .ambient {
    position: absolute;
    border-radius: 999px;
    filter: blur(96px);
    pointer-events: none;
    opacity: 0.45;
  }

  .ambient-left {
    top: 110px;
    left: -110px;
    width: 280px;
    height: 280px;
    background: rgba(80, 255, 113, 0.15);
  }

  .ambient-right {
    right: -80px;
    bottom: 140px;
    width: 260px;
    height: 260px;
    background: rgba(0, 110, 36, 0.12);
  }

  .topbar, .bottom-bar, .stage-panel, .side-panel > * {
    position: relative;
    z-index: 1;
  }

  .topbar,
  .bottom-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 18px 22px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(24px);
    box-shadow: inset 0 0 0 1px var(--ghost-border), var(--shadow-soft);
  }

  .topbar { margin-bottom: 28px; }
  .topbar-left, .topbar-center, .context-chip { display: flex; align-items: center; gap: 12px; }
  .topbar-center { flex: 1; flex-direction: column; align-items: flex-start; gap: 4px; }
  .topbar-center h1 {
    margin: 0;
    font-family: "Lexend", sans-serif;
    font-size: 1.45rem;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .eyebrow {
    color: var(--muted);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .brand-mark,
  .context-chip,
  .mini-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.88);
    box-shadow: inset 0 0 0 1px var(--ghost-border);
    color: var(--muted);
    font-size: 0.9rem;
  }

  .context-chip strong { color: var(--text); }

  .main-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(320px, 0.85fr);
    gap: 24px;
    margin-bottom: 24px;
  }

  .stage-panel {
    padding: 32px;
    min-height: calc(100vh - 236px);
    border-radius: 36px;
    background: var(--surface-low);
  }

  .side-panel { display: grid; gap: 16px; align-content: start; }

  .screen-body,
  .entry-copy,
  .entry-card-stack {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .screen-header h2,
  .entry-copy h2 {
    margin: 0 0 10px;
    font-family: "Lexend", sans-serif;
    font-size: clamp(2.3rem, 4vw, 4.2rem);
    line-height: 0.94;
    letter-spacing: -0.05em;
    max-width: 12ch;
  }

  .screen-header p,
  .entry-copy p {
    margin: 0;
    max-width: 760px;
    color: var(--muted);
    font-size: 1.02rem;
    line-height: 1.72;
  }

  .screen-content { display: grid; gap: 18px; }

  .entry-hero,
  .session-layout,
  .recommendation-grid,
  .prep-grid,
  .goal-grid,
  .equipment-grid,
  .feedback-grid,
  .next-step-grid {
    display: grid;
    gap: 16px;
  }

  .entry-hero {
    grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.95fr);
    align-items: stretch;
    min-height: 100%;
  }

  .entry-copy { justify-content: center; }
  .entry-actions, .session-actions { display: flex; flex-wrap: wrap; gap: 12px; }

  .hero-card,
  .goal-card,
  .equipment-card,
  .option-card,
  .pill-option,
  .recommendation-card,
  .session-main-card,
  .info-card,
  .mirror-panel {
    background: var(--surface-lowest);
  }

  .hero-card,
  .recommendation-card,
  .session-main-card,
  .info-card,
  .mirror-panel {
    padding: 22px;
    border-radius: 24px;
  }

  .hero-card.dark {
    background: linear-gradient(135deg, #000000 0%, #001b3d 100%);
    color: #f0f1f2;
    box-shadow: var(--shadow-soft);
  }

  .hero-card.accent {
    background: linear-gradient(180deg, rgba(80, 255, 113, 0.12) 0%, rgba(255, 255, 255, 0.98) 100%);
    box-shadow: inset 0 0 0 1px rgba(0, 110, 36, 0.08);
  }

  .hero-card:not(.dark):not(.accent) {
    background: var(--surface-high);
  }

  .hero-card p { margin: 10px 0 0; line-height: 1.62; }
  .goal-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .equipment-grid,
  .feedback-grid,
  .next-step-grid,
  .recommendation-grid,
  .prep-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }

  .goal-card,
  .equipment-card,
  .option-card,
  .pill-option {
    padding: 20px;
    text-align: left;
    cursor: pointer;
    border-radius: 22px;
    transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
    box-shadow: inset 0 0 0 1px rgba(196, 198, 207, 0.1);
  }

  .goal-card:hover,
  .equipment-card:hover,
  .option-card:hover,
  .pill-option:hover {
    transform: translateY(-2px);
    box-shadow: inset 0 0 0 1px rgba(196, 198, 207, 0.1), var(--shadow-soft);
  }

  .goal-card.selected,
  .equipment-card.selected,
  .option-card.selected,
  .pill-option.selected {
    background: linear-gradient(180deg, #ffffff 0%, rgba(80, 255, 113, 0.08) 100%);
    box-shadow:
      inset 0 0 0 2px rgba(0, 110, 36, 0.18),
      0 12px 24px rgba(25, 28, 29, 0.05);
  }

  .goal-icon,
  .equipment-icon,
  .icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 14px;
    color: var(--primary);
    background: rgba(0, 0, 0, 0.05);
  }

  .goal-card h3,
  .equipment-card h3,
  .option-card h3,
  .info-card h3,
  .intake-block h3,
  .recommendation-card h3,
  .session-main-card h3 {
    margin: 0;
    font-family: "Lexend", sans-serif;
    line-height: 1.12;
  }

  .goal-card h3,
  .equipment-card h3,
  .option-card h3 {
    margin-top: 14px;
    font-size: 1.08rem;
  }

  .goal-subtitle {
    margin: 8px 0 0;
    color: var(--text);
    font-weight: 700;
  }

  .goal-desc,
  .equipment-card p,
  .option-card p,
  .session-cue,
  .recommendation-for,
  .info-card p {
    margin: 8px 0 0;
    color: var(--muted);
    line-height: 1.65;
  }

  .equipment-head,
  .recommendation-head,
  .info-card-head,
  .session-badge-row,
  .mirror-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .pill,
  .session-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .pill,
  .session-badge,
  .session-badge.work {
    background: rgba(80, 255, 113, 0.18);
    color: var(--secondary);
  }

  .session-badge.rest {
    background: rgba(225, 227, 228, 0.95);
    color: var(--text);
  }

  .session-badge.neutral {
    background: rgba(0, 0, 0, 0.06);
    color: var(--text);
  }

  .equipment-icon.primary { background: rgba(80, 255, 113, 0.18); }
  .intake-block { display: grid; gap: 12px; }
  .intake-options { display: flex; flex-wrap: wrap; gap: 12px; }
  .pill-option { min-width: 180px; border-radius: 18px; }
  .pill-option strong, .pill-option span { display: block; }
  .pill-option span {
    margin-top: 6px;
    color: var(--muted);
    font-size: 0.92rem;
    line-height: 1.5;
  }

  .recommendation-card,
  .session-main-card {
    display: grid;
    gap: 18px;
    background: var(--surface-lowest);
    box-shadow: inset 0 0 0 1px rgba(196, 198, 207, 0.12);
  }

  .info-card,
  .mirror-panel {
    background: var(--surface-lowest);
    box-shadow: inset 0 0 0 1px rgba(196, 198, 207, 0.12);
  }

  .recommendation-meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: var(--muted);
    text-align: right;
    font-size: 0.92rem;
  }

  .list { margin: 0; padding-left: 18px; color: var(--muted); line-height: 1.75; }
  .list.compact { line-height: 1.6; }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 18px;
    border-radius: 20px;
    background: var(--surface-low);
  }

  .toggle-row + .toggle-row { margin-top: 12px; }
  .toggle-row p { margin: 4px 0 0; color: var(--muted); font-size: 0.92rem; }

  .toggle {
    min-width: 72px;
    padding: 10px 12px;
    border-radius: 999px;
    background: var(--surface-lowest);
    cursor: pointer;
    box-shadow: inset 0 0 0 1px rgba(196, 198, 207, 0.22);
    color: var(--text);
  }

  .toggle.active {
    background: rgba(80, 255, 113, 0.18);
    box-shadow: inset 0 0 0 2px rgba(0, 110, 36, 0.14);
    color: var(--secondary);
  }

  .session-layout { grid-template-columns: minmax(0, 1.5fr) minmax(240px, 0.8fr); }
  .session-cue { font-size: 1.05rem; }

  .timer-ring {
    display: grid;
    place-items: center;
    gap: 8px;
    min-height: 190px;
    border-radius: 999px;
    background:
      radial-gradient(circle at center, rgba(80, 255, 113, 0.12) 0%, rgba(255, 255, 255, 0.98) 62%),
      conic-gradient(from 180deg, rgba(0, 110, 36, 0.12), rgba(0, 0, 0, 0.06));
    box-shadow: inset 0 0 0 12px rgba(0, 0, 0, 0.045);
  }

  .timer-value {
    font-family: "Lexend", sans-serif;
    font-size: clamp(2.3rem, 5vw, 4rem);
    line-height: 1;
    letter-spacing: -0.05em;
  }

  .primary-button,
  .secondary-button,
  .ghost-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 56px;
    padding: 13px 18px;
    border-radius: 18px;
    cursor: pointer;
    transition: transform 160ms ease, opacity 160ms ease, box-shadow 160ms ease;
  }

  .primary-button:hover,
  .secondary-button:hover,
  .ghost-button:hover { transform: translateY(-1px); }

  .primary-button {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
    color: #ffffff;
    box-shadow: 0 12px 24px rgba(25, 28, 29, 0.12);
  }

  .primary-button.hero,
  .primary-button.large { padding: 15px 22px; font-weight: 700; }
  .primary-button.disabled { opacity: 0.42; box-shadow: none; cursor: not-allowed; }

  .secondary-button {
    background: var(--surface-highest);
    color: var(--text);
  }

  .ghost-button {
    background: rgba(255, 255, 255, 0.75);
    box-shadow: inset 0 0 0 1px var(--ghost-border);
    color: var(--text);
  }

  .ghost-button.danger {
    background: var(--error-container);
    color: var(--error);
    box-shadow: inset 0 0 0 1px rgba(186, 26, 26, 0.1);
  }

  .progress-track {
    width: 100%;
    height: 10px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .progress-track.large { height: 12px; }

  .progress-bar {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--secondary-container), var(--secondary));
  }

  .mirror-video,
  .mirror-empty {
    width: 100%;
    min-height: 290px;
    border-radius: 18px;
    background: linear-gradient(180deg, var(--surface-high) 0%, var(--surface-lowest) 100%);
  }

  .mirror-video { object-fit: cover; transform: scaleX(-1); }

  .mirror-empty {
    display: grid;
    place-items: center;
    padding: 24px;
    color: var(--muted);
    text-align: center;
    line-height: 1.6;
  }

  .status-dot { width: 10px; height: 10px; border-radius: 999px; background: rgba(0, 0, 0, 0.18); }
  .status-dot.loading { background: var(--primary); }
  .status-dot.ready { background: var(--secondary); }
  .status-dot.error { background: var(--error); }

  .summary-banner {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 18px;
    background: rgba(80, 255, 113, 0.18);
    color: var(--secondary);
    font-weight: 700;
  }

  .note-input {
    width: 100%;
    min-height: 108px;
    padding: 16px;
    resize: vertical;
    color: var(--text);
    border-radius: 18px;
    border: 0;
    background: var(--surface-lowest);
    box-shadow: inset 0 0 0 1px rgba(196, 198, 207, 0.18);
    transition: box-shadow 160ms ease, background 160ms ease;
  }

  .note-input:focus {
    outline: none;
    background: rgba(73, 95, 132, 0.04);
    box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.18);
  }

  .option-card.positive {
    background: linear-gradient(180deg, #ffffff 0%, rgba(80, 255, 113, 0.12) 100%);
  }

  .option-card.warning,
  .option-card.caution {
    background: linear-gradient(180deg, #ffffff 0%, rgba(255, 218, 214, 0.8) 100%);
  }

  .journey-monolith {
    position: relative;
    display: grid;
    gap: 12px;
    padding-left: 18px;
  }

  .journey-monolith::before {
    content: "";
    position: absolute;
    left: 10px;
    top: 12px;
    bottom: 12px;
    width: 6px;
    border-radius: 999px;
    background: rgba(80, 255, 113, 0.22);
  }

  .journey-step {
    position: relative;
    display: grid;
    gap: 4px;
    padding: 12px 14px 12px 18px;
    margin-left: 14px;
    border-radius: 18px;
    background: var(--surface-lowest);
    color: var(--muted);
    box-shadow: inset 0 0 0 1px rgba(196, 198, 207, 0.1);
  }

  .journey-step span {
    position: absolute;
    left: -24px;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: var(--surface);
    color: var(--primary);
    font-size: 0.78rem;
    font-weight: 800;
    box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.08);
  }

  .journey-step.active {
    color: var(--text);
    background: linear-gradient(180deg, #ffffff 0%, rgba(80, 255, 113, 0.1) 100%);
    box-shadow:
      inset 0 0 0 2px rgba(0, 110, 36, 0.16),
      0 10px 22px rgba(25, 28, 29, 0.05);
  }

  .journey-step.active span {
    background: var(--secondary-container);
    box-shadow: none;
  }

  .context-list { margin: 0; display: grid; gap: 14px; }
  .context-list div { display: grid; gap: 4px; }
  .context-list dt { color: var(--muted); font-size: 0.86rem; }
  .context-list dd { margin: 0; font-weight: 600; line-height: 1.5; }
  .bottom-left { display: flex; flex-direction: column; gap: 5px; }
  .footnote { font-size: 0.92rem; color: var(--text); }
  .footnote.subtle { color: var(--muted); }

  @media (max-width: 1200px) {
    .main-grid,
    .entry-hero,
    .session-layout,
    .recommendation-grid,
    .prep-grid,
    .goal-grid,
    .equipment-grid,
    .feedback-grid,
    .next-step-grid {
      grid-template-columns: 1fr;
    }

    .side-panel { order: -1; }
  }

  @media (max-width: 800px) {
    .app-shell { padding: 16px; }
    .topbar, .bottom-bar, .stage-panel { padding: 16px; border-radius: 22px; }
    .topbar, .bottom-bar { flex-direction: column; align-items: stretch; }
    .topbar-center { order: -1; }
    .pill-option, .goal-card, .equipment-card, .option-card { width: 100%; }
    .intake-options, .session-actions, .entry-actions { flex-direction: column; }
    .primary-button, .secondary-button, .ghost-button { width: 100%; }
  }
`;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
