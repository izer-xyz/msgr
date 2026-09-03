import { default as Device, from, list } from "../../../../src/device.js";

export default function (path, router) {
  router.get(path, listDevices);

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

async function listDevices({ env }) {
  let devices = list(env.TRMNL_DEVICES);
  return Response.json({ devices });
}
