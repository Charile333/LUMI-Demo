'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'

interface Topic {
  id: number
  title: string
  description: string
  votes: number
  createdBy: string
  createdAt: string
  hasVoted?: boolean
}

export function CreateTopicButton() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [newTopic, setNewTopic] = useState({ title: '', description: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 加载话题列表
  const loadTopics = async () => {
    try {
      const response = await fetch('/api/topics')
      if (response.ok) {
        const data = await response.json()
        setTopics(data.topics || [])
      }
    } catch (error) {
      console.error('加载话题失败:', error)
    }
  }

  // 打开窗口时加载数据
  useEffect(() => {
    if (isOpen) {
      loadTopics()
    }
  }, [isOpen])

  // 提交新话题
  const handleSubmitTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTopic.title.trim()) {
      alert(t('topic.pleaseEnterTitle'))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTopic.title,
          description: newTopic.description,
        })
      })

      if (response.ok) {
        alert(t('topic.submitSuccess'))
        setNewTopic({ title: '', description: '' })
        loadTopics()
      } else {
        const error = await response.json()
        alert(`${t('topic.submitFailed')}: ${error.error || ''}`)
      }
    } catch (error) {
      console.error('提交话题失败:', error)
      alert(`${t('topic.submitFailed')}，${t('topic.networkError')}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 投票
  const handleVote = async (topicId: number) => {
    try {
      const response = await fetch(`/api/topics/${topicId}/vote`, {
        method: 'POST',
      })

      if (response.ok) {
        setTopics(prev => prev.map(topic => 
          topic.id === topicId 
            ? { ...topic, votes: topic.votes + 1, hasVoted: true }
            : topic
        ))
        alert(t('topic.voteSuccess'))
      } else {
        const error = await response.json()
        alert(`❌ ${error.error || t('topic.voteFailed')}`)
      }
    } catch (error) {
      console.error('投票失败:', error)
      alert(t('topic.voteFailed'))
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
                onClick={loadTopics}
                className="text-amber-400 hover:text-amber-500 text-sm transition-colors"
              >
                🔄 {t('common.refresh')}
              </button>
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
                      <span className="text-xs text-gray-500">
                        {new Date(topic.createdAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })}
                      </span>
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
