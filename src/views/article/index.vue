<template>
  <div class="article-container">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新建文章
        </el-button>
        <el-select v-model="filterStatus" placeholder="文章状态" @change="handleFilterChange" class="filter-select">
          <el-option label="全部" value="" />
          <el-option label="已发布" value="published" />
          <el-option label="草稿" value="draft" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-input
          v-model="searchQuery"
          placeholder="搜索文章标题"
          class="search-input"
          :prefix-icon="Search"
          clearable
          @input="handleSearch"
          @clear="handleSearch"
        />
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="articles"
      style="width: 100%"
      border
    >
      <el-table-column prop="title" label="标题" min-width="300">
        <template #default="{ row }">
          <div class="article-title">
            <span class="title-text">{{ row.title }}</span>
            <el-tag
              v-if="row.status === 'draft'"
              type="info"
              size="small"
              effect="plain"
              class="status-tag"
            >
              草稿
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分类" width="120">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="tags" label="标签" width="200">
        <template #default="{ row }">
          <el-tag
            v-for="tag in row.tags"
            :key="tag"
            class="mx-1"
            size="small"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="view_count" label="访问量" width="100" align="center">
        <template #default="{ row }">
          <el-tooltip
            :content="'最近更新: ' + formatDate(row.updated_at)"
            placement="top"
          >
            <span>{{ row.view_count }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="favorite_count" label="收藏" width="100" align="center">
        <template #default="{ row }">
          <el-tooltip
            :content="row.is_favorited ? '取消收藏' : '添加收藏'"
            placement="top"
          >
            <el-button
              :type="row.is_favorited ? 'danger' : 'default'"
              :icon="Star"
              circle
              size="small"
              @click.stop="handleToggleFavorite(row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="{ row }">
          <el-space>
            <el-button type="primary" :icon="View" size="small" @click="handleView(row)">
              预览
            </el-button>
            <el-button type="primary" :icon="Edit" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" :icon="Delete" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="previewArticle?.title"
      width="800px"
      class="preview-dialog"
    >
      <div class="preview-content" v-html="previewContent"></div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, View, Edit, Delete, Star } from '@element-plus/icons-vue'
import * as marked from 'marked'
import dayjs from 'dayjs'
import 'highlight.js/styles/github.css'

interface Article {
  id: number
  title: string
  content?: string
  category: string
  tags: string[]
  status: 'published' | 'draft'
  createTime: string
  updated_at: string
  view_count: number
  favorite_count: number
  is_favorited: boolean
}

const router = useRouter()
const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const previewDialogVisible = ref(false)
const previewArticle = ref<Article | null>(null)

const previewContent = computed(() => {
  if (!previewArticle.value?.content) return ''
  
  // 配置 marked 选项
  marked.setOptions({
    gfm: true, // 启用 GitHub 风格的 Markdown
    breaks: true, // 启用换行符
    headerIds: true, // 为标题添加 id
    highlight: function(code, lang) {
      // 如果需要代码高亮，可以在这里配置
      return code;
    }
  })
  
  return marked.parse(previewArticle.value.content)
})

// 模拟数据
const articles = ref<Article[]>([
  {
    id: 1,
    title: 'Vue3 组合式 API 最佳实践',
    content: '# Vue3 组合式 API 最佳实践\n\n这是一篇关于 Vue3 组合式 API 的文章...',
    category: '前端开发',
    tags: ['Vue3', 'TypeScript'],
    status: 'published',
    createTime: '2024-03-20 10:00:00',
    updated_at: '2024-03-20 10:00:00',
    view_count: 1250,
    favorite_count: 28,
    is_favorited: true
  },
  {
    id: 2,
    title: 'TypeScript 高级特性详解',
    content: '# TypeScript 高级特性详解\n\n这是一篇关于 TypeScript 的文章...',
    category: '编程语言',
    tags: ['TypeScript', '教程'],
    status: 'draft',
    createTime: '2024-03-19 15:30:00',
    updated_at: '2024-03-19 15:30:00',
    view_count: 860,
    favorite_count: 15,
    is_favorited: false
  }
])

