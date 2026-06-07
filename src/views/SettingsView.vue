<template>
  <div class="settings">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-title">
        <SettingOutlined class="header-icon" />
        <div class="title-info">
          <h2>系统设置</h2>
          <span class="subtitle">配置系统参数和 LLM 连接</span>
        </div>
      </div>
    </div>

    <a-row :gutter="[20, 20]">
      <!-- System Config -->
      <a-col :xs="24" :lg="12">
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <DesktopOutlined class="panel-icon system" />
              <div class="title-info">
                <h3>系统配置</h3>
                <span class="subtitle">PDF 解析和后端引擎设置</span>
              </div>
            </div>
            <a-tag color="blue" class="panel-tag">核心配置</a-tag>
          </div>
          <div class="panel-body">
            <a-form :model="systemConfig" layout="vertical" class="settings-form">
              <a-form-item label="后端模式">
                <a-select v-model:value="systemConfig.backend" size="large" class="form-select">
                  <a-select-option value="pipeline">
                    <ApartmentOutlined /> Pipeline
                  </a-select-option>
                  <a-select-option value="vlm-auto-engine">
                    <EyeOutlined /> VLM Auto Engine
                  </a-select-option>
                  <a-select-option value="hybrid-auto-engine">
                    <MergeCellsOutlined /> Hybrid Auto Engine
                  </a-select-option>
                </a-select>
                <div class="form-hint">选择 PDF 解析的后端处理引擎</div>
              </a-form-item>

              <a-form-item label="设备">
                <a-radio-group v-model:value="systemConfig.device" class="device-radio">
                  <a-radio-button value="cpu">
                    <CloudOutlined /> CPU
                  </a-radio-button>
                  <a-radio-button value="cuda">
                    <GpuIcon /> GPU (CUDA)
                  </a-radio-button>
                </a-radio-group>
                <div class="form-hint">选择计算设备，GPU 可加速处理</div>
              </a-form-item>

              <a-form-item label="语言">
                <a-select v-model:value="systemConfig.language" size="large" class="form-select">
                  <a-select-option value="zh">
                    <span class="lang-flag">🇨🇳</span> 中文
                  </a-select-option>
                  <a-select-option value="en">
                    <span class="lang-flag">🇺🇸</span> 英文
                  </a-select-option>
                  <a-select-option value="auto">
                    <SyncOutlined /> 自动检测
                  </a-select-option>
                </a-select>
              </a-form-item>

              <a-divider class="form-divider" />

              <a-form-item>
                <div class="switch-item">
                  <div class="switch-info">
                    <div class="switch-label">公式提取</div>
                    <div class="switch-desc">启用 LaTeX 公式识别和提取</div>
                  </div>
                  <a-switch v-model:checked="systemConfig.formulaEnable" class="custom-switch" />
                </div>
              </a-form-item>

              <a-form-item>
                <div class="switch-item">
                  <div class="switch-info">
                    <div class="switch-label">表格提取</div>
                    <div class="switch-desc">启用表格结构识别和转换</div>
                  </div>
                  <a-switch v-model:checked="systemConfig.tableEnable" class="custom-switch" />
                </div>
              </a-form-item>

              <a-form-item class="form-actions">
                <a-button type="primary" size="large" class="save-btn" @click="saveSystemConfig">
                  <SaveOutlined />
                  保存系统配置
                </a-button>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </a-col>

      <!-- LLM Config -->
      <a-col :xs="24" :lg="12">
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <RobotOutlined class="panel-icon llm" />
              <div class="title-info">
                <h3>LLM 配置</h3>
                <span class="subtitle">大语言模型连接设置</span>
              </div>
            </div>
            <a-tag color="purple" class="panel-tag">AI 配置</a-tag>
          </div>
          <div class="panel-body">
            <a-form :model="llmConfig" layout="vertical" class="settings-form">
              <a-form-item label="LLM 类型">
                <a-select v-model:value="llmConfig.type" size="large" class="form-select">
                  <a-select-option value="openai">
                    <OpenAIIcon /> OpenAI
                  </a-select-option>
                  <a-select-option value="ollama">
                    <OllamaIcon /> Ollama
                  </a-select-option>
                  <a-select-option value="anthropic">
                    <AnthropicIcon /> Anthropic
                  </a-select-option>
                  <a-select-option value="custom">
                    <ApiOutlined /> 自定义
                  </a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item label="模型名称">
                <a-input v-model:value="llmConfig.model" placeholder="例如：gpt-4, glm-5, claude-3" size="large"
                  class="form-input" />
              </a-form-item>

              <a-form-item label="API URL">
                <a-input v-model:value="llmConfig.baseUrl" placeholder="https://api.example.com/v1" size="large"
                  class="form-input" />
              </a-form-item>

              <a-form-item label="API Token">
                <a-input-password v-model:value="llmConfig.apiToken" placeholder="输入 API Token" size="large"
                  class="form-input" />
              </a-form-item>

              <a-form-item label="温度">
                <div class="slider-item">
                  <a-slider v-model:value="llmConfig.temperature" :min="0" :max="2" :step="0.1" class="custom-slider" />
                  <span class="slider-value">{{ llmConfig.temperature }}</span>
                </div>
                <div class="form-hint">控制输出的随机性，较低值更确定，较高值更创意</div>
              </a-form-item>

              <a-form-item label="最大 Token">
                <a-input-number v-model:value="llmConfig.maxTokens" :min="1000" :max="100000" size="large"
                  class="form-input-number" style="width: 100%" />
              </a-form-item>

              <a-form-item class="form-actions">
                <a-button type="primary" size="large" class="save-btn llm-btn" @click="saveLLMConfig">
                  <SaveOutlined />
                  保存 LLM 配置
                </a-button>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- System Info -->
    <a-row :gutter="[20, 20]" class="info-row">
      <a-col :xs="24">
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">
              <InfoCircleOutlined class="panel-icon info" />
              <div class="title-info">
                <h3>系统信息</h3>
                <span class="subtitle">版本和依赖信息</span>
              </div>
            </div>
          </div>
          <div class="panel-body">
            <a-row :gutter="[20, 20]">
              <a-col :xs="24" :sm="12" :md="8" :lg="4" v-for="(item, index) in systemInfo" :key="index">
                <div class="info-card">
                  <div class="info-icon" :class="item.type">
                    <component :is="item.icon" />
                  </div>
                  <div class="info-content">
                    <div class="info-label">{{ item.label }}</div>
                    <div class="info-value">{{ item.value }}</div>
                  </div>
                </div>
              </a-col>
            </a-row>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, h } from 'vue'
