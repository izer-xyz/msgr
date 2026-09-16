import { getStub } from "../../../api/src/devices_do.js";

export default function (path, router) {
  router.get(path, listDevices);

  router.get(`${path}/preview`, ({ req, env }) => preview(req, env));

  router.post(path, async ({ env, req, ctx }) => {
    let request = await req.json();
    let stub = getStub(env, req);
    let device = await stub.from(undefined, request);

    await stub.save(device);
    await ctx.exports.Audit.audit(req.user, `D.${device.id}`, "update", device);

    let devices = await stub.list();
    return Response.json({ devices });
  });
}

async function preview(req, env) {
  let stub = getStub(env, req);
  let device = await stub.from(new Map(Object.entries(req.query)));
  let now = (await stub.deviceDateTime(device)).split(" ");
  console.log("[INFO] ADM Preview", device.id, now);

  return await env.TRMNL_IMG.preview(device, {
    date: now[0],
    time: now[1],
  });
}

async function listDevices({ env, req }) {
  let stub = getStub(env, req);
  let devices = await stub.list();
  let location = {};
  try {
    location = await req.boardStub.location();
    console.log("[INFO] ADM Board in", location.colo);
  } catch (e) {}
  return Response.json({ devices, location });
}
