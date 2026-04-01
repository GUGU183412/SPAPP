import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium, devices } from "playwright";

const baseUrl = process.env.STAGE3_BASE_URL || "http://127.0.0.1:4173/?asin=B0BXJLTRSH&src=qr";
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

async function waitForHash(page, hash) {
  await page.waitForFunction((expected) => window.location.hash === expected, hash);
}

async function resetApp(page, url = baseUrl) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => window.localStorage.clear());
  await page.goto(url, { waitUntil: "networkidle" });
}

async function clickPrimaryFooter(page) {
  await page.locator(".footer-btn").click();
}

async function openControlCenter(page) {
  await page.getByTestId("control-center-toggle").click();
  await page.getByTestId("control-center").waitFor();
}

async function verifyStandardFlow() {
  const { browser, page } = await createPage("iPhone 13");

  try {
    await resetApp(page);
    await waitForHash(page, "#entry");

    await clickPrimaryFooter(page);
    await waitForHash(page, "#goal");
    await page.getByRole("button", { name: /久坐舒缓/i }).click();
    await waitForHash(page, "#equipment");
    await page.locator(".equipment-card.selected").waitFor();

    await clickPrimaryFooter(page);
    await waitForHash(page, "#intake");
    await page.getByRole("button", { name: /12 分钟/i }).click();
    await page.getByRole("button", { name: /标准强度/i }).click();
    await page.getByRole("button", { name: /第一次尝试/i }).click();
    await page.getByRole("button", { name: /上背 \/ 胸椎发紧/i }).click();
    await waitForHash(page, "#recommendation");
    await page.getByTestId("edit-equipment").click();
    await waitForHash(page, "#equipment");
    await page.locator(".equipment-card.selected").waitFor();
    await page.evaluate(() => {
      window.location.hash = "#recommendation";
    });
    await waitForHash(page, "#recommendation");

    await clickPrimaryFooter(page);
    await waitForHash(page, "#prep");
    await openControlCenter(page);
    await page.getByTestId("control-home").click();
    await waitForHash(page, "#entry");

    await clickPrimaryFooter(page);
    await waitForHash(page, "#goal");
    const selectedGoal = page.locator(".goal-card.selected strong");
    await selectedGoal.waitFor();
    ensure((await selectedGoal.textContent())?.includes("久坐舒缓"), "Home return did not preserve selected goal draft");

    const events = await page.evaluate(() => JSON.parse(window.localStorage.getItem("spapp_stage3_events") || "[]"));
    const eventNames = events.map((event) => event.name);
    ensure(eventNames.includes("goal_select"), "Expected goal_select event");
    ensure(eventNames.includes("equipment_select"), "Expected equipment_select event");
    ensure(eventNames.includes("intake_complete"), "Expected intake_complete event");
    ensure(eventNames.includes("plan_accept"), "Expected plan_accept event");

    return {
      scenario: "standard_flow_with_edit_and_home_return",
      status: "passed",
      route: await page.evaluate(() => window.location.hash),
      selectedGoal: await selectedGoal.textContent(),
      eventNames
    };
  } finally {
    await browser.close();
  }
}

async function verifyPreviewAndLocale() {
  const { browser, page } = await createPage("Pixel 7");

  try {
    const previewUrl = `${baseUrl}&preview=1&lang=en#recommendation`;
    await resetApp(page, previewUrl);
    await waitForHash(page, "#recommendation");

    await page.getByText(/Yoga Ball Posture Relief Starter/i).waitFor();
    await openControlCenter(page);
    await page.getByTestId("preview-route-session").click();
    await waitForHash(page, "#session");
    await page.getByText(/Session progress/i).waitFor();

    await openControlCenter(page);
    await page.getByTestId("locale-zh").click();
    await waitForHash(page, "#session");
    await page.getByText(/本次训练进度/).waitFor();

    const locale = await page.evaluate(() => window.localStorage.getItem("spapp_stage3_locale"));
    ensure(locale === "zh-CN", "Locale switch did not persist zh-CN");

    await openControlCenter(page);
    await page.getByTestId("control-home").click();
    await waitForHash(page, "#entry");

    return {
      scenario: "preview_mode_and_locale_switch",
      status: "passed",
      finalHash: await page.evaluate(() => window.location.hash),
      persistedLocale: locale
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
  result.checks.push(await verifyStandardFlow());
  result.checks.push(await verifyPreviewAndLocale());

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
