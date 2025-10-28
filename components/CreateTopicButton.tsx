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
          <div className="relative bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
            <span className="text-sm font-semibold tracking-wide">Create & Vote</span>
            {/* 气泡三角形箭头 */}
            <div className="absolute top-full right-6 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-purple-600"></div>
          </div>
        </div>
        
        {/* 悬浮按钮 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full shadow-2xl hover:scale-110 transform transition-all duration-300 hover:shadow-purple-500/50 group"
          title={t('topic.create')}
        >
          <Image
            src="/image/create.png"
            alt={t('topic.createButton')}
            width={64}
            height={64}
            className="rounded-full group-hover:rotate-12 transition-transform duration-300"
          />
        </button>
      </div>

      {/* 悬浮小窗口 */}
      {isOpen && (
        <div className="fixed bottom-28 right-8 z-[60] w-[420px] h-[750px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-purple-300 animate-fadeIn">
          {/* 头部 - 关闭按钮 */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 z-10 text-purple-500 hover:text-purple-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-purple-100 transition-colors"
          >
            ×
          </button>

          {/* 上栏：创建投票区域 */}
          <div className="h-[280px] bg-gradient-to-br from-purple-50 to-white p-5 border-b-2 border-purple-200">
            <h3 className="text-lg font-bold text-purple-700 mb-3">✨ {t('topic.create')}</h3>
            <form onSubmit={handleSubmitTopic} className="space-y-2">
              <input
                type="text"
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                placeholder={t('topic.titlePlaceholder')}
                maxLength={100}
                required
              />
              <textarea
                value={newTopic.description}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white resize-none h-16"
                placeholder={t('topic.descriptionPlaceholder')}
                maxLength={200}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? t('topic.submitting') : t('topic.publishTopic')}
              </button>
            </form>
          </div>

          {/* 下栏：投票列表区域 (2/3) */}
          <div className="flex-1 bg-white overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-bold text-gray-800">{t('topic.allTopics')} ({topics.length})</h3>
              <button
                onClick={loadTopics}
                className="text-purple-500 hover:text-purple-700 text-sm"
              >
                🔄 {t('common.refresh')}
              </button>
            </div>

            {topics.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm mb-1">{t('topic.noTopics')}</p>
                <p className="text-xs">{t('topic.noTopicsHint')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-lg p-3 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-800 flex-1 pr-2 leading-snug">
                        {topic.title}
                      </h4>
                      <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-full">
                        <span className="text-purple-700 font-bold text-sm">{topic.votes}</span>
                        <span className="text-purple-500 text-xs">{t('topic.votes')}</span>
                      </div>
                    </div>
                    
                    {topic.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {topic.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(topic.createdAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })}
                      </span>
                      <button
                        onClick={() => handleVote(topic.id)}
                        disabled={topic.hasVoted}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          topic.hasVoted
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-purple-500 text-white hover:bg-purple-600'
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
