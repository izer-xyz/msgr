import { Calendar } from "../../../../src/event.js";

export default function (path, router) {
  router.get(path, listEvents);

  router.post(path, async ({ env, req, ctx }) => {
    let calendar = new Calendar(await req.json(), env.TRMNL_BOARD);
    await calendar.save();
    await ctx.exports.Audit.audit(
      req.user,
      calendar.event.id,
      "update",
      calendar.event,
    );

    return await listEvents({ req, env });
  });

  router.delete(path, async ({ env, req, ctx }) => {
    let calendar = new Calendar(await req.json(), env.TRMNL_BOARD);
    await calendar.delete();
    await ctx.exports.Audit.audit(req.user, calendar.event.id, "delete");

    return await listEvents({ req, env });
  });
}

async function listEvents({ req, env }) {
  let events = await new Calendar(
    { date: req.query.date },
    env.TRMNL_BOARD,
  ).list();
  return Response.json({
    events,
    profile: req.user,
  });
}
