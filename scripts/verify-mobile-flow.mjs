import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium, devices } from "playwright";

const baseUrl = process.env.STAGE2_BASE_URL || "http://127.0.0.1:4173/?asin=B0BXJLTRSH&src=qr";
const screenshotDir = process.env.STAGE2_SCREENSHOT_DIR
  ? path.resolve(process.cwd(), process.env.STAGE2_SCREENSHOT_DIR)
  : null;
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

async function createPage(deviceName) {
  const browser = await chromium.launch({ headless: true });
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
  await waitForHash(page, "#landing");
}

async function waitForHash(page, hash) {
  await page.waitForFunction((expected) => window.location.hash === expected, hash);
}

async function getCurrentFrame(page) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const frame = page.frames().find((candidate) => candidate !== page.mainFrame());
    if (frame) {
      try {
        await frame.waitForLoadState("domcontentloaded", { timeout: 250 });
        const hasBody = await frame.evaluate(() => Boolean(document.body));
        if (hasBody) {
          return frame;
        }
      } catch {
        // Keep polling until the iframe swaps and stabilizes.
      }
    }

    await page.waitForTimeout(100);
  }

  throw new Error("Unable to resolve the active UI iframe");
}

async function clickByText(page, targetText) {
  const frame = await getCurrentFrame(page);
  const clicked = await frame.evaluate((query) => {
    const normalizedQuery = query.toLowerCase();
    const candidates = [
      ...document.querySelectorAll('button, div[class*="cursor-pointer"], label')
    ];
    const target = candidates.find((element) =>
      (element.textContent || "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
        .includes(normalizedQuery)
    );

    if (!target) {
      return null;
    }

    target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return (target.textContent || "").replace(/\s+/g, " ").trim();
  }, targetText);

  ensure(Boolean(clicked), `Unable to find clickable text: ${targetText}`);
  return clicked;
}

async function capture(page, name) {
  if (!screenshotDir) return null;
  const frame = await getCurrentFrame(page);
  await frame.waitForFunction(() => (document.body?.innerText || "").trim().length > 20);
  await page.waitForTimeout(250);
  fs.mkdirSync(screenshotDir, { recursive: true });
  const filePath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

async function readEvents(page) {
  return page.evaluate(() => JSON.parse(window.localStorage.getItem("spapp_poc_events") || "[]"));
}

function summarize(events) {
  return events.map((event) => event.name);
}

async function verifyClosedLoop() {
  const { browser, page } = await createPage("iPhone 13");
  const screenshots = {};

  try {
    await resetSession(page);
    screenshots.landing = await capture(page, "landing-restored-check");

    await clickByText(page, "3-step safety installation guide");
    await waitForHash(page, "#step1");
    screenshots.step1 = await capture(page, "step1-restored-check");

    await clickByText(page, "next step");
    await waitForHash(page, "#step2");
    screenshots.step2 = await capture(page, "step2-restored-check");

    const step2Frame = await getCurrentFrame(page);
    await step2Frame.evaluate(() => {
      document
        .querySelector("main section .relative.overflow-hidden")
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });

    await clickByText(page, "next");
    await waitForHash(page, "#step3");
    screenshots.step3 = await capture(page, "step3-restored-check");

    await clickByText(page, "done");
    await waitForHash(page, "#feedback");
    screenshots.feedback = await capture(page, "feedback-restored-check");

    await clickByText(page, "no, still slip");
    await waitForHash(page, "#unresolved");
    screenshots.unresolved = await capture(page, "unresolved-restored-check");

    await clickByText(page, "it still slips");
    const unresolvedFrame = await getCurrentFrame(page);
    await unresolvedFrame.locator("textarea").fill("Need another lock check");
    await clickByText(page, "submit and review");
    await waitForHash(page, "#step1");

    const events = await readEvents(page);
    const names = summarize(events);

    ensure(names.includes("pwa_entry"), "Closed loop missing pwa_entry");
    ensure(names.includes("tutorial_start"), "Closed loop missing tutorial_start");
    ensure(
      names.filter((name) => name === "step_complete").length === 3,
      "Closed loop missing step_complete events"
    );
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
      browser: "chromium",
      device: "iPhone 13",
      status: "passed",
      eventCount: events.length,
      eventNames: names,
      screenshots
    };
  } finally {
    await browser.close();
  }
}

async function verifyDropout() {
  const { browser, context, page } = await createPage("Pixel 7");

  try {
    await resetSession(page);
    await clickByText(page, "3-step safety installation guide");
    await waitForHash(page, "#step1");
    await clickByText(page, "next step");
    await waitForHash(page, "#step2");
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
