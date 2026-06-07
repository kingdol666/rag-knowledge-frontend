<template>
  <div class="artifacts">
    <!-- Stats Cards -->
    <a-row :gutter="[20, 20]" class="stats-row">
      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon total">
            <AppstoreOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ artifacts.length }}</div>
            <div class="stat-label">Artifacts 总数</div>
            <div class="stat-change positive">
              <ArrowUpOutlined /> 可用
            </div>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon ready">
            <CheckCircleOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ readyCount }}</div>
            <div class="stat-label">就绪状态</div>
            <div class="stat-change positive">
              <ArrowUpOutlined /> 正常
            </div>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon skills">
            <ToolOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalSkills }}</div>
            <div class="stat-label">Skills 总数</div>
            <div class="stat-change neutral">
              <MinusOutlined /> 稳定
            </div>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card">
          <div class="stat-icon tools">
            <ApiOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalTools }}</div>
            <div class="stat-label">Tools 总数</div>
            <div class="stat-change neutral">
              <MinusOutlined /> 稳定
            </div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- Main Table -->
    <a-row :gutter="[20, 20]">
      <a-col :xs="24">
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <AppstoreOutlined class="panel-icon" />
              <div class="title-info">
                <h3>Artifacts 管理</h3>
                <span class="subtitle">管理您的 AI 智能体 Artifacts</span>
              </div>
            </div>
            <div class="header-actions">
              <a-button type="primary" class="action-btn-primary" @click="showBuildModal = true">
                <PlusOutlined />
                构建 Artifact
              </a-button>
              <a-tooltip title="刷新列表">
                <a-button type="text" class="action-btn" @click="loadArtifacts">
                  <ReloadOutlined />
                </a-button>
              </a-tooltip>
            </div>
          </div>
          <div class="panel-body">
            <a-table
              :columns="columns"
              :data-source="artifacts"
              :loading="loading"
              :pagination="{ pageSize: 10, showSizeChanger: true, showTotal: (total: number) => `共 ${total} 条` }"
              row-key="artifact_id"
              class="artifacts-table"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'artifact_id'">
                  <div class="artifact-id">
                    <span class="id-text">{{ record.artifact_id }}</span>
                  </div>
                </template>
                <template v-if="column.key === 'artifact_name'">
                  <div class="artifact-name">
                    <span class="name-text">{{ record.artifact_name || '未命名' }}</span>
                  </div>
                </template>
                <template v-if="column.key === 'status'">
                  <a-tag :color="getStatusColor(record.status)" class="status-tag">
                    <span class="status-dot" :class="record.status || 'ready'"></span>
                    {{ getStatusText(record.status) }}
                  </a-tag>
                </template>
                <template v-if="column.key === 'created_at'">
                  <span class="time-text">{{ formatTime(record.created_at) }}</span>
                </template>
                <template v-if="column.key === 'actions'">
                  <div class="action-btns">
                    <a-tooltip title="查看详情">
                      <a-button type="text" class="action-btn-view" @click="viewArtifact(record)">
                        <EyeOutlined />
                      </a-button>
                    </a-tooltip>
                    <a-tooltip title="执行">
                      <a-button type="text" class="action-btn-run" @click="executeArtifact(record)">
                        <PlayCircleOutlined />
                      </a-button>
                    </a-tooltip>
                    <a-popconfirm
                      title="确定要删除这个 Artifact 吗？"
                      ok-text="删除"
                      cancel-text="取消"
                      ok-type="danger"
                      @confirm="deleteArtifact(record.artifact_id)"
                    >
                      <a-tooltip title="删除">
                        <a-button type="text" danger class="action-btn-delete">
                          <DeleteOutlined />
                        </a-button>
                      </a-tooltip>
                    </a-popconfirm>
                  </div>
                </template>
              </template>
              <template #emptyText>
                <div class="empty-table">
                  <AppstoreOutlined class="empty-icon" />
                  <p>暂无 Artifacts</p>
                  <a-button type="primary" size="small" @click="showBuildModal = true">
                    <PlusOutlined />
                    创建第一个 Artifact
                  </a-button>
                </div>
              </template>
            </a-table>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- Build Modal -->
    <a-modal
      v-model:open="showBuildModal"
      title="构建 Artifact"
      width="720px"
      :footer="null"
      class="artifact-modal"
      @cancel="showBuildModal = false"
    >
      <div class="modal-body">
        <a-steps :current="buildStep" class="build-steps" size="small">
          <a-step title="基本信息" />
          <a-step title="能力配置" />
          <a-step title="系统提示" />
        </a-steps>

        <div class="step-content">
          <!-- Step 1: Basic Info -->
          <div v-if="buildStep === 0" class="step-panel">
            <a-form :model="buildForm" layout="vertical" class="modal-form">
              <a-form-item label="Artifact ID" required>
                <a-input
                  v-model:value="buildForm.artifactId"
                  placeholder="输入唯一的 Artifact ID"
                  size="large"
                  class="form-input"
                />
              </a-form-item>
              <a-form-item label="场景名称">
                <a-input
                  v-model:value="buildForm.scenarioName"
                  placeholder="输入场景名称，例如：代码审查助手"
                  size="large"
                  class="form-input"
                />
              </a-form-item>
            </a-form>
          </div>

          <!-- Step 2: Capabilities -->
          <div v-if="buildStep === 1" class="step-panel">
            <a-form :model="buildForm" layout="vertical" class="modal-form">
              <a-form-item label="Skills">
                <a-select
                  v-model:value="buildForm.skills"
                  mode="multiple"
                  placeholder="选择 Skills"
                  size="large"
                  class="form-select"
                >
                  <a-select-option value="backend-maintainer">
                    <CodeOutlined /> Backend Maintainer
                  </a-select-option>
                  <a-select-option value="open-research">
                    <SearchOutlined /> Open Research
                  </a-select-option>
                  <a-select-option value="code-review">
                    <FileSearchOutlined /> Code Review
                  </a-select-option>
                  <a-select-option value="data-analysis">
                    <BarChartOutlined /> Data Analysis
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="Tools">
                <a-select
                  v-model:value="buildForm.tools"
                  mode="multiple"
                  placeholder="选择 Tools"
                  size="large"
                  class="form-select"
                >
                  <a-select-option value="web_search">
                    <GlobalOutlined /> Web Search
                  </a-select-option>
                  <a-select-option value="fetch_web_page">
                    <FileTextOutlined /> Fetch Web Page
                  </a-select-option>
                  <a-select-option value="calculator">
                    <CalculatorOutlined /> Calculator
                  </a-select-option>
                  <a-select-option value="code_interpreter">
                    <CodeOutlined /> Code Interpreter
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </div>

          <!-- Step 3: System Prompt -->
          <div v-if="buildStep === 2" class="step-panel">
            <a-form :model="buildForm" layout="vertical" class="modal-form">
              <a-form-item label="系统提示词">
                <a-textarea
                  v-model:value="buildForm.systemPrompt"
                  :rows="8"
                  placeholder="输入系统提示词，定义 Artifact 的行为和角色..."
                  class="form-textarea"
                />
              </a-form-item>
            </a-form>
          </div>
        </div>

        <div class="modal-footer">
          <a-button v-if="buildStep > 0" size="large" @click="buildStep--">上一步</a-button>
          <a-button
            v-if="buildStep < 2"
            type="primary"
            size="large"
            @click="buildStep++"
          >
            下一步
          </a-button>
          <a-button
            v-else
            type="primary"
            size="large"
            :loading="building"
            @click="handleBuild"
          >
            <CheckOutlined />
            构建 Artifact
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- Execute Modal -->
    <a-modal
      v-model:open="showExecuteModal"
      title="执行 Artifact"
      width="700px"
      :footer="null"
      class="artifact-modal"
      @cancel="showExecuteModal = false"
    >
      <div class="modal-body">
        <a-form :model="executeForm" layout="vertical" class="modal-form">
          <a-form-item label="输入文本" required>
            <a-textarea
              v-model:value="executeForm.inputText"
              :rows="5"
              placeholder="输入要执行的内容..."
              class="form-textarea"
            />
          </a-form-item>
          <a-form-item label="Context (JSON)">
            <a-textarea
              v-model:value="executeForm.context"
              :rows="3"
              placeholder='{"key": "value"}'
              class="form-textarea code"
            />
          </a-form-item>
        </a-form>
        <div class="modal-footer">
          <a-button size="large" @click="showExecuteModal = false">取消</a-button>
          <a-button type="primary" size="large" :loading="executing" @click="handleExecute">
            <PlayCircleOutlined />
            执行
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- View Modal -->
    <a-modal
      v-model:open="showViewModal"
      title="Artifact 详情"
      width="800px"
      :footer="null"
      class="artifact-modal view-modal"
      @cancel="showViewModal = false"
    >
      <div class="modal-body">
        <div v-if="currentArtifact" class="artifact-detail">
          <div class="detail-header">
            <div class="detail-icon">
              <AppstoreOutlined />
            </div>
            <div class="detail-info">
              <h3>{{ currentArtifact.artifact_name || currentArtifact.artifact_id }}</h3>
              <a-tag :color="getStatusColor(currentArtifact.status)">
                {{ getStatusText(currentArtifact.status) }}
              </a-tag>
            </div>
          </div>
          <div class="detail-content">
            <pre class="json-content">{{ JSON.stringify(currentArtifact, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  ApiOutlined,
  ArrowUpOutlined,
  MinusOutlined,
  CheckOutlined,
  CodeOutlined,
  SearchOutlined,
  FileSearchOutlined,
  BarChartOutlined,
  GlobalOutlined,
  FileTextOutlined,
  CalculatorOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { deepAgentApi } from '@/services/api'

const loading = ref(false)
const building = ref(false)
const executing = ref(false)
const artifacts = ref<any[]>([])
const showBuildModal = ref(false)
const showExecuteModal = ref(false)
const showViewModal = ref(false)
const currentArtifact = ref<any>(null)
const currentArtifactId = ref('')
const buildStep = ref(0)

const readyCount = computed(() => artifacts.value.filter(a => (a.status || 'ready') === 'ready').length)
const totalSkills = computed(() => {
  const skills = new Set<string>()
  artifacts.value.forEach(a => {
    if (a.skills) a.skills.forEach((s: string) => skills.add(s))
  })
  return skills.size
})
const totalTools = computed(() => {
  const tools = new Set<string>()
  artifacts.value.forEach(a => {
    if (a.tools) a.tools.forEach((t: string) => tools.add(t))
  })
  return tools.size
})

const columns = [
  {
    title: 'Artifact ID',
    dataIndex: 'artifact_id',
    key: 'artifact_id',
    ellipsis: true,
    width: 200,
  },
  {
    title: '名称',
    dataIndex: 'artifact_name',
    key: 'artifact_name',
    width: 180,
  },
  {
    title: '状态',
    key: 'status',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180,
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    align: 'center' as const,
  },
]

const buildForm = reactive({
  artifactId: '',
  scenarioName: '',
  skills: [] as string[],
  tools: [] as string[],
  systemPrompt: '',
})

const executeForm = reactive({
  inputText: '',
  context: '',
})

function getStatusColor(status?: string) {
  switch (status) {
    case 'ready': return 'success'
    case 'building': return 'processing'
    case 'error': return 'error'
    default: return 'success'
  }
}

function getStatusText(status?: string) {
  switch (status) {
    case 'ready': return '就绪'
    case 'building': return '构建中'
    case 'error': return '错误'
    default: return '就绪'
  }
}

function formatTime(time?: string) {
  if (!time) return '-'
  try {
    return new Date(time).toLocaleString('zh-CN')
  } catch {
    return time
  }
}

async function loadArtifacts() {
  loading.value = true
  try {
    const response = await deepAgentApi.artifacts()
    artifacts.value = response.data.artifacts || []
  } catch (error) {
    message.error('加载 Artifacts 失败')
  } finally {
    loading.value = false
  }
}

async function handleBuild() {
  if (!buildForm.artifactId) {
    message.warning('请输入 Artifact ID')
    return
  }

  building.value = true
  try {
    await deepAgentApi.buildArtifact({
      artifact_id: buildForm.artifactId,
      scenario_name: buildForm.scenarioName || undefined,
      skills: buildForm.skills.length > 0 ? buildForm.skills : undefined,
      tools: buildForm.tools.length > 0 ? buildForm.tools : undefined,
      system_prompt: buildForm.systemPrompt || undefined,
    })
    message.success('Artifact 构建成功')
    showBuildModal.value = false
    buildStep.value = 0
    Object.assign(buildForm, {
      artifactId: '',
      scenarioName: '',
      skills: [],
      tools: [],
      systemPrompt: '',
    })
    loadArtifacts()
  } catch (error: any) {
    message.error(error.response?.data?.detail || '构建失败')
  } finally {
    building.value = false
  }
}

function viewArtifact(artifact: any) {
  currentArtifact.value = artifact
  showViewModal.value = true
}

function executeArtifact(artifact: any) {
  currentArtifactId.value = artifact.artifact_id
  executeForm.inputText = ''
  executeForm.context = ''
  showExecuteModal.value = true
}

async function handleExecute() {
  if (!executeForm.inputText) {
    message.warning('请输入输入文本')
    return
  }

  executing.value = true
  try {
    const context = executeForm.context ? JSON.parse(executeForm.context) : {}
    await deepAgentApi.executeArtifact(currentArtifactId.value, {
      input_text: executeForm.inputText,
      context,
    })
    message.success('执行成功')
    showExecuteModal.value = false
  } catch (error: any) {
    message.error(error.response?.data?.detail || '执行失败')
  } finally {
    executing.value = false
  }
}

async function deleteArtifact(artifactId: string) {
  try {
    await deepAgentApi.deleteArtifact(artifactId)
    message.success('删除成功')
    loadArtifacts()
  } catch (error: any) {
    message.error(error.response?.data?.detail || '删除失败')
  }
}

onMounted(() => {
  loadArtifacts()
})
</script>

<style scoped>
.artifacts {
  padding: 8px;
}

/* Stats Row */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-icon.total {
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

.stat-icon.ready {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.stat-icon.skills {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.stat-icon.tools {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 4px;
}

.stat-change {
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.neutral {
  color: #94a3b8;
}

/* Panel */
.panel {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.title-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #f1f5f9;
}

.title-info .subtitle {
  font-size: 13px;
  color: #94a3b8;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 8px;
  font-weight: 500;
}

.action-btn-primary:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.action-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  color: #e2e8f0;
}

.panel-body {
  padding: 24px;
}

/* Table */
.artifacts-table :deep(.ant-table) {
  background: transparent;
}

.artifacts-table :deep(.ant-table-thead > tr > th) {
  background: rgba(15, 23, 42, 0.5);
  color: #94a3b8;
  font-weight: 500;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.artifacts-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid rgba(99, 102, 241, 0.05);
  color: #e2e8f0;
}

.artifacts-table :deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(99, 102, 241, 0.05);
}

.id-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #cbd5e1;
}

.name-text {
  font-weight: 500;
  color: #f1f5f9;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.ready {
  background: #10b981;
}

.status-dot.building {
  background: #3b82f6;
}

.status-dot.error {
  background: #ef4444;
}

.time-text {
  font-size: 13px;
  color: #94a3b8;
}

.action-btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-btns .ant-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.action-btn-view:hover {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.action-btn-run:hover {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.action-btn-delete:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.empty-table {
  padding: 40px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: rgba(99, 102, 241, 0.3);
  margin-bottom: 16px;
}

.empty-table p {
  color: #94a3b8;
  margin-bottom: 16px;
}

/* Modal */
.artifact-modal :deep(.ant-modal-content) {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 16px;
}

.artifact-modal :deep(.ant-modal-header) {
  background: transparent;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  padding: 20px 24px;
}

.artifact-modal :deep(.ant-modal-title) {
  color: #f1f5f9;
  font-weight: 600;
}

.artifact-modal :deep(.ant-modal-close) {
  color: #94a3b8;
}

.artifact-modal :deep(.ant-modal-body) {
  padding: 0;
}

.modal-body {
  padding: 24px;
}

.build-steps :deep(.ant-steps-item-title) {
  color: #e2e8f0 !important;
}

.build-steps :deep(.ant-steps-item-description) {
  color: #94a3b8 !important;
}

.build-steps :deep(.ant-steps-item-icon) {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.3);
}

.build-steps :deep(.ant-steps-item-finish .ant-steps-item-icon) {
  background: #6366f1;
  border-color: #6366f1;
}

.step-content {
  margin-top: 24px;
}

.modal-form :deep(.ant-form-item-label > label) {
  color: #e2e8f0;
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  color: #e2e8f0;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.form-textarea.code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(99, 102, 241, 0.1);
}

/* View Modal */
.artifact-detail {
  padding: 16px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.detail-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.detail-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #f1f5f9;
}

.json-content {
  background: rgba(15, 23, 42, 0.5);
  padding: 20px;
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  font-family: 'JetBrains Mono', monospace;
  border: 1px solid rgba(99, 102, 241, 0.1);
}
</style>
