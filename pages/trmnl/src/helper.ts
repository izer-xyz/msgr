import { ImageResponse } from "takumi-js/response";

export function image() {
  
}


export function error_image(message) {
  return new ImageResponse(
    <h2 tw="">${ message }</h2>,  
    {
      width: 1872,
      height: 1404,
      status: 404, 
    },
  );  
}