import { render } from 'takumi-js/response';

export default async function screen(device, env) {
  return render(
    <h2 tw="">Welcome { device.id } { new Date().toISOString() } !</h2>,  
    {
      width: Number(device.width),
      height: Number(device.height),
      status: 404,
      format: 'raw'
    },
  );  
}
