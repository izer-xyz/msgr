interface Env {
  BROWSER: BrowserRun;
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) {
      await env.BROWSER.quickAction("screenshot", {
        url: "https://www.cloudflare.com",
        screenshotOptions: {
          omitBackground: true,
        },
        viewport: {
          width: 800,
          height: 600
        },
        //gotoOptions: {
        //  waitUntil: "networkidle0"
        //},
      });
  },
} satisfies ExportedHandler<Env>;