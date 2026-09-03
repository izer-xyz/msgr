import { Message } from "../../../../src/event.js";

export default function (path, router) {
  router.get(path, listMessages);

  router.post(path, async ({ env, req, ctx }) => {
    let message = new Message(await req.json(), env.TRMNL_BOARD);
    await message.save();
    await ctx.exports.Audit.audit(
      req.user,
      message.event.id,
      "update",
      message.event,
    );

    return await listMessages({ req, env });
  });

  router.delete(path, async ({ env, req, ctx }) => {
    let message = new Message(await req.json(), env.TRMNL_BOARD);
    await message.delete();
    await ctx.exports.Audit.audit(req.user, message.event.id, "delete");

    return await listMessages({ req, env });
  });
}

async function listMessages({ req, env }) {
  let messages = await new Message(
    { date: req.query.date },
    env.TRMNL_BOARD,
  ).list();
  return Response.json({
    messages,
    profile: req.user,
  });
}
