/**
 * Benefits Registry Auto-Updater — self-serve kit (v1.1)
 *
 * Bind this script to your own Google Sheet (Extensions > Apps Script, from
 * inside that Sheet) and it will:
 *   1. Search your Gmail for benefit/credit-related emails (a label or query
 *      you control — see CONFIG.GMAIL_SEARCH_QUERY below).
 *   2. Send each candidate email to the Gemini API (your own free API key)
 *      for structured extraction.
 *   3. Idempotently upsert the results into a "Registry" tab in your Sheet,
 *      matched by program name, with an audit trail in a "Logs" tab.
 *
 * This runs entirely inside YOUR Google account. The only outbound call is to
 * Google's Gemini API, authenticated with a key you control. Nothing is sent
 * to Jami Studio or any third party.
 *
 * Full setup guide: see README.md in this folder, or the detailed walkthrough
 * at docs/product/automation-kit-guide.md in the Benefit Hunter repository.
 */

/**
 * ============================================================================
 * CONFIGURATION — edit these to taste. None of these values are secrets.
 * Secrets (your Gemini API key) live only in Script Properties — see README.
 * ============================================================================
 */
const CONFIG = {
  // Tab names inside the spreadsheet this script is bound to. Created
  // automatically on first run if they don't exist.
  REGISTRY_TAB: "Registry",
  LOGS_TAB: "Logs",
  APPLICATIONS_TAB: "Applications",
  DASHBOARD_TAB: "Dashboard",

  // Gmail search used to find candidate emails. The default expects a Gmail
  // label named "benefit-programs" that you apply (manually or via a Gmail
  // filter) to relevant emails. Change this to any search you prefer, e.g.
  // 'newer_than:14d (credits OR "startup program" OR accepted)'.
  GMAIL_SEARCH_QUERY: "label:benefit-programs",

  // Gemini model name. Use any model available to your API key — see
  // https://ai.google.dev/gemini-api/docs/models for current names.
  GEMINI_MODEL: "gemini-flash-latest",

  // Optional: restrict runs to specific hours/days (script's own time zone,
  // set in appsscript.json). Leave empty to run every time the hourly
  // trigger fires (the recommended default — cheap and simple).
  // Example — weekdays only, every 2 hours 6am-8pm:
  //   RUN_WINDOWS: [{ days: [1, 2, 3, 4, 5], hours: [6, 8, 10, 12, 14, 16, 18, 20] }]
  RUN_WINDOWS: [],

  // Optional: email address to notify on hard failures. Leave blank to use
  // the Google account that installed the script.
  ALERT_EMAIL: "",
};

// ---------------------------------------------------------------------------

function getAlertEmail() {
  return CONFIG.ALERT_EMAIL || Session.getEffectiveUser().getEmail();
}

// Schedule guard. With CONFIG.RUN_WINDOWS empty (the default), always runs.
function shouldRunNow() {
  if (!CONFIG.RUN_WINDOWS || CONFIG.RUN_WINDOWS.length === 0) return true;
  const now = new Date();
  const day = now.getDay(); // 0=Sun ... 6=Sat
  const hour = now.getHours();
  return CONFIG.RUN_WINDOWS.some(function (w) {
    const dayOk = !w.days || w.days.indexOf(day) !== -1;
    const hourOk = !w.hours || w.hours.indexOf(hour) !== -1;
    return dayOk && hourOk;
  });
}

// This script is bound to the Sheet it's installed in — no Sheet ID needed.
function getSheet() {
  return SpreadsheetApp.getActive();
}

function getRegistrySheet() {
  const ss = getSheet();
  let sheet = ss.getSheetByName(CONFIG.REGISTRY_TAB);
  if (!sheet) sheet = ss.insertSheet(CONFIG.REGISTRY_TAB);
  return sheet;
}

function getLogsSheet() {
  const ss = getSheet();
  let sheet = ss.getSheetByName(CONFIG.LOGS_TAB);
  if (!sheet) sheet = ss.insertSheet(CONFIG.LOGS_TAB);
  return sheet;
}

function getApplicationsSheet() {
  const ss = getSheet();
  let sheet = ss.getSheetByName(CONFIG.APPLICATIONS_TAB);
  if (!sheet) sheet = ss.insertSheet(CONFIG.APPLICATIONS_TAB);
  return sheet;
}

