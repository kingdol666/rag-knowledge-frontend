<template>
  <div class="pdf-parser">
    <a-row :gutter="[20, 20]">
      <!-- Upload Section -->
      <a-col :xs="24" :lg="12">
        <div class="panel upload-panel">
          <div class="panel-header">
            <div class="panel-title">
              <CloudUploadOutlined class="panel-icon" />
              <h3>PDF 文件上传</h3>
            </div>
            <a-tag color="blue" class="panel-tag">支持批量</a-tag>
          </div>
          <div class="panel-body">
            <a-upload-dragger
              v-model:fileList="fileList"
              :multiple="true"
              :before-upload="beforeUpload"
              accept=".pdf"
              class="upload-area"
              :class="{ 'upload-active': isDragging }"
              @dragenter="isDragging = true"
              @dragleave="isDragging = false"
            >
              <div class="upload-content">
                <div class="upload-icon-wrapper" :class="{ pulse: isDragging }">
                  <InboxOutlined class="upload-icon" />
                </div>
                <p class="upload-text">点击或拖拽 PDF 文件到此处</p>
                <p class="upload-hint">支持单个或批量上传，文件大小不超过 100MB</p>
              </div>
            </a-upload-dragger>

            <!-- File List -->
            <div v-if="fileList.length > 0" class="file-list">
              <div v-for="(file, index) in fileList" :key="index" class="file-item">
                <div class="file-info">
                  <FilePdfOutlined class="file-icon" />
                  <div class="file-details">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-size">{{ formatFileSize(file.size || 0) }}</div>
                  </div>
                </div>
                <a-button type="text" danger size="small" @click="removeFile(index)">
                  <DeleteOutlined />
                </a-button>
              </div>
            </div>

            <div class="upload-actions">
              <a-button
                type="primary"
                size="large"
                :loading="uploading"
                :disabled="fileList.length === 0"
                block
                class="upload-btn"
                @click="handleUpload"
              >
                <UploadOutlined />
                开始解析
              </a-button>
            </div>
          </div>
        </div>

        <!-- Config Panel -->
        <div class="panel config-panel">
          <div class="panel-header">
            <div class="panel-title">
              <SettingOutlined class="panel-icon" />
              <h3>解析配置</h3>
            </div>
          </div>
          <div class="panel-body">
            <a-form :model="config" layout="vertical">
              <a-form-item label="解析模式">
                <a-radio-group v-model:value="config.mode" class="mode-selector">
                  <a-radio-button value="vt" class="mode-btn">
                    <FileTextOutlined />
                    <span>传统模式</span>
                    <small>基于 VT 的解析</small>
                  </a-radio-button>
                  <a-radio-button value="vlm" class="mode-btn">
                    <EyeOutlined />
                    <span>VLM 模式</span>
                    <small>视觉语言模型</small>
                  </a-radio-button>
                </a-radio-group>
              </a-form-item>

              <a-form-item label="输出格式">
                <a-radio-group v-model:value="config.outputFormat">
                  <a-radio-button value="markdown">Markdown</a-radio-button>
                  <a-radio-button value="json">JSON</a-radio-button>
                </a-radio-group>
              </a-form-item>

              <a-form-item>
                <div class="config-toggles">
                  <a-checkbox v-model:checked="config.useOcr" class="config-toggle">
                    <span class="toggle-label">启用 OCR</span>
                    <span class="toggle-desc">识别扫描版 PDF 中的文字</span>
                  </a-checkbox>
                  <a-checkbox v-model:checked="config.formulaEnable" class="config-toggle">
                    <span class="toggle-label">公式提取</span>
                    <span class="toggle-desc">识别并提取 LaTeX 公式</span>
                  </a-checkbox>
                  <a-checkbox v-model:checked="config.tableEnable" class="config-toggle">
                    <span class="toggle-label">表格提取</span>
                    <span class="toggle-desc">保留表格结构和数据</span>
                  </a-checkbox>
                </div>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </a-col>

      <!-- Results Section -->
      <a-col :xs="24" :lg="12">
        <div class="panel results-panel">
          <div class="panel-header">
            <div class="panel-title">
              <FileTextOutlined class="panel-icon" />
              <h3>解析结果</h3>
            </div>
            <div class="header-actions">
              <a-button type="link" size="small" :disabled="!result" @click="copyResult">
                <CopyOutlined />
                复制
              </a-button>
              <a-button type="link" size="small" :disabled="!result" @click="downloadResult">
                <DownloadOutlined />
                下载
              </a-button>
            </div>
          </div>
          <div class="panel-body">
            <div v-if="!result && !parsing" class="empty-state">
              <div class="empty-icon-wrapper">
                <FileSearchOutlined class="empty-icon" />
              </div>
              <h4>等待解析</h4>
              <p>上传 PDF 文件并开始解析后，结果将显示在这里</p>
            </div>

            <div v-else-if="parsing" class="parsing-state">
              <a-spin size="large" />
              <p class="parsing-text">正在解析文档...</p>
              <a-progress :percent="progress" :show-info="false" class="parsing-progress" />
            </div>

            <div v-else class="result-content">
              <div class="result-toolbar">
                <a-segmented v-model:value="viewMode" :options="[
                  { label: '预览', value: 'preview' },
                  { label: '源码', value: 'source' },
                ]" />
              </div>
              <div v-if="viewMode === 'preview'" class="markdown-preview" v-html="renderedResult" />
              <pre v-else class="source-code">{{ result }}</pre>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  CloudUploadOutlined,
  InboxOutlined,
  FilePdfOutlined,
  UploadOutlined,
  DeleteOutlined,
  SettingOutlined,
  FileTextOutlined,
  EyeOutlined,
  CopyOutlined,
  DownloadOutlined,
  FileSearchOutlined,
} from '@ant-design/icons-vue'
import { pdfApi } from '@/services/api'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const fileList = ref<any[]>([])
const uploading = ref(false)
const parsing = ref(false)
const progress = ref(0)
const result = ref('')
const viewMode = ref('preview')
const isDragging = ref(false)

