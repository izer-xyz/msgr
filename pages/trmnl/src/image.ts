import { encode } from "fast-png"; 
import { Jimp } from "jimp";

export default async function process(device, env) {
  const { default: screen } = await import(`./screen/${ device.screen }.tsx`);
  let png = (await Jimp.fromBuffer(screen(device, env))).greyscale(); 
  const img = encode(depth(png.bitmap, Number(device.depth)));
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

function depth({ width, height, data }, depth) {
  let l = width * height,
      out = {
        depth,
        channels: 1, 
        width,
        height,
        data:  new Uint8Array(new Array(l * depth / 8)) 
      };

    for (let i = 0; i < l; i++) { 
      out.data[Math.floor(i * depth / 8)] |=
        (data[i * 4] >> (8 - depth)) 
        <<  (8 - depth * (1 + i % (8 / depth)) )
        ; 
      };
  return out; 
}
