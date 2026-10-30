/// <reference types="vite/client" />

declare module 'virtual:design-revisions' {
  /** Each design's revision: a short hash of the files in its folder, by design id. */
  const revisions: Record<string, string>
  export default revisions
}

declare module '*.svg' {
  const url: string
  export default url
}
