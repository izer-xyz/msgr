import { ImageResponse } from 'takumi-js/response';

export default function screen(device, env) {
  return new ImageResponse(
    <h2 tw="">Welcome { device.id } { new Date().toISOString() } !</h2>,  
    {
      width: Number(device.width),
      height: Number(device.height),
      status: 404, 
    },
  );  
}
