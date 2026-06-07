<template>
  <div class="dashboard">
    <!-- Stats Cards -->
    <a-row :gutter="[20, 20]" class="stats-row">
      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card" v-motion-slide-bottom>
          <div class="stat-icon pdf">
            <FilePdfOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pdfCount }}</div>
            <div class="stat-label">PDF 文档</div>
            <div class="stat-change positive">
              <ArrowUpOutlined /> 12%
            </div>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon agent">
            <RobotOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.agentRuns }}</div>
            <div class="stat-label">Agent 执行</div>
            <div class="stat-change positive">
              <ArrowUpOutlined /> 8%
            </div>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon artifact">
            <AppstoreOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.artifacts }}</div>
            <div class="stat-label">Artifacts</div>
            <div class="stat-change positive">
              <ArrowUpOutlined /> 24%
            </div>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon success">
            <CheckCircleOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.successRate }}%</div>
            <div class="stat-label">成功率</div>
            <div class="stat-change neutral">
              <MinusOutlined /> 0%
            </div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- Main Content -->
    <a-row :gutter="[20, 20]" class="content-row">
      <a-col :xs="24" :lg="16">
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <HeartOutlined class="panel-icon" />
              <h3>系统状态</h3>
            </div>
            <a-tag :color="healthStatus.color" class="status-tag">{{ healthStatus.text }}</a-tag>
          </div>
          <div class="panel-body">
            <div class="status-grid">
              <div v-for="(service, index) in services" :key="index" class="status-item">
                <div class="status-icon" :class="service.status">
                  <component :is="service.icon" />
                </div>
                <div class="status-info">
                  <div class="status-name">{{ service.name }}</div>
                  <div class="status-desc">{{ service.description }}</div>
                </div>
                <a-badge :status="service.status as any" :text="service.statusText" />
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <HistoryOutlined class="panel-icon" />
              <h3>最近活动</h3>
            </div>
            <a-button type="link" size="small" class="view-all-btn">
              查看全部
              <RightOutlined />
            </a-button>
          </div>
          <div class="panel-body">
            <a-timeline class="activity-timeline">
              <a-timeline-item v-for="(activity, index) in recentActivities" :key="index" :color="activity.color">
                <template #dot>
                  <div class="timeline-dot" :class="activity.color">
                    <component :is="activity.icon" />
                  </div>
                </template>
                <div class="activity-item">
                  <div class="activity-header">
                    <span class="activity-title">{{ activity.title }}</span>
                    <span class="activity-time">{{ activity.time }}</span>
                  </div>
                  <div class="activity-desc">{{ activity.description }}</div>
                </div>
              </a-timeline-item>
            </a-timeline>
          </div>
        </div>
      </a-col>

      <a-col :xs="24" :lg="8">
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <ThunderboltOutlined class="panel-icon" />
              <h3>快速操作</h3>
            </div>
          </div>
          <div class="panel-body">
            <div class="quick-actions">
              <div v-for="(action, index) in quickActions" :key="index" class="action-item"
                @click="router.push(action.path)">
                <div class="action-icon" :class="action.type">
                  <component :is="action.icon" />
                </div>
                <div class="action-info">
                  <div class="action-name">{{ action.name }}</div>
                  <div class="action-desc">{{ action.description }}</div>
                </div>
                <RightOutlined class="action-arrow" />
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <InfoCircleOutlined class="panel-icon" />
              <h3>系统信息</h3>
            </div>
          </div>
          <div class="panel-body">
            <div class="system-info">
              <div class="info-item">
                <span class="info-label">版本</span>
                <span class="info-value">v1.0.0</span>
              </div>
              <div class="info-item">
                <span class="info-label">Python</span>
                <span class="info-value">3.10+</span>
              </div>
              <div class="info-item">
                <span class="info-label">FastAPI</span>
                <span class="info-value">0.110.0</span>
              </div>
              <div class="info-item">
                <span class="info-label">运行时间</span>
                <span class="info-value">2天 14小时</span>
              </div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  FilePdfOutlined,
  RobotOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  MinusOutlined,
  HeartOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  RightOutlined,
  FileTextOutlined,
  CodeOutlined,
  MessageOutlined,
  ToolOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
} from '@ant-design/icons-vue'

const router = useRouter()

const stats = reactive({
  pdfCount: 128,
  agentRuns: 456,
  artifacts: 32,
  successRate: 98.5,
})

const healthStatus = {
  status: 'processing',
  text: '运行中',
  color: 'green',
}

