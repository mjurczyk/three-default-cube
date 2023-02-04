import * as Three from "three";

export const DQ = {
  ShadowsAllObjects: 0x111111,
  ShadowsNoneObjects: 0x000000,
  ShadowsStaticObjects: 0x100000,
  ShadowsDynamicObjects: 0x010000,
};

export const math2Pi = Math.PI * 2.0;
export const mathPi2 = Math.PI / 2.0;
export const mathPi4 = Math.PI / 4.0;
export const mathPi8 = Math.PI / 8.0;

export const axisX = new Three.Vector3(1.0, 0.0, 0.0);
export const axisY = new Three.Vector3(0.0, 1.0, 0.0);
export const axisZ = new Three.Vector3(0.0, 0.0, 1.0);
