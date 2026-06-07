<template>
  <div class="deep-agent">
    <a-row :gutter="[20, 20]">
      <!-- Chat Section -->
      <a-col :xs="24" :lg="15">
        <div class="panel chat-panel">
          <div class="panel-header">
            <div class="panel-title">
              <RobotOutlined class="panel-icon" />
              <div class="title-info">
                <h3>Deep Agent</h3>
                <span class="subtitle">深度智能体对话</span>
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
                  <RobotOutlined />
                </div>
                <h3>开始与 Deep Agent 对话</h3>
                <p>输入您的问题或任务，Deep Agent 将为您提供智能服务</p>
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
                      <RobotOutlined v-else />
                    </a-avatar>
                  </div>
                  <div class="message-content">
                    <div class="message-header">
                      <span class="message-role">
                        {{ msg.role === 'user' ? '用户' : 'Deep Agent' }}
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

      <!-- Config Section -->
      <a-col :xs="24" :lg="9" style="display: flex; flex-direction: column; gap: 20px;">
        <div class="panel config-panel">
          <div class="panel-header">
            <div class="panel-title">
              <SettingOutlined class="panel-icon" />
              <h3>配置</h3>
            </div>
          </div>
          <div class="panel-body config-panel-body">
            <a-form :model="agentConfig" layout="vertical" class="config-form">
              <a-form-item label="模型">
                <a-select v-model:value="agentConfig.model" class="config-select">
                  <a-select-option value="glm-5">GLM-5</a-select-option>
                  <a-select-option value="gpt-4">GPT-4</a-select-option>
                  <a-select-option value="gpt-3.5-turbo">GPT-3.5</a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item label="温度">
                <div class="slider-with-value">
                  <a-slider v-model:value="agentConfig.temperature" :min="0" :max="2" :step="0.1"
                    class="config-slider" />
                  <span class="slider-value">{{ agentConfig.temperature }}</span>
                </div>
              </a-form-item>

              <a-form-item label="最大 Token">
                <a-input-number v-model:value="agentConfig.maxTokens" :min="1000" :max="100000" class="config-input" />
              </a-form-item>

              <a-form-item>
                <a-checkbox v-model:checked="agentConfig.stream" class="config-checkbox">
                  <span class="checkbox-label">流式输出</span>
                  <span class="checkbox-desc">实时显示生成内容</span>
                </a-checkbox>
              </a-form-item>

              <a-form-item>
                <a-checkbox v-model:checked="agentConfig.useTools" class="config-checkbox">
                  <span class="checkbox-label">启用工具</span>
                  <span class="checkbox-desc">允许使用外部工具</span>
                </a-checkbox>
              </a-form-item>
            </a-form>
          </div>
        </div>

        <div class="panel info-panel">
          <div class="panel-header">
            <div class="panel-title">
              <InfoCircleOutlined class="panel-icon" />
              <h3>关于 Deep Agent</h3>
            </div>
          </div>
          <div class="panel-body info-panel-body">
            <div class="info-content">
              <p>Deep Agent 是一个深度智能体，能够：</p>
              <ul class="feature-list">
                <li>
                  <CheckCircleOutlined /> 自主规划和执行任务
                </li>
                <li>
                  <CheckCircleOutlined /> 使用多种工具完成复杂操作
                </li>
                <li>
                  <CheckCircleOutlined /> 生成和管理 Artifacts
                </li>
                <li>
                  <CheckCircleOutlined /> 进行深度研究和分析
                </li>
              </ul>
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
  RobotOutlined,
  UserOutlined,
  SendOutlined,
  ClearOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  KeyOutlined,
} from '@ant-design/icons-vue'
import { deepAgentApi } from '@/services/api'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const inputMessage = ref('')
const sending = ref(false)
const messages = ref<Array<{
  role: string
  content: string
  time: string
  loading?: boolean
}>>([])
const chatContainer = ref<HTMLElement>()

const quickPrompts = [
  '帮我分析这份数据',
  '生成一个 Python 脚本',
  '解释一下这个概念',
  '优化这段代码',
]

const agentConfig = ref({
  model: 'glm-5',
  temperature: 0.7,
  maxTokens: 40960,
  stream: true,
  useTools: true,
})

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
    const response = await deepAgentApi.execute({
      input_text: message,
      model: agentConfig.value.model,
      temperature: agentConfig.value.temperature,
      max_tokens: agentConfig.value.maxTokens,
      include_messages: false,
    })

    messages.value[loadingIndex] = {
      role: 'assistant',
      content: response.data.final_answer || '执行完成，但未收到回复',
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
.deep-agent {
  height: calc(100vh - 120px);
  padding: 4px;
  overflow: hidden;
}

.panel {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 16px;
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
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
  flex-shrink: 0;
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
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Chat Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  scroll-behavior: smooth;
  min-height: 0;
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
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #6366f1;
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
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 20px;
  color: #a78bfa;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-prompt:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.3);
  color: #e2e8f0;
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
  background: #6366f1;
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
  flex-shrink: 0;
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
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: all 0.3s;
}

.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.send-btn:disabled {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  box-shadow: none;
}

/* Config */
.config-form :deep(.ant-form-item-label) {
  color: #94a3b8;
  font-size: 13px;
}

.config-panel-body {
  overflow-y: auto;
  padding: 20px 24px;
}

.info-panel-body {
  overflow-y: auto;
  padding: 20px 24px;
  flex: 1;
}

.config-select {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 10px;
}

.slider-with-value {
  display: flex;
  align-items: center;
  gap: 16px;
}

.config-slider {
  flex: 1;
}

.slider-value {
  font-size: 14px;
  font-weight: 600;
  color: #6366f1;
  min-width: 36px;
  text-align: right;
}

.config-input {
  width: 100%;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 10px;
}

.config-checkbox {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(99, 102, 241, 0.05);
}

.checkbox-label {
  font-weight: 500;
  color: #e2e8f0;
}

.checkbox-desc {
  font-size: 12px;
  color: #64748b;
}

/* Info Panel */
.info-content {
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.7;
}

.info-content p {
  margin-bottom: 16px;
}

.feature-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #e2e8f0;
}

.feature-list li :deep(.anticon) {
  color: #10b981;
  font-size: 16px;
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
