// POST -> save message (create or update)
// GET -> list all (top?) messages
// DELETE -> Delete message

// message.id: day of week (DOF-0..DOF-6) or YYYY-MM-DD.HH.mm.reference
// message.date: timestamp
// message.from: from who
// message.content: content

import Query from "./query.js";

const PREFIX = "M";

export async function onRequestGet({ request, env }) {
	const { search } = new URL(request.url);
	let date = search.substring(1);
	let day = new Date(date).getDay();

	let messages = await new Query(PREFIX, { date, day }, env.TRMNL_BOARD).list();

	let email = request.headers.get("cf-access-authenticated-user-email");
	let profile = {
		name: email,
		...(await env.TRMNL_BOARD.get(["P", email].join("."), "json")),
		email,
	};

	console.log(`[INFO /api/admin/messages] ${JSON.stringify({ profile })}`);
	return Response.json({ date, messages, profile });
}

export async function onRequestPost({ request, env }) {
	await new Query(PREFIX, await request.json(), env.TRMNL_BOARD).save();
	return onRequestGet({ request, env });
}

export async function onRequestDelete({ request, env }) {
	await new Query(PREFIX, await request.json(), env.TRMNL_BOARD).delete();
	return onRequestGet({ request, env });
}
