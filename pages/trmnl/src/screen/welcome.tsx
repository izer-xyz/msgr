import { render } from 'takumi-js';

export default async function screen(device, env) {
  return render(
    <div tw="bg-white">
    <h2 tw="">Welcome { device.id } { new Date().toISOString() } !</h2>
    </div>,  
    {
      width: Number(device.width),
      height: Number(device.height),
      format: 'png'
    },
  );  
}
