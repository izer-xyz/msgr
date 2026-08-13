import { createAuditor, getProfile } from "./audit.js";

const PREFIX = "P";

export async function onRequestGet({ request, env }) {
	let profile = await getProfile(request, env.TRMNL_BOARD);
	return Response.json({ profile });
}

export async function onRequestPost({ request, env }) {
	let email = request.headers.get("cf-access-authenticated-user-email");
	let profile = { ...(await request.json()), email };
	let id = [PREFIX, email].join(".");

	await env.TRMNL_BOARD.put(id, JSON.stringify(profile, null, " "));

	createAuditor(request, env.TRMNL_AUDIT)(id, "update", profile);

	return onRequestGet({ request, env });
}
