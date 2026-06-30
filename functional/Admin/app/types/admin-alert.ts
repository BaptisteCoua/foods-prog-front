// Mirrors the backend admin alert contract (/admin/alerts). An alert is created
// server-side whenever a user posts a feedback; it carries a snapshot (title,
// type, author) so it stays readable even if the linked feedback is deleted.
import type { FeedbackType } from '../../../Feedback/app/types/feedback'

export type AdminAlertType = 'NEW_FEEDBACK'

export interface AdminAlert {
  id: number
  type: AdminAlertType
  // null once the linked feedback has been deleted.
  feedbackId: number | null
  title: string
  feedbackType: FeedbackType
  authorName: string | null
  isRead: boolean
  createdAt: string
}
