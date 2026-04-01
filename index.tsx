import React, { memo, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, CheckCircle2, Clock3, Dumbbell, HeartPulse, Mic, MicOff, MonitorSmartphone, Pause, Play, ShieldCheck, SlidersHorizontal, Sparkles, Volleyball, Waves, XCircle } from "lucide-react";

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
type LocaleId = "zh-CN" | "en";

const DEFAULT_ASIN = "B0BXJLTRSH";
const TRACKER_KEY = "spapp_stage3_events";
const LOCALE_STORAGE_KEY = "spapp_stage3_locale";
const DEFAULT_LOCALE: LocaleId = "zh-CN";
const ROUTES: RouteId[] = ["entry", "goal", "equipment", "intake", "recommendation", "prep", "session", "feedback", "next-step"];
const ROUTE_LABEL: Record<RouteId, string> = { entry: "开始", goal: "目标", equipment: "器材", intake: "状态", recommendation: "方案", prep: "准备", session: "跟练", feedback: "反馈", "next-step": "下一步" };
const ROUTE_LABEL_EN: Record<RouteId, string> = { entry: "Home", goal: "Goal", equipment: "Gear", intake: "Status", recommendation: "Plan", prep: "Prep", session: "Session", feedback: "Feedback", "next-step": "Next" };
const PREVIEW_ROUTES: RouteId[] = ["entry", "goal", "equipment", "intake", "recommendation", "prep", "session", "feedback", "next-step"];

const goals = [
  { id: "posture_relief" as GoalId, title: "久坐舒缓", subtitle: "打开上背和胸廓", desc: "适合久坐后发紧、想快速活动身体的人。", icon: <Waves size={20} /> },
  { id: "shoulder_relief" as GoalId, title: "肩颈放松", subtitle: "先找回安全感", desc: "适合肩颈紧张、肩部不适、想先做轻量训练的人。", icon: <HeartPulse size={20} /> },
  { id: "starter_tone" as GoalId, title: "入门塑形", subtitle: "先做稳定和激活", desc: "适合想开始建立核心稳定和全身参与感的人。", icon: <Dumbbell size={20} /> }
];

