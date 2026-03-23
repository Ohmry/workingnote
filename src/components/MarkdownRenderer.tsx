import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import styles from '../views/DailyFocusView.module.css';
import { useTaskStore } from '../store/useTaskStore';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const theme = useTaskStore(state => state.config.theme);
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className={styles.markdownPreview}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const [copied, setCopied] = useState(false);

            const handleCopy = () => {
              const code = String(children).replace(/\n$/, '');
              navigator.clipboard.writeText(code).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            };

            if (!inline && match) {
              return (
                <div style={{ position: 'relative' }}>
                  <button 
                    className={styles.copyButton} 
                    onClick={handleCopy}
                    style={{ opacity: 1, top: '12px', right: '12px' }}
                  >
                    {copied ? (
                      <><Check size={12} color="#10b981" /> <span style={{ color: '#10b981' }}>Copied!</span></>
                    ) : (
                      <><Copy size={12} /> <span>Copy</span></>
                    )}
                  </button>
                  <SyntaxHighlighter
                    style={isDark ? vscDarkPlus : oneLight}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: '0 0 8px 0',
                      borderRadius: '4px',
                      padding: '6px 8px',
                      fontSize: '12px',
                      backgroundColor: isDark ? '#1e1e1e' : '#f8f9fa'
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
