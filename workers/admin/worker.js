import { Router } from "@tsndr/cloudflare-worker-router";
import { jwtDecode } from "jwt-decode";
import { WorkerEntrypoint } from "cloudflare:workers";
import { default as profile, PROFILE_PREFIX } from "./src/api/profile.js";
import device from "./src/api/device.js";
import messages from "./src/api/messages.js";
import events from "./src/api/events.js";

// Initialize Router
const router = new Router();

router.debug();

// Enabling build in CORS support
router.cors();

// get current user profile
router.use(async ({ env, req }) => {
    let jwt = req.headers.get("cf-access-jwt-assertion");
    let email = jwt ? jwtDecode(jwt).email : "anonymous";
    let ip = req.headers.get("x-real-ip");
    let profile = await env.TRMNL_BOARD.get(
        [PROFILE_PREFIX, email].join("."),
        "json",
    );
    req.user = {
        ...profile,
        email,
        ip,
    };
    // default name to email
    req.user.name = req.user.name || req.user.email;
});

profile("/api/admin/profile", router);
device("/api/admin/device", router);
messages("/api/admin/messages", router);
events("/api/admin/events", router);

// Listen Cloudflare Workers Fetch Event
export default {
    async fetch(request, env, ctx) {
        return router.handle(request, env, ctx, null, { user: {} });
    },
};

export class Audit extends WorkerEntrypoint {
    async audit(user, id, action, data) {
        if (this.env.TRMNL_AUDIT) {
            this.env.TRMNL_AUDIT.writeDataPoint({
                blobs: [user.email, user.ip, action, JSON.stringify(data)],
                doubles: [],
                indexes: [id],
            });
        } else {
            console.log(
                `[INFO /${user.ip}/audit/${id}/${action}] ${JSON.stringify(data)}`,
            );
        }
    }
}
