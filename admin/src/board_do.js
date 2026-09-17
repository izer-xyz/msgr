import { DurableObject } from "cloudflare:workers";

export function getStub(env, req, alias) {
  let name = req ? /:\/\/([^\/\.]+)/.exec(req.url)[1] || "default" : alias;
  console.info(`Board#${name}`);
  let stub = env.BOARD.getByName(name, { locationHint: "weur" });
  return stub;
}

const PROFILE_PREFIX = "P";
const MESSAGE_PREFIX = "M";
const EVENT_PREFIX = "E";
const DAY_PREFIX = "D";

export class Board extends DurableObject {
  profileByUserId(userId) {
    if (typeof userId !== "string" || userId.length === 0) {
      throw new TypeError("Id must be a non-empty string");
    }
    return this.ctx.storage.kv.get([PROFILE_PREFIX, userId].join(".")) ?? null;
  }

  saveProfile(profile) {
    if (!profile.id) {
      profile.id = [PROFILE_PREFIX, profile.email].join(".");
    }
    this.ctx.storage.kv.put(profile.id, profile);
    return profile;
  }

  listMessages(date, day) {
    let sort = (a, b) =>
      (Number(b.day) - Number(a.day)) * 100 - a.time.localeCompare(b.time) * 10;

    return this.list(MESSAGE_PREFIX, sort, date, day);
  }

  listEvents(date, day) {
    let sort = (a, b) =>
      (Number(b.hide || 0) - Number(a.hide || 0)) * 1000 +
      (Number(b.day) - Number(a.day)) * 10 +
      a.time.localeCompare(b.time) * 100 +
      (a.subject ? a.subject.localeCompare(b.subject) : 0);

    return this.list(EVENT_PREFIX, sort, date, day);
  }

  list(type, sort, date, day = "") {
    let prefix = [type, date].join(".");
    let dateList = this.ctx.storage.kv.list({ prefix });
    let list = [...dateList];

    prefix = [type, DAY_PREFIX + day].join(".");
    let dayList = this.ctx.storage.kv.list({ prefix });

    list = [...dayList, ...list].map((e) => e[1]);

    return sort ? list.sort(sort) : list;
  }

  delete(obj) {
    console.info("Board Delete", obj.id);
    this.ctx.storage.kv.delete(obj.id);
    return obj;
  }

  saveMessage(message) {
    return this.saveEvent(message, MESSAGE_PREFIX);
  }

  saveEvent(event, type = EVENT_PREFIX) {
    let id = [
      type,
      event.date || DAY_PREFIX + event.day,
      event.time,
      event.reference,
    ].join(".");
    console.info("Board Save", event.id, id);

    if (event.id && event.id !== id) {
      this.delete(event);
    }

    event.id = id;
    this.ctx.storage.kv.put(id, event);

    return event;
  }

  async location() {
    let data = await fetch("http://www.cloudflare.com/cdn-cgi/trace").then(
      (res) => res.text(),
    );
    let arr = data
      .trim()
      .split("\n")
      .map((e) => e.split("="));
    return Object.fromEntries(arr);
  }
}
