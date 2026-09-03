import "./style.css";
import Alpine from "alpinejs";
import nav from "./components/html/navigation.html?raw";

import profile from "./components/profile.js";
import device from "./components/device.js";
import messages from "./components/messages.js";
import events from "./components/events.js";

let page = messages; // default page
let name = window.location.search.substring(1);
page = { profile, messages, device, events }[name] || page;

document.querySelector("#app").innerHTML += nav;
document.querySelector("#app").innerHTML += page.html;

Alpine.data("page", () => ({ name: page.name }));
Alpine.data(page.name, page.data);
Alpine.start();
