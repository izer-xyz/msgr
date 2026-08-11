export async function onRequestGet({ request }) {
	const { search } = new URL(request.url);
	let device = search.substring(1);

	return await fetch(`${request.url}/../img/${device}.png`, {
		headers: {
			ID: device,
		},
	});
}
