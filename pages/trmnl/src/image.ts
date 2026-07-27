import { encode } from "fast-png"; 
import { Jimp } from "jimp";

export default async function process({screen, depth}, env) {
  const { default: screen } = await import(`./screen/${ screen }.tsx`);
  let raw = await screen(device, env); 
  let jimp = (await Jimp.fromBuffer(raw)).greyscale(); 
  const png = encode(depth(jimp.bitmap, Number(depth)));
  const filename = await md5(png) + '.png'; 
  env.TRMNL_CACHE.put(filename, png); 
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

function depth({ width, height, data }, depth) {
  let out = {
        depth,
        channels: 1, 
        width,
        height,
        data:  new Uint8Array(new Array(width * height * depth / 8)) 
  };

  for (let i = 0; i < width * height; i++) { 
    out.data[Math.floor(i * depth / 8)] |=
      (data[i * 4] >> (8 - depth)) 
      <<  (8 - depth * (1 + i % (8 / depth)) ); 
  };
  
  return out; 
}
