
import React from 'react'
import { Card } from '../src/components/ui/card'

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="p-6 space-y-6">
      {title && (
        <div className="border-b border-border/40 pb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
      )}
      <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          {children}
        </div>
      </Card>
    </div>
  )
}
