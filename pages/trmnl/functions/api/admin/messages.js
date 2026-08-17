// POST -> save message (create or update)
// GET -> list all (top?) messages
// DELETE -> Delete message

// message.id: day of week (DOF-0..DOF-6) or YYYY-MM-DD.HH.mm.reference
// message.date: timestamp
// message.from: from who
// message.content: content

import { default as Query } from "./query.js";
import { createAuditor, getProfile } from "./audit.js";

const PREFIX = "M";

export async function onRequestGet({ request, env }) {
	const { search } = new URL(request.url);
	let date = search.substring(1);

	let messages = await new Query(PREFIX, { date }, env.TRMNL_BOARD).list();

	let profile = await getProfile(request, env.TRMNL_BOARD);
	let response = { date, msgs: [], week: new Array(8), profile };
	for (const m of messages) {
		if (m.day) {
			response.week[m.day] = m;
		} else {
			response.msgs.push(m);
		}
	}

	response.msgs.sort(
		(a, b) => -a.time.localeCompare(b.time) - 100 * a.day.localeCompare(b.day),
	);

	return Response.json(response);
}

export async function onRequestPost({ request, env }) {
	await new Query(
		PREFIX,
		await request.json(),
		env.TRMNL_BOARD,
		createAuditor(request, env.TRMNL_AUDIT),
	).save();
	return onRequestGet({ request, env });
}

export async function onRequestDelete({ request, env }) {
	await new Query(
		PREFIX,
		await request.json(),
		env.TRMNL_BOARD,
		createAuditor(request, env.TRMNL_AUDIT),
	).delete();
	return onRequestGet({ request, env });
}
