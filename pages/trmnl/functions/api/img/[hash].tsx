import { error_image } from "../src/helper.ts";

export async function onRequest({ params, request, env}) {
  
  const { pathname } = new URL(request.url);
  const id = request.headers.get("ID"); 

  console.log(`[${ pathname }/${ id }] ${ JSON.stringify(request.headers) }`); 

  try {
    
  return new Response(
    env.TRMNL_CACHE.get(params.hash), 
    { "Content-Type": "image/png" }
  );

  } catch (err) {
    console.log(`[${ pathname }/${ id }] ${ JSON.stringify(err) }`);
    return error_image("Image not found");  
  }
};
