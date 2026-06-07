import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  time: string
  read: boolean
}

export const useAppStore = defineStore('app', () => {
  // State
  const isDark = ref(true)
  const sidebarCollapsed = ref(false)
  const notifications = ref<Notification[]>([
    {
      id: '1',
      title: '系统启动成功',
      message: 'RAG Knowledge 服务已成功启动，所有组件运行正常',
      type: 'success',
      time: '刚刚',
      read: false,
    },
    {
      id: '2',
      title: 'PDF 解析完成',
      message: '文档 "report.pdf" 已成功转换为 Markdown 格式',
      type: 'info',
      time: '5分钟前',
      read: false,
    },
    {
      id: '3',
      title: 'Deep Agent 任务完成',
      message: '代码生成任务已完成，生成了 3 个 artifact',
      type: 'success',
      time: '10分钟前',
      read: true,
    },
    {
      id: '4',
      title: '系统警告',
      message: 'GPU 内存使用率超过 80%，建议优化任务分配',
      type: 'warning',
      time: '30分钟前',
      read: true,
    },
  ])

  // Getters
  const notificationCount = computed(() => 
    notifications.value.filter(n => !n.read).length
  )

  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read)
  )

  // Actions
  function toggleTheme() {
    isDark.value = !isDark.value
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function addNotification(notification: Omit<Notification, 'id' | 'time' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      time: '刚刚',
      read: false,
    }
    notifications.value.unshift(newNotification)
  }

  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => n.read = true)
  }

  function removeNotification(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return {
    isDark,
    sidebarCollapsed,
    notifications,
    notificationCount,
    unreadNotifications,
    toggleTheme,
    toggleSidebar,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
  }
})
