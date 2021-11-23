export const MoneyService: MoneyServiceClass;
declare class MoneyServiceClass {
    platformId: any;
    adsInitialised: boolean;
    init(): Promise<any>;
    showAd(then?: () => void): Promise<any>;
}
export {};
