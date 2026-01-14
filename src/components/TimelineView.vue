<script setup>
import { computed, ref } from 'vue'
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, differenceInDays } from 'date-fns'
import { useSchedule } from '../stores/scheduleStore'
import TaskForm from './TaskForm.vue'

const { store, getTasksByMember, addTask, updateTask, deleteTask, fetchTasks } = useSchedule()

// Modal State
const isModalOpen = ref(false)
const selectedDate = ref(null)
const selectedMemberId = ref(null)
const taskToEdit = ref(null)

const openModal = (date, memberId) => {
  selectedDate.value = date
  selectedMemberId.value = memberId
  taskToEdit.value = null // Reset edit mode
  isModalOpen.value = true
}

const openEditModal = (task, event) => {
  event.stopPropagation() // Prevent triggering grid click
  taskToEdit.value = task
  isModalOpen.value = true
}

const handleSaveTask = (taskData) => {
  if (taskToEdit.value) {
    updateTask(taskData)
  } else {
    addTask(taskData)
  }
}

const handleDeleteTask = (taskId) => {
  deleteTask(taskId)
}

// Timeline Settings
const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }) // Start from this Monday
const viewDurationDays = 90 // Show 90 days (approx 3 months)
const cellWidth = 40 // Pixels per day
const headerHeight = 60
const rowHeight = 60

// Generate dates for the header
const dates = computed(() => {
  return eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, viewDurationDays - 1)
  })
})

const totalWidth = computed(() => dates.value.length * cellWidth)

// Helper to position tasks
const getTaskStyle = (task) => {
  const startDiff = differenceInDays(task.startDate, startDate)
  const duration = differenceInDays(task.endDate, task.startDate) + 1 // +1 to include end date
  
  // Clip if out of view (simplification for now)
  let left = startDiff * cellWidth
  let width = duration * cellWidth

  return {
    left: `${left}px`,
    width: `${width}px`,
  }
}

const getTaskColor = (type) => {
  return type === 'feature' 
    ? 'bg-blue-500 hover:bg-blue-600' 
    : 'bg-emerald-500 hover:bg-emerald-600'
}
</script>

<template>
  <div class="flex flex-col h-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
    <!-- Header Controls -->
    <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
      <div class="flex items-center gap-4">
        <h2 class="text-lg font-semibold text-gray-800">Resource Timeline</h2>
        <button 
          @click="store.tasks.length && fetchTasks()" 
          class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
          title="Sync with Database"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Sync / Save
        </button>
      </div>
      <div class="flex gap-2 text-sm">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>Feature Dev</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span>Operation SR</span>
        </div>
      </div>
    </div>

    <!-- Timeline Container -->
    <div class="flex-1 overflow-auto relative">
      <div class="flex min-w-max">
        
        <!-- Sidebar (Members) -->
        <div class="sticky left-0 z-20 bg-white border-r border-gray-200 shadow-sm" :style="{ marginTop: `${headerHeight}px` }">
          <div 
            v-for="member in store.members" 
            :key="member.id"
            class="flex items-center px-4 border-b border-gray-100 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            :style="{ height: `${rowHeight}px`, width: '200px' }"
          >
            <div class="flex flex-col">
              <span>{{ member.name }}</span>
              <span class="text-xs text-gray-400 font-normal">{{ member.role }}</span>
            </div>
          </div>
        </div>

        <!-- Scrollable Grid -->
        <div class="flex flex-col">
          
          <!-- Date Header -->
          <div 
            class="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 flex" 
            :style="{ height: `${headerHeight}px`, width: `${totalWidth}px` }"
          >
            <div 
              v-for="date in dates" 
              :key="date.toString()"
              class="flex-shrink-0 flex flex-col items-center justify-center border-r border-gray-100 text-xs text-gray-500"
              :class="{ 'bg-blue-50/50 text-blue-600 font-semibold': date.getDay() === 0 || date.getDay() === 6 }"
              :style="{ width: `${cellWidth}px` }"
            >
              <span>{{ format(date, 'MMM') }}</span>
              <span class="text-base">{{ format(date, 'd') }}</span>
              <span>{{ format(date, 'EEE') }}</span>
            </div>
          </div>

          <!-- Grid Rows -->
          <div class="relative" :style="{ width: `${totalWidth}px` }">
            <!-- Background Grid Lines -->
            <div class="absolute inset-0 flex pointer-events-none">
              <div 
                v-for="date in dates" 
                :key="`bg-${date}`"
                class="flex-shrink-0 border-r border-gray-50 h-full"
                :class="{ 'bg-gray-50/50': date.getDay() === 0 || date.getDay() === 6 }"
                :style="{ width: `${cellWidth}px` }"
              ></div>
            </div>

            <!-- Member Rows & Tasks -->
            <div 
              v-for="member in store.members" 
              :key="`row-${member.id}`"
              class="relative border-b border-gray-100 group hover:bg-gray-50/30 transition-colors"
              :style="{ height: `${rowHeight}px` }"
            >
              <!-- Clickable Background for Adding Tasks -->
              <div class="absolute inset-0 flex">
                 <div 
                  v-for="date in dates" 
                  :key="`cell-${member.id}-${date}`"
                  class="h-full border-r border-transparent hover:bg-blue-50/30 cursor-pointer transition-colors"
                  :style="{ width: `${cellWidth}px` }"
                  @click="openModal(date, member.id)"
                  :title="`Add task for ${member.name} on ${format(date, 'MMM d')}`"
                ></div>
              </div>

              <!-- Tasks -->
              <div 
                v-for="task in getTasksByMember(member.id)" 
                :key="task.id"
                class="absolute top-1/2 -translate-y-1/2 h-8 rounded-full shadow-sm text-white text-xs flex items-center px-3 overflow-hidden cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] z-10"
                :style="{ ...getTaskStyle(task), backgroundColor: task.color }"
                :title="`${task.title} (${format(task.startDate, 'MMM d')} - ${format(task.endDate, 'MMM d')})`"
                @click="(e) => openEditModal(task, e)"
              >
                <div class="font-medium truncate">{{ task.title }}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Task Creation Modal -->
    <TaskForm 
      :is-open="isModalOpen"
      :initial-date="selectedDate"
      :initial-member-id="selectedMemberId"
      :task-to-edit="taskToEdit"
      @close="isModalOpen = false"
      @save="handleSaveTask"
      @delete="handleDeleteTask"
    />
  </div>
</template>