import {
  SettingOutlined,
  DesktopOutlined,
  RobotOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  ApartmentOutlined,
  EyeOutlined,
  MergeCellsOutlined,
  SyncOutlined,
  ApiOutlined,
  GithubOutlined,
  CodeOutlined,
  FilePdfOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  CloudOutlined,
  DatabaseOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { pdfApi } from '@/services/api'

// Custom icons
const GpuIcon = () => h('svg', { viewBox: '0 0 24 24', width: '1em', height: '1em', fill: 'currentColor' }, [
  h('path', { d: 'M4 5v14h16V5H4zm14 12H6V7h12v10z' }),
  h('path', { d: 'M8 9h2v2H8zm4 0h2v2h-2zm4 0h2v2h-2z' }),
])

const OpenAIIcon = () => h('span', { style: 'font-weight: 600;' }, 'AI')
const OllamaIcon = () => h('span', { style: 'font-weight: 600;' }, 'Ol')
const AnthropicIcon = () => h('span', { style: 'font-weight: 600;' }, 'An')

const systemConfig = reactive({
  backend: 'pipeline',
  device: 'cpu',
  language: 'zh',
  formulaEnable: true,
  tableEnable: true,
})

const llmConfig = reactive({
  type: 'custom',
  model: 'glm-5',
  baseUrl: '',
  apiToken: '',
  temperature: 0.7,
  maxTokens: 40960,
})

const systemInfo = [
  { label: '服务版本', value: 'v1.0.0', icon: GithubOutlined, type: 'primary' },
  { label: 'FastAPI', value: '0.110.0', icon: CodeOutlined, type: 'success' },
  { label: 'Python', value: '3.10+', icon: DatabaseOutlined, type: 'warning' },
  { label: 'MinerU', value: 'latest', icon: FilePdfOutlined, type: 'info' },
  { label: 'LangChain', value: 'latest', icon: LinkOutlined, type: 'purple' },
  { label: '系统状态', value: '运行中', icon: CheckCircleOutlined, type: 'success' },
]

async function loadConfig() {
  try {
    const response = await pdfApi.config()
    const config = response.data
    systemConfig.backend = config.backend || 'pipeline'
    systemConfig.device = config.device || 'cpu'
    systemConfig.language = config.language || 'zh'
    systemConfig.formulaEnable = config.formula_enable !== false
    systemConfig.tableEnable = config.table_enable !== false
  } catch (error) {
    console.error('加载配置失败', error)
  }
}

function saveSystemConfig() {
  message.success('系统配置已保存')
}

function saveLLMConfig() {
  message.success('LLM 配置已保存')
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.settings {
  padding: 8px;
}

/* Page Header */
.page-header {
  margin-bottom: 24px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  padding: 12px;
}

.header-title .title-info h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #f1f5f9;
}

.header-title .subtitle {
  font-size: 14px;
  color: #94a3b8;
}

/* Panel */
.panel {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.panel-icon.system {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.panel-icon.llm {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.panel-icon.info {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
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

.panel-tag {
  border-radius: 6px;
  font-size: 12px;
  padding: 2px 10px;
}

.panel-body {
  padding: 24px;
}

/* Form */
.settings-form :deep(.ant-form-item-label > label) {
  color: #e2e8f0;
  font-weight: 500;
  font-size: 14px;
}

.form-input,
.form-select,
.form-input-number {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 8px;
  color: #e2e8f0;
}

.form-input:focus,
.form-select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.form-hint {
  font-size: 12px;
  color: #64748b;
  margin-top: 6px;
}

/* Device Radio */
.device-radio :deep(.ant-radio-button-wrapper) {
  background: rgba(15, 23, 42, 0.5);
  border-color: rgba(99, 102, 241, 0.2);
  color: #94a3b8;
}

.device-radio :deep(.ant-radio-button-wrapper-checked) {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
  color: #6366f1;
}

.device-radio :deep(.ant-radio-button-wrapper:not(:first-child)::before) {
  background-color: rgba(99, 102, 241, 0.2);
}

/* Switch */
.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 10px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.switch-label {
  font-weight: 500;
  color: #e2e8f0;
  font-size: 14px;
}

.switch-desc {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.custom-switch :deep(.ant-switch-checked) {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

/* Slider */
.slider-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.custom-slider {
  flex: 1;
}

.custom-slider :deep(.ant-slider-track) {
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
}

.custom-slider :deep(.ant-slider-handle) {
  border-color: #6366f1;
}

.slider-value {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.15);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
}

/* Divider */
.form-divider {
  border-color: rgba(99, 102, 241, 0.1);
  margin: 16px 0;
}

/* Save Button */
.form-actions {
  margin-top: 24px;
  margin-bottom: 0;
}

.save-btn {
  width: 100%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 10px;
  font-weight: 500;
  height: 44px;
}

.save-btn:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.save-btn.llm-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
}

.save-btn.llm-btn:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
}

/* Info Cards */
.info-row {
  margin-top: 4px;
}

.info-card {
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.info-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.info-icon.primary {
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

.info-icon.success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.info-icon.warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.info-icon.info {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.info-icon.purple {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.info-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
}

.lang-flag {
  margin-right: 8px;
}
</style>
