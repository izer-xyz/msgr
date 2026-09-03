export const PROFILE_PREFIX = "P";

export default function (path, router) {
  router.get(path, ({ req }) => Response.json({ profile: req.user }));

  router.post(path, async ({ env, req, ctx }) => {
    let id = [PROFILE_PREFIX, req.user.email].join(".");

    let profile = {
      ...req.user,
      ...(await req.json()),
    };

    if (profile.email !== req.user.email) {
      return Response.error();
    }

    await env.TRMNL_BOARD.put(id, JSON.stringify(profile, null, " "));
    await ctx.exports.Audit.audit(req.user, id, "update", profile);

    return Response.json({ profile });
  });
}
