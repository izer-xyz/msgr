import test from "node:test";
import assert from "node:assert/strict";

import emailWorker, {
  MAX_CONTENT_BYTES,
  assertContentSize,
  parseDate,
} from "../email/src/index.ts";
import { MemoryKV } from "./helpers.mjs";

function rawEmail({
  date = "Thu, 10 Sep 2026 12:34:00 +0000",
  subject = "Test message",
  body = "hello",
} = {}) {
  return [
    "From: sender@example.test",
    "To: board@example.test",
    `Date: ${date}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\r\n");
}

function rawCalendar({ uid = "event@example.test", start = "20260910T100000Z" } = {}) {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTART:${start}`,
    "SUMMARY:Team meeting",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  const boundary = "calendar-boundary";
  return [
    "From: sender@example.test",
    "To: board@example.test",
    "Date: Thu, 10 Sep 2026 12:34:00 +0000",
    "Subject: Calendar update",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain",
    "",
    "calendar attached",
    `--${boundary}`,
    'Content-Type: text/calendar; name="event.ics"',
    'Content-Disposition: attachment; filename="event.ics"',
    "",
    ics,
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

async function runEmail(raw, env) {
  await emailWorker.email(
    { raw: new TextEncoder().encode(raw), from: "sender@example.test" },
    env,
  );
}

test("email date parsing falls back for malformed dates", async () => {
  const fallback = new Date("2026-09-10T12:34:00.000Z");
  assert.equal(parseDate("not a date", fallback), fallback);

  const env = { MESSAGES: new MemoryKV(), CALENDAR: new MemoryKV() };
  await runEmail(rawEmail({ date: "not a date" }), env);
  assert.equal(env.MESSAGES.puts.length, 1);
  const stored = JSON.parse(env.MESSAGES.puts[0].value);
  assert.notEqual(stored.time, "Invalid Date");
  assert.match(env.MESSAGES.puts[0].key, /^\d{4}-\d{2}-\d{2}T/);
});

test("ICS attachments are parsed and duplicate UIDs update one record", async () => {
  const env = { MESSAGES: new MemoryKV(), CALENDAR: new MemoryKV() };
  await runEmail(rawCalendar({ uid: "same@example.test", start: "20260910T100000Z" }), env);
  await runEmail(rawCalendar({ uid: "same@example.test", start: "20260911T110000Z" }), env);

  assert.deepEqual([...env.CALENDAR.values.keys()], ["same@example.test"]);
  assert.match(env.CALENDAR.values.get("same@example.test"), /20260911T110000Z/);
  assert.equal(env.CALENDAR.puts[0].options.metadata.subject, "Calendar update");
});

test("email message keys do not collide when timestamps match", async () => {
  const env = { MESSAGES: new MemoryKV(), CALENDAR: new MemoryKV() };
  await runEmail(rawEmail(), env);
  await runEmail(rawEmail(), env);
  assert.equal(env.MESSAGES.values.size, 2);
  assert.notEqual(env.MESSAGES.puts[0].key, env.MESSAGES.puts[1].key);
});

test("oversized email content is rejected before storage", () => {
  assert.doesNotThrow(() => assertContentSize("x".repeat(MAX_CONTENT_BYTES)));
  assert.throws(
    () => assertContentSize("x".repeat(MAX_CONTENT_BYTES + 1)),
    /exceeds KV size limit/,
  );
});