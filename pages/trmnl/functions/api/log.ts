import lookup from '../../src/device.ts'; 

// https://github.com/usetrmnl/terminus/blob/main/doc/api.adoc#log
export async function onRequest({ request, env }) {

  const device = await lookup(request.headers, env.TRMNL_DEVICES); 
  const logs = await (request.json()).logs;

  for(log in logs) {
    console.log(`[/api/log/${ device.id }] ${ x }`)
  }

  return new Response(null, { status: 204 });
};
