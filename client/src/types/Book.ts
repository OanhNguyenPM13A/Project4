export interface Book {
  userId: string
  bookId: string
  createdAt: string
  name: string
  author: string
  quantity: number
  price: number
  attachmentUrl?: string
}
