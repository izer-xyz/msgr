// https://github.com/usetrmnl/terminus/blob/main/doc/api.adoc#display
export async function onRequest({ request, env}) {

  const { pathname, searchParams } = new URL(request.url);
  const id = request.headers.get("ID"); 
  
  console.log(`[${ pathname }/${ id }] ${ JSON.stringify(request.headers) }`); 
  let filename = "hash"; 
  
  try {
    let response = JSON.stringify({
      "filename": filename,
      //"firmware_url": null,
      //"firmware_version": null,
      "image_url": `${ request.url }/../img/${ filename }.png`,
      //"image_url_timeout": 0,
      //"maximum_compatibility": false,
      "refresh_rate": 60,
      //"reset_firmware": false,
      //"special_function": "none",
      //"temperature_profile": "default",
      //"touchbar_mode": "tap",
      //"update_firmware": false
    }, null, 2);
  
    return new Response(response, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    });
  } catch (err) {
    console.log(`[${ pathname }/${ id }] ${ JSON.stringify(err) }`); 
    return new Response('Error', { status: 400 });
  }

};
