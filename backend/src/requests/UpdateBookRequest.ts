/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateBookRequest {
  name: string
  author: string
  quantity: number
  price: number
}