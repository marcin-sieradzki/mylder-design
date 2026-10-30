// Headings for Perron's Text `render` prop, as `<Text variant="heading-sm" render={h2}>`: Text
// sets the type, the heading sets the page's outline.
import type { HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLHeadingElement>

export const h1 = ({ children, ...props }: Props) => <h1 {...props}>{children}</h1>
export const h2 = ({ children, ...props }: Props) => <h2 {...props}>{children}</h2>
export const h3 = ({ children, ...props }: Props) => <h3 {...props}>{children}</h3>
