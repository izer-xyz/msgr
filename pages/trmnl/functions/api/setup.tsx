import { ImageResponse } from "takumi-js/response";

// https://github.com/usetrmnl/terminus/blob/main/doc/api.adoc#setup
// https://oetiker.github.io/byonk/dev/api/http-api.html#get-apisetup
export async function onRequest({ request, env}) {

  const { pathname } = new URL(request.url);
  const id = request.headers.get("ID"); 
  
  console.log(`[${ pathname }/${ id }] ${ JSON.stringify(request.headers) }`);

  // TODO generate access token 

  env.TRMNL_CACHE.put(id, await (new ImageResponse(
    <h2 tw="">Hello { id } </h2>,  
    {
      width: 1872,
      height: 1404,
    },
  )).arrayBuffer()); 
  
  return new Response(JSON.stringify({
     "api_key": id,
     "friendly_id": id,
     "image_url": `${ request.url }/../img/${ id }`,
     "message": "Hello",
     "status": 200
   }), {
      headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  });
};
