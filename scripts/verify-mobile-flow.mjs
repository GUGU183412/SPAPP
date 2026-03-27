import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium, devices, webkit } from "playwright";

const baseUrl = process.env.STAGE2_BASE_URL || "http://127.0.0.1:4173/?asin=B0BXJLTRSH&src=qr";
const outputArgIndex = process.argv.indexOf("--output");
const outputPath =
  outputArgIndex >= 0 && process.argv[outputArgIndex + 1]
    ? path.resolve(process.cwd(), process.argv[outputArgIndex + 1])
    : null;

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function createPage(browserType, deviceName) {
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({
    ...devices[deviceName]
  });
  const page = await context.newPage();

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  return { browser, context, page };
}

async function resetSession(page) {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => window.localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
}

async function readEvents(page) {
  return page.evaluate(() => JSON.parse(window.localStorage.getItem("spapp_poc_events") || "[]"));
}

function summarize(events) {
  return events.map((event) => event.name);
}

async function verifyClosedLoop() {
  const { browser, page } = await createPage(webkit, "iPhone 13");

  try {
    await resetSession(page);
    await page.getByRole("button", { name: /start 3-step safety guide/i }).click();
    await page.getByRole("button", { name: /^next$/i }).click();
    await page.getByRole("button", { name: /open proof/i }).click();
    await page.getByRole("button", { name: /^next$/i }).click();
    await page.getByRole("button", { name: /done, let'?s start!/i }).click();
    await page.getByRole("button", { name: /no, still not solved/i }).click();
    await page.getByRole("button", { name: /it still slips/i }).click();
    await page.getByRole("button", { name: /submit and review/i }).click();

    await page.waitForTimeout(300);

    const events = await readEvents(page);
    const names = summarize(events);

    ensure(names.includes("pwa_entry"), "Closed loop missing pwa_entry");
    ensure(names.includes("tutorial_start"), "Closed loop missing tutorial_start");
    ensure(names.filter((name) => name === "step_complete").length === 3, "Closed loop missing step_complete events");
    ensure(names.includes("safety_trust_click"), "Closed loop missing safety_trust_click");
    ensure(names.includes("resolved_status"), "Closed loop missing resolved_status");
    ensure(names.includes("unresolved_reason_submit"), "Closed loop missing unresolved_reason_submit");

    const unresolvedEvent = events.find((event) => event.name === "unresolved_reason_submit");
    ensure(
      unresolvedEvent?.payload?.recommended_review === "step1",
      "Closed loop unresolved reason did not recommend step1"
    );

    return {
      scenario: "closed_loop_unresolved_recovery",
      browser: "webkit",
      device: "iPhone 13",
      status: "passed",
      eventCount: events.length,
      eventNames: names
    };
  } finally {
    await browser.close();
  }
}

async function verifyDropout() {
  const { browser, context, page } = await createPage(chromium, "Pixel 7");

  try {
    await resetSession(page);
    await page.getByRole("button", { name: /start 3-step safety guide/i }).click();
    await page.getByRole("button", { name: /^next$/i }).click();
    await page.waitForTimeout(200);
    await page.goto("about:blank", { waitUntil: "load" });

    const inspectPage = await context.newPage();
    await inspectPage.goto(baseUrl, { waitUntil: "networkidle" });
    const events = await readEvents(inspectPage);
    const names = summarize(events);

    ensure(names.includes("dropout_step"), "Dropout flow missing dropout_step");

    const dropoutEvent = events.find((event) => event.name === "dropout_step");
    ensure(dropoutEvent?.payload?.page === "step2", "Dropout flow did not capture step2 context");

    await inspectPage.close();

    return {
      scenario: "mid_tutorial_dropout",
      browser: "chromium",
      device: "Pixel 7",
      status: "passed",
      eventCount: events.length,
      eventNames: names,
      dropoutPayload: dropoutEvent?.payload || null
    };
  } finally {
    await browser.close();
  }
}

const result = {
  executedAt: new Date().toISOString(),
  baseUrl,
  checks: []
};

try {
  result.checks.push(await verifyClosedLoop());
  result.checks.push(await verifyDropout());

  const output = JSON.stringify(result, null, 2);
  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, output);
  }
  console.log(output);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
}
