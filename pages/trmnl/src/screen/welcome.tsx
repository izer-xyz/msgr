import { render } from 'takumi-js';

export default async function screen(device, env) {
  return render(
    <div tw="w-full h-full bg-white">
      <h2 tw="flex w-full px-10">
        <div tw="grow">Wednesday, 21 July 2026</div>
        <div tw="">23:00</div>
      </h2>
      <div tw="flex w-full">
      <div tw="flex flex-col flex-1">
        <h3 tw="justify-center">Messages</h3>
        <ul tw="flex flex-col ">
          <li tw="p-2 m-4 border-l-2 border-black ">hello this is  a very long text that will come over mutiple lines even get upto three lines of text</li>
          <li tw="p-2 m-4 border-l-2 border-black">hello</li>
          <li tw="p-2 m-4 border-l-2 border-black ">hello</li>
          <li tw="p-2 m-4 border-l-2 border-black ">hello</li>
          <li tw="p-2 m-4 border-l-2 border-black ">hello</li>
        </ul>
      </div>
      <div tw="flex flex-col flex-1">
        <h3 tw="justify-center">Today</h3>
        <ul tw="flex flex-col">
          <li tw="p-2 m-2"><span tw="">23:00</span> - Get ready this really can ge t very linf so line jfdkj fd kjfd kkkk f</li>
          <li tw="p-2 m-2">23:00 - fdfddfdf   fd dj k gfk kfgj fkjg kk fg kj j jjjjjGet ready </li>
        </ul>
      </div>
      </div>
      <div tw="flex absolute bottom-0">
      footer.. 
      </div>
    </div>,  
    {
      width: Number(device.width),
      height: Number(device.height),
      format: 'png'
    },
  );  
}
