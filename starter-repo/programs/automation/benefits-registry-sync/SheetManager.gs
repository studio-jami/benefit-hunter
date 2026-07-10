/**
 * SheetManager — handles all reads/writes to Registry, Logs, Applications,
 * Dashboard tabs AND owns the canonical layout + formatting of the Registry
 * tab.
 *
 * CANONICAL REGISTRY SHAPE: 11 columns, in this exact order. This is a
 * recommended default — edit REGISTRY_HEADERS and the matching logic below
 * if you want a different shape, but keep GeminiClient.gs's prompt in sync.
 *
 * applyCanonicalFormat() is the single source of truth for the look and is
 * called after every sync run so the sheet always returns to this layout.
 */

// ---- Canonical schema (edit here + in GeminiClient.gs's prompt together) ----
const REGISTRY_HEADERS = [
  "Tier",
  "Program",
  "Status",
  "Impact",
  "Value",
  "Expiration",
  "LastSourced",
  "Referral",
  "Doc",
  "EvidenceDriveLink",
  "Notes",
];
const COL = {};
REGISTRY_HEADERS.forEach((h, i) => {
  COL[h] = i;
}); // 0-based

// ---- Canonical format spec ----
const FMT = {
  PURPLE: "#5B3F86",
  WHITE: "#FFFFFF",
  BAND2: "#F6F8F9",
  GREEN: "#99D899",
  YELLOW: "#FFF299",
  RED: "#F2B2B2",
  HEADER_SIZE: 10,
  DATA_SIZE: 9,
  FONT: "Roboto",
  WIDTHS: [93, 248, 151, 84, 230, 179, 233, 300, 300, 233, 300], // A..K px
  STATUS_GREEN: ["active", "accepted", "unlocked", "credited", "approved"],
  STATUS_YELLOW: ["applied", "ready", "in progress", "target", "candidate"],
  STATUS_RED: ["denied"],
};

class SheetManager {
  constructor(registrySheet, logsSheet, applicationsSheet) {
    this.registry = registrySheet;
    this.logs = logsSheet;
    this.applications = applicationsSheet;
    this._ensureHeaders();
  }

  _ensureHeaders() {
    this._ensureRow1(this.registry, REGISTRY_HEADERS);
    this._ensureRow1(this.logs, [
      "Timestamp",
      "MessageId",
      "Subject",
      "From",
      "Program",
      "Action",
      "Before",
      "After",
      "Confidence",
      "Rationale",
      "Error",
    ]);
    this._ensureRow1(this.applications, [
      "Program",
      "SubmittedDate",
      "To",
      "ReferralCodeUsed",
      "Status",
      "ApplicationDoc",
      "Notes",
    ]);
  }

