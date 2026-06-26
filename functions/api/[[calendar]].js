export async function onRequestPost({ request, params }) {
	try {
		let input = await request.formData(),
        date = new Date(...params.calendar),
        calendar = [
          ...Array(date.getDay(), 
          ...([...Array(new Date(params.calendar[0],params.calendar[1] + 1,0).getDate() + 1).keys()].slice(1)];

    //let value = JSON.stringify({"message": input["message"]}, null, 2);
    // context.env.messages.put(input["id"] + ":" + input["date"], value);
    
		return new Response(value, {
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			}
		});
	} catch (err) {
		return new Response('Error', { status: 400 });
	}
}
