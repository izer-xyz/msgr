export interface Env {
  MESSAGES: KVNamespace;
  CALENDAR: KVNamespace;
}

interface EmailMessage {
  readonly from: string;
  readonly to: string;
  readonly headers: Headers;
  readonly raw: ReadableStream;
  readonly rawSize: number;
  forward(rcptTo: string, headers?: Headers): Promise<void>;
  reply(message: EmailMessage): Promise<void>;
  setReject(reason: string): void;
}

// ---------------------------------------------------------------------------
// Minimal MIME parser
// ---------------------------------------------------------------------------

interface MimePart {
  headers: Map<string, string>;
  body: string;
}

function parseMimeParts(raw: string, boundary: string): MimePart[] {
  const delimiter = `--${boundary}`;
  const parts: MimePart[] = [];

  const sections = raw.split(delimiter);
  // Skip preamble (index 0) and epilogue (last, which starts with --)
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    if (section.trimStart().startsWith("--")) break; // closing delimiter

    // Split headers from body on first blank line
    const crlfBlank = section.indexOf("\r\n\r\n");
    const lfBlank = section.indexOf("\n\n");
    const blankAt =
      crlfBlank !== -1 && (lfBlank === -1 || crlfBlank <= lfBlank)
        ? crlfBlank
        : lfBlank;

    if (blankAt === -1) continue;

    const headerBlock = section.slice(0, blankAt);
    const body = section.slice(blankAt + (crlfBlank === blankAt ? 4 : 2));

    const headers = new Map<string, string>();
    // Unfold and split header lines
    const lines = headerBlock.replace(/\r\n[ \t]/g, " ").split(/\r?\n/);
    for (const line of lines) {
      const colon = line.indexOf(":");
      if (colon === -1) continue;
      headers.set(
        line.slice(0, colon).trim().toLowerCase(),
        line.slice(colon + 1).trim()
      );
    }

    parts.push({ headers, body });
  }
  return parts;
}

function extractBoundary(contentType: string): string | null {
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^\s;]+))/i);
  return match ? (match[1] ?? match[2]) : null;
}

function isIcsPart(part: MimePart): boolean {
  const ct = part.headers.get("content-type") ?? "";
  const cd = part.headers.get("content-disposition") ?? "";
  return (
    ct.toLowerCase().includes("text/calendar") ||
    ct.toLowerCase().includes("application/ics") ||
    /\.ics["']?\s*$/i.test(cd)
  );
}

// ---------------------------------------------------------------------------
// ICS field extractor
// ---------------------------------------------------------------------------

function extractIcsField(ics: string, field: string): string | null {
  // Unfold continuation lines (RFC 5545 §3.1)
  const unfolded = ics.replace(/\r?\n[ \t]/g, "");
  const match = unfolded.match(new RegExp(`^${field}[;:][^\r\n]*`, "im"));
  if (!match) return null;
  const colon = match[0].indexOf(":");
  return colon !== -1 ? match[0].slice(colon + 1).trim() : null;
}

// Normalise DTSTART to a sortable string: strip TZID params, keep value only.
function normaliseDtstart(raw: string): string {
  // raw may be "20260401T120000Z" or "20260401T120000" — keep as-is
  return raw.replace(/[^0-9TZ]/g, "");
}

// ---------------------------------------------------------------------------
// Worker
// ---------------------------------------------------------------------------

export default {
  async email(message: EmailMessage, env: Env): Promise<void> {
    // Read the raw email body
    const rawBytes = await new Response(message.raw).arrayBuffer();
    const rawText = new TextDecoder().decode(rawBytes);

    // Derive a timestamp key from the Date header
    const dateHeader = message.headers.get("date");
    const emailDate = dateHeader ? new Date(dateHeader) : new Date();
    const dateKey = emailDate.toISOString();

    const subject = message.headers.get("subject") ?? "(no subject)";
    const from = message.from;
    const topContentType = message.headers.get("content-type") ?? "";

    // --- Check for ICS attachment in multipart emails ---
    const boundary = extractBoundary(topContentType);
    if (boundary) {
      const parts = parseMimeParts(rawText, boundary);
      const icsPart = parts.find(isIcsPart);

      if (icsPart) {
        const icsContent = icsPart.body.trim();
        const dtstart = extractIcsField(icsContent, "DTSTART");
        const uid = extractIcsField(icsContent, "UID");

        const calKey =
          dtstart && uid
            ? `${normaliseDtstart(dtstart)}.${uid}`
            : `${dateKey}.${uid ?? crypto.randomUUID()}`;

        await env.CALENDAR.put(calKey, icsContent, {
          metadata: { from, subject, receivedAt: dateKey },
        });
        return;
      }
    }

    // --- No ICS: store as a plain message ---
    await env.MESSAGES.put(
      dateKey,
      JSON.stringify({ time: dateKey, from, subject })
    );
  },
};
