export default function (path, router) {
  router.get(path, listMessages);

  router.get(path + "/image", async ({ req }) => {
    let img = await req.boardStub.getImage();
    return new Response(img.content, {
      headers: {
        "Content-Type": img.type,
      },
    });
  });

  router.post(path + "/image", async ({ req }) => {
    let form = await req.formData();
    let file = form.get("image");
    await req.boardStub.saveImage(await file.arrayBuffer(), file.type);
    return Response.redirect(req.headers.get("referer"));
  });

  router.post(path, async ({ req, ctx }) => {
    let message = await req.boardStub.saveMessage(await req.json());
    await ctx.exports.Audit.audit(req.user, message.id, "update", message);
    return await listMessages({ req });
  });

  router.delete(path, async ({ req, ctx }) => {
    let message = await req.boardStub.delete(await req.json());
    await ctx.exports.Audit.audit(req.user, message.id, "delete");
    return await listMessages({ req });
  });
}

async function listMessages({ req }) {
  let messages = await req.boardStub.listMessages(req.query.date);
  return Response.json({
    messages,
    profile: req.user,
  });
}
