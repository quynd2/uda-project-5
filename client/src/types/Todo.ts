export interface Todo {
  todoId: string,
  createdAt: string,
  name: string,
  phoneNo: string,
  dueDate: string,
  done: boolean,
  attachmentUrl?: string
}
