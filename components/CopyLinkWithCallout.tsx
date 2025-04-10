import React, { useState } from 'react'
import { Callout } from 'nextra-theme-docs'

interface CopyLinkWithCalloutProps {
  content: string
  children: React.ReactNode
  calloutMessage?: string
  calloutType?: 'default' | 'info' | 'warning' | 'error'
  calloutEmoji?: string
}

export function CopyLinkWithCallout({ 
  content, 
  children, 
  calloutMessage = '已复制到剪贴板！', 
  calloutType = 'info',
  calloutEmoji
}: CopyLinkWithCalloutProps) {
  const [copied, setCopied] = useState(false)
  const [showCallout, setShowCallout] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setShowCallout(true)
      
      // Hide checkmark icon after 2 seconds
      setTimeout(() => setCopied(false), 2000)
      
      // Hide callout after 3 seconds
      setTimeout(() => setShowCallout(false), 3000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="mb-6">
      <div 
        className="flex items-center gap-2 my-1 cursor-pointer" 
        onClick={handleCopy}
        title={copied ? "已复制" : "复制内容"}
      >
        <span className="text-gray-500 hover:text-gray-700">
          {children}
        </span>
        <span
          className="inline-flex items-center justify-center p-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {copied ? (
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
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
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
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </span>
      </div>
      
      {showCallout && (
        calloutEmoji ? (
          <Callout emoji={calloutEmoji}>
            {calloutMessage}
          </Callout>
        ) : (
          <Callout type={calloutType}>
            {calloutMessage}
          </Callout>
        )
      )}
    </div>
  )
} 