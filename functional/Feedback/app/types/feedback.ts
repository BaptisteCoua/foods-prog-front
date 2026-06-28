// Mirrors the backend feedback board contract (/feedback). Counts (votesCount,
// repliesCount) and the per-user `hasVoted` flag are computed server-side.
import type { Paginated } from '../../../Recipe/app/types/recipe'

export type { Paginated }

export type FeedbackType = 'BUG' | 'FEATURE' | 'IDEA'
export type FeedbackStatus = 'OPEN' | 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'DECLINED'
export type FeedbackSort = 'VOTES' | 'RECENT'

// Reduced author info (never the email).
export interface FeedbackAuthor {
  id: number
  displayName: string | null
  picture: string | null
}

export interface FeedbackReply {
  id: number
  feedbackId: number
  userId: number
  body: string
  votesCount: number
  author: FeedbackAuthor
  hasVoted: boolean
  createdAt: string
}

export interface Feedback {
  id: number
  userId: number
  title: string
  description: string
  type: FeedbackType
  status: FeedbackStatus
  votesCount: number
  repliesCount: number
  author: FeedbackAuthor
  hasVoted: boolean
  createdAt: string
  updatedAt: string
}

// GET /feedback/:id and every mutation return the full entry with its replies.
export interface FeedbackDetail extends Feedback {
  replies: FeedbackReply[]
}

export interface FeedbackPayload {
  title: string
  description: string
  type: FeedbackType
}
