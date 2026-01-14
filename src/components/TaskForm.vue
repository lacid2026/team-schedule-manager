<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { useSchedule } from '../stores/scheduleStore'

const props = defineProps({
  isOpen: Boolean,
  initialDate: Date,
  initialMemberId: Number,
  taskToEdit: Object,
})

const emit = defineEmits(['close', 'save', 'delete'])

const { store } = useSchedule()

const form = ref({
  id: null,
  title: '',
  memberId: '',
  type: 'feature',
  color: '#3b82f6',
  startDate: '',
  endDate: '',
})

// Initialize form when opening
const initForm = () => {
  if (props.taskToEdit) {
    // Edit Mode
    form.value = {
      id: props.taskToEdit.id,
      title: props.taskToEdit.title,
      memberId: props.taskToEdit.memberId,
      type: props.taskToEdit.type,
      color: props.taskToEdit.color || '#3b82f6',
      startDate: format(props.taskToEdit.startDate, 'yyyy-MM-dd'),
      endDate: format(props.taskToEdit.endDate, 'yyyy-MM-dd'),
    }
  } else {
    // Create Mode
    form.value = {
      id: null,
      title: '',
      memberId: props.initialMemberId || store.members[0].id,
      type: 'feature',
      color: '#3b82f6',
      startDate: props.initialDate ? format(props.initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      endDate: props.initialDate ? format(props.initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    }
  }
}

// Watch for modal open to reset form
import { watch } from 'vue'
watch(() => props.isOpen, (newVal) => {
  if (newVal) initForm()
})

const save = () => {
  emit('save', {
    ...form.value,
    startDate: new Date(form.value.startDate),
    endDate: new Date(form.value.endDate),
    id: form.value.id || Date.now() // Use existing ID or generate new
  })
  emit('close')
}

const remove = () => {
  if (confirm('Are you sure you want to delete this task?')) {
    emit('delete', form.value.id)
    emit('close')
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
      <h3 class="text-xl font-bold text-gray-900 mb-4">Add New Task</h3>
      
      <div class="space-y-4">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Project / SR Name</label>
          <input 
            v-model="form.title" 
            type="text" 
            class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., Q1 Feature A"
          >
        </div>

        <!-- Type & Color -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="form.type" type="radio" value="feature" class="text-blue-600 focus:ring-blue-500">
                <span class="text-sm text-gray-700">Feature</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="form.type" type="radio" value="sr" class="text-emerald-600 focus:ring-emerald-500">
                <span class="text-sm text-gray-700">SR</span>
              </label>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div class="flex items-center gap-2">
              <input 
                v-model="form.color" 
                type="color" 
                class="h-8 w-8 rounded cursor-pointer border-0 p-0"
              >
              <span class="text-sm text-gray-500">{{ form.color }}</span>
            </div>
          </div>
        </div>

        <!-- Assignee -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
          <select 
            v-model="form.memberId" 
            class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option v-for="member in store.members" :key="member.id" :value="member.id">
              {{ member.name }} ({{ member.role }})
            </option>
          </select>
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
              v-model="form.startDate" 
              type="date" 
              class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
              v-model="form.endDate" 
              type="date" 
              class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-8 flex justify-between items-center">
        <button 
          v-if="form.id"
          @click="remove"
          class="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Delete
        </button>
        <div v-else></div> <!-- Spacer -->

        <div class="flex gap-3">
          <button 
            @click="$emit('close')" 
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="save" 
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-600/20 transition-colors"
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
