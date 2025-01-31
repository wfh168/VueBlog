<template>
  <div class="editor-container">
    <div class="editor-header">
      <el-form :model="articleForm" :rules="rules" ref="formRef" class="article-form">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item prop="title">
              <el-input
                v-model="articleForm.title"
                placeholder="请输入文章标题"
                maxlength="100"
                show-word-limit
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item prop="category">
              <el-select
                v-model="articleForm.category"
                placeholder="选择分类"
                class="w-full"
                clearable
              >
                <el-option
                  v-for="item in categories"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item prop="tags">
              <el-select
                v-model="articleForm.tags"
                placeholder="选择标签"
                multiple
                class="w-full"
                collapse-tags
                collapse-tags-tooltip
                clearable
              >
                <el-option
                  v-for="item in tags"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="editor-toolbar">
        <el-space :size="isMobile ? 8 : 12" wrap>
          <el-button type="primary" @click="handleSave" :loading="saving">
            <el-icon><DocumentAdd /></el-icon>
            保存草稿
          </el-button>
          <el-button type="success" @click="handlePublish" :loading="publishing">
            <el-icon><Upload /></el-icon>
            发布文章
          </el-button>
          <el-button type="info" @click="showHistory" :loading="loadingHistory">
            <el-icon><Timer /></el-icon>
            历史版本
          </el-button>
          <el-button @click="handleCancel">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
        </el-space>
      </div>
    </div>
    <div class="editor-main">
      <MdEditor
        v-model="articleForm.content"
        :theme="theme"
        @onSave="handleSave"
        :showCodeRowNumber="true"
        :toolbars="isMobile ? mobileToolbars : toolbars"
        codeTheme="github"
        previewTheme="github"
        class="md-editor"
        :style="{ height: editorHeight }"
      />
    </div>
    <el-dialog
      v-model="historyDialogVisible"
      title="历史版本"
      :width="isMobile ? '95%' : '800px'"
      class="history-dialog"
    >
      <el-table
        v-loading="loadingHistory"
        :data="versionHistory"
        style="width: 100%"
      >
        <el-table-column prop="version" label="版本" width="80" align="center" />
        <el-table-column prop="updated_at" label="修改时间" :width="isMobile ? 140 : 180" />
        <el-table-column prop="editor" label="修改人" :width="isMobile ? 80 : 120" />
        <el-table-column label="操作" :width="isMobile ? 140 : 200" fixed="right">
          <template #default="{ row }">
            <el-space :size="isMobile ? 4 : 8">
              <el-button
                type="primary"
                size="small"
                @click="previewVersion(row)"
              >
                预览
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="restoreVersion(row)"
              >
                恢复
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog
      v-model="previewDialogVisible"
      :title="'版本预览 (v' + selectedVersion?.version + ')'"
      :width="isMobile ? '95%' : '800px'"
      class="preview-dialog"
      append-to-body
    >
      <div class="preview-content" v-html="previewContent"></div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { marked } from 'marked'
import { DocumentAdd, Upload, Close, Timer } from '@element-plus/icons-vue'
import { useDark } from '@vueuse/core'


interface Category {
  id: number
  name: string
}

interface Tag {
  id: number
  name: string
}

interface ArticleForm {
  id?: number
  title: string
  content: string
  category: number | null
  tags: number[]
  status: 'draft' | 'published'
}

interface VersionHistory {
  version: number
  content: string
  editor: string
  updated_at: string
}

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const theme = ref('light')
const saving = ref(false)
const publishing = ref(false)
const isDark = useDark()
const historyDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const loadingHistory = ref(false)
const versionHistory = ref<VersionHistory[]>([])
const selectedVersion = ref<VersionHistory | null>(null)

// 添加移动端检测
const isMobile = ref(window.innerWidth <= 768)

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 移动端工具栏配置
const mobileToolbars = [
  'bold', 'italic', 'quote', 'unorderedList',
  'orderedList', 'codeRow', 'code', 'link',
  'image', 'preview', 'fullscreen'
]

// 编辑器高度计算
const editorHeight = computed(() => {
  return isMobile.value ? 'calc(100vh - 240px)' : 'calc(100vh - 280px)'
})

