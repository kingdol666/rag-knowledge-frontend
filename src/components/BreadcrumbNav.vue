<template>
  <a-breadcrumb class="breadcrumb">
    <a-breadcrumb-item>
      <HomeOutlined />
    </a-breadcrumb-item>
    <a-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
      <router-link v-if="item.path && index < breadcrumbs.length - 1" :to="item.path">
        {{ item.title }}
      </router-link>
      <span v-else>{{ item.title }}</span>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeOutlined } from '@ant-design/icons-vue'

const route = useRoute()

const breadcrumbs = computed(() => {
  const items: { title: string; path?: string }[] = []
  
  if (route.path === '/dashboard') {
    items.push({ title: '概览' })
  } else if (route.path === '/pdf-parser') {
    items.push({ title: 'PDF 解析' })
  } else if (route.path === '/deep-agent') {
    items.push({ title: 'Deep Agent' })
  } else if (route.path === '/my-agent') {
    items.push({ title: 'My Agent' })
  } else if (route.path === '/artifacts') {
    items.push({ title: 'Artifacts' })
  } else if (route.path === '/settings') {
    items.push({ title: '设置' })
  }
  
  return items
})
</script>

<style scoped>
.breadcrumb {
  font-size: 13px;
}

.breadcrumb :deep(.ant-breadcrumb-link) {
  color: #64748b;
  transition: color 0.3s;
}

.breadcrumb :deep(.ant-breadcrumb-link:hover) {
  color: #e2e8f0;
}

.breadcrumb :deep(.ant-breadcrumb-separator) {
  color: #475569;
}

.breadcrumb :deep(.ant-breadcrumb > span:last-child .ant-breadcrumb-link) {
  color: #e2e8f0;
  font-weight: 500;
}
</style>
