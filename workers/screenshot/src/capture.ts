interface Env {
  BROWSER: BrowserRun;
}

export default {
  async scheduled(controller, env, ctx): Promise<Response> {
    return await env.BROWSER.quickAction("screenshot", {
      url: "https://",
      screenshotOptions: {
        omitBackground: true,
      },
    });
  },
} satisfies ExportedHandler<Env>;