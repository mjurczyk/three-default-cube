export const ParticleService: ParticleServiceClass;
declare class ParticleServiceClass {
    emitters: any[];
    init(): void;
    registerParticleEmitter(object: any, { particleObject, particleDensity, positionBase, rotationBase, scaleBase, positionJitter, rotationJitter, scaleJitter, spawnJitter, globalTransforms, onCreate, onFrame, onReset }?: {
        particleObject: any;
        particleDensity: any;
        positionBase: any;
        rotationBase: any;
        scaleBase: any;
        positionJitter: any;
        rotationJitter: any;
        scaleJitter: any;
        spawnJitter: any;
        globalTransforms: any;
        onCreate: any;
        onFrame: any;
        onReset: any;
    }): {
        particleDensity: any;
        positionBase: any;
        rotationBase: any;
        scaleBase: any;
        positionJitter: any;
        rotationJitter: any;
        scaleJitter: any;
        spawnJitter: any;
        globalTransforms: any;
        particles: any[];
        root: any;
        onFrame: any;
        onReset: any;
        active: boolean;
    };
    createRandomParticle(pivot: any, emitterProps: any): void;
    getUniformBase(value: any): any[];
    getUniformRandomness(value: any): any[];
    disposeAll(): void;
}
export {};
