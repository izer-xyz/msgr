import process from '../../src/image.ts';
import { default:lookup, save } from '../../src/device.ts'; 

// https://github.com/usetrmnl/terminus/blob/main/doc/api.adoc#setup
// https://oetiker.github.io/byonk/dev/api/http-api.html#get-apisetup
export async function onRequest({ request, env}) {

  const device = lookup(request.headers, env.TRMNL_DEVICES); 
  
  // TODO generate access token 
  device.api_key = device.ID; 
  device.friendly_id = device.ID.slice(-5); 

  save(device, env.TRMNL_DEVICES); 
  
  const filename = await process(device, env); 
  
  return new Response(JSON.stringify({
     'api_key': device.api_key,
     'friendly_id': device.friendly_id,
     'image_url': `${ request.url }/../img/${ filename }`,
     'message': 'Welcome',
     'status': 200
   }), {
      headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  });
};
