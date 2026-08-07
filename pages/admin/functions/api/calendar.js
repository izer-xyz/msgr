// POST -> save calendar entry (create or update)
// GET -> list all items for specific month
// DELETE -> Delete item

// entry.id: day of week (DOF-0..DOF-6.HH:mm) or YYYY-MM-dd.HH:mm.reference
// entry.reference: external id (or random generated)
// entry.date: timestamp
// entry.subject: subject
// entry.content: content
// entry.flag: true/false

// Special case: override day of week YYYY-MM-dd.DOF-X[.HH:mm]

import Query from "./query.js";

const PREFIX = "C";

export async function onRequestGet({ request, env }) {
	const { search } = new URL(request.url);
	let date = search.substring(1);
	let day = new Date(date).getDay();

	let calendar = await new Query(
		PREFIX,
		{ date: date.slice(0, 7), day },
		env.MESSAGES,
	).list();

	return new Response(JSON.stringify({ date, calendar }), {
		headers: {
			"Content-Type": "application/json;charset=utf-8",
		},
	});
}

export async function onRequestPost({ request, env }) {
	await new Query(PREFIX, await request.json(), env.MESSAGES).save();
	return onRequestGet({ request, env });
}

export async function onRequestDelete({ request, env }) {
	await new Query(PREFIX, await request.json(), env.MESSAGES).delete();
	return onRequestGet({ request, env });
}
