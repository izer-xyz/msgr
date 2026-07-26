import { ImageResponse } from 'takumi-js/response';

export default function screen(device, env, params) {
  return new ImageResponse(
    <h2 tw="">${ params.message }</h2>,  
    {
      width: Number(device.width),
      height: Number(device.height),
      status: 404, 
    },
  );  
}
