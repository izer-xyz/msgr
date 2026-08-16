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
import { createAuditor } from "./audit.js";

const PREFIX = "C";

export async function onRequestGet({ request, env }) {
	const { search } = new URL(request.url);
	let date = search.substring(1);
	let day = new Date(date).getDay() || 7; // Sunday is 7 not 0

	let events = await new Query(
		PREFIX,
		{ date: date.slice(0, 7), day },
		env.TRMNL_BOARD,
	).list();

	let response = { date, day: [], week: new Array(8), month: new Array(31) };

	for (const e of events) {
		if (e.day) {
			response.week[e.day] = e;
			response.day.push(e);
		} else {
			response.month[new Date(e.date).getDate()] = e;
			if (date === e.date) {
				response.day.push(e);
			}
		}
	}

	response.day.sort(
		(a, b) => a.time.localeCompare(b.time) * 100 + a.day.localeCompare(b.day),
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
