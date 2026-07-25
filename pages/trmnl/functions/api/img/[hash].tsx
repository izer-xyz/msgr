import { error_image } from "../../../src/helper.tsx";

export async function onRequest({ params, request, env}) {
  
  const { pathname } = new URL(request.url);
  const id = request.headers.get("ID"); 

  console.log(`[${ pathname }/${ id }] ${ JSON.stringify(Object.fromEntries(request.headers)) }`); 


  try {
    let png = await env.TRMNL_CACHE.get(params.hash, 'arrayBuffer');

    if (!png) throw new Error(`${params.hash} not found`);   

    return new Response(
      png,  
      { headers: { 'Content-Type': 'image/png'} }
    );

  } catch (err) {
    console.log(`[${ pathname }/${ id }] ${ JSON.stringify(err) }`);
    return error_image('Image not found');  
  }
};
