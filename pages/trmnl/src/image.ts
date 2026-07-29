import { encode, decode } from 'fast-png'; 
import { Jimp } from 'jimp';
import error   from './screen/error.tsx'; 
import welcome from './screen/welcome.tsx'; 
import board   from './screen/board.tsx'; 

const SCREENS = {
  error, 
  welcome, 
  board
}

export default async function process(device, env) {
  let render = SCREENS[device.screen] || error; 
  let response = await render(device, env); 
  let raw = await response.arrayBuffer(); 
  let jimp = Jimp.fromBitmap(await decode(raw)).greyscale(); 
  const png = encode(depth(jimp.bitmap, Number(device.depth)));
  return png; 
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
