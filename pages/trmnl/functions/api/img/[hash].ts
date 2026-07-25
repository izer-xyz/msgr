import screen from "../../../src/screen/error.tsx";
import lookup from "../../../src/device.ts";

export async function onRequest({ params, request, env}) {

  let device = lookup(request, env.TRMNL_DEVICES)

  try {
    let png = await env.TRMNL_CACHE.get(params.hash, 'arrayBuffer');

    if (!png) throw new Error(`${ params.hash } not found`);   

    return new Response(
      png,  
      { headers: { 'Content-Type': 'image/png'} }
    );

  } catch (err) {
    console.log(`[${ device.ID }] ${ JSON.stringify(err) }`);
    return screen(device, env, { message: 'Image not found' });  
  }
};
