import error from "../../../src/screen/error.tsx";
import { default as lookup, DEFAULTS } from "../../../src/device.ts";
import process from '../../src/image.ts'; 

export async function onRequest({ request, env}) {

  try {
    const device = await lookup(request.headers, env.TRMNL_DEVICES); 
    const png = process(device, env); 

    return new Response(
      png,  
      { headers: { 'Content-Type': 'image/png'} }
    );

  } catch (err) {
    console.log(`[ERROR /api/img/${ request.headers.get('id') }] ${ JSON.stringify(err) }`);
    return error(DEFAULTS, env, { message: 'Image not found' });  
  }
};
