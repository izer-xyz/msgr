import { ImageResponse } from 'takumi-js/response';

export default function screen(device, env) {
  return new ImageResponse(
    <h2 tw="">Welcome { device.ID } !</h2>,  
    {
      width: device.width,
      height: device.height,
      status: 404, 
    },
  );  
}