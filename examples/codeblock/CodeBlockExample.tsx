import { CodeBlock, CodeBlockCopy, CodeBlockHeader, CodeBlockViewport } from '@cognitap/radiant'

const code = `export function greet(name: string): string {
  return 'Hello, ' + name + '!'
}

console.log(greet('Radiant'))`

export function CodeBlockExample({ lineNumbers = false }: { lineNumbers?: boolean }) {
  return (
    <CodeBlock
      code={code}
      language="typescript"
      lineNumbers={lineNumbers}
    >
      <CodeBlockHeader>
        <span>greeting.ts</span>
        <CodeBlockCopy />
      </CodeBlockHeader>
      <CodeBlockViewport aria-label="greeting.ts" />
    </CodeBlock>
  )
}