// 工具栏配置
const toolbars = [
  'bold', 'underline', 'italic', 'strikethrough', 'sub', 'sup', 'quote', 'unorderedList',
  'orderedList', 'codeRow', 'code', 'link', 'image', 'table', 'mermaid', 'katex', 'preview',
  'fullscreen'
]

// 表单数据
const articleForm = reactive<ArticleForm>({
  title: '',
  content: '',
  category: null,
  tags: [],
  status: 'draft'
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ]
}

// 模拟数据
const categories = ref<Category[]>([
  { id: 1, name: '前端开发' },
  { id: 2, name: '后端开发' },
  { id: 3, name: '数据库' },
  { id: 4, name: '开发工具' },
  { id: 5, name: '编程语言' }
])

const tags = ref<Tag[]>([
  { id: 1, name: 'Vue3' },
  { id: 2, name: 'TypeScript' },
  { id: 3, name: 'Node.js' },
  { id: 4, name: 'React' },
  { id: 5, name: 'JavaScript' },
  { id: 6, name: 'Python' }
])

// 如果是编辑模式，加载文章数据
onMounted(async () => {
  const id = route.params.id
  if (id) {
    try {
      // 这里应该调用API获取文章数据
      // 模拟加载数据
      const response = await new Promise<ArticleForm>((resolve) => {
        setTimeout(() => {
          resolve({
            id: Number(id),
            title: '示例文章',
            content: '# 示例文章\n\n这是一篇示例文章的内容。',
            category: 1,
            tags: [1, 2],
            status: 'draft'
          })
        }, 500)
      })
      Object.assign(articleForm, response)
    } catch (error) {
      ElMessage.error('加载文章失败')
      router.back()
    }
  }
})

// 保存为草稿
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    articleForm.status = 'draft'
    // 这里应该调用API保存文章
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    ElMessage.success('保存成功')
    router.push('/article')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('保存失败，请检查表单内容')
    }
  } finally {
    saving.value = false
  }
}

// 发布文章
const handlePublish = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    await ElMessageBox.confirm(
      '确定要发布这篇文章吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    publishing.value = true
    articleForm.status = 'published'
    // 这里应该调用API发布文章
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    ElMessage.success('发布成功')
    router.push('/article')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('发布失败，请重试')
    }
  } finally {
    publishing.value = false
  }
}

