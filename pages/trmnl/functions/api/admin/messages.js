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
	let day = new Date(date).getDay();

	let messages = await new Query(PREFIX, { date, day }, env.TRMNL_BOARD).list();

	let profile = getProfile(request, env.TRMNL_BOARD);

	return Response.json({ date, messages, profile });
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
