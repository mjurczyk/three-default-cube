export function IntroFadeShader({ target }: {
    target: any;
}): {
    uniforms: {
        tMap: {
            value: any;
        };
        tDiffuse: {
            value: any;
        };
        fTime: {
            value: number;
        };
    };
    vertexShader: string;
    fragmentShader: string;
    transparent: boolean;
};