const services = [
  {
    name: '后端服务',
    description: 'FastAPI 核心服务',
    status: 'processing',
    statusText: '运行中',
    icon: CloudServerOutlined,
  },
  {
    name: 'PDF 解析器',
    description: 'MinerU 文档解析',
    status: 'processing',
    statusText: '运行中',
    icon: FileTextOutlined,
  },
  {
    name: 'DeepAgent',
    description: '深度智能体服务',
    status: 'processing',
    statusText: '运行中',
    icon: RobotOutlined,
  },
  {
    name: 'MyAgent',
    description: '自定义智能体服务',
    status: 'processing',
    statusText: '运行中',
    icon: ApiOutlined,
  },
  {
    name: '数据库',
    description: 'SQLite 数据存储',
    status: 'processing',
    statusText: '运行中',
    icon: DatabaseOutlined,
  },
]

const recentActivities = [
  {
    title: 'PDF 文档解析完成',
    time: '2分钟前',
    description: '成功解析 "annual_report_2024.pdf"，共 45 页',
    color: 'blue',
    icon: FileTextOutlined,
  },
  {
    title: 'Deep Agent 执行成功',
    time: '15分钟前',
    description: '代码生成任务完成，生成 3 个 artifact',
    color: 'green',
    icon: CodeOutlined,
  },
  {
    title: 'My Agent 对话',
    time: '30分钟前',
    description: '用户查询知识库，返回 5 条相关结果',
    color: 'purple',
    icon: MessageOutlined,
  },
  {
    title: 'Artifact 构建完成',
    time: '1小时前',
    description: '"data_processor" artifact 构建成功',
    color: 'orange',
    icon: ToolOutlined,
  },
]

const quickActions = [
  {
    name: '解析 PDF',
    description: '上传并解析 PDF 文档',
    icon: FilePdfOutlined,
    path: '/pdf-parser',
    type: 'pdf',
  },
  {
    name: 'Deep Agent',
    description: '启动深度智能体对话',
    icon: RobotOutlined,
    path: '/deep-agent',
    type: 'agent',
  },
  {
    name: 'My Agent',
    description: '使用自定义智能体',
    icon: ApiOutlined,
    path: '/my-agent',
    type: 'myagent',
  },
  {
    name: '管理 Artifacts',
    description: '查看和管理生成的 artifacts',
    icon: AppstoreOutlined,
    path: '/artifacts',
    type: 'artifact',
  },
]
</script>

<style scoped>
.dashboard {
  padding: 4px;
}

/* Stats Cards */
.stats-row {
  margin-bottom: 8px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  opacity: 0;
  transition: opacity 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(99, 102, 241, 0.1);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}

.stat-icon.pdf {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
  color: #ef4444;
}

.stat-icon.agent {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%);
  color: #6366f1;
}

.stat-icon.artifact {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%);
  color: #8b5cf6;
}

.stat-icon.success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
  color: #10b981;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.stat-change {
  font-size: 12px;
  font-weight: 500;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.neutral {
  color: #64748b;
}

/* Panel */
.panel {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 16px;
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s;
}

.panel:hover {
  border-color: rgba(99, 102, 241, 0.15);
}

.panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-icon {
  font-size: 18px;
  color: #6366f1;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #f1f5f9;
}

.status-tag {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 20px;
}

.view-all-btn {
  color: #6366f1;
  font-size: 13px;
}

.panel-body {
  padding: 20px 24px;
}

/* Status Grid */
.status-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.05);
  transition: all 0.3s;
}

.status-item:hover {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(99, 102, 241, 0.1);
}

.status-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.status-icon.processing {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-info {
  flex: 1;
}

.status-name {
  font-weight: 500;
  color: #e2e8f0;
  font-size: 14px;
}

.status-desc {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

/* Activity Timeline */
.activity-timeline :deep(.ant-timeline-item-tail) {
  border-left: 2px solid rgba(99, 102, 241, 0.1);
}

.timeline-dot {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.timeline-dot.blue {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.timeline-dot.green {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.timeline-dot.purple {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.timeline-dot.orange {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.activity-item {
  padding-bottom: 8px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.activity-title {
  font-weight: 500;
  color: #e2e8f0;
  font-size: 14px;
}

.activity-time {
  font-size: 12px;
  color: #64748b;
}

.activity-desc {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.05);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-item:hover {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(99, 102, 241, 0.15);
  transform: translateX(4px);
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.action-icon.pdf {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.action-icon.agent {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.action-icon.myagent {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.action-icon.artifact {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.action-info {
  flex: 1;
}

.action-name {
  font-weight: 500;
  color: #e2e8f0;
  font-size: 14px;
}

.action-desc {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.action-arrow {
  color: #64748b;
  font-size: 12px;
  transition: all 0.3s;
}

.action-item:hover .action-arrow {
  color: #e2e8f0;
  transform: translateX(4px);
}

/* System Info */
.system-info {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 10px;
}

.info-label {
  font-size: 13px;
  color: #64748b;
}

.info-value {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
}
</style>
