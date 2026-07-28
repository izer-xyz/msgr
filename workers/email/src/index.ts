import PostalMime from "postal-mime";

export interface Env {
  MESSAGES: KVNamespace;
  CALENDAR: KVNamespace;
}

export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    const raw = await new Response(message.raw).arrayBuffer();
    const parsed = await new PostalMime().parse(raw);

    // Key: ISO timestamp from the Date header, fallback to now
    const emailDate = parsed.date ? new Date(parsed.date) : new Date();
    const dateKey = emailDate.toISOString();

    const from = message.from;
    const subject = parsed.subject ?? "(no subject)";

    // Look for an .ics attachment or inline calendar part
    const icsPart = parsed.attachments.find(
      (a) =>
        a.mimeType === "text/calendar" ||
        a.mimeType === "application/ics" ||
        a.filename?.endsWith(".ics")
    );

    if (icsPart) {
      const icsContent =
        typeof icsPart.content === "string"
          ? icsPart.content
          : new TextDecoder().decode(icsPart.content);

      // Extract DTSTART and UID from the ICS (unfold continuation lines first)
      const unfolded = icsContent.replace(/\r?\n[ \t]/g, "");
      const dtstart = unfolded.match(/^DTSTART[;:][^\r\n]*/im)?.[0]
        ?.split(":")[1]
        ?.trim()
        ?.replace(/[^0-9TZ]/g, "");
      const uid = unfolded.match(/^UID:[^\r\n]*/im)?.[0]
        ?.slice(4)
        ?.trim();

      const calKey =
        dtstart && uid
          ? `${dtstart}.${uid}`
          : `${dateKey}.${uid ?? crypto.randomUUID()}`;

      await env.CALENDAR.put(calKey, icsContent, {
        metadata: { from, subject, receivedAt: dateKey },
      });
      return;
    }

    // No ICS — store as a plain message
    await env.MESSAGES.put(dateKey, JSON.stringify({ time: dateKey, from, subject }));
  },
};
