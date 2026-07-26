import lookup from '../../src/device.ts'; 

// https://github.com/usetrmnl/terminus/blob/main/doc/api.adoc#log
export async function onRequest({ request }) {

  const device = await lookup(request.headers, env.TRMNL_DEVICES); 
  
  request.json().logs.forEach( 
    x => console.log(`[${ device.id }] ${ x }`)
  ); 

  return new Response(null, { status: 204 });
};
