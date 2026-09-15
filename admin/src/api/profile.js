export default function (path, router) {
  router.get(path, ({ req }) => Response.json({ profile: req.user }));

  router.post(path, async ({ req, ctx }) => {
    let profile = {
      ...req.user,
      ...(await req.json()),
    };

    if (profile.email !== req.user.email) {
      return Response.error();
    }

    await req.boardStub.saveProfile(profile);
    await ctx.exports.Audit.audit(req.user, profile.id, "update", profile);

    return Response.json({ profile });
  });
}
