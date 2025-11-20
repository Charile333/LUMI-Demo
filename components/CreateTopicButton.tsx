'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'
import { useWallet } from '@/app/provider-wagmi'
import { useToast } from '@/components/Toast'

interface Topic {
  id: number
  title: string
  description: string
  votes: number
  createdBy: string
  createdAt: string
  category?: string
  hasVoted?: boolean
}

export function CreateTopicButton() {
  const { t } = useTranslation()
  const { address: userAddress, isConnected, connectWallet } = useWallet()
  const { success: toastSuccess, error: toastError, info: toastInfo, warning: toastWarning } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [newTopic, setNewTopic] = useState({ title: '', description: '', category: 'automotive' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // 话题分类选项
  const topicCategories = [
    { value: 'all', label: t('topic.allCategories'), icon: '📊' },
    { value: 'automotive', label: t('categories.automotive') || '汽车', icon: '🚗' },
    { value: 'tech-ai', label: t('categories.techAi') || '科技与AI', icon: '🤖' },
    { value: 'entertainment', label: t('categories.entertainment') || '娱乐', icon: '🎬' },
    { value: 'smart-devices', label: t('categories.smartDevices') || '智能设备', icon: '📱' },
    { value: 'sports-gaming', label: t('categories.sportsGaming') || '体育与游戏', icon: '⚽' },
    { value: 'economy-social', label: t('categories.economySocial') || '经济与社会', icon: '💰' },
    { value: 'emerging', label: t('categories.emerging') || '新兴', icon: '🌟' },
  ]

  // ✅ 检查用户是否已投票
  const checkUserVoted = async (topicId: number, address: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/topics/${topicId}/vote/check?userAddress=${address}`)
      if (response.ok) {
        const data = await response.json()
        return data.hasVoted || false
      }
    } catch (error) {
      console.error('检查投票状态失败:', error)
    }
    return false
  }

  // 加载话题列表
  const loadTopics = async (category?: string) => {
    try {
      const categoryParam = category !== undefined ? category : selectedCategory
      const url = categoryParam && categoryParam !== 'all' 
        ? `/api/topics?category=${categoryParam}`
        : '/api/topics'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        const topics = data.topics || []
        
        // ✅ 如果有用户地址，检查每个话题的投票状态
        if (userAddress) {
          const topicsWithVoteStatus = await Promise.all(
            topics.map(async (topic: Topic) => ({
              ...topic,
              hasVoted: await checkUserVoted(topic.id, userAddress)
            }))
          )
          setTopics(topicsWithVoteStatus)
        } else {
          // 没有用户地址，设置默认值
          setTopics(topics.map((topic: Topic) => ({
            ...topic,
            hasVoted: false
          })))
        }
      }
    } catch (error) {
      console.error('加载话题失败:', error)
    }
  }

  // 打开窗口时加载数据，当用户地址或分类变化时也重新加载
  useEffect(() => {
    if (isOpen) {
      loadTopics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userAddress, selectedCategory])

  // 提交新话题
  const handleSubmitTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTopic.title.trim()) {
      toastWarning(t('topic.pleaseEnterTitle'))
      return
    }

    setIsSubmitting(true)

    try {
      console.log('📤 提交话题:', { title: newTopic.title, description: newTopic.description })
      
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTopic.title,
          description: newTopic.description,
          category: newTopic.category || 'general',
        })
      })

      console.log('📥 API 响应状态:', response.status, response.statusText)
      
      // ✅ 确保正确解析响应，即使状态码不是 200
      let data;
      try {
        const text = await response.text()
        console.log('📥 API 原始响应:', text)
        data = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error('❌ 解析响应失败:', parseError)
        data = { error: '无法解析服务器响应' }
      }
      
      console.log('📥 API 响应数据:', data)

      if (response.ok && data.success) {
        console.log('✅ 话题创建成功:', data.topic)
        toastSuccess(t('topic.submitSuccess'))
        setNewTopic({ title: '', description: '', category: 'automotive' })
        loadTopics()
      } else {
        // ✅ 增强错误处理：显示详细错误信息
        const errorMessage = data.error || `HTTP ${response.status}: ${response.statusText}`
        const errorCode = data.errorCode || ''
        const errorDetails = data.errorDetails || ''
        
        console.error('❌ 创建话题失败:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          errorCode,
          errorDetails,
          fullResponse: data
        })
        
        // ✅ 显示详细的错误信息
        let toastMessage = `${t('topic.submitFailed')}\n\n错误: ${errorMessage}`
        if (errorCode) {
          toastMessage += `\n错误代码: ${errorCode}`
        }
        if (data.errorDetails && process.env.NODE_ENV === 'development') {
          toastMessage += `\n详情: ${JSON.stringify(data.errorDetails, null, 2)}`
        }
        
        // ✅ 如果是表不存在错误，提供明确的解决方案
        if (errorMessage.includes('表尚未创建') || errorMessage.includes('does not exist')) {
          toastMessage += `\n\n解决方案: 请在 Supabase 中运行 database/create-user-topics-table.sql 创建表`
        }
        
        toastError(toastMessage, { duration: 8000 })
        
        // ✅ 同时输出到控制台，方便调试
        console.error('完整错误信息:', JSON.stringify(data, null, 2))
      }
    } catch (error: any) {
      console.error('❌ 提交话题异常:', error)
      console.error('错误堆栈:', error.stack)
      
      const errorMessage = error.message || '网络错误'
      toastError(`${t('topic.submitFailed')}，${errorMessage}\n\n请检查控制台获取详细错误信息。`, { duration: 7000 })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ✅ 投票（增强版：要求用户连接钱包）
  const handleVote = async (topicId: number) => {
    // ✅ 检查用户是否已连接钱包（不在这里弹出第二个连接对话框，统一使用导航栏的 WalletConnect）
    if (!isConnected || !userAddress) {
      toastInfo(
        `${t('topic.voteRequiresWallet') || '投票需要连接钱包'}\n\n` +
        `${t('topic.connectWalletToVote') || '请先使用页面右上角的“连接钱包”按钮连接 OKX / MetaMask 等钱包。'}`,
        { duration: 6000 }
      )
      return
    }

    // ✅ 检查是否已投票（防止重复点击）
    const topic = topics.find(t => t.id === topicId)
    if (topic?.hasVoted) {
      toastWarning(t('topic.alreadyVoted') || '您已经投过票了')
      return
    }

    try {
      const response = await fetch(`/api/topics/${topicId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-address': userAddress
        },
        body: JSON.stringify({
          userAddress: userAddress
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // ✅ 更新本地状态
        setTopics(prev => prev.map(topic => 
          topic.id === topicId 
            ? { ...topic, votes: data.votes || topic.votes + 1, hasVoted: true }
            : topic
        ))
        toastSuccess(t('topic.voteSuccess') || '✅ 投票成功！')
      } else {
        // ✅ 增强错误处理
        const errorMessage = data.error || t('topic.voteFailed') || '投票失败'
        
        // ✅ 如果是重复投票错误，更新本地状态
        if (errorMessage.includes('已经投过') || errorMessage.includes('already voted')) {
          setTopics(prev => prev.map(topic => 
            topic.id === topicId 
              ? { ...topic, hasVoted: true }
              : topic
          ))
        }
        
        toastError(`❌ ${errorMessage}`)
      }
    } catch (error: any) {
      console.error('投票失败:', error)
      toastError(`❌ ${error.message || t('topic.voteFailed') || '投票失败'}`)
    }
  }

  return (
    <>
      {/* 悬浮按钮容器 */}
      <div className="fixed bottom-8 right-8 z-50">
        {/* 气泡提示 - create & vote */}
        <div className="absolute bottom-full right-0 mb-3 animate-bounce-slow">
          <div className="relative bg-amber-400 text-black px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
            <span className="text-sm font-semibold tracking-wide">{t('topic.createAndVote')}</span>
            {/* 气泡三角形箭头 */}
            <div className="absolute top-full right-6 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-amber-400"></div>
          </div>
        </div>
        
        {/* 悬浮按钮 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full shadow-2xl hover:scale-110 transform transition-all duration-300 hover:shadow-amber-500/50 group"
          title={t('topic.create')}
        >
          <Image
            src="/image/LUMI-logo.png"
            alt={t('topic.createButton')}
            width={64}
            height={64}
            className="rounded-full group-hover:rotate-12 transition-transform duration-300"
          />
        </button>
      </div>

      {/* 悬浮小窗口 */}
      {isOpen && (
        <div className="fixed bottom-28 right-8 z-[110] w-[420px] max-h-[calc(100vh-9rem)] bg-zinc-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-amber-400/30 animate-fadeIn">
          {/* 头部 - 关闭按钮 */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 z-10 text-gray-400 hover:text-amber-400 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
          >
            ×
          </button>

          {/* 上栏：创建投票区域 */}
          <div className="flex-shrink-0 bg-zinc-950 p-5 border-b border-white/5">
            <h3 className="text-lg font-semibold text-amber-400 mb-3"> {t('topic.create')}</h3>
            <form onSubmit={handleSubmitTopic} className="space-y-3">
              <input
                type="text"
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-amber-400 bg-white/5 text-white placeholder-gray-500 transition-colors"
                placeholder={t('topic.titlePlaceholder')}
                maxLength={100}
                required
              />
              <textarea
                value={newTopic.description}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-amber-400 bg-white/5 text-white placeholder-gray-500 resize-none h-16 transition-colors"
                placeholder={t('topic.descriptionPlaceholder')}
                maxLength={200}
              />
              <select
                value={newTopic.category}
                onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-amber-400 bg-white/5 text-white transition-colors"
              >
                {topicCategories.filter(cat => cat.value !== 'all').map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-zinc-900">
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-400 hover:bg-amber-500 text-black px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? t('topic.submitting') : t('topic.publishTopic')}
              </button>
            </form>
          </div>

          {/* 下栏：投票列表区域 */}
          <div className="flex-1 bg-zinc-900 overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-semibold text-white">{t('topic.allTopics')} ({topics.length})</h3>
              <button
                onClick={() => loadTopics()}
                className="text-amber-400 hover:text-amber-500 text-sm transition-colors"
              >
                🔄 {t('common.refresh')}
              </button>
            </div>
            
            {/* 分类筛选器 */}
            <div className="mb-3 flex flex-wrap gap-2">
              {topicCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value)
                    loadTopics(cat.value)
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat.value
                      ? 'bg-amber-400 text-black'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {topics.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm mb-1">{t('topic.noTopics')}</p>
                <p className="text-xs text-gray-600">{t('topic.noTopicsHint')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-zinc-950 border border-white/10 rounded-lg p-3 hover:border-amber-400/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-white flex-1 pr-2 leading-snug">
                        {topic.title}
                      </h4>
                      <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
                        <span className="text-amber-400 font-bold text-sm">{topic.votes}</span>
                        <span className="text-amber-400/70 text-xs">{t('topic.votes')}</span>
                      </div>
                    </div>
                    
                    {topic.description && (
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                        {topic.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2">
                        {topic.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                            {topicCategories.find(cat => cat.value === topic.category)?.icon || '📌'} {topicCategories.find(cat => cat.value === topic.category)?.label || topic.category}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(topic.createdAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })}
                        </span>
                      </div>
                      <button
                        onClick={() => handleVote(topic.id)}
                        disabled={topic.hasVoted}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          topic.hasVoted
                            ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                            : 'bg-amber-400 text-black hover:bg-amber-500'
                        }`}
                      >
                        {topic.hasVoted ? t('topic.voted') : t('topic.vote')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-bounce-slow {
          animation: bounceSlow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