// 取消编辑
const handleCancel = async () => {
  if (articleForm.content || articleForm.title) {
    try {
      await ElMessageBox.confirm(
        '确定要取消编辑吗？未保存的内容将会丢失',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      router.back()
    } catch {
      // 用户取消操作，不做任何处理
    }
  } else {
    router.back()
  }
}

// 添加历史版本相关方法
const showHistory = async () => {
  try {
    loadingHistory.value = true
    // 这里应该调用API获取历史版本列表
    await new Promise(resolve => setTimeout(resolve, 1000))
    versionHistory.value = [
      {
        version: 2,
        content: '# 示例文章 v2\n\n这是第二个版本的内容。',
        editor: '管理员',
        updated_at: '2024-03-20 15:30:00'
      },
      {
        version: 1,
        content: '# 示例文章 v1\n\n这是第一个版本的内容。',
        editor: '管理员',
        updated_at: '2024-03-20 10:00:00'
      }
    ]
    historyDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载历史版本失败')
  } finally {
    loadingHistory.value = false
  }
}

const previewVersion = (version: VersionHistory) => {
  selectedVersion.value = version
  previewDialogVisible.value = true
}

const restoreVersion = async (version: VersionHistory) => {
  try {
    await ElMessageBox.confirm(
      `确定要恢复到版本 ${version.version} 吗？当前未保存的内容将会丢失。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用API恢复版本
    await new Promise(resolve => setTimeout(resolve, 1000))
    articleForm.content = version.content
    historyDialogVisible.value = false
    ElMessage.success('版本恢复成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('版本恢复失败')
    }
  }
}

// 添加计算属性
const previewContent = computed(() => {
  if (!selectedVersion.value?.content) return ''
  return marked(selectedVersion.value.content)
})

// 监听主题变化
watch(isDark, (newValue) => {
  theme.value = newValue ? 'dark' : 'light'
}, { immediate: true })
</script>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.editor-header {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
}

.article-form {
  margin-bottom: 16px;
}

.editor-toolbar {
  display: flex;
  justify-content: flex-end;
}

.editor-main {
  flex: 1;
  overflow: hidden;
  padding: 16px;
  background-color: var(--el-bg-color);
}

.md-editor {
  height: calc(100vh - 280px);
  min-height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.md-editor) {
  border: 1px solid var(--el-border-color) !important;
  background-color: var(--el-bg-color) !important;
  color: var(--el-text-color-primary) !important;
}

:deep(.md-editor-toolbar) {
  background-color: var(--el-bg-color) !important;
  border-bottom: 1px solid var(--el-border-color) !important;
}

:deep(.md-editor-toolbar-item) {
  color: var(--el-text-color-primary) !important;
}

:deep(.md-editor-toolbar-item:hover) {
  background-color: var(--el-fill-color-light) !important;
}

:deep(.md-editor-content) {
  background-color: var(--el-bg-color) !important;
}

:deep(.md-editor-preview) {
  background-color: var(--el-bg-color) !important;
  color: var(--el-text-color-primary) !important;
}

:deep(.cm-editor) {
  background-color: var(--el-bg-color) !important;
}

:deep(.cm-editor .cm-content) {
  color: var(--el-text-color-primary) !important;
}

:deep(.cm-editor .cm-gutters) {
  background-color: var(--el-fill-color-light) !important;
  border-right: 1px solid var(--el-border-color) !important;
}

:deep(.cm-editor .cm-activeLineGutter) {
  background-color: var(--el-fill-color) !important;
}

:deep(.cm-editor .cm-activeLine) {
  background-color: var(--el-fill-color-light) !important;
}

:deep(.cm-editor .cm-line) {
  color: var(--el-text-color-primary) !important;
}

:deep(.cm-editor .cm-cursor) {
  border-left-color: var(--el-text-color-primary) !important;
}

.w-full {
  width: 100%;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__wrapper) {
  background-color: var(--el-bg-color) !important;
  box-shadow: 0 0 0 1px var(--el-border-color) !important;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--el-color-primary) !important;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  color: var(--el-text-color-primary) !important;
}

:deep(.el-select-dropdown) {
  background-color: var(--el-bg-color) !important;
  border: 1px solid var(--el-border-color) !important;
}

:deep(.el-select-dropdown__item) {
  color: var(--el-text-color-primary) !important;
}

:deep(.el-select-dropdown__item.hover) {
  background-color: var(--el-fill-color-light) !important;
}

:deep(.el-select-dropdown__item.selected) {
  background-color: var(--el-color-primary-light-9) !important;
  color: var(--el-color-primary) !important;
}

.history-dialog :deep(.el-dialog__body) {
  padding: 20px;
  background-color: var(--el-bg-color);
}

.preview-dialog :deep(.el-dialog__body) {
  padding: 20px;
  background-color: var(--el-bg-color);
}

.preview-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  color: var(--el-text-color-primary);
}

.preview-content :deep(h1) {
  margin-top: 0;
  color: var(--el-text-color-primary);
}

@media screen and (max-width: 768px) {
  .editor-container {
    border-radius: 0;
  }

  .editor-header {
    padding: 12px;
  }

  .editor-toolbar {
    justify-content: center;
  }

  .editor-main {
    padding: 12px;
  }

  .md-editor {
    height: calc(100vh - 240px);
  }

  :deep(.el-form-item) {
    margin-bottom: 12px;
  }

  :deep(.el-dialog) {
    width: 95% !important;
    margin: 10px auto !important;
  }

  :deep(.el-dialog__body) {
    padding: 12px !important;
  }

  :deep(.el-table) {
    font-size: 12px;
  }

  :deep(.el-button--small) {
    padding: 6px 12px;
    font-size: 12px;
  }

  :deep(.md-editor-toolbar) {
    flex-wrap: wrap;
    padding: 4px;
  }

  :deep(.md-editor-toolbar-item) {
    padding: 4px 8px;
  }
}
</style> 