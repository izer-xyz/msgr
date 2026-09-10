import test from "node:test";
import assert from "node:assert/strict";

import {
  deviceDateTime,
  from,
  getFilename,
  getSleepTime,
} from "../src/device.js";
import { Calendar, Message } from "../src/event.js";
import { MemoryKV } from "./helpers.mjs";

const instant = new Date("2026-09-10T12:34:00.000Z");

test("device scheduling respects the configured time zone", () => {
  const device = { refresh_rate: "60", time_zone: "Asia/Tokyo" };
  const tokyo = deviceDateTime(device, instant);
  const utc = deviceDateTime(
    { ...device, time_zone: "UTC" },
    instant,
  );

  assert.match(tokyo, /^2026-09-10 21:34$/);
  assert.match(utc, /^2026-09-10 12:34$/);
  assert.notEqual(tokyo, utc);
});

test("device date buckets change at refresh-rate boundaries", () => {
  const device = { refresh_rate: "60", time_zone: "UTC" };
  assert.equal(deviceDateTime(device, instant), "2026-09-10 12:34");
  assert.equal(
    deviceDateTime(device, new Date("2026-09-10T12:34:01.000Z")),
    "2026-09-10 12:35",
  );
  assert.equal(
    deviceDateTime(
      { ...device, refresh_rate: "61" },
      new Date("2026-09-10T12:34:01.000Z"),
    ),
    "2026-09-10 12:36",
  );
});

test("sleep windows cover normal and overnight ranges", () => {
  const overnight = {
    sleep_from: "22:00",
    sleep_to: "06:00",
    refresh_rate: "300",
    time_zone: "UTC",
  };
  assert.equal(getSleepTime(overnight, new Date("2026-09-10T23:00:00Z")), 24600);
  assert.equal(getSleepTime(overnight, new Date("2026-09-10T05:40:00Z")), 600);
  assert.equal(getSleepTime(overnight, new Date("2026-09-10T05:59:00Z")), "");
  assert.equal(getSleepTime(overnight, new Date("2026-09-10T07:00:00Z")), "");

  const daytime = {
    sleep_from: "06:00",
    sleep_to: "22:00",
    refresh_rate: "300",
    time_zone: "UTC",
  };
  assert.equal(getSleepTime(daytime, new Date("2026-09-10T12:00:00Z")), 35400);
});

test("invalid scheduling inputs fail closed", async () => {
  const device = {
    sleep_from: "25:00",
    sleep_to: "06:00",
    refresh_rate: "300",
    time_zone: "Not/AZone",
  };
  assert.equal(getSleepTime(device, instant), "");
  assert.equal(
    getSleepTime({ ...device, time_zone: "UTC", sleep_from: "bad" }, instant),
    "",
  );

  const saved = await from(new MemoryKV(), new Map(), {
    refresh_rate: "not-a-number",
    time_zone: "Not/AZone",
  });
  assert.equal(saved.device.sleep, "");
});

test("device filenames use the same time bucket as the screen", () => {
  const device = {
    screen: "board",
    refresh_rate: "60",
    time_zone: "UTC",
  };
  assert.equal(
    getFilename(device, instant),
    "board/2026-09-10/12:34/0.png",
  );
});

test("calendar create, update, delete, expiration, and invalid dates", async () => {
  const kv = new MemoryKV();
  const event = await new Calendar(
    { date: "2026-09-10", day: 4, time: "09:00", reference: "team", subject: "Standup" },
    kv,
  ).save();

  assert.equal(event.event.id, "C.2026-09-10.09:00.team");
  assert.equal(kv.puts[0].options.expiration, Date.parse("2026-09-10") / 1000 + 31 * 86400);

  const updated = await new Calendar(
    {
      id: event.event.id,
      date: "2026-09-11",
      day: 5,
      time: "10:00",
      reference: "team",
      subject: "Moved",
    },
    kv,
  ).save();
  assert.equal(updated.event.id, "C.2026-09-11.10:00.team");
  assert.deepEqual(kv.deletes, ["C.2026-09-10.09:00.team"]);

  await new Calendar(
    { date: "not-a-date", day: 5, time: "10:00", reference: "bad" },
    kv,
  ).save();
  assert.deepEqual(kv.puts.at(-1).options, {});

  await updated.delete();
  assert.equal(kv.values.has(updated.event.id), false);
});

test("event keys intentionally replace an existing same-slot event", async () => {
  const kv = new MemoryKV();
  await new Message(
    { date: "2026-09-10", day: 4, time: "09:00", reference: "same", content: "first" },
    kv,
  ).save();
  await new Message(
    { date: "2026-09-10", day: 4, time: "09:00", reference: "same", content: "second" },
    kv,
  ).save();

  const messages = await new Message({ date: "2026-09-10", day: 4 }, kv).list();
  assert.equal(messages.length, 1);
  assert.equal(messages[0].content, "second");
});

test("hidden recurring events suppress other recurring events only", async () => {
  const kv = new MemoryKV();
  await new Calendar(
    { day: 4, time: "08:00", reference: "-", subject: "Hide recurring" },
    kv,
  ).save();
  await new Calendar(
    { day: 4, time: "09:00", reference: "other", subject: "Other recurring" },
    kv,
  ).save();
  await new Calendar(
    { date: "2026-09-10", day: 4, time: "10:00", reference: "dated", subject: "Dated" },
    kv,
  ).save();

  const visible = await new Calendar({ date: "2026-09-10", day: 4 }, kv).list(false);
  assert.deepEqual(visible.map((event) => event.subject), ["Dated"]);
  const all = await new Calendar({ date: "2026-09-10", day: 4 }, kv).list(true);
  assert.equal(all.length, 3);
});