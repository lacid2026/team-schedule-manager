<script setup>
import { onMounted } from 'vue'
import TimelineView from './components/TimelineView.vue'
import { useSchedule } from './stores/scheduleStore'

const { fetchTasks } = useSchedule()

onMounted(() => {
  fetchTasks()
})
</script>

<template>
  <div class="h-screen w-full bg-gray-100 flex flex-col overflow-hidden">
    <!-- Navbar -->
    <header class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">T</div>
        <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Team Schedule Manager
        </h1>
      </div>
      <div>
        <button class="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20">
          + New Project
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 p-6 overflow-hidden">
      <TimelineView />
    </main>
  </div>
</template>
