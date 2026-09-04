import { default as Device, from, list } from "../../../../src/device.js";

export default function (path, router) {
  router.get(path, listDevices);

  router.get(`${path}/preview`, ({ req, env }) => preview(req, env));

  router.post(path, async ({ env, req, ctx }) => {
    let device = new Device(
      from(env.TRMNL_DEVICES, null, await req.json()),
      env.TRMNL_DEVICES,
    );

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
  let device = (await list(env.TRMNL_DEVICES))[0];
  return await env.TRMNL_IMG.preview(device, req);
}

async function listDevices({ env }) {
  let devices = await list(env.TRMNL_DEVICES);
  return Response.json({ devices });
}
