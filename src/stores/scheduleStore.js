import { reactive } from 'vue'
import { supabase } from '../lib/supabaseClient'

export const store = reactive({
    members: [
        { id: 1, name: '심', role: 'Leader' },
        { id: 2, name: '율리아', role: 'Core Dev' },
        { id: 3, name: '와니', role: 'Core Dev' },
        { id: 4, name: '제리', role: 'Core Dev' },
        { id: 5, name: '렌', role: 'Core Dev' },
    ],
    tasks: []
})

export const useSchedule = () => {
    const fetchTasks = async () => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')

        if (error) {
            console.error('Error fetching tasks:', error)
            return
        }

        if (data) {
            store.tasks = data.map(t => ({
                id: t.id,
                title: t.title,
                type: t.type,
                color: t.color || (t.type === 'feature' ? '#3b82f6' : '#10b981'), // Fallback defaults
                startDate: new Date(t.start_date),
                endDate: new Date(t.end_date),
                memberId: t.member_id
            }))
        }
    }

    const getTasksByMember = (memberId) => {
        return store.tasks.filter(t => t.memberId === memberId)
    }

    const addTask = async (task) => {
        // Optimistic update
        const tempId = Date.now()
        store.tasks.push({ ...task, id: tempId })

        const { data, error } = await supabase
            .from('tasks')
            .insert({
                title: task.title,
                type: task.type,
                color: task.color,
                start_date: task.startDate,
                end_date: task.endDate,
                member_id: task.memberId
            })
            .select()

        if (error) {
            console.error('Error adding task:', error)
            // Rollback
            const idx = store.tasks.findIndex(t => t.id === tempId)
            if (idx !== -1) store.tasks.splice(idx, 1)
        } else if (data) {
            // Replace temp task with real one
            const idx = store.tasks.findIndex(t => t.id === tempId)
            if (idx !== -1) {
                store.tasks[idx] = {
                    ...data[0],
                    color: data[0].color,
                    startDate: new Date(data[0].start_date),
                    endDate: new Date(data[0].end_date),
                    memberId: data[0].member_id
                }
            }
        }
    }

    const updateTask = async (updatedTask) => {
        // Optimistic update
        const index = store.tasks.findIndex(t => t.id === updatedTask.id)
        const originalTask = store.tasks[index]
        if (index !== -1) {
            store.tasks[index] = updatedTask
        }

        const { error } = await supabase
            .from('tasks')
            .update({
                title: updatedTask.title,
                type: updatedTask.type,
                color: updatedTask.color,
                start_date: updatedTask.startDate,
                end_date: updatedTask.endDate,
                member_id: updatedTask.memberId
            })
            .eq('id', updatedTask.id)

        if (error) {
            console.error('Error updating task:', error)
            // Rollback
            if (index !== -1) store.tasks[index] = originalTask
        }
    }

    const deleteTask = async (taskId) => {
        // Optimistic update
        const index = store.tasks.findIndex(t => t.id === taskId)
        const originalTask = store.tasks[index]
        if (index !== -1) {
            store.tasks.splice(index, 1)
        }

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId)

        if (error) {
            console.error('Error deleting task:', error)
            // Rollback
            if (index !== -1 && originalTask) store.tasks.splice(index, 0, originalTask)
        }
    }

    return {
        store,
        fetchTasks,
        getTasksByMember,
        addTask,
        updateTask,
        deleteTask
    }
}
