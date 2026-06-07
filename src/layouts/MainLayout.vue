<template>
  <a-layout class="main-layout">
    <!-- Sidebar -->
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible class="sidebar" width="260"
      collapsed-width="72">
      <div class="logo">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
            <path d="M8 10h16M8 16h12M8 22h8" stroke="white" stroke-width="2" stroke-linecap="round" />
            <defs>
              <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                <stop stop-color="#6366f1" />
                <stop offset="1" stop-color="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <transition name="fade">
          <span v-if="!collapsed" class="logo-text">RAG Knowledge</span>
        </transition>
      </div>

      <div class="menu-container">
        <a-menu v-model:selectedKeys="selectedKeys" mode="inline" theme="dark" class="menu">
          <a-menu-item v-for="item in menuItems" :key="item.path" @click="router.push(item.path)">
            <template #icon>
              <component :is="item.icon" />
            </template>
            <span>{{ item.title }}</span>
          </a-menu-item>
        </a-menu>
      </div>

      <div class="sidebar-footer">
        <a-tooltip :title="collapsed ? '展开' : '折叠'" placement="right">
          <a-button type="text" class="collapse-btn" @click="toggleSidebar">
            <MenuFoldOutlined v-if="!collapsed" />
            <MenuUnfoldOutlined v-else />
          </a-button>
        </a-tooltip>
      </div>
    </a-layout-sider>

    <!-- Main Content -->
    <a-layout class="content-layout">
      <a-layout-header class="header">
        <div class="header-left">
          <breadcrumb-nav />
          <h2 class="page-title">{{ currentPageTitle }}</h2>
        </div>
        <div class="header-right">
          <a-tooltip title="通知">
            <a-badge :count="notificationCount" :offset="[-2, 2]">
              <a-button type="text" class="header-btn" @click="showNotifications = true">
                <BellOutlined />
              </a-button>
            </a-badge>
          </a-tooltip>

          <a-tooltip title="主题">
            <a-button type="text" class="header-btn" @click="toggleTheme">
              <BulbOutlined v-if="isDark" />
              <BgColorsOutlined v-else />
            </a-button>
          </a-tooltip>

          <a-dropdown>
            <div class="user-info">
              <a-avatar :size="32" class="user-avatar">
                <template #icon>
                  <UserOutlined />
                </template>
              </a-avatar>
              <span class="user-name">管理员</span>
              <DownOutlined class="user-arrow" />
            </div>
            <template #overlay>
              <a-menu class="user-dropdown">
                <a-menu-item key="profile">
                  <UserOutlined />
                  个人中心
                </a-menu-item>
                <a-menu-item key="settings" @click="router.push('/settings')">
                  <SettingOutlined />
                  系统设置
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <a-layout-content class="content">
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </a-layout-content>
    </a-layout>

    <!-- Notification Drawer -->
    <a-drawer v-model:open="showNotifications" title="通知中心" placement="right" width="380" class="notification-drawer">
      <div class="notification-list">
        <div v-for="(notification, index) in notifications" :key="index" class="notification-item">
          <div class="notification-icon" :class="notification.type">
            <component :is="getNotificationIcon(notification.type)" />
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ notification.time }}</div>
          </div>
        </div>
      </div>
    </a-drawer>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DashboardOutlined,
  FilePdfOutlined,
  RobotOutlined,
  ApiOutlined,
  AppstoreOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  BulbOutlined,
  BgColorsOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons-vue'
import { useAppStore } from '@/stores/app'
import BreadcrumbNav from '@/components/BreadcrumbNav.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const collapsed = ref(false)
const selectedKeys = ref([route.path])
const showNotifications = ref(false)

const isDark = computed(() => appStore.isDark)
const notificationCount = computed(() => appStore.notificationCount)
const notifications = computed(() => appStore.notifications)

