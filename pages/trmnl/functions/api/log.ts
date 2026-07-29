import lookup from '../../src/device.ts'; 

// https://github.com/usetrmnl/terminus/blob/main/doc/api.adoc#log
export async function onRequest({ request, env }) {

  const device = await lookup(request.headers, env.TRMNL_DEVICES); 
  const body = await request.json();
  const logs = Array.isArray(body?.logs) ? body.logs : [];

  for(const log of logs) {
    console.log(`[INFO /api/log/${ device.id }] ${ JSON.stringify(log) }`)
  }

  return new Response(null, { status: 204 });
};
