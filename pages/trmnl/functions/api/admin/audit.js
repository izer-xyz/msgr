import { jwtDecode } from "jwt-decode";

export function createAuditor(request, store) {
  let email = getEmail(request);
  let ip = getIp(request);
  return (id, action, data) => {
    store &&
      store.writeDataPoint({
        blobs: [email, ip, action, JSON.stringify(data)],
        doubles: [],
        indexes: [id],
      });
  };
}

export function getEmail(request) {
  let jwt = request.headers.get("cf-access-jwt-assertion");
  return jwt ? jwtDecode(jwt).email : "";
}

export function getIp(request) {
  return request.headers.get("x-real-ip");
}

export async function getProfile(request, store) {
  let email = getEmail(request);
  let profile = {
    ...(await store.get(["P", email].join("."), "json")),
    email,
  };
  // default name to email
  profile.name = profile.name || profile.email;
  return profile;
}
