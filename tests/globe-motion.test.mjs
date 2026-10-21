import assert from 'node:assert/strict';
import test from 'node:test';
import { Euler, Quaternion, Vector3 } from 'three';
import { orientationForProject, rotateInView } from '../src/scripts/globe-motion.ts';

test('both drag axes pass a half turn and complete a full orbit', () => {
  for (const axis of ['pitch', 'yaw']) {
    const orientation = new Quaternion();
    for (let i = 0; i < 40; i++) {
      rotateInView(orientation, axis === 'pitch' ? Math.PI / 40 : 0, axis === 'yaw' ? Math.PI / 40 : 0);
    }
    assert.ok(new Vector3(0, 0, 1).applyQuaternion(orientation).z < -.999999);
    for (let i = 0; i < 40; i++) {
      rotateInView(orientation, axis === 'pitch' ? Math.PI / 40 : 0, axis === 'yaw' ? Math.PI / 40 : 0);
    }
    assert.ok(orientation.angleTo(new Quaternion()) < 1e-6);
  }
});

test('horizontal drag follows the screen after a vertical orbit past the pole', () => {
  const orientation = new Quaternion();
  rotateInView(orientation, Math.PI * .75, 0);
  const before = new Vector3(0, 0, 1).applyQuaternion(orientation);
  rotateInView(orientation, 0, Math.PI / 2);
  const after = new Vector3(0, 0, 1).applyQuaternion(orientation);
  assert.ok(Math.abs(after.y - before.y) < 1e-10);
  assert.ok(Math.abs(after.x - before.z) < 1e-10);
  assert.ok(Math.abs(orientation.length() - 1) < 1e-10);
});

test('story selection brings panels at any latitude or longitude to the front', () => {
  for (const position of [new Vector3(1, 8, -2), new Vector3(-4, -8, 1), new Vector3(0, 1, 0), new Vector3(0, 0, -1)]) {
    const target = orientationForProject(position);
    const orientation = new Quaternion().setFromEuler(new Euler(2.8, -2.2, 1.1));
    for (let i = 0; i < 100; i++) orientation.slerp(target, .2);
    const result = position.clone().normalize().applyQuaternion(orientation);
    assert.ok(result.distanceTo(new Vector3(0, 0, 1)) < 1e-6);
  }
});
