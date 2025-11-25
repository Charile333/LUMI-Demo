'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// /LUMI 直接重定向到第一个分类页面
const LUMIPage = () => {
  const router = useRouter()

  useEffect(() => {
    // 直接重定向到热门分类
    router.replace('/markets/hot')
  }, [router])

  // 显示加载状态
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading markets...</p>
      </div>
    </div>
  )
}

export default LUMIPage