const config = ref({
  mode: 'vt',
  outputFormat: 'markdown',
  useOcr: false,
  formulaEnable: true,
  tableEnable: true,
})

const renderedResult = computed(() => {
  if (!result.value) return ''
  const html = marked(result.value, { async: false }) as string
  return DOMPurify.sanitize(html)
})

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function beforeUpload(file: File) {
  const isPDF = file.type === 'application/pdf'
  if (!isPDF) {
    message.error('只能上传 PDF 文件！')
    return false
  }
  const isLt100M = file.size / 1024 / 1024 < 100
  if (!isLt100M) {
    message.error('文件大小不能超过 100MB！')
    return false
  }
  return false
}

function removeFile(index: number) {
  fileList.value.splice(index, 1)
}

async function handleUpload() {
  if (fileList.value.length === 0) return

  uploading.value = true
  parsing.value = true
  progress.value = 0

  try {
    const file = fileList.value[0].originFileObj || fileList.value[0]
    const response = await pdfApi.convertFile(file)
    
    progress.value = 100
    result.value = response.data.markdown || response.data.content || JSON.stringify(response.data, null, 2)
    message.success('解析成功！')
  } catch (error) {
    console.error('上传失败', error)
    message.error('解析失败，请重试')
  } finally {
    uploading.value = false
    parsing.value = false
  }
}

function copyResult() {
  navigator.clipboard.writeText(result.value)
  message.success('已复制到剪贴板')
}

