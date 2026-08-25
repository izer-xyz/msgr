class Events {
  constructor(
    type,
    order,
    { id, date, day, time, reference, ...data },
    kv,
    audit = () => {},
  ) {
    this.event = {
      id,
      date,
      day,
      time,
      reference,
      ...data,
    };
    this.type = type;
    this.kv = kv;
    this.audit = audit;
    this.order = order;
  }

  // date: YYYY-MM-dd
  // day: d (day number of week)
  async list(showAll = true) {
    let prefix = [this.type, this.event.date].join(".");
    let dateList = (
      await (this.event.date ? this.kv.list({ prefix }) : { keys: [] })
    ).keys;

    prefix = [this.type, "D" + this.event.day].join(".");
    let dayList = (await this.kv.list({ prefix })).keys;

    let keys = [...dayList, ...dateList].map((key) => key.name);
    if (keys.length === 0) return [];
    let hide = !showAll && keys.find((key) => key.endsWith("..-")); // special case to hide all events can only be on a daand the reference is "-"

    let list = (await Promise.all(await this.kv.get(keys, "json"))).reduce(
      (list, i) =>
        i[1] && (showAll || (!i[1].hide && (i[1].date || !hide)))
          ? list.push(i[1]) && list
          : list,
      [],
    );

    //TODO fix sorting
    list.sort(
      (a, b) =>
        this.order * a.time.localeCompare(b.time) * 100 +
        (Number(a.day) - Number(b.day)) * 1000 +
        a.subject.localeCompare(b.subject),
    );
    /*
    list.sort(
      (a, b) =>
        -a.time.localeCompare(b.time) - 100 * a.day.localeCompare(b.day),
    );
*/
    return list;
  }

  async save() {
    let id = [
      this.type,
      this.event.date || "D" + this.event.day,
      this.event.time,
      this.event.reference,
    ].join(".");

    if (this.event.id && this.event.id !== id) {
      await this.delete();
    }

    this.event.id = id;
    // expire after ~1 month
    let expiration =
      this.event.date &&
      !this.event.flag &&
      new Date(this.event.date).getTime() / 1000 + 31 * 24 * 60 * 60;
    await this.kv.put(
      id,
      JSON.stringify(this.event, null, " "),
      (expiration && { expiration }) || {},
    );

    this.audit(this.event.id, "update", this.event);

    return this;
  }

  async delete() {
    await this.kv.delete(this.event.id);
    this.audit(this.event.id, "delete");
    return this;
  }
}

class Message extends Events {
  constructor(...params) {
    super("M", -1, ...params);
  }
}
class Calendar extends Events {
  constructor(...params) {
    super("C", 1, ...params);
  }
}

export { Message, Calendar };
