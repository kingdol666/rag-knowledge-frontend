<template>
  <div class="my-agent">
    <a-row :gutter="[20, 20]">
      <!-- Chat Section -->
      <a-col :xs="24" :lg="16">
        <div class="panel chat-panel">
          <div class="panel-header">
            <div class="panel-title">
              <ApiOutlined class="panel-icon" />
              <div class="title-info">
                <h3>My Agent</h3>
                <span class="subtitle">自定义智能体对话</span>
              </div>
            </div>
            <div class="header-actions">
              <a-tooltip title="清空对话">
                <a-button type="text" class="action-btn" @click="clearChat">
                  <ClearOutlined />
                </a-button>
              </a-tooltip>
            </div>
          </div>
          <div class="panel-body">
            <div ref="chatContainer" class="chat-messages">
              <div v-if="messages.length === 0" class="empty-chat">
                <div class="empty-avatar">
                  <ApiOutlined />
                </div>
                <h3>开始与 My Agent 对话</h3>
                <p>My Agent 是一个深度智能体，能够自主思考和执行任务</p>
                <div class="quick-prompts">
                  <a-tag v-for="(prompt, index) in quickPrompts" :key="index" class="quick-prompt"
                    @click="inputMessage = prompt">
                    {{ prompt }}
                  </a-tag>
                </div>
              </div>

              <transition-group name="message">
                <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
                  <div class="message-avatar">
                    <a-avatar :size="40" :class="msg.role">
                      <UserOutlined v-if="msg.role === 'user'" />
                      <ApiOutlined v-else />
                    </a-avatar>
                  </div>
                  <div class="message-content">
                    <div class="message-header">
                      <span class="message-role">
                        {{ msg.role === 'user' ? '用户' : 'My Agent' }}
                      </span>
                      <span class="message-time">{{ msg.time }}</span>
                    </div>
                    <div class="message-body">
                      <div v-if="msg.loading" class="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <div v-else class="message-text" v-html="renderMarkdown(msg.content)"></div>
                    </div>
                    <div v-if="msg.toolCalls && msg.toolCalls.length > 0" class="tool-calls">
                      <div class="tool-call-header">
                        <ToolOutlined />
                        <span>工具调用</span>
                      </div>
                      <div v-for="(tool, toolIndex) in msg.toolCalls" :key="toolIndex" class="tool-call-item">
                        <div class="tool-call-name">
                          <FunctionOutlined />
                          {{ tool.name }}
                        </div>
                        <pre class="tool-call-params">{{ JSON.stringify(tool.parameters, null, 2) }}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>

            <div class="chat-input">
              <div class="input-wrapper">
                <a-textarea v-model:value="inputMessage" :rows="3" placeholder="输入您的问题..." class="input-textarea"
                  @keydown.enter.prevent="handleEnter" />
                <div class="input-toolbar">
                  <span class="input-hint">
                    <KeyOutlined /> Enter 发送 · Shift + Enter 换行
                  </span>
                  <a-button type="primary" :loading="sending" :disabled="!inputMessage.trim()" class="send-btn"
                    @click="sendMessage">
                    <SendOutlined />
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-col>

      <!-- Info Section -->
      <a-col :xs="24" :lg="8">
        <div class="panel info-panel">
          <div class="panel-header">
            <div class="panel-title">
              <InfoCircleOutlined class="panel-icon" />
              <h3>智能体信息</h3>
            </div>
          </div>
          <div class="panel-body">
            <div class="agent-info">
              <div class="info-item">
                <span class="info-label">名称</span>
                <span class="info-value">My Agent</span>
              </div>
              <div class="info-item">
                <span class="info-label">类型</span>
                <a-tag color="blue">自定义</a-tag>
              </div>
              <div class="info-item">
                <span class="info-label">状态</span>
                <a-badge status="processing" text="运行中" />
              </div>
            </div>
          </div>
        </div>

        <div class="panel tools-panel">
          <div class="panel-header">
            <div class="panel-title">
              <ToolOutlined class="panel-icon" />
              <h3>可用工具</h3>
            </div>
          </div>
          <div class="panel-body">
            <div class="tools-list">
              <div v-for="(tool, index) in tools" :key="index" class="tool-item">
                <div class="tool-icon">
                  <FunctionOutlined />
                </div>
                <div class="tool-info">
                  <div class="tool-name">{{ tool.name }}</div>
                  <div class="tool-desc">{{ tool.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import {
  ApiOutlined,
  UserOutlined,
  SendOutlined,
  ClearOutlined,
  InfoCircleOutlined,
  ToolOutlined,
  FunctionOutlined,
  KeyOutlined,
} from '@ant-design/icons-vue'
import { myAgentApi } from '@/services/api'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const inputMessage = ref('')
const sending = ref(false)
const messages = ref<Array<{
  role: string
  content: string
  time: string
  loading?: boolean
  toolCalls?: Array<{ name: string; parameters: any }>
}>>([])
const chatContainer = ref<HTMLElement>()

const quickPrompts = [
  '查询知识库',
  '执行数据分析',
  '调用外部 API',
  '生成报告',
]

const tools = [
  { name: 'web_search', description: '搜索网络信息' },
  { name: 'fetch_web_page', description: '获取网页内容' },
  { name: 'calculator', description: '执行数学计算' },
  { name: 'file_reader', description: '读取文件内容' },
  { name: 'code_executor', description: '执行代码' },
]

function renderMarkdown(content: string) {
  const html = marked(content, { async: false }) as string
  return DOMPurify.sanitize(html)
}

function handleEnter(e: KeyboardEvent) {
  if (!e.shiftKey) {
    sendMessage()
  }
}

async function sendMessage() {
  const message = inputMessage.value.trim()
  if (!message || sending.value) return

  const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  messages.value.push({
    role: 'user',
    content: message,
    time: now,
  })

  inputMessage.value = ''
  sending.value = true

  const loadingIndex = messages.value.push({
    role: 'assistant',
    content: '',
    time: now,
    loading: true,
  }) - 1

  await nextTick()
  scrollToBottom()

  try {
    const response = await myAgentApi.execute({
      input_text: message,
      use_config_llm: true,
    })

    const result = response.data.result
    messages.value[loadingIndex] = {
      role: 'assistant',
      content: result?.final_answer || '执行完成，但未收到回复',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
  } catch (error) {
    messages.value[loadingIndex] = {
      role: 'assistant',
      content: '抱歉，执行过程中出现错误，请重试。',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
  } finally {
    sending.value = false
    await nextTick()
    scrollToBottom()
  }
}

function clearChat() {
  messages.value = []
  message.success('对话已清空')
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}
</script>

<style scoped>
.my-agent {
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
  gap: 12px;
}

.panel-icon {
  font-size: 20px;
  color: #6366f1;
}

.title-info {
  display: flex;
  flex-direction: column;
}

.title-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #f1f5f9;
}

.subtitle {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #64748b;
  transition: all 0.3s;
}

.action-btn:hover {
  color: #e2e8f0;
  background: rgba(99, 102, 241, 0.1);
}

.panel-body {
  padding: 0;
}

/* Chat Messages */
.chat-messages {
  height: calc(100vh - 340px);
  min-height: 400px;
  overflow-y: auto;
  padding: 24px;
  scroll-behavior: smooth;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px;
}

.empty-avatar {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #f59e0b;
  margin-bottom: 20px;
}

.empty-chat h3 {
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 8px;
}

.empty-chat p {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 24px;
}

.quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.quick-prompt {
  padding: 8px 16px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 20px;
  color: #fbbf24;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-prompt:hover {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

/* Message */
.message {
  display: flex;
  gap: 14px;
  margin-bottom: 24px;
  animation: messageIn 0.3s ease;
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar :deep(.ant-avatar) {
  width: 40px;
  height: 40px;
  border-radius: 12px;
}

.message-avatar :deep(.ant-avatar.user) {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.message-avatar :deep(.ant-avatar:not(.user)) {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.message-content {
  flex: 1;
  max-width: calc(100% - 60px);
}

.message.user .message-content {
  text-align: right;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.message.user .message-header {
  justify-content: flex-end;
}

.message-role {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

.message-time {
  font-size: 12px;
  color: #64748b;
}

.message-body {
  display: inline-block;
  padding: 14px 18px;
  border-radius: 14px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.1);
  text-align: left;
}

.message.user .message-body {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-color: rgba(99, 102, 241, 0.2);
}

.message-text {
  font-size: 14px;
  line-height: 1.7;
  color: #e2e8f0;
}

.message-text :deep(p) {
  margin-bottom: 8px;
}

.message-text :deep(pre) {
  background: rgba(15, 23, 42, 0.8);
  padding: 14px;
  border-radius: 10px;
  overflow-x: auto;
  margin: 10px 0;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.message-text :deep(code) {
  background: rgba(99, 102, 241, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #a78bfa;
}

.message-text :deep(pre code) {
  background: none;
  padding: 0;
  color: #e2e8f0;
}

/* Tool Calls */
.tool-calls {
  margin-top: 12px;
  padding: 14px 18px;
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.1);
  border-radius: 12px;
  text-align: left;
}

.tool-call-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #f59e0b;
  margin-bottom: 10px;
}

.tool-call-item {
  margin-bottom: 10px;
}

.tool-call-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
  margin-bottom: 6px;
}

.tool-call-params {
  background: rgba(15, 23, 42, 0.8);
  padding: 10px 14px;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #94a3b8;
  overflow-x: auto;
  margin: 0;
  border: 1px solid rgba(99, 102, 241, 0.05);
}

/* Loading Dots */
.loading-dots {
  display: flex;
  gap: 6px;
  padding: 8px 0;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}

/* Chat Input */
.chat-input {
  padding: 20px 24px;
  border-top: 1px solid rgba(99, 102, 241, 0.08);
}

.input-wrapper {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(99, 102, 241, 0.1);
  padding: 16px;
  transition: all 0.3s;
}

.input-wrapper:focus-within {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-textarea {
  background: transparent;
  border: none;
  resize: none;
  padding: 0;
  font-size: 14px;
  color: #e2e8f0;
}

.input-textarea:focus {
  box-shadow: none;
}

.input-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.input-hint {
  font-size: 12px;
  color: #64748b;
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  transition: all 0.3s;
}

.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

.send-btn:disabled {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  box-shadow: none;
}

/* Agent Info */
.agent-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 10px;
}

.info-label {
  font-size: 13px;
  color: #64748b;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #e2e8f0;
}

/* Tools */
.tools-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(99, 102, 241, 0.05);
  transition: all 0.3s;
}

.tool-item:hover {
  border-color: rgba(99, 102, 241, 0.1);
  background: rgba(15, 23, 42, 0.7);
}

.tool-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #6366f1;
  flex-shrink: 0;
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-size: 14px;
  font-weight: 500;
  color: #e2e8f0;
}

.tool-desc {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

/* Transitions */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>
