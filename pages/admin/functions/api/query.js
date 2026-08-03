export default class Query {
	constructor(type, { id, date, day, time, reference, ...data }, store) {
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
		console.log(`request ${JSON.stringify(this.item)}`);
	}

	// date: YYYY-MM-dd
	// day: d (day number of week)
	async list() {
		let prefix = [this.type, this.item.date].join(".");
		console.log(`list ${prefix}`);
		let dateList = await (this.item.date
			? this.store.list({ prefix })
			: { keys: [] });

		prefix = [this.type, "D", this.item.day].join(".");
		console.log(`list ${prefix}`);
		let dayList = await this.store.list({ prefix });

		let keys = [...dateList?.keys, ...dayList?.keys].map((key) => key.name);
		console.log(`list ${JSON.stringify(keys)}`);

		return (await Promise.all(await this.store.get(keys, "json"))).map(
			(i) => i[1],
		);
	}

	async save() {
		let id = [
			this.type,
			this.item.date || "D." + this.item.day,
			this.item.time,
			this.item.reference,
		].join(".");

		if (this.item.id && this.item.id !== id) {
			this.delete();
		}

		this.item.id = id;
		// TODO set TTL
		console.log(`save ${id}`);
		this.store.put(id, JSON.stringify(this.item));

		return this;
	}

	async delete() {
		console.log(`delete ${id}`);
		this.store.delete(this.item.id);
		return this;
	}
}
