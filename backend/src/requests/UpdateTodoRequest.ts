/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateTodoRequest {
  name: string
  phoneNo: string
  dueDate: string
  done: boolean
}