'use client'

import { useState } from 'react'
import { Article, ReactionType } from '@/types/article'
import { withBasePath } from '@/lib/basePath'

interface InitialState {
  reactions: Record<string, ReactionType>
  readBy: string[]
  shortlistedBy: string[]
}

interface ArticleActions {
  reactions: Record<string, ReactionType>
  readBy: string[]
  shortlistedBy: string[]
  pending: boolean
  handleReaction: (userId: string, type: ReactionType, e: React.MouseEvent) => void
  handlePersonalize: (userId: string, field: 'read' | 'shortlisted', e: React.MouseEvent) => void
}

export function useArticleActions(articleId: Article['id'], initial: InitialState): ArticleActions {
  const [reactions, setReactions] = useState(initial.reactions)
  const [readBy, setReadBy] = useState(initial.readBy)
  const [shortlistedBy, setShortlistedBy] = useState(initial.shortlistedBy)
  const [pending, setPending] = useState(false)

  function handleReaction(userId: string, type: ReactionType, e: React.MouseEvent) {
    e.stopPropagation()
    if (pending) return

    const userReaction = reactions[userId]
    const next = userReaction === type ? null : type
    const previous = reactions
    const optimistic = { ...reactions }
    if (next === null) {
      delete optimistic[userId]
    } else {
      optimistic[userId] = next
    }
    setReactions(optimistic)
    setPending(true)

    fetch(withBasePath(`/api/articles/${articleId}/react`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reaction: next }),
    })
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((updated) => setReactions(updated.reactions ?? {}))
      .catch(() => setReactions(previous))
      .finally(() => setPending(false))
  }

  function handlePersonalize(userId: string, field: 'read' | 'shortlisted', e: React.MouseEvent) {
    e.stopPropagation()
    if (pending) return

    const list = field === 'read' ? readBy : shortlistedBy
    const setList = field === 'read' ? setReadBy : setShortlistedBy
    const isOn = list.includes(userId)
    const previous = list
    const optimistic = isOn ? list.filter((u) => u !== userId) : [...list, userId]
    setList(optimistic)
    setPending(true)

    fetch(withBasePath(`/api/articles/${articleId}/personalize`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, [field]: !isOn }),
    })
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((updated) => {
        setReadBy(updated.readBy ?? [])
        setShortlistedBy(updated.shortlistedBy ?? [])
      })
      .catch(() => setList(previous))
      .finally(() => setPending(false))
  }

  return { reactions, readBy, shortlistedBy, pending, handleReaction, handlePersonalize }
}
