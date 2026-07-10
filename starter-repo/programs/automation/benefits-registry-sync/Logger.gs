/**
 * Simple logger helpers. Most logging goes through SheetManager.
 * This is for console + critical email alerts.
 */
const Logger = {
  logError(logsSheet, messageId, type, message) {
    try {
      if (logsSheet && typeof logsSheet.appendRow === "function") {
        logsSheet.appendRow([
          new Date().toISOString(),
          messageId || "",
          "",
          "",
          "",
          "ERROR",
          "",
          "",
          "",
          type,
          message,
        ]);
      }
    } catch (e) {
      console.error("Failed to write to logs sheet", e);
    }
    console.error(type, message);
  },
};
