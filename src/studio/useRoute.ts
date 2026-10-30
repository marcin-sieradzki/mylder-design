// The studio's two places, in the address's hash so a static host serves every one from
// index.html: the gallery (`#/`) and a design (`#/d/<design-id>`).
import { useSyncExternalStore } from 'react'

export type Route = { page: 'gallery' } | { page: 'design'; designId: string }

export function routeOf(hash: string): Route {
  const match = /^#\/d\/([\w-]+)/.exec(hash)
  return match ? { page: 'design', designId: match[1]! } : { page: 'gallery' }
}

export const hrefOf = (route: Route) => (route.page === 'design' ? `#/d/${route.designId}` : '#/')

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return routeOf(hash)
}