const handleAdd = () => {
  router.push('/article/create')
}

const handleView = (row: Article) => {
  previewArticle.value = row
  previewDialogVisible.value = true
}

const handleEdit = (row: Article) => {
  router.push(`/article/${row.id}/edit`)
}

const handleDelete = (row: Article) => {
  ElMessageBox.confirm(
    `确定要删除文章"${row.title}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实现删除文章逻辑
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleSearch = () => {
  // 实现搜索逻辑
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handleFilterChange = () => {
  // 实现筛选逻辑
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handleToggleFavorite = async (row: Article) => {
  try {
    // 这里应该调用API切换收藏状态
    await new Promise(resolve => setTimeout(resolve, 500))
    row.is_favorited = !row.is_favorited
    row.favorite_count += row.is_favorited ? 1 : -1
    ElMessage.success(row.is_favorited ? '收藏成功' : '已取消收藏')
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped>
.article-container {
  padding: 20px;
  background-color: var(--bg-color);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  background-color: var(--bg-color);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.filter-select {
  width: 120px;
}

.article-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  color: var(--text-color);
  font-weight: 500;
}

.status-tag {
  font-weight: normal;
}

.preview-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
    background-color: var(--el-bg-color);
  }
}

.preview-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 24px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.8;
  color: var(--el-text-color-primary);

  :deep(h1) {
    font-size: 32px;
    font-weight: 600;
    margin: 24px 0 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-light);
    color: var(--el-text-color-primary);
  }

  :deep(h2) {
    font-size: 28px;
    font-weight: 600;
    margin: 20px 0 16px;
    color: var(--el-text-color-primary);
  }

  :deep(h3) {
    font-size: 24px;
    font-weight: 600;
    margin: 16px 0 12px;
    color: var(--el-text-color-primary);
  }

  :deep(h4) {
    font-size: 20px;
    font-weight: 600;
    margin: 16px 0 12px;
    color: var(--el-text-color-primary);
  }

  :deep(h5) {
    font-size: 18px;
    font-weight: 600;
    margin: 16px 0 12px;
    color: var(--el-text-color-primary);
  }

  :deep(h6) {
    font-size: 16px;
    font-weight: 600;
    margin: 16px 0 12px;
    color: var(--el-text-color-primary);
  }

  :deep(p) {
    margin: 16px 0;
    line-height: 1.8;
    color: var(--el-text-color-regular);
    font-size: 16px;
  }

  :deep(strong) {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  :deep(em) {
    font-style: italic;
    color: var(--el-text-color-regular);
  }

  :deep(blockquote) {
    margin: 16px 0;
    padding: 12px 24px;
    border-left: 4px solid var(--el-color-primary);
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-regular);
    font-size: 15px;
  }

  :deep(ul), :deep(ol) {
    padding-left: 24px;
    margin: 12px 0;
    color: var(--el-text-color-regular);
    font-size: 16px;
  }

  :deep(li) {
    margin: 8px 0;
    line-height: 1.8;
  }

  :deep(code) {
    font-family: 'Fira Code', 'Courier New', Courier, monospace;
    background-color: var(--el-fill-color-light);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  :deep(pre) {
    background-color: var(--el-fill-color-light);
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 16px 0;

    code {
      background-color: transparent;
      padding: 0;
      color: var(--el-text-color-primary);
      font-size: 14px;
      line-height: 1.6;
    }
  }

  :deep(a) {
    color: var(--el-color-primary);
    text-decoration: none;
    transition: color 0.3s;
    font-weight: 500;

    &:hover {
      color: var(--el-color-primary-light-3);
      text-decoration: underline;
    }
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 16px 0;
    border: 1px solid var(--el-border-color-light);
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid var(--el-border-color-light);
    margin: 24px 0;
  }

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color-darker);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background: var(--el-fill-color-light);
    border-radius: 3px;
  }
}

@media (max-width: 640px) {
  .article-container {
    padding: 12px;
  }

  .toolbar {
    flex-direction: column;
    padding: 12px;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }
}
</style> 