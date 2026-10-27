import { renderToString } from "react-dom/server"
import KDramaHanoi from "./KDramaHanoi"
import { pageProps, type PageConfig } from "./config"

export function render(config: PageConfig) {
    return renderToString(<KDramaHanoi {...pageProps(config)} />)
}
