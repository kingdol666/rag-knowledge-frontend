import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('[API Error]', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// PDF Parser API
export const pdfApi = {
  health: () => apiClient.get('/v1/health'),
  config: () => apiClient.get('/v1/config'),
  convertBase64: (data: { pdf_base64: string; output_dir?: string }) =>
    apiClient.post('/v1/convert', data),
  convertFile: (file: File, outputDir?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    if (outputDir) formData.append('output_dir', outputDir)
    return apiClient.post('/v1/convert/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  batchParseVT: (data: {
    pdf_paths: string[]
    output_dir?: string
    use_ocr?: boolean
  }) => apiClient.post('/v1/batch/parse/vt', data),
  batchParseVLM: (data: {
    pdf_paths: string[]
    output_dir?: string
    vlm_backend?: string
    vlm_model_path?: string
    vlm_server_url?: string
    formula_enable?: boolean
    table_enable?: boolean
    batch_size?: number
  }) => apiClient.post('/v1/batch/parse/vlm', data),
}

// DeepAgent API
export const deepAgentApi = {
  info: () => apiClient.get('/deepagent'),
  skills: () => apiClient.get('/deepagent/skills'),
  dependencies: () => apiClient.get('/deepagent/dependencies'),
  artifacts: () => apiClient.get('/deepagent/artifacts'),
  getArtifact: (id: string) => apiClient.get(`/deepagent/artifacts/${id}`),
  buildArtifact: (data: any) => apiClient.post('/deepagent/artifacts', data),
  executeArtifact: (id: string, data: any) =>
    apiClient.post(`/deepagent/artifacts/${id}/execute`, data),
  executeArtifactByName: (name: string, data: any) =>
    apiClient.post(`/deepagent/artifacts/by-name/${name}/execute`, data),
  deleteArtifact: (id: string) => apiClient.delete(`/deepagent/artifacts/${id}`),
  execute: (data: any) => apiClient.post('/deepagent/execute', data),
}

// MyAgent API
export const myAgentApi = {
  info: () => apiClient.get('/myagent'),
  execute: (data: any) => apiClient.post('/myagent/execute', data),
  executeStream: (data: any) =>
    apiClient.post('/myagent/execute/stream', data, {
      responseType: 'stream',
    }),
  tools: () => apiClient.get('/myagent/tools'),
  executeTool: (data: { tool_name: string; parameters: Record<string, any> }) =>
    apiClient.post('/myagent/tools/execute', data),
}

export default apiClient
