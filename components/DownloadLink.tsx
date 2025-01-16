import React from 'react'

interface DownloadLinkProps {
  href: string
  filename: string
  children: React.ReactNode
}

export function DownloadLink({ href, filename, children }: DownloadLinkProps) {
  return (
    <div className="flex items-center gap-2 my-1">
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
        {children}
      </a>
      <a
        href={href}
        download={filename}
        className="inline-flex items-center justify-center p-1 text-gray-500 hover:text-gray-700 transition-colors"
        title="下载文件"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </a>
    </div>
  )
} 