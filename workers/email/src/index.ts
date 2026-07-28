export interface Env {
  MESSAGES: KVNamespace;
  EMAIL: EmailEvent;
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

export default {
  async email(message: EmailMessage, env: Env): Promise<void> {
    // Parse the date from the email headers, fall back to now
    const dateHeader = message.headers.get("date");
    const emailDate = dateHeader ? new Date(dateHeader) : new Date();

    // Format key as ISO date-time: YYYY-MM-DDTHH:MM:SS.mmmZ
    const key = emailDate.toISOString();

    const subject = message.headers.get("subject") ?? "(no subject)";
    const from = message.from;

    const value = JSON.stringify({
      time: key,
      from,
      subject,
    });

    await env.MESSAGES.put(key, value);
  },
};
