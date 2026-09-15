export default function (path, router) {
  router.get(path, listEvents);

  router.post(path, async ({ req, ctx }) => {
    let event = await req.boardStub.saveEvent(await req.json());
    await ctx.exports.Audit.audit(req.user, event.id, "update", event);
    return await listEvents({ req });
  });

  router.delete(path, async ({ req, ctx }) => {
    let event = await req.boardStub.delete(await req.json());
    await ctx.exports.Audit.audit(req.user, event.id, "delete");
    return await listEvents({ req });
  });
}

async function listEvents({ req }) {
  let events = await req.boardStub.listEvents(req.query.date);
  return Response.json({
    events,
    profile: req.user,
  });
}
