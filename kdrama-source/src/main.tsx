import { hydrateRoot } from "react-dom/client"
import KDramaHanoi from "./KDramaHanoi"
import { pageProps, type PageConfig } from "./config"

const config = JSON.parse(document.getElementById("kdrama-config")!.textContent!) as PageConfig
hydrateRoot(document.getElementById("kdrama-root")!, <KDramaHanoi {...pageProps(config)} />)
