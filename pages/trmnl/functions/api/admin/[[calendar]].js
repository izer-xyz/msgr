export async function onRequestPost({ request, params }) {
	try {
		let [year, month, day] = params.calendar, 
			date = new Date(year, month - 1, day).toISOString().slice(0, 10),
			firstDate = new Date(year, month - 1, 1),
			lastDate = new Date(year, month, 0), // day 0 is -1 day
        	calendar = [...Array(lastDate.getDate())].map(
				(value, index) => ({
					date: index + 1,
					data: { // context.env.messages.get(input["id"] + ":" + new Date(year, month - 1, index + 1).toISOString().slice(0, 10)
						messages: ["1"],
						activities: ["2", "3"]
					}
				})
			),
			week = [...Array(7)].map(
				(value, index) => ({
					date: index,
					data: { // context.env.messages.get(input["id"] + ":" + index
						messages: ["1"],
						activities: ["2", "3"]
					}
				})
			),
			response = JSON.stringify({
				date: date,
				firstDay: firstDate.getDay(),
				calendar: calendar,
				week: week
			}, null, 2)
		;
		
		return new Response(response, {
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			}
		});
	} catch (err) {
		console.log(err);
		return new Response('Error', { status: 400 });
	}
}
