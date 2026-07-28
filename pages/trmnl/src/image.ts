import { encode, decode } from "fast-png"; 
import { Jimp } from "jimp";
import render from "./screen/welcome.tsx"; 


export default async function process(device, env) {
  // const { default: render } = await import(`./screen/${ device.screen }.tsx`);
  let response = await render(device, env); 
  let raw = await response.arrayBuffer(); 
  let jimp = Jimp.fromBitmap(await decode(raw))
    .greyscale(); 
  const png = encode(depth(jimp.bitmap, Number(device.depth)));
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
