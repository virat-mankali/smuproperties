// Shared state to tell the auth navigator where to go after sign-in.
// `pending` distinguishes a fresh sign-in (target was explicitly set)
// from a reload (no target was set, must read role from DB).

let target: "/(customer)/" | "/(agent)/dashboard" = "/(customer)/";
let pending = false;

export function setAuthTarget(t: "/(customer)/" | "/(agent)/dashboard") {
  target = t;
  pending = true;
}

export function getAuthTarget() {
  return target;
}

export function hasPendingTarget() {
  return pending;
}

export function consumeAuthTarget() {
  const t = target;
  target = "/(customer)/";
  pending = false;
  return t;
}
