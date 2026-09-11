export default async function log(req) {
  let body = await req.json();
  let logs = Array.isArray(body?.logs) ? body.logs : [];
  for (const log of logs) {
    console.log(`[/api/log/${req.device.device.id}] ${JSON.stringify(log)}`);
  }
  return new Response(null, { status: 204 });
}
