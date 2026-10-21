import { Euler, Quaternion, Vector3 } from 'three';

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