const equipmentOptions = [
  { id: "yoga_ball" as EquipmentId, title: "瑜伽球", detail: "优先模板", icon: <Volleyball size={20} />, priority: true },
  { id: "resistance_band" as EquipmentId, title: "弹力带", detail: "拉伸激活", icon: <Sparkles size={20} /> },
  { id: "yoga_mat" as EquipmentId, title: "瑜伽垫", detail: "地面训练", icon: <ShieldCheck size={20} /> },
  { id: "dumbbell" as EquipmentId, title: "哑铃", detail: "力量补充", icon: <Dumbbell size={20} /> },
  { id: "none" as EquipmentId, title: "无器材", detail: "直接开始", icon: <MonitorSmartphone size={20} /> }
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

const uiCopy: Record<LocaleId, {
  routeLabel: Record<RouteId, string>;
  topbarActive: string;
  footerDefault: string;
  footerBack: string;
  footerByRoute: Partial<Record<RouteId, string>>;
  control: {
    toggle: string;
    title: string;
    home: string;
    homeHint: string;
    language: string;
    zh: string;
    en: string;
    edit: string;
    preview: string;
    previewHint: string;
    close: string;
  };
  editRoute: Record<"goal" | "equipment" | "intake", string>;
  confirmLeaveActive: string;
  voicePrompt: { start: string; rest: string };
  mirror: {
    unavailable: string;
    intro: string;
    statusReady: string;
    statusLoading: string;
    statusError: string;
    statusIdle: string;
    kicker: string;
    title: string;
  };
  entry: { title: string; heroTitle: string; heroDesc: string };
  goal: { kicker: string; title: string; desc: string };
  equipment: { kicker: string; title: string; desc: string; priority: string };
  intake: {
    kicker: string;
    title: string;
    desc: string;
    labels: {
      experience: string;
      duration: string;
      discomfort: string;
      intensity: string;
    };
  };
  recommendation: {
    kicker: string;
    emptyTitle: string;
    emptyDesc: string;
    estimated: string;
    equipment: string;
    summary: string;
    safetyTitle: string;
    emptyBody: string;
    editHint: string;
  };
  prep: {
    kicker: string;
    title: string;
    desc: string;
    heroKicker: string;
    heroTitle: string;
    heroDesc: string;
    supportKicker: string;
    supportDesc: string;
    voiceTitle: string;
    voiceOn: string;
    voiceOff: string;
    mirrorTitle: string;
    mirrorOn: string;
    mirrorOff: string;
    enabled: string;
    disabled: string;
    editHint: string;
  };
  session: {
    kicker: string;
    rest: string;
    work: string;
    completeCount: string;
    recoverTime: string;
    currentCountdown: string;
    progress: string;
    planMinutes: string;
    resume: string;
    pause: string;
    next: string;
    finish: string;
    endEarly: string;
  };
  feedback: {
    kicker: string;
    title: string;
    desc: string;
    notePlaceholder: string;
  };
  nextStep: {
    kicker: string;
    title: string;
    desc: string;
  };
}> = {
  "zh-CN": {
    routeLabel: ROUTE_LABEL,
    topbarActive: "跟练中",
    footerDefault: "继续",
    footerBack: "返回",
    footerByRoute: { entry: "开始训练设置", recommendation: "使用这套方案", prep: "开始跟练", feedback: "生成下一步", "next-step": "保留当前建议" },
    control: {
      toggle: "控制",
      title: "快速控制",
      home: "回到主界面",
      homeHint: "目标、器材和状态会继续保留。",
      language: "语言查看",
      zh: "中文",
      en: "English",
      edit: "修改已选信息",
      preview: "预览模式",
      previewHint: "仅用于演示和检查",
      close: "关闭"
    },
    editRoute: { goal: "改目标", equipment: "改器材", intake: "改状态" },
    confirmLeaveActive: "返回主界面后会结束当前训练流程，但会保留目标、器材和状态。确认继续吗？",
    voicePrompt: { start: "开始", rest: "休息" },
    mirror: {
      unavailable: "摄像头权限不可用。你仍然可以继续标准跟练。",
      intro: "在准备页开启镜像预览后，这里会显示你的实时动作画面。",
      statusReady: "已开启",
      statusLoading: "启动中",
      statusError: "不可用",
      statusIdle: "未开启",
      kicker: "辅助预览",
      title: "镜像预览"
    },
    entry: { title: "今天的问题？", heroTitle: "20 秒完成设置", heroDesc: "选目标、器材和状态，马上开始跟练。" },
    goal: { kicker: "目标选择", title: "先选今天目标", desc: "先聚焦一个方向，我再给你方案。" },
    equipment: { kicker: "器材", title: "选择器材", desc: "勾选你现在手边有的，可多选。", priority: "优先" },
    intake: {
      kicker: "快速确认",
      title: "20 秒确认状态",
      desc: "补全 4 项信息，我会给你更稳的方案。",
      labels: { experience: "训练经验", duration: "今天能练多久", discomfort: "今天最想注意哪里", intensity: "希望从什么强度开始" }
    },
    recommendation: {
      kicker: "推荐结果",
      emptyTitle: "暂时还没匹配到方案",
      emptyDesc: "请回到上一步补充目标、器材或状态信息。",
      estimated: "预计时长",
      equipment: "建议器材",
      summary: "训练结构",
      safetyTitle: "开始前提醒",
      emptyBody: "当前没有符合条件的训练计划。",
      editHint: "如果想微调方案，直接改目标、器材或状态即可。"
    },
    prep: {
      kicker: "开始前",
      title: "开始前准备",
      desc: "确认站位和辅助方式，然后直接开始。",
      heroKicker: "准备确认",
      heroTitle: "先确认这 3 件事",
      heroDesc: "这一页只保留真正影响开始训练的内容。",
      supportKicker: "辅助方式",
      supportDesc: "按你的习惯选择，默认都可以随时再改。",
      voiceTitle: "语音播报",
      voiceOn: "减少盯屏负担",
      voiceOff: "保持纯视觉跟练",
      mirrorTitle: "镜像预览",
      mirrorOn: "开始后自动打开",
      mirrorOff: "不开也能正常训练",
      enabled: "已开启",
      disabled: "未开启",
      editHint: "发现方案不对时，直接回改前面的条件，不用整条流程重走。"
    },
    session: {
      kicker: "跟练中",
      rest: "休息",
      work: "动作进行中",
      completeCount: "个动作完成",
      recoverTime: "恢复时间",
      currentCountdown: "当前动作倒计时",
      progress: "本次训练进度",
      planMinutes: "分钟计划",
      resume: "继续",
      pause: "暂停",
      next: "下一步",
      finish: "结束",
      endEarly: "提前结束"
    },
    feedback: {
      kicker: "训练反馈",
      title: "这轮感觉如何？",
      desc: "只要告诉我结果是否合适，我就能给出下一步建议。",
      notePlaceholder: "如果想补充哪里不确定、哪里不舒服，可以简单写一句。"
    },
    nextStep: {
      kicker: "下一步",
      title: "下一步建议",
      desc: "训练闭环不是结束，而是给你一个明确可继续的动作。"
    }
  },
  en: {
    routeLabel: ROUTE_LABEL_EN,
    topbarActive: "Active",
    footerDefault: "Continue",
    footerBack: "Back",
    footerByRoute: { entry: "Start setup", recommendation: "Use this plan", prep: "Start session", feedback: "Generate next step", "next-step": "Keep this recommendation" },
    control: {
      toggle: "Controls",
      title: "Quick controls",
      home: "Return home",
      homeHint: "Goal, equipment, and intake stay saved as a draft.",
      language: "Language",
      zh: "中文",
      en: "English",
      edit: "Edit setup",
      preview: "Preview mode",
      previewHint: "Internal demo and QA only",
      close: "Close"
    },
    editRoute: { goal: "Edit goal", equipment: "Edit gear", intake: "Edit status" },
    confirmLeaveActive: "Return home and leave the current session flow? Your goal, gear, and intake will stay saved.",
    voicePrompt: { start: "Start", rest: "Rest" },
    mirror: {
      unavailable: "Camera permission is unavailable. You can still continue with the standard guided session.",
      intro: "Turn on mirror preview on the prep screen to see your live movement here.",
      statusReady: "On",
      statusLoading: "Starting",
      statusError: "Unavailable",
      statusIdle: "Off",
      kicker: "Support view",
      title: "Mirror preview"
    },
    entry: { title: "What do you need today?", heroTitle: "Set up in 20 seconds", heroDesc: "Pick a goal, your gear, and today's status, then start training." },
    goal: { kicker: "Goal", title: "Choose today's focus", desc: "Pick one direction first. I'll shape the session around it." },
    equipment: { kicker: "Equipment", title: "Equipment", desc: "Select what you have available today. You can choose multiple.", priority: "Priority" },
    intake: {
      kicker: "Quick intake",
      title: "Confirm today's status",
      desc: "Fill in four inputs and I'll recommend a safer first session.",
      labels: { experience: "Training experience", duration: "Available time", discomfort: "What needs attention today", intensity: "Starting intensity" }
    },
    recommendation: {
      kicker: "Recommended plan",
      emptyTitle: "No plan matched yet",
      emptyDesc: "Go back and add goal, equipment, or intake details.",
      estimated: "Estimated time",
      equipment: "Suggested gear",
      summary: "Session structure",
      safetyTitle: "Before you start",
      emptyBody: "No matching session plan is available yet.",
      editHint: "If the plan feels off, update the goal, gear, or intake directly."
    },
    prep: {
      kicker: "Before you start",
      title: "Get ready to begin",
      desc: "Confirm setup and support options, then start.",
      heroKicker: "Ready check",
      heroTitle: "Confirm these 3 things",
      heroDesc: "This page keeps only what truly affects the start of training.",
      supportKicker: "Support options",
      supportDesc: "Choose what fits your habit. You can still change these later.",
      voiceTitle: "Voice guidance",
      voiceOn: "Less screen-watching pressure",
      voiceOff: "Stay fully visual",
      mirrorTitle: "Mirror preview",
      mirrorOn: "Open automatically after start",
      mirrorOff: "Training still works without it",
      enabled: "Enabled",
      disabled: "Disabled",
      editHint: "If the setup feels wrong, revise the earlier choices instead of restarting everything."
    },
    session: {
      kicker: "In session",
      rest: "Rest",
      work: "Working",
      completeCount: "moves complete",
      recoverTime: "Recovery time",
      currentCountdown: "Current move countdown",
      progress: "Session progress",
      planMinutes: "min plan",
      resume: "Resume",
      pause: "Pause",
      next: "Next",
      finish: "Finish",
      endEarly: "End early"
    },
    feedback: {
      kicker: "Session feedback",
      title: "How did that round feel?",
      desc: "Tell me whether the session felt right, and I'll suggest the next move.",
      notePlaceholder: "If you want to note uncertainty or discomfort, add one short sentence."
    },
    nextStep: {
      kicker: "Next step",
      title: "Recommended next move",
      desc: "The loop does not end here. It should point you to one clear next action."
    }
  }
};

const goalCopyEn: Record<GoalId, { title: string; subtitle: string; desc: string }> = {
  posture_relief: { title: "Desk relief", subtitle: "Open the upper back", desc: "Best for post-sitting stiffness when you want a fast reset." },
  shoulder_relief: { title: "Neck and shoulder ease", subtitle: "Start with safety", desc: "Best for tight shoulders or light discomfort when you want a gentler session." },
  starter_tone: { title: "Starter tone", subtitle: "Build stability first", desc: "Best for building core stability and full-body participation from scratch." }
};
const equipmentCopyEn: Record<EquipmentId, { title: string; detail: string }> = {
  yoga_ball: { title: "Yoga ball", detail: "Priority template" },
  resistance_band: { title: "Resistance band", detail: "Stretch and activation" },
  yoga_mat: { title: "Yoga mat", detail: "Floor work" },
  dumbbell: { title: "Dumbbell", detail: "Strength support" },
  none: { title: "No equipment", detail: "Start right away" }
};
const experienceCopyEn: Record<ExperienceId, string> = {
  beginner: "First time trying",
  returning: "Starting again",
  active: "Already training"
};
const durationCopyEn: Record<DurationId, { title: string; detail: string }> = {
  "8": { title: "8 min", detail: "Light" },
  "12": { title: "12 min", detail: "Standard" },
  "18": { title: "18 min", detail: "Full round" }
};
const discomfortCopyEn: Record<DiscomfortId, string> = {
  none: "No obvious discomfort today",
  upper_back: "Upper back / thoracic tightness",
  shoulder: "Neck / shoulder discomfort",
  core_confidence: "Low core stability confidence"
};
const intensityCopyEn: Record<IntensityId, string> = {
  gentle: "Start lighter",
  steady: "Standard intensity",
  energized: "More activation"
};
const feedbackCopyEn: Record<FeedbackOutcomeId, { title: string; detail: string }> = {
  great: { title: "That felt good", detail: "The pace felt right. I'm ready to continue." },
  too_hard: { title: "A bit too hard", detail: "I want to repeat this with less intensity first." },
  need_review: { title: "I want to review prep", detail: "I still feel unsure about the setup, form, or gear." },
  stopped_early: { title: "I stopped early", detail: "I need a clearer or safer next step." }
};
const nextStepCopyEn: Record<RecoveryActionId, { title: string; detail: string; badge: string }> = {
  repeat_easier: { title: "Repeat an easier version", detail: "Keep the same goal and lower time or intensity automatically.", badge: "Recommended" },
  continue_track: { title: "Move to the next session", detail: "Stay on the same goal and continue into the next foundational round.", badge: "Continue" },
  review_prep: { title: "Review the prep page", detail: "Reconfirm setup, pacing, and safety cues before trying again.", badge: "Review" },
  contact_support: { title: "Contact support", detail: "If it still does not feel right, route into human support or follow-up.", badge: "Support" }
};
const equipmentLabelEn: Record<EquipmentId, string> = {
  yoga_ball: "Yoga ball",
  resistance_band: "Resistance band",
  yoga_mat: "Yoga mat",
  dumbbell: "Dumbbell",
  none: "No equipment"
};
const planCopyEn: Record<string, {
  title: string;
  why: string;
  safetyNote: string;
  prepChecklist: string[];
  summary: string[];
  steps: Record<string, { title: string; cue: string }>;
}> = {
  "yoga-ball-posture": {
    title: "Yoga Ball Posture Relief Starter",
    why: "You chose desk relief and you have a yoga ball nearby. This first session is intentionally light so you can build comfort and confidence fast.",
    safetyNote: "Keep breathing steady. If your shoulder feels sharp pain, stop immediately and switch to a lighter version.",
    prepChecklist: ["Stabilize the yoga ball on a non-slip surface, ideally near a wall.", "Leave about one arm's length of space so the ball does not hit furniture.", "In the first round, aim for smoothness, not range."],
    summary: ["4 moves", "About 12 min", "Ball activation + floor release"],
    steps: {
      breath: { title: "Ball-supported chest opening breath", cue: "Support the back of your head and gently open the chest." },
      "rest-1": { title: "Reset your breath", cue: "Inhale through the nose, exhale through the mouth, and let the shoulders relax." },
      pelvis: { title: "Pelvic roll", cue: "Keep the movement small and focus on regaining pelvic control." },
      "rest-2": { title: "Short rest", cue: "Notice whether the low back and upper back feel lighter." },
      wall: { title: "Wall-supported scapular activation", cue: "Draw the shoulder blades down softly and avoid shrugging." },
      "rest-3": { title: "Return to standing", cue: "Prepare for the last movement." },
      finish: { title: "Floor cooldown release", cue: "Let the back lengthen naturally to finish the first round." }
    }
  },
  "yoga-ball-shoulder": {
    title: "Yoga Ball Neck and Shoulder Relief Starter",
    why: "You chose neck and shoulder relief. The yoga ball lowers load and makes the shoulder pattern feel smoother for a first session.",
    safetyNote: "Sharp pain or numbness is not normal training feedback. Stop immediately if it appears.",
    prepChecklist: ["Keep the ball in front of your body so it does not drift off center.", "Stay in a comfortable range instead of chasing height.", "Relax the neck and prioritize rhythm first."],
    summary: ["3 moves", "About 10 min", "Shoulder activation + easy breath"],
    steps: {
      slide: { title: "Forward shoulder activation on the ball", cue: "Press the ball forward lightly and feel the shoulder blade glide." },
      "rest-1": { title: "Return to neutral", cue: "Relax the neck and lightly tuck the chin." },
      circle: { title: "Small circles on the ball", cue: "Keep the circles small first, then expand only if you feel steady." },
      "rest-2": { title: "Recover your breath", cue: "If it feels good, move into the last set." },
      reach: { title: "Wall-assisted overhead reach", cue: "Lift only as high as feels comfortable. No need to go overhead." }
    }
  },
  "starter-mat": {
    title: "Yoga Ball and Floor Starter Tone",
    why: "You chose starter tone. This plan favors stability and easy pacing so the first session feels controlled and approachable.",
    safetyNote: "Find stability first and do not chase speed. If you lose balance, place both feet down immediately.",
    prepChecklist: ["Keep both feet grounded and align the ball with the hips.", "Start with a smaller activation range to confirm the setup will not slip.", "Lightly brace the core and avoid holding your breath."],
    summary: ["4 moves", "About 14 min", "Stability + core activation"],
    steps: {
      march: { title: "Alternating foot lift on the ball", cue: "Keep the pelvis steady and lift only slightly from the floor." },
      "rest-1": { title: "Reset your position", cue: "Notice whether the core is beginning to engage." },
      reach: { title: "Alternating forward reach on the ball", cue: "As the arms reach forward, keep the trunk stable." },
      "rest-2": { title: "Relax the shoulders", cue: "Prepare for the third move." },
      squat: { title: "Wall-assisted squat", cue: "Slow the movement down and keep the weight centered between both feet." },
      "rest-3": { title: "Short rest", cue: "Keep the last round smooth and steady." },
      finish: { title: "Supine finish", cue: "Lengthen through the limbs slowly and keep the back relaxed against the floor." }
    }
  },
  "bodyweight-shoulder": {
    title: "No-Equipment Neck and Shoulder Relief",
    why: "Even without equipment, you can still start with a low-load relief session for the neck and shoulders.",
    safetyNote: "Move only inside a comfortable range and do not push into pain.",
    prepChecklist: ["Standing or sitting upright both work.", "Relax the shoulders and lightly tuck the chin.", "Aim for smooth motion first, not bigger range."],
    summary: ["3 moves", "About 8 min", "No equipment needed"],
    steps: {
      neck: { title: "Nodding warm-up", cue: "A small range is enough." },
      "rest-1": { title: "Reset your breath", cue: "Let the shoulders soften." },
      scap: { title: "Scapular glide", cue: "Shrug gently first, then let the shoulders settle down." },
      "rest-2": { title: "Return to neutral", cue: "Prepare for the last move." },
      wall: { title: "Wall-assisted reach", cue: "Stop at a comfortable height." }
    }
  }
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
const readLocaleOverride = (): LocaleId | null => {
  const p = new URLSearchParams(window.location.search);
  const lang = p.get("lang");
  return lang === "en" || lang === "zh-CN" ? lang : null;
};
const readPersistedLocale = (): LocaleId | null => {
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "en" || stored === "zh-CN" ? stored : null;
};
const resolveLocale = (): LocaleId => readLocaleOverride() || readPersistedLocale() || DEFAULT_LOCALE;
const previewFromQuery = () => {
  const p = new URLSearchParams(window.location.search);
  return p.get("preview") === "1";
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
const equipmentLabel = (id: EquipmentId, locale: LocaleId) => locale === "en" ? equipmentLabelEn[id] : id === "yoga_ball" ? "瑜伽球" : id === "resistance_band" ? "弹力带" : id === "yoga_mat" ? "瑜伽垫" : id === "dumbbell" ? "哑铃" : "无器材";
const localizeGoals = (locale: LocaleId) => goals.map((item) => locale === "en" ? { ...item, ...goalCopyEn[item.id] } : item);
const localizeEquipment = (locale: LocaleId) => equipmentOptions.map((item) => locale === "en" ? { ...item, ...equipmentCopyEn[item.id] } : item);
const localizeExperience = (locale: LocaleId) => experienceOptions.map((item) => locale === "en" ? { ...item, title: experienceCopyEn[item.id] } : item);
const localizeDuration = (locale: LocaleId) => durationOptions.map((item) => locale === "en" ? { ...item, ...durationCopyEn[item.id] } : item);
const localizeDiscomfort = (locale: LocaleId) => discomfortOptions.map((item) => locale === "en" ? { ...item, title: discomfortCopyEn[item.id] } : item);
const localizeIntensity = (locale: LocaleId) => intensityOptions.map((item) => locale === "en" ? { ...item, title: intensityCopyEn[item.id] } : item);
const localizeFeedback = (locale: LocaleId) => feedbackOptions.map((item) => locale === "en" ? { ...item, ...feedbackCopyEn[item.id] } : item);
const localizeNextSteps = (locale: LocaleId) => Object.fromEntries(
  (Object.entries(nextStepCopy) as [RecoveryActionId, typeof nextStepCopy[RecoveryActionId]][]).map(([key, value]) => [key, locale === "en" ? { ...value, ...nextStepCopyEn[key] } : value])
) as Record<RecoveryActionId, { title: string; detail: string; badge: string; icon: React.ReactNode }>;
const localizePlan = (plan: SessionPlan | null, locale: LocaleId): SessionPlan | null => {
  if (!plan || locale !== "en") return plan;
  const copy = planCopyEn[plan.id];
  if (!copy) return plan;
  return {
    ...plan,
    title: copy.title,
    why: copy.why,
    safetyNote: copy.safetyNote,
    prepChecklist: copy.prepChecklist,
    summary: copy.summary,
    steps: plan.steps.map((step) => ({ ...step, ...(copy.steps[step.id] || {}) }))
  };
};

const MirrorMedia = memo(function MirrorMedia({
  enabled,
  stream,
  status,
  copy,
  variant = "card"
}: {
  enabled: boolean;
  stream: MediaStream | null;
  status: "idle" | "loading" | "ready" | "error";
  copy: typeof uiCopy["zh-CN"]["mirror"];
  variant?: "card" | "session";
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tryPlay = () => {
      video.play().catch(() => {
        // iOS Safari may defer autoplay until metadata is ready; ignore transient play failures.
      });
    };
    video.muted = true;
    video.playsInline = true;
    if (enabled && stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      if (video.readyState >= 1) {
        tryPlay();
      }
      video.addEventListener("loadedmetadata", tryPlay);
      video.addEventListener("canplay", tryPlay);
      return () => {
        video.removeEventListener("loadedmetadata", tryPlay);
        video.removeEventListener("canplay", tryPlay);
      };
    }
    video.pause();
    video.srcObject = null;
  }, [enabled, stream]);

  return enabled
    ? status === "error"
      ? <div className={`mirror-empty ${variant}`}>{copy.unavailable}</div>
      : <video ref={videoRef} className={`mirror-video ${variant}`} autoPlay muted playsInline />
    : <div className={`mirror-empty ${variant}`}>{copy.intro}</div>;
});

MirrorMedia.displayName = "MirrorMedia";

function MirrorPreview({
  enabled,
  stream,
  status,
  copy,
  variant = "card",
  overlay
}: {
  enabled: boolean;
  stream: MediaStream | null;
  status: "idle" | "loading" | "ready" | "error";
  copy: typeof uiCopy["zh-CN"]["mirror"];
  variant?: "card" | "session";
  overlay?: React.ReactNode;
}) {
  const label = status === "ready" ? copy.statusReady : status === "loading" ? copy.statusLoading : status === "error" ? copy.statusError : copy.statusIdle;
  if (variant === "session") {
    return <section className="mirror-stage"><div className="mirror-stage-media"><MirrorMedia enabled={enabled} stream={stream} status={status} copy={copy} variant="session" />{overlay}</div><div className="mirror-stage-foot"><span className={`status ${status}`}>{label}</span></div></section>;
  }
  return <section className="sub-card"><div className="sub-head"><div><span className="kicker">{copy.kicker}</span><h3>{copy.title}</h3></div><span className={`status ${status}`}>{label}</span></div><MirrorMedia enabled={enabled} stream={stream} status={status} copy={copy} variant="card" /></section>;
}

function ScreenWrap({ kicker, title, desc, children, compact = false, titleOnly = false }: { kicker?: string; title: string; desc: string; children: React.ReactNode; compact?: boolean; titleOnly?: boolean }) {
  return <section className={`screen ${compact ? "compact-screen" : ""}`}><div className={`screen-header ${compact ? "compact" : ""} ${titleOnly ? "title-only" : ""}`}>{!titleOnly && kicker ? <span className="kicker">{kicker}</span> : null}<h2>{title}</h2>{!titleOnly ? <p>{desc}</p> : null}</div><div className="screen-body">{children}</div></section>;
}

function App() {
  const context = contextFromQuery();
  const previewMode = previewFromQuery();
  const [route, setRoute] = useState<RouteId>(routeFromHash);
  const [locale, setLocale] = useState<LocaleId>(resolveLocale);
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [equipment, setEquipment] = useState<EquipmentId[]>(context.productHint === "yoga-ball" ? ["yoga_ball"] : []);
  const [intake, setIntake] = useState<IntakeState>({ experience: null, duration: "12", discomfort: null, intensity: "steady" });
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [mirrorEnabled, setMirrorEnabled] = useState(false);
  const [mirrorStatus, setMirrorStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [feedback, setFeedback] = useState<FeedbackState>({ outcome: null, note: "" });
  const [nextStep, setNextStep] = useState<NextStepState>({ action: null });
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [enteredAt, setEnteredAt] = useState<Record<RouteId, number>>({ entry: Date.now(), goal: 0, equipment: 0, intake: 0, recommendation: 0, prep: 0, session: 0, feedback: 0, "next-step": 0 });
  const [sessionInterrupted, setSessionInterrupted] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const dropoutRef = useRef(false);
  const lastSpokenRef = useRef<string | null>(null);
  const mirrorStreamRef = useRef<MediaStream | null>(null);
  const copy = uiCopy[locale];
  const routeLabels = copy.routeLabel;
  const localizedGoals = localizeGoals(locale);
  const localizedEquipment = localizeEquipment(locale);
  const localizedExperience = localizeExperience(locale);
  const localizedDuration = localizeDuration(locale);
  const localizedDiscomfort = localizeDiscomfort(locale);
  const localizedIntensity = localizeIntensity(locale);
  const localizedFeedback = localizeFeedback(locale);
  const localizedNextSteps = localizeNextSteps(locale);
  const plan = pickPlan(goal, equipment, intake);
  const displayPlan = localizePlan(plan, locale);
  const currentStep = displayPlan?.steps[stepIndex] || null;
  const completedWorkSteps = plan ? plan.steps.slice(0, stepIndex).filter((s) => s.type === "work").length : 0;
  const editTargets: Array<"goal" | "equipment" | "intake"> = route === "recommendation" || route === "prep" ? ["goal", "equipment", "intake"] : [];

  const resetResolvedState = () => {
    setSessionStarted(false);
    setSessionPaused(false);
    setSessionInterrupted(false);
    setStepIndex(0);
    setRemainingSeconds(0);
    setFeedback({ outcome: null, note: "" });
    setNextStep({ action: null });
  };

  const ensurePreviewState = (targetRoute: RouteId) => {
    if (!previewMode) return;
    const needsPlan = ["recommendation", "prep", "session", "feedback", "next-step"].includes(targetRoute);
    let nextGoal = goal;
    let nextEquipment = equipment;
    let nextIntake = intake;

    if (needsPlan && !nextGoal) nextGoal = "posture_relief";
    if (needsPlan && nextEquipment.length === 0) nextEquipment = context.productHint === "yoga-ball" ? ["yoga_ball"] : ["none"];
    if (needsPlan) {
      nextIntake = {
        experience: nextIntake.experience || "beginner",
        duration: nextIntake.duration || "12",
        discomfort: nextIntake.discomfort || "upper_back",
        intensity: nextIntake.intensity || "steady"
      };
    }

    if (nextGoal !== goal) setGoal(nextGoal);
    if (nextEquipment !== equipment) setEquipment(nextEquipment);
    if (nextIntake !== intake) setIntake(nextIntake);

    const seededPlan = pickPlan(nextGoal, nextEquipment, nextIntake);

    if (targetRoute === "session" && seededPlan && !sessionStarted) {
      setSessionStarted(true);
      setSessionPaused(false);
      setSessionInterrupted(false);
      setStepIndex(0);
      setRemainingSeconds(seededPlan.steps[0]?.durationSec || 0);
    }

    if (targetRoute !== "session" && sessionStarted) {
      setSessionStarted(false);
      setSessionPaused(false);
      setStepIndex(0);
      setRemainingSeconds(0);
    }

    if ((targetRoute === "feedback" || targetRoute === "next-step") && !feedback.outcome) {
      setFeedback({ outcome: "great", note: "" });
    }

    if (targetRoute !== "feedback" && targetRoute !== "next-step" && (feedback.outcome || feedback.note)) {
      setFeedback({ outcome: null, note: "" });
    }

    if (targetRoute === "next-step" && !nextStep.action) {
      setNextStep({ action: nextAction(feedback.outcome || "great") });
    }

    if (targetRoute !== "next-step" && nextStep.action) {
      setNextStep({ action: null });
    }
  };

  useEffect(() => { document.title = locale === "en" ? "Shifu Training" : "Shifu"; }, [locale]);
  useEffect(() => {
    tracker.track("entry_open", { asin: context.asin, source: context.source, campaign: context.campaign, product_hint: context.productHint, preview_mode: previewMode, locale });
  }, [context.asin, context.campaign, context.productHint, context.source, locale, previewMode]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("lang", locale);
    const nextHash = `#${route}`;
    const nextUrl = `${window.location.pathname}?${params.toString()}${nextHash}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    setEnteredAt((p) => ({ ...p, [route]: Date.now() }));
  }, [locale, route]);
  useEffect(() => { const onHash = () => setRoute(routeFromHash()); window.addEventListener("hashchange", onHash); return () => window.removeEventListener("hashchange", onHash); }, []);
  useEffect(() => { if (!sessionStarted || sessionPaused || !currentStep) return; const timer = window.setInterval(() => setRemainingSeconds((n) => { if (n <= 1) { window.clearInterval(timer); completeStep(); return 0; } return n - 1; }), 1000); return () => window.clearInterval(timer); }, [currentStep, sessionPaused, sessionStarted]);
  useEffect(() => {
    if (!voiceEnabled || !sessionStarted || !currentStep) return;
    if (lastSpokenRef.current === currentStep.id) return;
    lastSpokenRef.current = currentStep.id;
    tracker.track("voice_prompt_use", { route, enabled: true, step_id: currentStep.id, locale });
    if ("speechSynthesis" in window) {
      const prefix = currentStep.type === "rest" ? copy.voicePrompt.rest : copy.voicePrompt.start;
      const u = new SpeechSynthesisUtterance(`${prefix}，${currentStep.title}`);
      u.lang = locale;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  }, [copy.voicePrompt.rest, copy.voicePrompt.start, currentStep, locale, route, sessionStarted, voiceEnabled]);
  useEffect(() => {
    if (mirrorEnabled) return;
    setMirrorStatus("idle");
    if (mirrorStreamRef.current) {
      mirrorStreamRef.current.getTracks().forEach((t) => t.stop());
      mirrorStreamRef.current = null;
    }
  }, [mirrorEnabled]);
  useEffect(() => {
    if (route === "prep" || route === "session") return;
    if (mirrorStreamRef.current) {
      mirrorStreamRef.current.getTracks().forEach((t) => t.stop());
      mirrorStreamRef.current = null;
    }
    if (mirrorEnabled) {
      setMirrorStatus("idle");
    }
  }, [route, mirrorEnabled]);
  useEffect(() => () => {
    if (mirrorStreamRef.current) {
      mirrorStreamRef.current.getTracks().forEach((t) => t.stop());
      mirrorStreamRef.current = null;
    }
  }, []);
  useEffect(() => { if (previewMode) ensurePreviewState(route); }, [previewMode, route]);
  useEffect(() => { setControlsOpen(false); }, [route]);
  useEffect(() => { if (mirrorEnabled) tracker.track("mirror_mode_use", { route, enabled: true }); }, [mirrorEnabled, route]);
  useEffect(() => { const onHide = () => { if (dropoutRef.current || route === "entry" || route === "next-step") return; tracker.track("flow_exit", { route, duration_ms: Date.now() - (enteredAt[route] || Date.now()), goal, equipment: equipment.join(",") || null, session_started: sessionStarted, session_interrupted: sessionInterrupted }); dropoutRef.current = true; }; window.addEventListener("pagehide", onHide); return () => window.removeEventListener("pagehide", onHide); }, [enteredAt, equipment, goal, route, sessionInterrupted, sessionStarted]);

  const canContinue = route === "entry" ? true : route === "goal" ? Boolean(goal) : route === "equipment" ? equipment.length > 0 : route === "intake" ? Boolean(intake.experience && intake.duration && intake.discomfort && intake.intensity) : route === "recommendation" ? Boolean(plan) : route === "prep" ? true : route === "feedback" ? Boolean(feedback.outcome) : route === "next-step" ? Boolean(nextStep.action) : false;
  const routeIndex = ROUTES.indexOf(route);
  const progress = route === "session" ? 0.72 : (routeIndex + 1) / ROUTES.length;
  const sessionProgress = plan ? (stepIndex + 1) / plan.steps.length : 0;

  const goTo = (r: RouteId) => setRoute(r);
  const goBack = () => { if (route === "goal") return goTo("entry"); if (route === "equipment") return goTo("goal"); if (route === "intake") return goTo("equipment"); if (route === "recommendation") return goTo("intake"); if (route === "prep") return goTo("recommendation"); if (route === "session") return goTo("prep"); if (route === "feedback") return goTo("session"); if (route === "next-step") return goTo("feedback"); };
  const toggleEquipment = (id: EquipmentId) => setEquipment((curr) => { if (id === "none") return curr.includes("none") ? [] : ["none"]; const list = curr.filter((x) => x !== "none"); return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]; });
  const returnHome = () => {
    const needsConfirm = route === "session" || route === "feedback" || route === "next-step";
    if (needsConfirm && !window.confirm(copy.confirmLeaveActive)) return;
    resetResolvedState();
    goTo("entry");
  };
  const toggleLocale = () => {
    setLocale((current) => current === "zh-CN" ? "en" : "zh-CN");
    setControlsOpen(false);
  };
  const jumpToEdit = (target: "goal" | "equipment" | "intake") => {
    setControlsOpen(false);
    goTo(target);
  };
  const ensureMirrorStream = async () => {
    const currentTrack = mirrorStreamRef.current?.getVideoTracks()[0];
    if (mirrorStreamRef.current && mirrorStreamRef.current.active && currentTrack?.readyState === "live") {
      setMirrorStatus("ready");
      return true;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setMirrorStatus("error");
      return false;
    }
    if (mirrorStreamRef.current) {
      mirrorStreamRef.current.getTracks().forEach((t) => t.stop());
      mirrorStreamRef.current = null;
    }
    setMirrorStatus("loading");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      mirrorStreamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      if (track) {
        track.addEventListener("ended", () => {
          if (!mirrorEnabled) return;
          setMirrorStatus("error");
        }, { once: true });
      }
      setMirrorStatus("ready");
      return true;
    } catch {
      setMirrorStatus("error");
      return false;
    }
  };

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
    setFeedback({ outcome: "stopped_early", note: locale === "en" ? "I ended the session early and need a lighter or clearer next step." : "训练中途结束，需要更轻或更明确的下一步。" });
    goTo("feedback");
  };

  const nextFlow = async () => {
    if (route === "entry") return goTo("goal");
    if (route === "goal" && goal) { tracker.track("goal_select", { goal, source: context.source, asin: context.asin }); return goTo("equipment"); }
    if (route === "equipment" && equipment.length) { tracker.track("equipment_select", { equipment: equipment.join(","), yoga_ball_selected: equipment.includes("yoga_ball") }); return goTo("intake"); }
    if (route === "intake" && intake.experience && intake.duration && intake.discomfort && intake.intensity) { tracker.track("intake_complete", { experience: intake.experience, duration: intake.duration, discomfort: intake.discomfort, intensity: intake.intensity }); return goTo("recommendation"); }
    if (route === "recommendation" && plan) { tracker.track("plan_accept", { plan_id: plan.id, primary_equipment: plan.primaryEquipment, estimated_minutes: plan.estimatedMinutes }); return goTo("prep"); }
    if (route === "prep" && plan) {
      tracker.track("prep_ready", { plan_id: plan.id, voice_enabled: voiceEnabled, mirror_enabled: mirrorEnabled });
      if (mirrorEnabled) {
        const ok = await ensureMirrorStream();
        if (!ok) {
          return;
        }
      }
      return startSession();
    }
    if (route === "feedback" && feedback.outcome) { const action = nextAction(feedback.outcome); setNextStep({ action }); tracker.track("session_feedback", { plan_id: plan?.id || null, outcome: feedback.outcome, note_present: feedback.note.trim().length > 0 }); tracker.track("next_step_route", { action, plan_id: plan?.id || null }); return goTo("next-step"); }
  };

  const footerLabel = copy.footerByRoute[route] || copy.footerDefault;
  const editActionRow = editTargets.length
    ? <div className="inline-action-row">{editTargets.map((target) => <button key={target} type="button" className="inline-action" data-testid={`edit-${target}`} onClick={() => jumpToEdit(target)}>{copy.editRoute[target]}</button>)}</div>
    : null;
  const controlCenter = controlsOpen
    ? <div className="control-center" data-testid="control-center">
        <div className="control-center-head">
          <div className="copy">
            <strong>{copy.control.title}</strong>
            <span>{previewMode ? copy.control.previewHint : copy.control.homeHint}</span>
          </div>
          {previewMode ? <span className="tag top">{copy.control.preview}</span> : null}
        </div>
        <div className="control-group">
          <span className="kicker">{copy.control.language}</span>
          <div className="control-grid two-up">
            <button type="button" className={`control-pill ${locale === "zh-CN" ? "selected" : ""}`} data-testid="locale-zh" onClick={() => { setLocale("zh-CN"); setControlsOpen(false); }}>{copy.control.zh}</button>
            <button type="button" className={`control-pill ${locale === "en" ? "selected" : ""}`} data-testid="locale-en" onClick={() => { setLocale("en"); setControlsOpen(false); }}>{copy.control.en}</button>
          </div>
        </div>
        {route !== "entry" ? <div className="control-group">
          <span className="kicker">{copy.control.title}</span>
          <div className="control-grid">
            <button type="button" className="control-action" data-testid="control-home" onClick={returnHome}>{copy.control.home}</button>
          </div>
        </div> : null}
        {editTargets.length ? <div className="control-group">
          <span className="kicker">{copy.control.edit}</span>
          <div className="control-grid">{editTargets.map((target) => <button key={target} type="button" className="control-action" data-testid={`control-edit-${target}`} onClick={() => jumpToEdit(target)}>{copy.editRoute[target]}</button>)}</div>
        </div> : null}
        {previewMode ? <div className="control-group">
          <span className="kicker">{copy.control.preview}</span>
          <div className="control-grid preview-grid">
            {PREVIEW_ROUTES.map((previewRoute) => <button key={previewRoute} type="button" className={`control-pill ${route === previewRoute ? "selected" : ""}`} data-testid={`preview-route-${previewRoute}`} onClick={() => { ensurePreviewState(previewRoute); goTo(previewRoute); setControlsOpen(false); }}>{routeLabels[previewRoute]}</button>)}
          </div>
        </div> : null}
      </div>
    : null;

  let body: React.ReactNode = null;
  if (route === "entry") body = <ScreenWrap title={copy.entry.title} desc="" titleOnly><div className="hero-card compact-hero"><div className="hero-icon"><Sparkles size={24} /></div><div className="hero-copy"><h3>{copy.entry.heroTitle}</h3><p>{copy.entry.heroDesc}</p></div></div></ScreenWrap>;
  if (route === "goal") body = <ScreenWrap kicker={copy.goal.kicker} title={copy.goal.title} desc={copy.goal.desc} compact titleOnly><div className="choice-grid">{localizedGoals.map((item) => <button key={item.id} type="button" className={`card goal-card ${goal === item.id ? "selected" : ""}`} onClick={() => setGoal(item.id)}><span className="icon">{item.icon}</span><div className="copy"><strong>{item.title}</strong><span>{item.subtitle}</span></div><CheckCircle2 size={18} className="check" /></button>)}</div></ScreenWrap>;
  if (route === "equipment") body = <ScreenWrap kicker={copy.equipment.kicker} title={copy.equipment.title} desc={copy.equipment.desc} compact><div className="choice-grid equipment-grid">{localizedEquipment.map((item) => <button key={item.id} type="button" className={`card equipment-card ${equipment.includes(item.id) ? "selected" : ""}`} onClick={() => toggleEquipment(item.id)}><span className="icon">{item.icon}</span><div className="copy"><strong>{item.title}</strong><span>{item.detail}</span></div><div className="equipment-card-side">{item.priority ? <span className="tag card-tag">{copy.equipment.priority}</span> : null}<CheckCircle2 size={18} className="check" /></div></button>)}</div></ScreenWrap>;
  if (route === "intake") body = <ScreenWrap kicker={copy.intake.kicker} title={copy.intake.title} desc={copy.intake.desc} compact titleOnly><div className="q"><h3>{copy.intake.labels.experience}</h3><div className="pill-list">{localizedExperience.map((o) => <button key={o.id} type="button" className={`pill ${intake.experience === o.id ? "selected" : ""}`} onClick={() => setIntake((s) => ({ ...s, experience: o.id }))}>{o.title}</button>)}</div></div><div className="q"><h3>{copy.intake.labels.duration}</h3><div className="pill-list">{localizedDuration.map((o) => <button key={o.id} type="button" className={`pill detail ${intake.duration === o.id ? "selected" : ""}`} onClick={() => setIntake((s) => ({ ...s, duration: o.id }))}><strong>{o.title}</strong><span>{o.detail}</span></button>)}</div></div><div className="q"><h3>{copy.intake.labels.discomfort}</h3><div className="pill-list">{localizedDiscomfort.map((o) => <button key={o.id} type="button" className={`pill ${intake.discomfort === o.id ? "selected" : ""}`} onClick={() => setIntake((s) => ({ ...s, discomfort: o.id }))}>{o.title}</button>)}</div></div><div className="q"><h3>{copy.intake.labels.intensity}</h3><div className="pill-list">{localizedIntensity.map((o) => <button key={o.id} type="button" className={`pill ${intake.intensity === o.id ? "selected" : ""}`} onClick={() => setIntake((s) => ({ ...s, intensity: o.id }))}>{o.title}</button>)}</div></div></ScreenWrap>;
  if (route === "recommendation") body = <ScreenWrap kicker={copy.recommendation.kicker} title={displayPlan ? displayPlan.title : copy.recommendation.emptyTitle} desc={displayPlan ? displayPlan.why : copy.recommendation.emptyDesc} titleOnly>{displayPlan ? <><div className="recommendation-inline">{editActionRow}<p>{copy.recommendation.editHint}</p></div><div className="sub-card recommendation-card"><div className="recommendation-metrics"><div className="recommendation-metric"><span className="metric-label">{copy.recommendation.estimated}</span><strong><Clock3 size={14} />{displayPlan.estimatedMinutes} {locale === "en" ? "min" : "分钟"}</strong></div><div className="recommendation-metric"><span className="metric-label">{copy.recommendation.equipment}</span><strong>{equipmentLabel(displayPlan.primaryEquipment, locale)}</strong></div></div><div className="recommendation-summary"><span className="metric-label">{copy.recommendation.summary}</span><div className="summary-list">{displayPlan.summary.map((x) => <span key={x} className="summary-pill">{x}</span>)}</div></div><div className="note recommendation-note"><ShieldCheck size={16} /><div className="note-copy"><strong>{copy.recommendation.safetyTitle}</strong><span>{displayPlan.safetyNote}</span></div></div></div></> : <div className="sub-card"><p>{copy.recommendation.emptyBody}</p></div>}</ScreenWrap>;
  if (route === "prep") body = <ScreenWrap kicker={copy.prep.kicker} title={copy.prep.title} desc={copy.prep.desc} titleOnly>{displayPlan ? <><div className="recommendation-inline">{editActionRow}<p>{copy.prep.editHint}</p></div><section className="sub-card prep-hero"><div className="prep-hero-copy"><span className="kicker">{copy.prep.heroKicker}</span><h3>{copy.prep.heroTitle}</h3><p>{copy.prep.heroDesc}</p></div><ul className="list prep-list">{displayPlan.prepChecklist.map((item) => <li key={item}><CheckCircle2 size={16} /><span>{item}</span></li>)}</ul><div className="prep-support-head"><span className="kicker">{copy.prep.supportKicker}</span><p>{copy.prep.supportDesc}</p></div><div className="prep-support-grid"><button type="button" className={`support-toggle ${voiceEnabled ? "active" : ""}`} onClick={() => setVoiceEnabled((v) => !v)}><div className="support-toggle-main"><div className="support-toggle-title"><strong>{copy.prep.voiceTitle}</strong><span>{voiceEnabled ? copy.prep.voiceOn : copy.prep.voiceOff}</span></div><span className={`state ${voiceEnabled ? "ready" : ""}`}>{voiceEnabled ? <Mic size={16} /> : <MicOff size={16} />}{voiceEnabled ? copy.prep.enabled : copy.prep.disabled}</span></div></button><button type="button" className={`support-toggle ${mirrorEnabled ? "active" : ""}`} onClick={() => setMirrorEnabled((v) => !v)}><div className="support-toggle-main"><div className="support-toggle-title"><strong>{copy.prep.mirrorTitle}</strong><span>{mirrorEnabled ? copy.prep.mirrorOn : copy.prep.mirrorOff}</span></div><span className={`state ${mirrorEnabled ? "ready" : ""}`}><MonitorSmartphone size={16} />{mirrorEnabled ? copy.prep.enabled : copy.prep.disabled}</span></div></button></div></section></> : null}</ScreenWrap>;
  if (route === "session") body = <ScreenWrap kicker={copy.session.kicker} title={currentStep ? currentStep.title : copy.session.kicker} desc={currentStep ? currentStep.cue : ""} compact titleOnly>{plan && currentStep ? mirrorEnabled ? <div className="session-layout session-layout-mirror"><MirrorPreview enabled={mirrorEnabled} stream={mirrorStreamRef.current} status={mirrorStatus} copy={copy.mirror} variant="session" overlay={<div className="session-overlay"><div className="session-overlay-top"><span className={`badge ${currentStep.type}`}>{currentStep.type === "rest" ? copy.session.rest : copy.session.work}</span><span className="badge muted">{completedWorkSteps}/{totalWorkSteps(plan)} {copy.session.completeCount}</span></div><div className="session-overlay-timer"><div className="time">{fmt(remainingSeconds)}</div><span>{currentStep.type === "rest" ? copy.session.recoverTime : copy.session.currentCountdown}</span></div><div className="session-overlay-bottom"><p>{currentStep.cue}</p><div className="progress large overlay-progress"><div className="bar" style={{ width: `${Math.min(sessionProgress * 100, 100)}%` }} /></div></div></div>} /><section className="sub-card runtime runtime-compact"><div className="meta"><span>{copy.session.progress}</span><span>{plan.estimatedMinutes} {copy.session.planMinutes}</span></div><div className="session-actions compact-actions"><button type="button" className="secondary" onClick={() => setSessionPaused((v) => !v)}>{sessionPaused ? <Play size={16} /> : <Pause size={16} />}{sessionPaused ? copy.session.resume : copy.session.pause}</button><button type="button" className="primary inline" onClick={completeStep}><ArrowRight size={16} />{copy.session.next}</button><button type="button" className="ghost danger" onClick={exitSession}><XCircle size={16} />{copy.session.finish}</button></div></section></div> : <section className="sub-card runtime"><div className="runtime-top"><span className={`badge ${currentStep.type}`}>{currentStep.type === "rest" ? copy.session.rest : copy.session.work}</span><span className="badge muted">{completedWorkSteps}/{totalWorkSteps(plan)} {copy.session.completeCount}</span></div><div className="timer"><div className="time">{fmt(remainingSeconds)}</div><span>{currentStep.type === "rest" ? copy.session.recoverTime : copy.session.currentCountdown}</span></div><div className="progress large"><div className="bar" style={{ width: `${Math.min(sessionProgress * 100, 100)}%` }} /></div><div className="meta"><span>{copy.session.progress}</span><span>{plan.estimatedMinutes} {copy.session.planMinutes}</span></div><div className="session-actions"><button type="button" className="secondary" onClick={() => setSessionPaused((v) => !v)}>{sessionPaused ? <Play size={16} /> : <Pause size={16} />}{sessionPaused ? copy.session.resume : copy.session.pause}</button><button type="button" className="primary inline" onClick={completeStep}><ArrowRight size={16} />{copy.session.next}</button><button type="button" className="ghost danger" onClick={exitSession}><XCircle size={16} />{copy.session.endEarly}</button></div></section> : null}</ScreenWrap>;
  if (route === "feedback") body = <ScreenWrap kicker={copy.feedback.kicker} title={copy.feedback.title} desc={copy.feedback.desc} titleOnly><div className="stack">{localizedFeedback.map((item) => <button key={item.id} type="button" className={`${toneClass(item.tone)} ${feedback.outcome === item.id ? "selected" : ""}`} onClick={() => setFeedback((s) => ({ ...s, outcome: item.id }))}><div className="icon semantic">{item.icon}</div><div className="copy"><strong>{item.title}</strong><p>{item.detail}</p></div><CheckCircle2 size={18} className="check" /></button>)}</div><textarea className="note-input" placeholder={copy.feedback.notePlaceholder} value={feedback.note} onChange={(e) => setFeedback((s) => ({ ...s, note: e.target.value }))} /></ScreenWrap>;
  if (route === "next-step") body = <ScreenWrap kicker={copy.nextStep.kicker} title={copy.nextStep.title} desc={copy.nextStep.desc} titleOnly>{nextStep.action ? <div className="hero-card success"><div className="hero-icon success"><CheckCircle2 size={24} /></div><div className="hero-copy"><h3>{localizedNextSteps[nextStep.action].title}</h3><p>{localizedNextSteps[nextStep.action].detail}</p></div></div> : null}<div className="stack">{(Object.keys(localizedNextSteps) as RecoveryActionId[]).map((action) => <button key={action} type="button" className={`card action-card ${nextStep.action === action ? "selected" : ""}`} onClick={() => { setNextStep({ action }); tracker.track("next_step_route", { action, explicit_choice: true }); }}><span className="tag top">{localizedNextSteps[action].badge}</span><div className="icon">{localizedNextSteps[action].icon}</div><div className="copy"><strong>{localizedNextSteps[action].title}</strong><p>{localizedNextSteps[action].detail}</p></div><CheckCircle2 size={18} className="check" /></button>)}</div></ScreenWrap>;

  return <><style>{styles}</style><div className="app-bg"><div className={`phone-shell route-${route} ${previewMode ? "preview-mode" : ""}`} data-preview={previewMode ? "true" : "false"}><header className="topbar"><div className="topbar-row"><div className="topbar-copy"><span className="brand">Shifu</span><strong>{routeLabels[route]}</strong></div><div className="topbar-tools"><span className="topbar-aside">{route === "session" ? copy.topbarActive : `${routeIndex + 1}/${ROUTES.length}`}</span>{route !== "entry" || previewMode ? <button className={`topbar-control topbar-utility ${controlsOpen ? "active" : ""}`} type="button" data-testid="control-center-toggle" aria-label={copy.control.toggle} onClick={() => setControlsOpen((v) => !v)}><SlidersHorizontal size={15} /></button> : null}<button className="topbar-control locale-switch" type="button" data-testid="locale-toggle" aria-label={copy.control.language} onClick={toggleLocale}>{locale === "en" ? "EN" : "中"}</button></div></div><div className="progress"><div className="bar" style={{ width: `${Math.min(progress * 100, 100)}%` }} /></div>{controlCenter}</header><main className="main">{body}</main>{route !== "session" ? <footer className="footer"><div className={`footer-actions ${route !== "entry" ? "with-back" : ""}`}>{route !== "entry" ? <button className="secondary footer-back" type="button" onClick={goBack}><span>{copy.footerBack}</span></button> : null}<button className={`primary footer-btn ${canContinue ? "" : "disabled"}`} type="button" onClick={nextFlow} disabled={!canContinue}><span>{footerLabel}</span><ArrowRight size={16} /></button></div></footer> : null}</div></div></>;
}

const styles = `
:root {
  color-scheme: light;
  --bg: #f8f9fa;
  --surface: #fff;
  --surface-2: #f4f6f5;
  --surface-3: #eef2f0;
  --soft: #f4f5f4;
  --tint: #eef1ef;
  --line: rgba(25, 28, 29, 0.05);
  --hairline: rgba(17, 24, 39, 0.05);
  --hairline-strong: rgba(17, 24, 39, 0.09);
  --text: #191c1d;
  --muted: #44474e;
  --muted2: #74777f;
  --primary: #000000;
  --secondary: #006e24;
  --selected-ring: rgba(0, 110, 36, 0.24);
  --selected-fill: rgba(80, 255, 113, 0.12);
  --selected-shadow: rgba(0, 110, 36, 0.08);
  --shadow: 0 20px 56px rgba(17, 24, 39, 0.06);
  --shadow2: 0 10px 24px rgba(17, 24, 39, 0.045);
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
  background: radial-gradient(circle at top, #ffffff 0%, var(--bg) 52%, #edf0ee 100%);
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
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.app-bg::before,
.app-bg::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(16px);
  opacity: 0.7;
}

.app-bg::before {
  width: 54vw;
  height: 54vw;
  top: -14vw;
  left: -18vw;
  background: radial-gradient(circle, rgba(80, 255, 113, 0.14) 0%, rgba(80, 255, 113, 0.03) 56%, rgba(80, 255, 113, 0) 72%);
}

.app-bg::after {
  width: 46vw;
  height: 46vw;
  right: -14vw;
  bottom: 10vh;
  background: radial-gradient(circle, rgba(17, 24, 39, 0.08) 0%, rgba(17, 24, 39, 0.02) 54%, rgba(17, 24, 39, 0) 74%);
}

.phone-shell {
  width: min(100%, 430px);
  min-height: 100dvh;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(248, 250, 249, 0.95) 100%);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.phone-shell::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 180px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: calc(18px + env(safe-area-inset-top)) 20px 12px;
  background: rgba(255, 255, 255, 0.74);
  backdrop-filter: blur(24px);
  box-shadow: 0 12px 28px rgba(17, 24, 39, 0.035);
}

.topbar-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.topbar-tools {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.topbar-copy {
  display: grid;
  gap: 4px;
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
  font-size: 1.08rem;
  letter-spacing: -0.035em;
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

.topbar-control {
  min-width: 52px;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: var(--text);
  box-shadow: inset 0 0 0 1px var(--hairline);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
  transition: background 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.topbar-utility {
  min-width: 32px;
  padding: 0;
}

.locale-switch {
  letter-spacing: 0.01em;
}

.topbar-control.active {
  background: rgba(80, 255, 113, 0.12);
  box-shadow: inset 0 0 0 1px rgba(13, 138, 67, 0.18);
}

.topbar-aside,
.chip,
.status,
.badge.muted {
  background: rgba(255, 255, 255, 0.7);
  color: var(--muted);
  box-shadow: inset 0 0 0 1px var(--hairline);
}

.topbar-aside {
  min-width: 52px;
  justify-content: center;
}

.progress,
.large {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.06);
  overflow: hidden;
}

.large {
  height: 9px;
}

.bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #1ad567 0%, #0d8a43 100%);
}

.main {
  flex: 1;
  padding: 24px 20px calc(120px + env(safe-area-inset-bottom));
}

.screen,
.screen-header,
.screen-body,
.copy,
.hero-copy {
  display: grid;
  gap: 16px;
}

.screen-header {
  gap: 12px;
}

.screen.compact-screen {
  gap: 16px;
}

.screen-header.compact {
  gap: 10px;
}

.screen-header.title-only {
  gap: 2px;
}

.kicker {
  font-family: "Lexend", sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--secondary);
  font-weight: 700;
}

.screen-header h2 {
  margin: 0;
  font-family: "Lexend", sans-serif;
  font-size: clamp(2.2rem, 8vw, 3.15rem);
  line-height: 0.92;
  letter-spacing: -0.06em;
}

.screen-header.compact h2 {
  font-size: clamp(1.95rem, 6.5vw, 2.4rem);
  line-height: 0.94;
  letter-spacing: -0.05em;
}

.screen-header.title-only h2 {
  font-size: clamp(2rem, 6.8vw, 2.55rem);
}

.screen-header p,
.copy p,
.hero-copy p,
.mini-card span,
.note-input,
.mirror-empty {
  margin: 0;
  color: var(--muted);
  line-height: 1.58;
  font-size: 0.96rem;
}

.screen-header.compact p {
  font-size: 0.92rem;
  line-height: 1.52;
  max-width: 22rem;
}

.hero-card,
.sub-card,
.mini-card,
.card,
.feedback-card,
.pill.detail {
  background: var(--surface);
  border: 0;
  box-shadow: var(--shadow2), inset 0 0 0 1px rgba(17, 24, 39, 0.04);
}

.hero-card {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 16px;
  padding: 22px;
  border-radius: 26px;
  background: linear-gradient(180deg, #ffffff 0%, rgba(238, 241, 239, 0.92) 100%);
}

.compact-hero {
  padding: 22px;
}

.hero-card.success {
  background: linear-gradient(180deg, #fff 0%, rgba(26, 213, 103, 0.1) 100%);
}

.hero-icon,
.icon {
  width: 50px;
  height: 50px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.06);
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

.choice-grid {
  display: grid;
  gap: 14px;
}

.equipment-grid {
  grid-template-columns: 1fr;
  gap: 12px;
}

.mini-grid,
.stack,
.pill-list,
.session-actions {
  display: grid;
  gap: 12px;
}

.session-layout {
  display: grid;
  gap: 12px;
}

.session-layout-mirror {
  grid-template-rows: minmax(0, 1fr) auto;
}

.mini-grid {
  grid-template-columns: 1fr 1fr;
}

.mini-card,
.sub-card {
  padding: 18px;
  border-radius: 22px;
}

.recommendation-card {
  display: grid;
  gap: 18px;
  padding: 20px;
}

.recommendation-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.recommendation-metric,
.recommendation-summary {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: inset 0 0 0 1px var(--hairline);
}

.recommendation-metric strong {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: "Lexend", sans-serif;
  font-size: 1.08rem;
  letter-spacing: -0.02em;
}

.metric-label {
  font-size: 0.72rem;
  line-height: 1.2;
  letter-spacing: 0.12em;
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
  background: var(--surface-2);
  color: var(--primary);
  font-size: 0.88rem;
  font-weight: 700;
  box-shadow: inset 0 0 0 1px var(--hairline);
}

.mini-card strong,
.copy strong,
.hero-copy h3,
.sub-card h3 {
  margin: 0;
  font-family: "Lexend", sans-serif;
  font-size: 1.08rem;
  letter-spacing: -0.03em;
}

.card,
.feedback-card {
  width: 100%;
  text-align: left;
  padding: 18px;
  border-radius: 24px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
  cursor: pointer;
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
  position: relative;
  isolation: isolate;
}

.goal-card {
  min-height: 104px;
}

.goal-card .copy {
  gap: 6px;
}

.equipment-card {
  grid-template-columns: 44px 1fr auto;
  align-content: center;
  justify-items: stretch;
  min-height: 96px;
  aspect-ratio: auto;
  padding: 16px 18px;
  border-radius: 22px;
  gap: 14px;
}

.equipment-card .icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
}

.equipment-card .copy {
  gap: 4px;
  width: auto;
}

.equipment-card .copy strong {
  font-size: 1.05rem;
}

.equipment-card .copy span {
  font-size: 0.88rem;
  line-height: 1.42;
}

.equipment-card-side {
  display: grid;
  justify-items: end;
  align-content: space-between;
  gap: 10px;
  min-height: 100%;
}

.equipment-card .check {
  position: static;
  align-self: start;
  justify-self: end;
}

.card:hover,
.feedback-card:hover,
.pill:hover,
.toggle:hover,
.primary:hover,
.secondary:hover,
.ghost:hover {
  transform: translateY(-2px);
}

.card.selected,
.pill.selected,
.toggle.active {
  background: linear-gradient(180deg, #fff 0%, var(--selected-fill) 100%);
  box-shadow: 0 14px 30px var(--selected-shadow), inset 0 0 0 1px rgba(13, 138, 67, 0.24);
}

.feedback-card.selected {
  background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(26, 213, 103, 0.12) 100%);
  box-shadow: 0 14px 30px var(--selected-shadow), inset 0 0 0 1px rgba(13, 138, 67, 0.24);
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
  font-size: 0.84rem;
  font-weight: 600;
  line-height: 1.45;
}

.semantic {
  background: rgba(15, 23, 42, 0.06);
}

.check {
  color: rgba(13, 138, 67, 0.22);
  opacity: 0.24;
  transform: scale(0.92);
  transition: color 160ms ease, opacity 160ms ease, transform 160ms ease;
}

.selected .check {
  color: var(--secondary);
  opacity: 1;
  transform: scale(1);
}

.tag {
  background: rgba(15, 23, 42, 0.05);
  color: var(--muted);
  box-shadow: inset 0 0 0 1px var(--hairline);
}

.tag.top {
  justify-self: start;
  grid-column: 1 / -1;
  margin-bottom: -4px;
}

.card-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  min-height: 26px;
  padding: 0 10px;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
}

.card.selected .tag {
  background: rgba(13, 138, 67, 0.12);
  color: var(--secondary);
}

.q {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: inset 0 0 0 1px var(--hairline);
}

.q h3 {
  margin: 0;
  font-family: "Lexend", sans-serif;
  font-size: 1.02rem;
  letter-spacing: -0.03em;
}

.pill {
  width: 100%;
  min-height: 52px;
  border-radius: 18px;
  padding: 15px 16px;
  background: rgba(244, 246, 245, 0.9);
  color: var(--text);
  text-align: left;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease;
  border: 0;
  box-shadow: inset 0 0 0 1px var(--hairline);
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
  padding: 15px 16px;
  border-radius: 18px;
  background: rgba(13, 138, 67, 0.08);
  color: var(--primary);
  line-height: 1.55;
}

.recommendation-note {
  margin-top: 2px;
}

.recommendation-inline {
  display: grid;
  gap: 10px;
}

.recommendation-inline p {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.inline-action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.inline-action {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  color: var(--text);
  box-shadow: inset 0 0 0 1px var(--hairline);
  cursor: pointer;
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
  padding: 16px 17px;
  border-radius: 20px;
  background: rgba(244, 246, 245, 0.92);
  border: 0;
  box-shadow: inset 0 0 0 1px var(--hairline);
  cursor: pointer;
}

.support-card {
  display: grid;
  gap: 12px;
}

.prep-hero {
  display: grid;
  gap: 18px;
  padding: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(245, 248, 246, 0.92) 100%);
}

.prep-hero-copy {
  display: grid;
  gap: 8px;
}

.prep-hero-copy h3 {
  font-size: 1.28rem;
  letter-spacing: -0.04em;
}

.prep-hero-copy p,
.prep-support-head p,
.support-toggle-title span {
  margin: 0;
  color: var(--muted);
  font-size: 0.92rem;
  line-height: 1.52;
}

.prep-list {
  gap: 14px;
}

.prep-list li {
  gap: 12px;
}

.prep-list span {
  font-size: 1rem;
  line-height: 1.55;
}

.prep-support-head {
  display: grid;
  gap: 6px;
}

.prep-support-grid {
  display: grid;
  gap: 10px;
}

.support-toggle {
  width: 100%;
  text-align: left;
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: inset 0 0 0 1px var(--hairline);
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
}

.support-toggle:hover {
  transform: translateY(-1px);
}

.support-toggle.active {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(80, 255, 113, 0.08) 100%);
  box-shadow: 0 10px 22px rgba(13, 138, 67, 0.08), inset 0 0 0 1px rgba(13, 138, 67, 0.18);
}

.support-toggle-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.support-toggle-title {
  display: grid;
  gap: 4px;
}

.support-toggle-title strong {
  margin: 0;
  font-family: "Lexend", sans-serif;
  font-size: 1.02rem;
  letter-spacing: -0.03em;
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
  background: rgba(255, 255, 255, 0.86);
  box-shadow: inset 0 0 0 1px var(--hairline);
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
  box-shadow: inset 0 0 0 1px rgba(13, 138, 67, 0.12);
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

.runtime-compact {
  padding: 16px 18px 18px;
  gap: 14px;
}

.compact-actions {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.compact-actions .primary,
.compact-actions .secondary,
.compact-actions .ghost {
  min-height: 50px;
  padding: 12px 10px;
  font-size: 0.92rem;
}

.mirror-stage {
  display: grid;
  gap: 12px;
}

.mirror-stage-media {
  position: relative;
  min-height: min(54dvh, 460px);
  border-radius: 28px;
  overflow: hidden;
  background: #101314;
  box-shadow: 0 18px 40px rgba(17, 24, 39, 0.12);
}

.mirror-stage-foot {
  display: flex;
  justify-content: flex-end;
}

.mirror-video.session,
.mirror-empty.session {
  min-height: min(54dvh, 460px);
  height: 100%;
  border-radius: 28px;
  background: linear-gradient(180deg, #1b1f20 0%, #303536 100%);
}

.session-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 16px;
  padding: 18px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.24) 0%, rgba(0, 0, 0, 0.04) 36%, rgba(0, 0, 0, 0.52) 100%);
  pointer-events: none;
}

.session-overlay-top,
.session-overlay-bottom {
  display: grid;
  gap: 10px;
}

.session-overlay-top {
  justify-items: start;
  align-content: start;
}

.session-overlay-timer {
  align-self: center;
  justify-self: center;
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 16px 18px;
  min-width: min(72vw, 260px);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.16);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(12px);
  color: #fff;
}

.session-overlay-timer .time {
  color: #fff;
}

.session-overlay-timer span,
.session-overlay-bottom p {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.5;
  text-align: center;
}

.session-overlay-bottom {
  align-content: end;
}

.overlay-progress {
  background: rgba(255, 255, 255, 0.18);
}

.primary,
.secondary,
.ghost {
  width: 100%;
  min-height: 56px;
  padding: 14px 18px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 160ms ease, opacity 160ms ease, box-shadow 160ms ease;
}

.primary {
  background: linear-gradient(135deg, #000000 0%, #1b232b 100%);
  color: #fff;
  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.12);
  font-weight: 700;
}

.primary.disabled {
  opacity: 0.4;
  box-shadow: none;
  cursor: not-allowed;
}

.secondary {
  background: rgba(255, 255, 255, 0.82);
  color: var(--primary);
  box-shadow: inset 0 0 0 1px var(--hairline);
  font-weight: 700;
}

.ghost {
  background: rgba(255, 255, 255, 0.74);
  color: var(--primary);
  box-shadow: inset 0 0 0 1px rgba(17, 24, 39, 0.1);
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
  border: 0;
  background: var(--surface);
  color: var(--text);
  resize: vertical;
  box-shadow: var(--shadow2), inset 0 0 0 1px rgba(17, 24, 39, 0.06);
}

.note-input:focus {
  outline: none;
  box-shadow: 0 10px 24px rgba(13, 138, 67, 0.07), inset 0 0 0 2px rgba(13, 138, 67, 0.2);
}

.footer {
  position: sticky;
  bottom: 0;
  z-index: 9;
  padding: 12px 20px calc(16px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 28%, rgba(255, 255, 255, 0.98) 100%);
  backdrop-filter: blur(18px);
  box-shadow: 0 -14px 30px rgba(17, 24, 39, 0.03);
}

.footer-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.footer-actions.with-back {
  grid-template-columns: 120px 1fr;
}

.footer-btn {
  min-height: 58px;
  border-radius: 20px;
}

.footer-back {
  min-height: 58px;
  border-radius: 20px;
}

.control-center {
  display: grid;
  gap: 14px;
  margin-top: 12px;
  padding: 16px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--shadow2), inset 0 0 0 1px rgba(17, 24, 39, 0.05);
}

.control-center-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.control-center-head .copy {
  gap: 4px;
}

.control-center-head strong {
  font-family: "Lexend", sans-serif;
  font-size: 1rem;
  letter-spacing: -0.03em;
}

.control-group {
  display: grid;
  gap: 8px;
}

.control-grid {
  display: grid;
  gap: 8px;
}

.control-grid.two-up {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.preview-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.control-pill,
.control-action {
  min-height: 42px;
  padding: 0 14px;
  border-radius: 16px;
  background: rgba(244, 246, 245, 0.92);
  color: var(--text);
  box-shadow: inset 0 0 0 1px var(--hairline);
  cursor: pointer;
  text-align: center;
}

.control-pill.selected {
  background: var(--selected-fill);
  box-shadow: 0 8px 18px var(--selected-shadow), inset 0 0 0 1px rgba(13, 138, 67, 0.18);
  color: var(--secondary);
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
  border-radius: 22px;
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

.route-entry .topbar-aside {
  min-height: auto;
  padding: 0;
  background: transparent;
  box-shadow: none;
  color: var(--muted2);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.route-entry .screen {
  gap: 18px;
}

.route-entry .screen-header h2 {
  max-width: 10ch;
}

.route-entry .hero-card {
  min-height: 184px;
  grid-template-columns: 56px 1fr;
  align-content: space-between;
}

.route-entry .hero-copy h3 {
  font-size: 1.24rem;
  letter-spacing: -0.04em;
}

.route-entry .hero-copy p {
  max-width: 18rem;
}

.route-goal .screen-header,
.route-equipment .screen-header,
.route-feedback .screen-header,
.route-next-step .screen-header {
  max-width: 20rem;
}

.route-equipment .screen {
  gap: 12px;
}

.route-equipment .screen-header {
  gap: 8px;
}

.route-equipment .screen-header h2 {
  font-size: clamp(1.8rem, 5.6vw, 2.2rem);
  line-height: 0.96;
  letter-spacing: -0.05em;
}

.route-equipment .screen-header p {
  max-width: 18.5rem;
  font-size: 0.92rem;
}

.route-goal .card,
.route-feedback .feedback-card,
.route-next-step .action-card {
  min-height: 108px;
}

.route-equipment .card-tag {
  position: static;
  justify-self: end;
  align-self: start;
  margin-left: auto;
  min-height: 24px;
  padding: 0 9px;
}

.route-intake .screen {
  gap: 14px;
}

.route-prep .sub-card,
.route-recommendation .sub-card,
.route-session .sub-card {
  border-radius: 24px;
}

.route-prep .screen-header {
  max-width: 18rem;
}

.route-prep .screen {
  gap: 16px;
}

.route-feedback .stack,
.route-next-step .stack {
  gap: 14px;
}

.route-session .screen-header {
  gap: 8px;
}

.route-session .screen-header h2 {
  font-size: clamp(1.8rem, 6vw, 2.24rem);
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

  .equipment-grid {
    grid-template-columns: 1fr;
  }

  .compact-actions {
    grid-template-columns: 1fr;
  }

  .mirror-stage-media,
  .mirror-video.session,
  .mirror-empty.session {
    min-height: min(48dvh, 380px);
  }
}
`;

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
