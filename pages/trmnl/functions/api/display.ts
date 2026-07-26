import lookup from '../../src/device.ts'; 
import process from '../../src/image.ts'; 

// https://github.com/usetrmnl/terminus/blob/main/doc/api.adoc#display
export async function onRequest({ request, env }) {

  const device = await lookup(request.headers, env.TRMNL_DEVICES, true); 
  
  try {

    const filename = await process(device, env); 
    
    let response = JSON.stringify({
      "filename": filename,
      //"firmware_url": null,
      //"firmware_version": null,
      "image_url": `${ request.url }/../img/${ filename }`,
      //"image_url_timeout": 0,
      //"maximum_compatibility": false,
      "refresh_rate": device.refresh_rate,
      "reset_firmware": false,
      //"special_function": "none",
      //"temperature_profile": "default",
      //"touchbar_mode": "tap",
      "update_firmware": false
    });
    console.log(`[${ device.id }] ${ response }`);  
    return new Response(response, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    });
  } catch (err) {
    console.log(`[${ device.id }] ${ err }`); 
    return new Response('Error', { status: 400 });
  }

};
