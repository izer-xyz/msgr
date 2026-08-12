import { getProfile } from "./query.js";

const PREFIX = "P";

export async function onRequestGet({ request, env }) {
	let profile = await getProfile(request, env.TRMNL_BOARD);
	return Response.json({ profile });
}

export async function onRequestPost({ request, env }) {
	let email = request.headers.get("cf-access-authenticated-user-email");
	let profile = { ...(await request.json()), email };

	await env.TRMNL_BOARD.put(
		[PREFIX, email].join("."),
		JSON.stringify(profile, null, " "),
	);

	console.log(`[INFO /api/admin/profile] SAVE ${JSON.stringify(profile)}`);
	return onRequestGet({ request, env });
}