function downloadResult() {
  const blob = new Blob([result.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'result.md'
  a.click()
  URL.revokeObjectURL(url)
  message.success('下载成功')
}
</script>

<style scoped>
.pdf-parser {
  padding: 4px;
}

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

.panel-tag {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 20px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.panel-body {
  padding: 24px;
}

/* Upload Area */
.upload-area {
  background: rgba(15, 23, 42, 0.5);
  border: 2px dashed rgba(99, 102, 241, 0.2);
  border-radius: 16px;
  padding: 48px 24px;
  transition: all 0.3s;
}

.upload-area:hover,
.upload-active {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.05);
}

.upload-content {
  text-align: center;
}

.upload-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  transition: all 0.3s;
}

.upload-icon-wrapper.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.upload-icon {
  font-size: 36px;
  color: #6366f1;
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: #e2e8f0;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 13px;
  color: #64748b;
}

/* File List */
.file-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.05);
  transition: all 0.3s;
}

.file-item:hover {
  border-color: rgba(99, 102, 241, 0.1);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  font-size: 24px;
  color: #ef4444;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #e2e8f0;
}

.file-size {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

/* Upload Actions */
.upload-actions {
  margin-top: 20px;
}

.upload-btn {
  height: 48px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
  transition: all 0.3s;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

.upload-btn:disabled {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  box-shadow: none;
}

/* Config */
.mode-selector {
  display: flex;
  gap: 12px;
}

.mode-btn {
  flex: 1;
  height: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.1);
  background: rgba(15, 23, 42, 0.5);
}

.mode-btn :deep(.ant-radio-button-checked) {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%);
  border-color: #6366f1;
}

.mode-btn span {
  font-size: 14px;
  font-weight: 500;
}

.mode-btn small {
  font-size: 12px;
  color: #64748b;
}

.config-toggles {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-toggle {
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(99, 102, 241, 0.05);
  transition: all 0.3s;
}

.config-toggle:hover {
  border-color: rgba(99, 102, 241, 0.1);
}

.toggle-label {
  display: block;
  font-weight: 500;
  color: #e2e8f0;
  margin-bottom: 2px;
}

.toggle-desc {
  font-size: 12px;
  color: #64748b;
}

/* Results */
.empty-state {
  text-align: center;
  padding: 60px 24px;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.empty-icon {
  font-size: 36px;
  color: #6366f1;
}

.empty-state h4 {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 13px;
  color: #64748b;
}

.parsing-state {
  text-align: center;
  padding: 60px 24px;
}

.parsing-text {
  margin-top: 20px;
  font-size: 15px;
  color: #e2e8f0;
}

.parsing-progress {
  max-width: 300px;
  margin: 20px auto 0;
}

.parsing-progress :deep(.ant-progress-inner) {
  background: rgba(99, 102, 241, 0.1);
}

.parsing-progress :deep(.ant-progress-bg) {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-toolbar {
  display: flex;
  justify-content: flex-end;
}

.markdown-preview {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(99, 102, 241, 0.05);
  max-height: 600px;
  overflow-y: auto;
  line-height: 1.8;
}

.source-code {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(99, 102, 241, 0.1);
  max-height: 600px;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #e2e8f0;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Markdown Styles */
.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3) {
  color: #f1f5f9;
  margin-top: 24px;
  margin-bottom: 12px;
}

.markdown-preview :deep(p) {
  color: #94a3b8;
  margin-bottom: 12px;
}

.markdown-preview :deep(code) {
  background: rgba(99, 102, 241, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #a78bfa;
}

.markdown-preview :deep(pre) {
  background: rgba(15, 23, 42, 0.8);
  padding: 16px;
  border-radius: 10px;
  overflow-x: auto;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.markdown-preview :deep(pre code) {
  background: none;
  padding: 0;
  color: #e2e8f0;
}

.markdown-preview :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid rgba(99, 102, 241, 0.1);
  padding: 10px 14px;
  text-align: left;
}

.markdown-preview :deep(th) {
  background: rgba(99, 102, 241, 0.1);
  font-weight: 600;
  color: #e2e8f0;
}

.markdown-preview :deep(tr:nth-child(even)) {
  background: rgba(15, 23, 42, 0.3);
}
</style>
