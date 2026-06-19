const { chromium } = require("playwright");
(async () => {
  const consoleErrs = [];
  const pageErrs = [];
  
  try {
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const page = await browser.newPage();
    
    page.on("console", msg => { if (msg.type() === "error") consoleErrs.push(msg.text()); });
    page.on("pageerror", err => pageErrs.push(err.message));
    
    // Test 1: Load homepage
    console.log("=== Test 1: Page Load ===");
    await page.goto("http://localhost:3000/", { timeout: 15000, waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    console.log("URL:", page.url());
    console.log("Console errors:", consoleErrs.length === 0 ? "NONE" : JSON.stringify(consoleErrs));
    console.log("Page errors:", pageErrs.length === 0 ? "NONE" : JSON.stringify(pageErrs));
    
    // Check for boot sequence or main content
    let bodyText = await page.textContent("body");
    let hasBoot = bodyText.includes("Initializing") || bodyText.includes("NEXUS AI");
    let hasCrash = bodyText.includes("error") || bodyText.includes("Error");
    console.log("Boot sequence visible:", hasBoot);
    console.log("Crash visible:", hasCrash);
    
    // Test 2: Click Enter to trigger transition
    console.log("\n=== Test 2: Click Enter ===");
    const enterBtn = await page.$("button");
    if (enterBtn) {
      await enterBtn.click();
      console.log("Clicked Enter");
      await page.waitForTimeout(2000);
      
      // Check for new console errors
      console.log("Console errors after click:", consoleErrs.length === 0 ? "NONE" : JSON.stringify(consoleErrs));
      
      // Check if we transitioned to main content
      bodyText = await page.textContent("body");
      let hasMainContent = bodyText.includes("Dashboard") || bodyText.includes("header");
      console.log("Transitioned to main content:", hasMainContent);
    } else {
      console.log("No Enter button found (might already be past boot)");
    }
    
    // Test 3: Check localStorage for boot_completed
    let bootCompleted = await page.evaluate(() => localStorage.getItem("nexus_boot_completed"));
    console.log("\nboot_completed:", bootCompleted);
    
    console.log("\n=== FINAL ===");
    console.log("Test completed successfully");
    console.log("All console errors:", consoleErrs);
    
    await browser.close();
  } catch(e) {
    console.log("ERROR:", e.message ? e.message.substring(0, 200) : e);
  }
})();
