import { createAuditor } from "./audit.js";

export async function onRequestGet({ env }) {
	let devices = [];
	let keys = (await env.TRMNL_DEVICES.list()).keys.map((key) => key.name);
	console.log(keys);
	if (keys.length !== 0) {
		devices = (
			await Promise.all(await env.TRMNL_DEVICES.get(keys, "json"))
		).reduce((list, i) => (i[1] ? list.push(i[1]) && list : list), []);
	}
	return Response.json({ devices });
}

export async function onRequestPost({ request, env }) {
	let { id, time_zone, refresh_rate, sleep_from, sleep_to, depth, screen } =
		await request.json();

	let device = {
		...(await env.TRMNL_DEVICES.get(id, "json")),
		id,
		time_zone,
		refresh_rate,
		depth,
		screen,
		sleep_from,
		sleep_to,
	};

	await env.TRMNL_DEVICES.put(id, JSON.stringify(device));
	createAuditor(request, env.TRMNL_AUDIT)(`D.${id}`, "update", device);

	return onRequestGet({ request, env });
}
