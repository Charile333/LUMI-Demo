'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Link from 'next/link'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-primary text-accent">
      {/* 导航栏 */}
      <Navbar />

      {/* 主内容区域 */}
      <main className="container mx-auto px-4 pt-24 pb-12 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-9xl font-bold mb-6 text-secondary">404</div>
          <h1 className="text-4xl font-bold mb-4 text-accent">Page Not Found</h1>
          <p className="text-xl mb-8 text-accent/70">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/" className="btn bg-secondary text-primary hover:bg-accent transition-colors duration-200 text-lg py-3 px-8 rounded-md font-bold inline-block">
            Go Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}

export default NotFoundPage