const menuItems = [
  { path: '/dashboard', title: '概览', icon: DashboardOutlined },
  { path: '/pdf-parser', title: 'PDF 解析', icon: FilePdfOutlined },
  { path: '/deep-agent', title: 'Deep Agent', icon: RobotOutlined },
  { path: '/my-agent', title: 'My Agent', icon: ApiOutlined },
  { path: '/artifacts', title: 'Artifacts', icon: AppstoreOutlined },
  { path: '/settings', title: '设置', icon: SettingOutlined },
]

const currentPageTitle = computed(() => {
  const item = menuItems.find(item => item.path === route.path)
  return item?.title || 'RAG Knowledge'
})

function toggleSidebar() {
  collapsed.value = !collapsed.value
}

function toggleTheme() {
  appStore.toggleTheme()
}

function getNotificationIcon(type: string) {
  const icons: Record<string, any> = {
    success: CheckCircleOutlined,
    info: InfoCircleOutlined,
    warning: ExclamationCircleOutlined,
    error: CloseCircleOutlined,
  }
  return icons[type] || InfoCircleOutlined
}

watch(() => route.path, (path) => {
  selectedKeys.value = [path]
})
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  background: #0f172a;
}

/* Sidebar */
.sidebar {
  background: linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%) !important;
  border-right: 1px solid rgba(99, 102, 241, 0.1);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 100;
}

.sidebar :deep(.ant-layout-sider-children) {
  display: flex;
  flex-direction: column;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.logo-icon {
  flex-shrink: 0;
}

.logo-text {
  font-size: 17px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
  letter-spacing: -0.5px;
}

.menu-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px 10px;
}

.menu {
  background: transparent !important;
  border-right: none !important;
}

.menu :deep(.ant-menu-item) {
  border-radius: 10px;
  margin: 4px 0;
  color: #94a3b8;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 44px;
  line-height: 44px;
}

.menu :deep(.ant-menu-item:hover) {
  color: #e2e8f0;
  background: rgba(99, 102, 241, 0.08);
}

.menu :deep(.ant-menu-item-selected) {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%) !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.menu :deep(.ant-menu-item-icon) {
  font-size: 18px;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(99, 102, 241, 0.1);
}

.collapse-btn {
  width: 100%;
  height: 40px;
  color: #64748b;
  border-radius: 10px;
  transition: all 0.3s;
}

.collapse-btn:hover {
  color: #e2e8f0;
  background: rgba(99, 102, 241, 0.1);
}

/* Content Layout */
.content-layout {
  background: #0f172a;
  min-height: 100vh;
}

/* Header */
.header {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
  letter-spacing: -0.3px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  width: 40px;
  height: 40px;
  color: #64748b;
  border-radius: 10px;
  font-size: 18px;
  transition: all 0.3s;
}

.header-btn:hover {
  color: #e2e8f0;
  background: rgba(99, 102, 241, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 10px;
  transition: all 0.3s;
  margin-left: 8px;
}

.user-info:hover {
  background: rgba(99, 102, 241, 0.1);
}

.user-avatar {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.user-name {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 500;
}

.user-arrow {
  font-size: 12px;
  color: #64748b;
  transition: transform 0.3s;
}

.user-info:hover .user-arrow {
  transform: rotate(180deg);
}

/* Content */
.content {
  padding: 24px;
  min-height: calc(100vh - 64px);
}

.content-wrapper {
  max-width: 1440px;
  margin: 0 auto;
}

/* Notification Drawer */
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.1);
  transition: all 0.3s;
}

.notification-item:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(99, 102, 241, 0.2);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.notification-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.notification-icon.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.notification-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.notification-icon.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

.notification-time {
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
}

/* User Dropdown */
.user-dropdown :deep(.ant-dropdown-menu) {
  background: #1e293b;
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.user-dropdown :deep(.ant-dropdown-menu-item) {
  border-radius: 8px;
  color: #94a3b8;
  padding: 10px 16px;
}

.user-dropdown :deep(.ant-dropdown-menu-item:hover) {
  background: rgba(99, 102, 241, 0.1);
  color: #e2e8f0;
}

.user-dropdown :deep(.ant-dropdown-menu-item-divider) {
  background: rgba(99, 102, 241, 0.1);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
