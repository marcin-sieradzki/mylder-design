import { designById } from '../designs/registry.ts'
import { Editor } from './Editor.tsx'
import { Gallery } from './Gallery.tsx'
import { useRoute } from './useRoute.ts'
import { useTheme } from './useTheme.ts'

export function App() {
  const route = useRoute()
  const [theme, setTheme] = useTheme()
  const design = route.page === 'design' ? designById(route.designId) : undefined

  if (design)
    return <Editor key={design.id} design={design} theme={theme} onThemeChange={setTheme} />
  return <Gallery theme={theme} onThemeChange={setTheme} missing={route.page === 'design'} />
}
