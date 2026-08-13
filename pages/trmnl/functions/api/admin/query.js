export default class Query {
	constructor(
		type,
		{ id, date, day, time, reference, ...data },
		store,
		audit = () => {},
	) {
		this.item = {
			id,
			date,
			day,
			time,
			reference,
			...data,
		};
		this.type = type;
		this.store = store;
		this.audit = audit;
	}

	// date: YYYY-MM-dd
	// day: d (day number of week)
	async list() {
		let prefix = [this.type, this.item.date].join(".");
		console.log(`list ${prefix}`);
		let dateList = await (this.item.date
			? this.store.list({ prefix })
			: { keys: [] });

		prefix = [this.type, "D"].join("."); // return every day
		console.log(`list ${prefix}`);
		let dayList = await this.store.list({ prefix });

		let keys = [...dayList?.keys, ...dateList?.keys].map((key) => key.name);
		console.log(`list ${JSON.stringify(keys)}`);

		if (keys.length === 0) return [];

		return (await Promise.all(await this.store.get(keys, "json"))).reduce(
			(list, i) => (i[1] ? list.push(i[1]) && list : list),
			[],
		);
	}

	async save() {
		let id = [
			this.type,
			this.item.date || "D" + this.item.day,
			this.item.time,
			this.item.reference,
		].join(".");

		if (this.item.id && this.item.id !== id) {
			await this.delete();
		}

		this.item.id = id;
		// expire after ~1 month
		let expiration =
			this.item.date &&
			!this.item.flag &&
			new Date(this.item.date).getTime() / 1000 + 31 * 24 * 60 * 60;
		await this.store.put(
			id,
			JSON.stringify(this.item, null, " "),
			(expiration && { expiration }) || {},
		);

		this.audit(this.item.id, "update", this.item);

		return this;
	}

	async delete() {
		await this.store.delete(this.item.id);
		this.audit(this.item.id, "delete");
		return this;
	}
}