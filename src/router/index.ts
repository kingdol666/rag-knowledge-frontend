import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { title: '概览', icon: 'DashboardOutlined' }
        },
        {
          path: 'pdf-parser',
          name: 'PDFParser',
          component: () => import('@/views/PDFParserView.vue'),
          meta: { title: 'PDF 解析', icon: 'FilePdfOutlined' }
        },
        {
          path: 'deep-agent',
          name: 'DeepAgent',
          component: () => import('@/views/DeepAgentView.vue'),
          meta: { title: 'Deep Agent', icon: 'RobotOutlined' }
        },
        {
          path: 'my-agent',
          name: 'MyAgent',
          component: () => import('@/views/MyAgentView.vue'),
          meta: { title: 'My Agent', icon: 'ApiOutlined' }
        },
        {
          path: 'artifacts',
          name: 'Artifacts',
          component: () => import('@/views/ArtifactsView.vue'),
          meta: { title: 'Artifacts', icon: 'AppstoreOutlined' }
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/SettingsView.vue'),
          meta: { title: '设置', icon: 'SettingOutlined' }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

export default router
