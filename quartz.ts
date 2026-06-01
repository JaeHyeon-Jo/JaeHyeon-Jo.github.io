import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

// Attempt to load external plugins to override Explorer sorting
try {
  // @ts-ignore
  const ExternalPlugin = await import("./.quartz/plugins/index.js")
  if (ExternalPlugin && ExternalPlugin.Explorer) {
    ExternalPlugin.Explorer({
      sortFn: (a, b) => {
        if ((!a.file && !b.file) || (a.file && b.file)) {
          if (a.file && b.file) {
            const aDate = a.file.dates?.modified ?? a.file.dates?.created ?? new Date(0)
            const bDate = b.file.dates?.modified ?? b.file.dates?.created ?? new Date(0)
            if (aDate.getTime() !== bDate.getTime()) {
              return bDate.getTime() - aDate.getTime() // newer first
            }
          }
          return a.displayName.localeCompare(b.displayName)
        }
        if (a.file && !b.file) {
          return 1
        } else {
          return -1
        }
      }
    })
  }
} catch (e) {
  // Ignore if plugins are not installed locally
}

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
