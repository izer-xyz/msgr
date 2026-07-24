// https://github.com/usetrmnl/terminus/blob/main/doc/api.adoc#log
export async function onRequest({ request }) {

  const { pathname } = new URL(request.url);
  const id = request.headers.get("ID"); 
  
  request.json().logs.forEach( 
    x => console.log(`[${ pathname }/${ id }] ${ x }`)
  ); 

  return new Response("", { status: 204 });
};
