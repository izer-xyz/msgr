import { encode } from "fast-png"; 
import { Jimp } from "jimp"; 

interface Env {
  BROWSER: BrowserRun;
}

const KV = new Map(); 
const DEFAULT_CONFIG = {
  id:           0,
  url:          "https://www.cloudflare.com/not-found-404/",
  width:        800,  // px
  height:       600,  // px
  greyscale:    1, // 1 true 
  depth:        1, // 1 bit -> 2 colours
  refresh_rate: 60 * 5, // min
  timezone:     "UTC",
  sleep_from:   21, // 0-23 in hours
  sleep_to:     7,  // 0-23 in hourse
}


// keys
//  * config:[id]
//    {
//      id:,
//      url:,
//      width:, // px
//      height:, // px
//      greyscale:, // boolean 
//      depth:, // in bits
//      refresh_rate: // in secs / min 60 
//    }
//  * response:[id] //https://help.trmnl.com/en/articles/11035846-redirect-plugin
//    {
//      filename:,
//      url:, // finish with [name]
//      refresh_rate
//    }
//  * image:[name]
export default {
  async fetch(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) {
      // const config = KV.get(
      const response = await env.BROWSER.quickAction("screenshot", {
        //url: "https://www.cloudflare.com",
         url: "https://wikipedia.org",
        screenshotOptions: {
          //omitBackground: true,
        },
        viewport: {
          width: 800,
          height: 600
        },
        //gotoOptions: { 
        //  waitUntil: "networkidle0"
        //},
      });
      
      let b = await (new Response(response.body).arrayBuffer());
      
      let img = (await Jimp.fromBuffer(b))
      	.threshold({max: 210}).quantize({ 
		colors: 16,
//	        colorDistanceFormula: "",	
		imageQuantization: "sierra"	
	}).posterize(5); 
      
      console.log(img); 
      let out = encode(depth(img.bitmap, 1)); 
      
      return new Response(out, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-store",
        },
      }); 
  },
} satisfies ExportedHandler<Env>;

function depth(img, depth) {
  let l = img.width * img.height,
      out = {
	  depth: depth,
	  channels: 1, 
	  width: img.width,
	  height: img.height,
          data:  new Uint8Array(new Array(l * depth / 8)) 
      };

    for (let i = 0; i < l; i++) { 
      out.data[Math.floor(i * depth / 8)] |=
        (img.data[i * 4] >> (8 - depth)) 
        <<  (8 - depth * (1 + i % (8 / depth)) )
        ; 
      };
  return out; 
}
