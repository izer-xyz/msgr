import test from "node:test";
import assert from "node:assert/strict";

import api from "../api/worker.js";
import { greyscale, validateDisplay } from "../img/src/image.js";
import { MemoryKV, jsonRequest } from "./helpers.mjs";

function apiEnv() {
  return { TRMNL_DEVICES: new MemoryKV() };
}

test("API workers return explicit responses for unknown and malformed requests", async () => {
  const env = apiEnv();
  const unknown = await api.fetch(
    new Request("https://example.test/api/unknown"),
    env,
    {},
  );
  assert.equal(unknown.status, 404);
  assert.equal(await unknown.text(), "Not found");

  const malformed = await api.fetch(
    new Request("https://example.test/api/log", {
      method: "POST",
      headers: { id: "device-1", "content-type": "application/json" },
      body: "{",
    }),
    env,
    {},
  );
  assert.equal(malformed.status, 400);
  assert.equal(await malformed.text(), "Invalid log payload");

  const valid = await api.fetch(
    jsonRequest("https://example.test/api/log", { logs: [{ level: "info" }] }, { id: "device-1" }),
    env,
    {},
  );
  assert.equal(valid.status, 204);
});

test("image conversion validates dimensions, depth, and source size", () => {
  assert.deepEqual(validateDisplay({ width: "2", height: "2", depth: "4" }), {
    width: 2,
    height: 2,
    depth: 4,
  });
  assert.equal(
    greyscale(
      { width: 2, height: 2, depth: 4 },
      new Uint8Array([0, 30, 60, 90, 120, 150, 180, 210, 240, 255, 255, 255]),
    ).length,
    2,
  );

  for (const device of [
    { width: 0, height: 2, depth: 4 },
    { width: -1, height: 2, depth: 4 },
    { width: 2.5, height: 2, depth: 4 },
    { width: 2, height: 2, depth: 3 },
    { width: 2, height: 2, depth: 16 },
  ]) {
    assert.throws(() => validateDisplay(device), RangeError);
  }
  assert.throws(
    () => greyscale({ width: 2, height: 2, depth: 4 }, new Uint8Array(3)),
    RangeError,
  );
});