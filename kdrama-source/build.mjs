import { build } from "esbuild"
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const output = resolve(here, "../kdrama")
const shared = { bundle: true, jsx: "automatic", define: { "process.env.NODE_ENV": '"production"' }, logLevel: "info" }

await build({ ...shared, absWorkingDir: here, entryPoints: ["src/main.tsx"], outfile: `${output}/assets/kdrama-app.js`, minify: true, target: ["es2020"], format: "esm", legalComments: "eof" })
await build({ ...shared, absWorkingDir: here, entryPoints: ["src/render.tsx"], outfile: `${here}/.build/render.mjs`, platform: "node", format: "esm", packages: "external" })
const { render } = await import(`./.build/render.mjs?build=${Date.now()}`)

const metadata = {
    ko: ["보일링 시푸드 & 카페", "낮에는 카페, 저녁에는 보일링 시푸드. 하노이 K-DRAMA에서 커피와 해산물 한 상을 즐겨보세요. 메뉴, Zalo 예약 및 가맹 문의."],
    zh: ["手抓海鲜与咖啡", "白天是咖啡馆，夜晚是手抓海鲜。在河内 K-DRAMA 享用咖啡与海鲜盛宴。查看菜单、通过 Zalo 预订或咨询加盟。"],
    en: ["Boiling Seafood & Café", "Good coffee by day. Korean-style boiling seafood by night. Explore the menu, request a table on Zalo or enquire about a K-DRAMA franchise in Hanoi."],
    vi: ["Boiling Seafood & Cà phê", "Ban ngày cà phê, buổi tối hải sản kiểu Hàn. Khám phá thực đơn K-DRAMA Hà Nội, gửi yêu cầu đặt bàn qua Zalo và tìm hiểu nhượng quyền."],
}

for (const route of ["", "ko", "zh", "en", "vi"]) {
    const language = route || "ko"
    const prefix = route ? "../" : "./"
    const config = { language, assetPrefix: prefix, languageLocked: Boolean(route) }
    const destination = resolve(output, route)
    await mkdir(destination, { recursive: true })
    const canonical = `https://www.kdramahanoi.com/${route ? route + "/" : ""}`
    const alternates = Object.keys(metadata).map(lang => `<link rel="alternate" hreflang="${lang === "zh" ? "zh-Hans" : lang}" href="https://www.kdramahanoi.com/${lang}/">`).join("\n")
    const html = `<!doctype html>
<html lang="${language === "zh" ? "zh-Hans" : language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#191C19">
<title>K-DRAMA Hanoi | ${metadata[language][0]}</title>
<meta name="description" content="${metadata[language][1]}">
<link rel="canonical" href="${canonical}">
${alternates}
<link rel="alternate" hreflang="x-default" href="https://www.kdramahanoi.com/">
<link rel="icon" href="${prefix}assets/kdrama-logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link id="kdrama-fonts" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700;800&display=swap">
<meta property="og:type" content="restaurant">
<meta property="og:title" content="K-DRAMA Hanoi | ${metadata[language][0]}">
<meta property="og:description" content="${metadata[language][1]}">
<meta property="og:image" content="https://www.kdramahanoi.com/assets/store-seafood.jpg">
<meta property="og:url" content="${canonical}">
<style>html{scroll-behavior:smooth;scroll-padding-top:24px}body{margin:0;background:#F2F0E6;color:#191C19}button,input,textarea,select{font:inherit}img{max-width:100%}#location{scroll-margin-top:24px}noscript{display:block;padding:20px;background:#F37021;font-family:sans-serif}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}</style>
</head>
<body>
<div id="kdrama-root">${render(config)}</div>
<noscript>예약 / Reservations / 预订 / Đặt bàn: <a href="tel:+84822829399">0822 829 399</a> · <a href="https://zalo.me/84822829399">Zalo</a></noscript>
<script id="kdrama-config" type="application/json">${JSON.stringify(config)}</script>
<script type="module" src="${prefix}assets/kdrama-app.js"></script>
</body>
</html>
`
    await writeFile(resolve(destination, "index.html"), html)
}
console.log("Built K-DRAMA Orange Edition and all four language pages into kdrama/.")
