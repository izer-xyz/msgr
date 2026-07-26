
export default async function process(device, env) {
  const { default: screen } = await import(`./screen/${ device.screen }.tsx`);
  const img = await (screen(device, env)).arrayBuffer();
  const filename = await md5(img) + '.png'; 
  env.TRMNL_CACHE.put(filename, img); 
  return filename; 
}

async function md5(buffer) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest({name: 'MD5'}, buffer)
    ),
    (byte) => byte.toString(16).padStart(2, '0')
  ).join('');
}