/**
 * GmailProcessor — takes a raw email, calls Gemini, applies structured updates via SheetManager.
 */
class GmailProcessor {
  constructor(geminiClient, sheetManager, logsSheet) {
    this.gemini = geminiClient;
    this.sheet = sheetManager;
    this.logs = logsSheet;
  }

  processEmail(email, options = {}) {
    const { dryRun = false } = options;

    // Build rich text for Gemini
    let emailText = `Subject: ${email.subject}\nFrom: ${email.from}\nDate: ${email.date}\n`;
    if (email.attachments && email.attachments.length > 0) {
      emailText += `Attachments: ${email.attachments.join(", ")}\n`;
    }
    emailText += `\n--- BODY ---\n${email.body}`;

    // Provide current Program names so Gemini can match against existing rows.
    const knownPrograms = this.sheet.registry
      .getDataRange()
      .getValues()
      .slice(1)
      .map(function (r) {
        return r[COL.Program];
      })
      .filter(Boolean);

    let operations = [];
    try {
      operations = this.gemini.extractUpdates(emailText, knownPrograms);
    } catch (e) {
      Logger.logError(
        this.logs,
        email.messageId,
        "GEMINI_EXTRACTION_FAILED",
        e.toString(),
      );
      return { updatesApplied: 0, error: "gemini_failed" };
    }

    if (!operations || operations.length === 0) {
      // Still log that we looked at it
      this.sheet.logUpdate(
        email.messageId,
        email.subject,
        email.from,
        "",
        "no_relevant_update",
        null,
        null,
        0,
        "Gemini returned no operations or low relevance",
      );
      return { updatesApplied: 0 };
    }

    let applied = 0;
    for (const op of operations) {
      const program = op.program || op.programKey; // tolerate either field name
      if (!program || !op.fields) continue;

      if (dryRun) {
        console.log("DRY RUN operation:", op);
        this.sheet.logUpdate(
          email.messageId,
          email.subject,
          email.from,
          program,
          "dry_run_" + (op.action || "upsert"),
          null,
          op.fields,
          op.confidence,
          op.rationale,
        );
        applied++;
        continue;
      }

      try {
        const res = this.sheet.upsertRegistry(program, op.fields, {
          messageId: email.messageId,
          subject: email.subject,
          from: email.from,
          date: email.date,
        });
        applied += res.updatesApplied || 0;
      } catch (e) {
        this.sheet.logError(
          email.messageId,
          "UPSERT_FAILED",
          e.toString() + " | program=" + program,
        );
      }
    }

    return { updatesApplied: applied, operationsCount: operations.length };
  }
}
