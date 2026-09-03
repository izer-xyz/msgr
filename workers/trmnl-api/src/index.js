import { from } from "../../../src/device.js";

export default {
  // /api/[display|log|setup]
  async fetch(request, env, ctx) {
    let path = new URL(request.url).pathname.split("/").filter((a) => a !== "");
    let data = await from(env.TRMNL_DEVICES, request.headers);
    let response = null;

    if (path[1] === "display") {
      response = await display(data, request, env);
    } else if (path[1] === "log") {
      log(data, request);
      return new Response(null, { status: 204 });
    } else if (path[1] === "setup") {
      response = await setup(data, request);
    } else {
      return new Response("Not found", { status: 404 });
    }
    return Response.json(response);
  },
};

async function display(data, request, env) {
  // only save twice/3 a day KV limits apply
  if (
    new Date(data.device.updated || 0).toDateString() !==
      new Date().toDateString() ||
    data.device.sleep !== ""
  ) {
    await data.save();
  }
  let filename = data.getFilename();

  metrics(data, env);

  return {
    filename: filename.replaceAll("/", "_"),
    //'firmware_url': null,
    //'firmware_version': null,
    image_url: new URL(`/api/screen-v2/${filename}`, request.url),
    //'image_url_timeout': 0,
    //'maximum_compatibility': false,
    refresh_rate: data.device.sleep || data.device.refresh_rate,
    reset_firmware: false,
    //'special_function': 'none',
    update_firmware: false,
  };
}

async function log(data, request) {
  let body = await request.json();
  let logs = Array.isArray(body?.logs) ? body.logs : [];
  for (const log of logs) {
    console.log(`[/api/log/${data.device.id}] ${JSON.stringify(log)}`);
  }
}

async function setup(data, request) {
  // TODO generate access token
  data.device.api_key = data.device.id;
  data.device.friendly_id = data.device.id.slice(-5);
  await data.save();

  return {
    api_key: data.device.api_key,
    friendly_id: data.device.friendly_id,
    image_url: new URL(`/api/screen-v2/${data.getFilename()}`, request.url),
    message: "Welcome",
    status: 200,
  };
}

async function metrics(data, env) {
  if (env.TRMNL_ANALYTICS) {
    env.TRMNL_ANALYTICS.writeDataPoint({
      blobs: [
        data.device["x-real-ip"],
        data.device.model,
        data.device["fw-version"],
        data.device.friendly_id,
        data.getFilename(),
      ],
      doubles: [
        Number(data.device["wake-time"]),
        Number(data.device["battery-voltage"]),
        Number(data.device.refresh_rate),
      ],
      indexes: [data.device.id],
    });
  } else {
    // no analytics just save to KV
    console.log(
      `[INFO /api/display/${data.device.id}] ${JSON.stringify(data.device)}`,
    );
    await data.save();
  }
}
