import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import 'katex/dist/katex.min.css'

interface MarkdownContentProps {
  content: string
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  return (
    <div className="markdown-content prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneLight}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-surface-secondary px-1.5 py-0.5 rounded text-sm font-mono text-text-primary" {...props}>
                {children}
              </code>
            )
          },
          p({ children }) {
            return <p className="mb-3 leading-relaxed whitespace-pre-wrap text-text-primary">{children}</p>
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-3 mt-4 text-text-primary">{children}</h1>
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-2 mt-3 text-text-primary">{children}</h2>
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold mb-2 mt-3 text-text-primary">{children}</h3>
          },
          ul({ children }) {
            return <ul className="list-disc list-inside mb-3 space-y-1 text-text-primary">{children}</ul>
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-3 space-y-1 text-text-primary">{children}</ol>
          },
          li({ children }) {
            return <li className="leading-relaxed text-text-primary">{children}</li>
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-surface-border pl-4 my-3 italic text-text-secondary">
                {children}
              </blockquote>
            )
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-dark hover:underline"
              >
                {children}
              </a>
            )
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3">
                <table className="min-w-full border-collapse border border-surface-border">
                  {children}
                </table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th className="border border-surface-border px-4 py-2 bg-surface-secondary font-semibold text-left text-text-primary">
                {children}
              </th>
            )
          },
          td({ children }) {
            return (
              <td className="border border-surface-border px-4 py-2 text-text-primary">
                {children}
              </td>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
