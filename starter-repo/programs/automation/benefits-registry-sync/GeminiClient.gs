/**
 * GeminiClient — calls the Gemini API (Generative Language API) using a
 * plain API key you control. Get a free key at
 * https://aistudio.google.com/app/apikey and store it in Script Properties
 * (Project Settings > Script Properties) as GEMINI_API_KEY. Never paste the
 * key into this file — Script Properties keeps it out of any shared/exported
 * copy of the source.
 */
class GeminiClient {
  constructor() {
    const props = PropertiesService.getScriptProperties();
    this.apiKey = props.getProperty("GEMINI_API_KEY");
    if (!this.apiKey) {
      throw new Error(
        "Missing GEMINI_API_KEY in Script Properties. Add one at Project Settings > Script Properties using a free key from https://aistudio.google.com/app/apikey.",
      );
    }
    this.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent`;
  }

  /**
   * @param {string} emailText - subject + body + metadata
   * @param {string[]} knownPrograms - list of current Program display names for matching
   * @returns {Array} array of operation objects or empty on failure
   */
  extractUpdates(emailText, knownPrograms = []) {
    const systemPrompt = this._buildSystemPrompt(knownPrograms);
    const userPrompt = `EMAIL TO PARSE:\n${emailText}\n\nReturn ONLY the JSON array as specified. No prose, no markdown fences.`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.1,
        topP: 0.9,
        topK: 20,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    };

    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(
      `${this.endpoint}?key=${this.apiKey}`,
      options,
    );
    const code = response.getResponseCode();
    const text = response.getContentText();

    if (code !== 200) {
      throw new Error(`Gemini API returned status ${code}: ${text}`);
    }

    const data = JSON.parse(text);
    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error(
        `Gemini API returned no candidates. Raw response: ${text}`,
      );
    }
    const parts = candidates[0].content?.parts;
    if (!parts || parts.length === 0) {
      throw new Error(
        `Gemini API returned no content parts. Raw response: ${text}`,
      );
    }
    let jsonText = parts[0].text || "[]";

    // Robust cleanup in case the model still adds fences.
    jsonText = jsonText
      .replace(/```json\s*/g, "")
      .replace(/```\s*$/g, "")
      .trim();

    try {
      let parsed = JSON.parse(jsonText);
      if (parsed && !Array.isArray(parsed)) {
        // If it's a wrapped object containing an array field, extract the array.
        const keys = Object.keys(parsed);
        for (const k of keys) {
          if (Array.isArray(parsed[k])) {
            parsed = parsed[k];
            break;
          }
        }
        // If it's just a single operation object, wrap it in an array.
        if (!Array.isArray(parsed) && parsed.program) {
          parsed = [parsed];
        }
      }
      if (!Array.isArray(parsed)) {
        throw new Error(
          `Gemini API returned JSON that is not an array: ${jsonText}`,
        );
      }
      return parsed;
    } catch (parseErr) {
      throw new Error(
        `Failed to parse Gemini response JSON: ${jsonText}. Error: ${parseErr.toString()}`,
      );
    }
  }

  _buildSystemPrompt(knownPrograms) {
    const known =
      knownPrograms.length > 0
        ? knownPrograms.join(", ")
        : "(will be provided at runtime)";
    const today = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() || "Etc/UTC",
      "yyyy-MM-dd",
    );

    return `You are an expert maintainer of a personal startup benefits & credits registry.

Your ONLY job is to read the provided email (or thread) and output a JSON array of precise update operations that keep a Google Sheet Registry tab in the exact canonical shape below.

CANONICAL SCHEMA — exactly these 11 columns, in order (do not add others unless you've also updated SheetManager.gs):
Tier, Program, Status, Impact, Value, Expiration, LastSourced, Referral, Doc, EvidenceDriveLink, Notes

COLUMN TYPES (critical — emit the right JSON type):
- Tier:   one of T0 | T1 | T2 | T3 (T9 = parking/candidate). Dropdown column.
- Status: one of: unlocked, accepted, active, approved, credited, applied, ready, in progress, denied, superseded, candidate, target. Dropdown column.
- Impact: H | M | L.
- Value:  a NUMBER only — integer USD value of the benefit (e.g. 50000 for "$50,000 credits").
          Omit Value entirely if the email gives no clear dollar figure. NEVER invent a number,
          NEVER output text/currency symbols in Value. Put any qualitative detail in Notes.
- Expiration: a single ISO date "YYYY-MM-DD" (the benefit's expiry/redeem-by). Omit if no concrete date.
- LastSourced: the string "YYYY-MM-DD · <source>" (date of this signal + sender/subject hint).
- Referral, Doc, EvidenceDriveLink, Notes: free text.

Matching:
- Match to an existing row by Program name (case/suffix-insensitive). Known Programs: ${known}
- If no good match, create a new row; set Status to the email's state (or "candidate").

Rules:
- Extract every field you have evidence for: referral/promo codes, account or org IDs, exact
  credit amounts, and expiry dates, when the email actually states them.
- Never invent numbers or dates. If unknown, OMIT the field (do not write placeholders into Value/Expiration).
- Self-sent application / "we received your app" -> Status "applied". Denial -> "denied" (+ retry plan in Notes).
- Output ONLY a JSON array. Each item:
  {
    "program": "Example Program Name",
    "action": "upsert" | "create",
    "fields": { "Status": "accepted", "Value": 5000, "Expiration": "2027-01-01", "Referral": "...", "Notes": "...", "LastSourced": "2026-07-10 · sender@example.com" },
    "confidence": 0.0-1.0,
    "rationale": "1-2 sentence justification from the email",
    "sourceMessageHint": "short subject or from line"
  }
- confidence: 0.9+ only if the email is clearly about that program and facts are unambiguous.

Current date context: ${today}. Use ISO dates (YYYY-MM-DD). Return ONLY the JSON array.`;
  }
}
