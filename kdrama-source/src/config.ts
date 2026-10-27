export type Language = "ko" | "zh" | "en" | "vi"

export const siteDefaults = {
    backgroundColor: "#F2F0E6",
    textColor: "#191C19",
    accentColor: "#F37021",
    heroNightImage: "./assets/store-seafood.jpg",
    coffeeImage: "./assets/real-coffee.png",
    facadeImage: "./assets/store-front-v2.jpg",
    waffleImage: "./assets/store-waffle.png",
    seafoodImage: "./assets/real-seafood-boil.jpg",
    address: "12A A lô A10, Khu đô thị Nam Trung Yên, Cầu Giấy, Hà Nội",
    phoneDisplay: "0822 829 399",
    phoneLink: "+84822829399",
    zaloUrl: "https://zalo.me/84822829399",
    companyUrl: "https://www.neokculture.com/",
    initialLanguage: "ko" as Language,
    translationsJson: "{}",
    bodyFont: {},
    buttonFont: {},
}

export interface PageConfig {
    language: Language
    assetPrefix: string
    languageLocked: boolean
}

export function pageProps(config: PageConfig) {
    return {
        ...siteDefaults,
        initialLanguage: config.language,
        languageLocked: config.languageLocked,
        heroNightImage: `${config.assetPrefix}assets/store-seafood.jpg`,
        coffeeImage: `${config.assetPrefix}assets/real-coffee.png`,
        facadeImage: `${config.assetPrefix}assets/store-front-v2.jpg`,
        waffleImage: `${config.assetPrefix}assets/store-waffle.png`,
        seafoodImage: `${config.assetPrefix}assets/real-seafood-boil.jpg`,
    }
}