function syncRegistryFromEmail(options = {}) {
  const force = options.force === true;
  const dryRun = options.dryRun === true;

  if (!force && !shouldRunNow()) {
    console.log(
      "Outside configured RUN_WINDOWS. Skipping. Use force:true for a manual/test run.",
    );
    return { skipped: true, reason: "schedule" };
  }

  const registry = getRegistrySheet();
  const logs = getLogsSheet();

  const props = PropertiesService.getScriptProperties();
  const lastRun = props.getProperty("LAST_SYNC_RUN") || "never";
  console.log("Last run:", lastRun);

  let threads;
  try {
    threads = GmailApp.search(CONFIG.GMAIL_SEARCH_QUERY, 0, 100);
  } catch (e) {
    Logger.logError(logs, null, "GMAIL_SEARCH_FAILED", e.toString());
    MailApp.sendEmail(
      getAlertEmail(),
      "Registry Sync: Gmail search failed",
      e.toString(),
    );
    return { error: "gmail_search_failed" };
  }

  console.log("Found threads to consider:", threads.length);

  const gemini = new GeminiClient();
  const sheetManager = new SheetManager(registry, logs, getApplicationsSheet());
  const processor = new GmailProcessor(gemini, sheetManager, logs);

  let processed = 0;
  let updates = 0;
  const messageIdsProcessed = [];

  for (const thread of threads) {
    const messages = thread.getMessages();
    for (const msg of messages) {
      const msgId = msg.getId();
      // Simple dedup: skip messages already logged, unless forcing.
      if (sheetManager.isMessageAlreadyProcessed(msgId) && !force) {
        continue;
      }

      const subject = msg.getSubject();
      const from = msg.getFrom();
      const date = msg.getDate();
      const body = msg.getPlainBody() || msg.getBody().replace(/<[^>]+>/g, " "); // crude html strip
      const attachments = msg.getAttachments().map((a) => a.getName());

      console.log("Processing:", subject, "from", from);

      try {
        const result = processor.processEmail(
          {
            messageId: msgId,
            subject,
            from,
            date: date.toISOString(),
            body: body.substring(0, 15000), // safe limit
            attachments,
          },
          { dryRun },
        );

        processed++;
        if (result && result.updatesApplied) {
          updates += result.updatesApplied;
        }
        messageIdsProcessed.push(msgId);

        // Label as processed. Requires the gmail.modify scope (see appsscript.json).
        try {
          thread.addLabel(GmailApp.createLabel("registry-processed"));
        } catch (labelErr) {
          // Non-fatal — sync still works via the Logs-based dedup above.
          console.log("Could not add label (non-fatal):", labelErr.toString());
        }
      } catch (err) {
        Logger.logError(
          logs,
          msgId,
          "EMAIL_PROCESS_FAILED",
          err.toString() + " | " + subject,
        );
      }
    }
  }

  // Re-assert the canonical look (typed columns + Status colors) after any writes.
  // Table-safe: never deletes columns, dropdowns, or a native Table if you add one.
  try {
    sheetManager.applyCanonicalFormat();
  } catch (fmtErr) {
    Logger.logError(logs, null, "FORMAT_REAPPLY_FAILED", fmtErr.toString());
  }

  props.setProperty("LAST_SYNC_RUN", new Date().toISOString());
  props.setProperty("LAST_PROCESSED_COUNT", processed.toString());

  sheetManager.updateDashboard({
    lastSync: new Date().toISOString(),
    threadsConsidered: threads.length,
    messagesProcessed: processed,
    updatesApplied: updates,
  });

  const summary = { processed, updates, messageIdsProcessed, dryRun };
  console.log("Sync complete:", summary);

  return summary;
}

/**
 * One-time setup: run this once from the Apps Script editor (while viewing
 * the Sheet you bound this script to). Creates the trigger that drives
 * everything afterward.
 */
function installTriggers() {
  // Clean up existing triggers for this project to avoid duplicates.
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach((t) => {
    if (
      t.getHandlerFunction() === "syncRegistryFromEmail" ||
      t.getHandlerFunction() === "hourlyRegistryCheck"
    ) {
      ScriptApp.deleteTrigger(t);
    }
  });

  // A single hourly trigger + the shouldRunNow() guard is the simplest
  // reliable way to hit any custom schedule without many separate triggers.
  ScriptApp.newTrigger("hourlyRegistryCheck")
    .timeBased()
    .everyHours(1)
    .create();

  console.log("Installed hourly check trigger.");
  return "Triggers installed. Run testSyncNow() once to verify end-to-end.";
}

function hourlyRegistryCheck() {
  // Called every hour by the trigger. The RUN_WINDOWS guard (if configured)
  // decides whether to do real work.
  return syncRegistryFromEmail();
}

/** Quick manual test entrypoint (run from the editor) */
function testSyncNow() {
  return syncRegistryFromEmail({ force: true });
}

/** Dry run for safety / debugging — no writes */
function dryRunSync() {
  return syncRegistryFromEmail({ force: true, dryRun: true });
}

/** Installs a menu in the bound Sheet for convenience */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Registry Sync")
    .addItem("Run sync now (force)", "testSyncNow")
    .addItem("Dry run (no writes)", "dryRunSync")
    .addItem("Re-apply canonical format", "reapplyCanonicalFormat")
    .addSeparator()
    .addItem("Re-install triggers", "installTriggers")
    .addToUi();
}

/** Manually re-apply the canonical look (typed columns + Status colors). */
function reapplyCanonicalFormat() {
  const sm = new SheetManager(
    getRegistrySheet(),
    getLogsSheet(),
    getApplicationsSheet(),
  );
  sm.applyCanonicalFormat();
  return "Canonical format re-applied.";
}
