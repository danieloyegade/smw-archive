import { Euler, Matrix4, Quaternion, Vector3 } from 'three';

const turn = new Quaternion();
const angles = new Euler();

// Follow the screen's axes even after passing a pole, without rotation limits.
export function rotateInView(orientation: Quaternion, pitch: number, yaw: number) {
  turn.setFromEuler(angles.set(pitch, yaw, 0, 'XYZ'));
  orientation.premultiply(turn).normalize();
}

export function orientationForProject(position: Vector3) {
  const yaw = -Math.atan2(position.x, position.z);
  const pitch = Math.atan2(position.y, Math.hypot(position.x, position.z));
  return new Quaternion().setFromEuler(new Euler(pitch, yaw, 0, 'XYZ'));
}

const normal = new Vector3();
const right = new Vector3();
const up = new Vector3();
const basis = new Matrix4();
const facing = new Quaternion();

// Keep a panel facing outward from the globe with its top toward the top of the
// screen, whatever the globe's orientation. Returns the panel's local rotation.
export function uprightPanelQuaternion(position: Vector3, orientation: Quaternion, out: Quaternion) {
  normal.copy(position).normalize().applyQuaternion(orientation);
  right.set(0, 1, 0).cross(normal);
  // Facing straight up or down has no "up" on screen; keep screen-right stable.
  if (right.lengthSq() < 1e-8) right.set(1, 0, 0);
  right.normalize();
  up.crossVectors(normal, right);
  facing.setFromRotationMatrix(basis.makeBasis(right, up, normal));
  return out.copy(orientation).invert().multiply(facing);
}
