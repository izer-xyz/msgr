const PREFIX = "P";
const DEFAULT_PROFILE = {};

export async function onRequestGet({ request, env }) {
	let email = request.headers.get("cf-access-authenticated-user-email");
	let profile = {
		...DEFAULT_PROFILE,
		...(await env.TRMNL_BOARD.get([PREFIX, email].join("."), "json")),
	};

	console.log(`[INFO /api/admin/profile] ${JSON.stringify(profile)}`);

	return new Response(JSON.stringify({ email, profile }), {
		headers: {
			"Content-Type": "application/json;charset=utf-8",
		},
	});
}

export async function onRequestPost({ request, env }) {
	let email = request.headers.get("cf-access-authenticated-user-email");
	let profile = { ...DEFAULT_PROFILE, ...(await request.json()), email };

	await env.TRMNL_BOARD.put([PREFIX, email].join("."), JSON.stringify(profile));

	console.log(`[INFO /api/admin/profile] SAVE ${JSON.stringify(profile)}`);
	return onRequestGet({ request, env });
}
