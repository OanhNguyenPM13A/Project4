import { TodosAccess } from '../dataLayer/todosAcess'
// import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

const logger = createLogger('Todos')

// Create dataLayer
const todosAccess = new TodosAccess()
//Implement businessLogic
export async function createTodo(newTodo: CreateTodoRequest, userId: string) {
    logger.info(`[Service] Start create new Todo ${newTodo.name}`)
    const todoId = uuid.v4()
    const newItem = {
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        done: false,
        ...newTodo
    }
    return await todosAccess.createTodosAccess(newItem)
}

export async function getTodosForUser(userId: string) {
    logger.info(`[Service] Start getting todos for userId: ${userId}`)
    return await todosAccess.getTodosForUser(userId)
}

export async function updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest) {
    logger.info(`[Service] Start updating todos for userId: ${userId} & todoId ${todoId}`)
    return await todosAccess.updateTodo(userId, todoId, updatedTodo)
}

export async function deleteTodo(userId: string, todoId: string) {
    logger.info(`[Service] Start Delete todos by userId: ${userId} & todoId ${todoId}`)
    return await todosAccess.deleteTodo(userId, todoId)
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string) {
    logger.info(`[Service] Start create attachment signed URL for userId: ${userId} & todoId ${todoId}`)
    return await todosAccess.createAttachmentPresignedUrl(userId, todoId)
}