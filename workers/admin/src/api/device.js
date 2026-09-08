import { from, list, deviceDateTime } from "../../../../src/device.js";

export default function (path, router) {
  router.get(path, listDevices);

  router.get(`${path}/preview`, ({ req, env }) => preview(req, env));

  router.post(path, async ({ env, req, ctx }) => {
    let device = await from(env.TRMNL_DEVICES, null, await req.json());

    await device.save();
    await ctx.exports.Audit.audit(
      req.user,
      `D.${device.device.id}`,
      "update",
      device.device,
    );

    return listDevices({ env });
  });
}

async function preview(req, env) {
  let device = (
    await from(env.TRMNL_DEVICES, new Map(Object.entries(req.query)))
  ).device;

  let now = deviceDateTime(device).split(" ");

  console.log("[INFO] /api/admin/device/preview", device.id, now);

  return await env.TRMNL_IMG.preview(device, {
    date: now[0],
    time: now[1],
  });
}

async function listDevices({ env }) {
  let devices = await list(env.TRMNL_DEVICES);
  return Response.json({ devices });
}
