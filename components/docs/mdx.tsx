import { isValidElement, type ComponentProps, type ReactNode } from 'react'
import {
  Alert,
  AlertTitle,
  CodeBlock,
  CodeBlockContent,
  CodeBlockCopy,
  CodeBlockHeader,
  CodeBlockViewport,
  InlineCode,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  type TableProps
} from '@cognitap/radiant'

export function Callout({ title = 'Note', children }: { title?: string; children: ReactNode }) {
  return (
    <Alert className="mdx-callout">
      <AlertTitle level={3}>{title}</AlertTitle>
      <div>{children}</div>
    </Alert>
  )
}

/** The highlighted code's plain text, for copying. */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

/** Shiki's pre wraps one code element; CodeBlock supplies both, so keep only its lines. */
function Pre({ children }: ComponentProps<'pre'>) {
  const lines = isValidElement<{ children?: ReactNode }>(children)
    ? children.props.children
    : children
  return (
    <CodeBlock
      code={textOf(lines)}
      className="mdx-code"
    >
      <CodeBlockHeader className="mdx-code-header">
        <CodeBlockCopy
          variant="ghost"
          tone="neutral"
          controlSize="small"
        >
          Copy
        </CodeBlockCopy>
      </CodeBlockHeader>
      <CodeBlockViewport aria-label="Code example">
        <CodeBlockContent>{lines}</CodeBlockContent>
      </CodeBlockViewport>
    </CodeBlock>
  )
}

function DataTable(props: TableProps) {
  return (
    <TableContainer
      aria-label="Data table"
      className="mdx-table"
    >
      <Table {...props} />
    </TableContainer>
  )
}

export const mdxComponents = {
  Callout,
  pre: Pre,
  code: InlineCode,
  table: DataTable,
  thead: TableHead,
  tbody: TableBody,
  tr: TableRow,
  th: TableHeader,
  td: TableCell
}
