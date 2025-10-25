'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

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
      alert('请输入话题标题')
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
        alert('✅ 话题提交成功！')
        setNewTopic({ title: '', description: '' })
        loadTopics()
      } else {
        const error = await response.json()
        alert(`❌ 提交失败: ${error.error || '请稍后重试'}`)
      }
    } catch (error) {
      console.error('提交话题失败:', error)
      alert('❌ 提交失败，请检查网络连接')
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
        alert('✅ 投票成功！')
      } else {
        const error = await response.json()
        alert(`❌ ${error.error || '投票失败'}`)
      }
    } catch (error) {
      console.error('投票失败:', error)
      alert('❌ 投票失败')
    }
  }

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full shadow-2xl hover:scale-110 transform transition-all duration-300 hover:shadow-purple-500/50 group"
        title="创建话题投票"
      >
        <Image
          src="/image/create.png"
          alt="创建话题"
          width={64}
          height={64}
          className="rounded-full group-hover:rotate-12 transition-transform duration-300"
        />
      </button>

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
            <h3 className="text-lg font-bold text-purple-700 mb-3">✨ 创建话题投票</h3>
            <form onSubmit={handleSubmitTopic} className="space-y-2">
              <input
                type="text"
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                placeholder="输入话题标题..."
                maxLength={100}
                required
              />
              <textarea
                value={newTopic.description}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white resize-none h-16"
                placeholder="描述（可选）"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? '提交中...' : '🚀 发布话题'}
              </button>
            </form>
          </div>

          {/* 下栏：投票列表区域 (2/3) */}
          <div className="flex-1 bg-white overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-bold text-gray-800">📊 所有话题 ({topics.length})</h3>
              <button
                onClick={loadTopics}
                className="text-purple-500 hover:text-purple-700 text-sm"
              >
                🔄 刷新
              </button>
            </div>

            {topics.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm mb-1">暂无话题</p>
                <p className="text-xs">快来创建第一个吧！</p>
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
                        <span className="text-purple-500 text-xs">票</span>
                      </div>
                    </div>
                    
                    {topic.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {topic.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(topic.createdAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
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
                        {topic.hasVoted ? '✓ 已投' : '👍 投票'}
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
      `}</style>
    </>
  )
}
