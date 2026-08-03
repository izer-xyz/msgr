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
