const puppeteer = require("puppeteer");
const lighthouse = require("lighthouse").default;

async function runLighthouse(url) {
  let browser;

  try {
    console.log("Starting Lighthouse:", url);

    browser = await puppeteer.launch({
      headless: true,

      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-background-networking",
        "--disable-extensions",
        "--disable-sync",
        "--no-first-run",
        "--no-default-browser-check",
        "--remote-debugging-port=0"
      ]
    });

    const wsEndpoint = browser.wsEndpoint();

    const port = Number(
      new URL(wsEndpoint).port
    );

    console.log("Chrome debugging port:", port);

    const result = await lighthouse(url, {
      port,
      output: "json",
      logLevel: "error",

      onlyCategories: [
        "performance",
        "accessibility",
        "best-practices",
        "seo"
      ],

      settings: {
        maxWaitForLoad: 45000,
        maxWaitForFcp: 30000
      }
    });

    if (!result || !result.lhr) {
      throw new Error("Lighthouse did not return a report.");
    }

    const lhr = result.lhr;

    const performance =
      lhr.categories.performance?.score ?? 0;

    const accessibility =
      lhr.categories.accessibility?.score ?? 0;

    const bestPractices =
      lhr.categories["best-practices"]?.score ?? 0;

    const seo =
      lhr.categories.seo?.score ?? 0;

    const report = {
      performance: Math.round(performance * 100),
      accessibility: Math.round(accessibility * 100),
      bestPractices: Math.round(bestPractices * 100),
      seo: Math.round(seo * 100)
    };

    console.log("Lighthouse result:", report);

    return report;

  } catch (error) {
    console.error("LIGHTHOUSE ERROR:", error.message);
    throw error;

  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error(
          "Chrome close error:",
          closeError.message
        );
      }
    }
  }
}

module.exports = runLighthouse;