  // Set/repair header row WITHOUT inserting rows (never push data down, never widen schema).
  _ensureRow1(sheet, headers) {
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      return;
    }
    const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    let mismatch = false;
    for (let i = 0; i < headers.length; i++) {
      if ((current[i] || "").toString().trim() !== headers[i]) {
        mismatch = true;
        break;
      }
    }
    if (mismatch) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }
  }

  // Normalized match key derived from the Program display name. Used only
  // for matching incoming updates to existing rows; never stored.
  static normalizeKey(name) {
    let s = (name || "").toString().toLowerCase().trim();
    s = s.replace(/\(.*?\)/g, " "); // drop parentheticals e.g. "(via referral)"
    s = s.replace(
      /\b(for startups?|startup program|startup|scholarship|accelerator|grants?|program|oss)\b/g,
      " ",
    );
    s = s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return s;
  }

  static shouldUpdateStatus(oldStatus, newStatus) {
    if (!oldStatus) return true;
    if (!newStatus) return false;

    const sOld = oldStatus.toString().toLowerCase().trim();
    const sNew = newStatus.toString().toLowerCase().trim();
    if (sOld === sNew) return true;

    // Define success/terminal states
    const successStates = [
      "active",
      "accepted",
      "unlocked",
      "credited",
      "approved",
    ];
    // Intermediate/pre-approval states
    const preStates = [
      "applied",
      "in progress",
      "ready",
      "target",
      "candidate",
    ];

    // If already in a success/terminal state, do not allow reverting to a pre-approval/lower state
    if (successStates.indexOf(sOld) !== -1) {
      if (preStates.indexOf(sNew) !== -1) {
        return false;
      }
    }
    return true;
  }

  // Map of normalizedProgram -> 1-based row index (data rows start at 2)
  getProgramRowMap() {
    const map = {};
    const data = this.registry.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const key = SheetManager.normalizeKey(data[i][COL.Program]);
      if (key) map[key] = i + 1;
    }
    return map;
  }

  isMessageAlreadyProcessed(messageId) {
    if (!messageId) return false;
    const data = this.logs.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === messageId) return true; // column B = MessageId
    }
    return false;
  }

  upsertRegistry(program, fields, sourceInfo) {
    const map = this.getProgramRowMap();
    const key = SheetManager.normalizeKey(program || fields.Program);
    let row = map[key];

    const now = new Date().toISOString();
    const before = row ? this._getRowAsObject(this.registry, row) : null;
    const newRow = this._buildRow(program, fields, sourceInfo, now);

    if (row) {
      // Update in place; only overwrite cells where this update actually has a value.
      const cur = this.registry
        .getRange(row, 1, 1, REGISTRY_HEADERS.length)
        .getValues()[0];
      const oldStatus = cur[COL.Status];
      for (let c = 0; c < REGISTRY_HEADERS.length; c++) {
        if (newRow[c] !== "" && newRow[c] != null) {
          if (c === COL.Status) {
            if (SheetManager.shouldUpdateStatus(oldStatus, newRow[c])) {
              cur[c] = newRow[c];
            } else {
              console.log(
                "Blocking status downgrade for " +
                  program +
                  ": " +
                  oldStatus +
                  " -> " +
                  newRow[c],
              );
            }
          } else {
            cur[c] = newRow[c];
          }
        }
      }
      this.registry.getRange(row, 1, 1, cur.length).setValues([cur]);
    } else {
      this.registry.appendRow(newRow);
      row = this.registry.getLastRow();
    }

    const after = this._getRowAsObject(this.registry, row);
    this.logUpdate(
      sourceInfo.messageId,
      sourceInfo.subject,
      sourceInfo.from,
      fields.Program || program,
      "upsert",
      before,
      after,
      fields.confidence || 0.8,
      fields.rationale || "",
    );
    return { row, updatesApplied: 1 };
  }

  // Build a row in canonical 11-column order from Gemini fields.
  _buildRow(program, fields, sourceInfo, nowIso) {
    const row = new Array(REGISTRY_HEADERS.length).fill("");
    row[COL.Tier] = fields.Tier || "";
    row[COL.Program] = fields.Program || program || "";
    row[COL.Status] = fields.Status || "candidate";
    row[COL.Impact] = fields.Impact || "";
    // Value is a NUMBER column (USD). Store a real number when we have one; never invent.
    row[COL.Value] = this._toNumber(fields.Value);
    // Expiration is a DATE column. Store a real Date for ISO inputs; blank otherwise.
    row[COL.Expiration] = this._toDate(fields.Expiration);
    // LastSourced: "YYYY-MM-DD · source"
    row[COL.LastSourced] =
      fields.LastSourced ||
      this._composeLastSourced(fields, sourceInfo, nowIso);
    row[COL.Referral] = fields.Referral || "";
    row[COL.Doc] = fields.Doc || "";
    row[COL.EvidenceDriveLink] = fields.EvidenceDriveLink || "";
    row[COL.Notes] = fields.Notes || "";
    return row;
  }

  _composeLastSourced(fields, sourceInfo, nowIso) {
    const date = (
      fields.LastSourcedDate ||
      (sourceInfo && sourceInfo.date) ||
      nowIso
    )
      .toString()
      .substring(0, 10);
    const src =
      (sourceInfo && (sourceInfo.from || sourceInfo.subject)) || "email";
    return date + " · " + src;
  }

  // Coerce to a real number (USD). Strips $ and commas. Returns '' when not a clean number (never guesses).
  _toNumber(v) {
    if (v === "" || v == null) return "";
    if (typeof v === "number") return v;
    const s = v.toString().replace(/[$,\s]/g, "");
    return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : "";
  }

  // Coerce ISO YYYY-MM-DD to a real Date (so the DATE column stays typed). Blank otherwise.
  _toDate(v) {
    if (v instanceof Date) return v;
    if (!v) return "";
    const m = v.toString().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : "";
  }

  _getRowAsObject(sheet, rowNum) {
    const headers = sheet
      .getRange(1, 1, 1, REGISTRY_HEADERS.length)
      .getValues()[0];
    const values = sheet.getRange(rowNum, 1, 1, headers.length).getValues()[0];
    const obj = {};
    headers.forEach(function (h, i) {
      obj[h] = values[i];
    });
    return obj;
  }

  logUpdate(
    messageId,
    subject,
    from,
    program,
    action,
    before,
    after,
    confidence,
    rationale,
    error,
  ) {
    this.logs.appendRow([
      new Date().toISOString(),
      messageId || "",
      subject || "",
      from || "",
      program || "",
      action || "",
      before ? JSON.stringify(before).substring(0, 5000) : "",
      after ? JSON.stringify(after).substring(0, 5000) : "",
      confidence || "",
      rationale || "",
      error || "",
    ]);
  }

  logError(messageId, errorType, message) {
    this.logs.appendRow([
      new Date().toISOString(),
      messageId || "",
      "",
      "",
      "",
      "ERROR",
      "",
      "",
      "",
      errorType,
      message,
    ]);
  }

  updateDashboard(stats) {
    const ss = SpreadsheetApp.getActive();
    const dash =
      ss.getSheetByName(CONFIG.DASHBOARD_TAB) ||
      ss.insertSheet(CONFIG.DASHBOARD_TAB);
    dash.clear();
    dash.appendRow(["Last Synced", stats.lastSync]);
    dash.appendRow(["Messages Processed (this run)", stats.messagesProcessed]);
    dash.appendRow(["Updates Applied (this run)", stats.updatesApplied]);
    dash.appendRow(["Threads Considered", stats.threadsConsidered]);
    dash.appendRow(["Spreadsheet", ss.getName()]);
  }

  /**
   * Re-apply the canonical look to the Registry tab AFTER data writes.
   * Table-safe: if you convert Registry to a native Table with Tier/Status
   * dropdown columns, this method deliberately does NOT delete columns, does
   * NOT add manual banding, and does NOT touch data validation — so the
   * Table and its dropdowns are never destroyed. It only enforces: freeze,
   * fonts/alignment, the Value (currency) and Expiration (date) number
   * formats, column widths, and the Status color rules. Idempotent.
   */
  applyCanonicalFormat() {
    const sheet = this.registry;
    const nCols = REGISTRY_HEADERS.length;
    const lastRow = Math.max(2, sheet.getLastRow());
    const nData = lastRow - 1;
    const CLIP = SpreadsheetApp.WrapStrategy.CLIP;

    sheet.setFrozenRows(1);

    sheet
      .getRange(1, 1, 1, nCols)
      .setFontFamily(FMT.FONT)
      .setFontSize(FMT.HEADER_SIZE)
      .setFontWeight("bold")
      .setVerticalAlignment("middle")
      .setWrapStrategy(CLIP);

    if (nData > 0) {
      sheet
        .getRange(2, 1, nData, nCols)
        .setFontFamily(FMT.FONT)
        .setFontSize(FMT.DATA_SIZE)
        .setVerticalAlignment("middle")
        .setWrapStrategy(CLIP);
      // Typed columns: Value = currency number, Expiration = date.
      sheet.getRange(2, COL.Value + 1, nData, 1).setNumberFormat('"$"#,##0');
      sheet
        .getRange(2, COL.Expiration + 1, nData, 1)
        .setNumberFormat("yyyy-mm-dd");
    }

    for (let i = 0; i < FMT.WIDTHS.length && i < nCols; i++)
      sheet.setColumnWidth(i + 1, FMT.WIDTHS[i]);

    // Status color rules (dedupe: replace ALL conditional rules with the canonical set).
    const statusRange = sheet.getRange(
      2,
      COL.Status + 1,
      Math.max(1, nData),
      1,
    );
    const rules = [];
    const add = function (words, color) {
      words.forEach(function (w) {
        rules.push(
          SpreadsheetApp.newConditionalFormatRule()
            .whenTextContains(w)
            .setBackground(color)
            .setRanges([statusRange])
            .build(),
        );
      });
    };
    add(FMT.STATUS_GREEN, FMT.GREEN);
    add(FMT.STATUS_YELLOW, FMT.YELLOW);
    add(FMT.STATUS_RED, FMT.RED);
    sheet.setConditionalFormatRules(rules);
  }
}
