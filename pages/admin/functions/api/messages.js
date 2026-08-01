export async function onRequestPost({ request }) {
	try {
		let input = await request.formData();

    let value = JSON.stringify({"message": input["message"]}, null, 2);
    context.env.messages.put(input["id"] + ":" + input["date"], value);
    
		return new Response(value, {
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			}
		});
	} catch (err) {
		return new Response('Error', { status: 400 });
	}
}
