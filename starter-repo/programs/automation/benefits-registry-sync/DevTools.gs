/**
 * Dev / admin helpers. Run these from the Apps Script editor while viewing
 * the Sheet this script is bound to.
 */

function clearAllProcessedState() {
  const props = PropertiesService.getScriptProperties();
  props.deleteAllProperties();
  console.log(
    "Cleared all script properties (including LAST_SYNC_RUN and GEMINI_API_KEY). You will need to re-add GEMINI_API_KEY before the next sync.",
  );
}

function showCurrentConfig() {
  const props = PropertiesService.getScriptProperties();
  const stored = props.getProperties();
  const safe = Object.assign({}, stored);
  if (safe.GEMINI_API_KEY)
    safe.GEMINI_API_KEY = "(set, " + safe.GEMINI_API_KEY.length + " chars)";
  console.log("Script Properties:", safe);
  console.log("Config:", CONFIG);
  console.log("Spreadsheet:", SpreadsheetApp.getActive().getName());
}

function reprocessMessageById(messageId) {
  // For debugging a specific email. You must provide a valid messageId from your account.
  if (!messageId) {
    console.log('Usage: reprocessMessageById("the-message-id")');
    return;
  }
  const msg = GmailApp.getMessageById(messageId);
  if (!msg) {
    console.log("Message not found or no access");
    return;
  }

  const email = {
    messageId: messageId,
    subject: msg.getSubject(),
    from: msg.getFrom(),
    date: msg.getDate().toISOString(),
    body: (
      msg.getPlainBody() || msg.getBody().replace(/<[^>]+>/g, " ")
    ).substring(0, 15000),
    attachments: msg.getAttachments().map((a) => a.getName()),
  };

  const ss = SpreadsheetApp.getActive();
  const registry =
    ss.getSheetByName(CONFIG.REGISTRY_TAB) ||
    ss.insertSheet(CONFIG.REGISTRY_TAB);
  const logs =
    ss.getSheetByName(CONFIG.LOGS_TAB) || ss.insertSheet(CONFIG.LOGS_TAB);
  const apps =
    ss.getSheetByName(CONFIG.APPLICATIONS_TAB) ||
    ss.insertSheet(CONFIG.APPLICATIONS_TAB);

  const gemini = new GeminiClient();
  const sm = new SheetManager(registry, logs, apps);
  const proc = new GmailProcessor(gemini, sm, logs);

  const result = proc.processEmail(email, { force: true, dryRun: false });
  console.log("Reprocess result:", result);
}
