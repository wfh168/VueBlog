<template>
  <div class="article-page">
    <!-- 左侧边栏 -->
    <el-aside width="280px" class="left-sidebar">
      <el-card shadow="never" class="nav-card">
        <template #header>
          <div class="nav-group-title">
            <el-icon><Folder /></el-icon>
            文章分类
          </div>
        </template>
        <el-tree
          :data="categoryTree"
          :props="{
            label: 'name',
            children: 'articles'
          }"
          node-key="id"
          :current-node-key="currentArticleId"
          @node-click="handleNodeClick"
          class="category-tree"
        >
          <template #default="{ node, data }">
            <div class="custom-tree-node">
              <span :class="{ 'is-article': !data.articles }">{{ node.label }}</span>
              <el-tag v-if="!data.articles" size="small" type="info">{{ formatDate(data.created_at) }}</el-tag>
            </div>
          </template>
        </el-tree>
      </el-card>
    </el-aside>

    <!-- 主要内容区域 -->
    <el-main class="article-main">
      <el-card shadow="never" class="article-card">
        <article>
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <el-space wrap :size="16">
              <el-tag size="large" :color="isDark ? '#2c2c2c' : '#f5f7fa'" class="meta-tag">
                <template #icon><el-icon><User /></el-icon></template>
                {{ article.author }}
              </el-tag>
              <el-tag size="large" :color="isDark ? '#2c2c2c' : '#f5f7fa'" class="meta-tag">
                <template #icon><el-icon><Calendar /></el-icon></template>
                {{ formatDate(article.created_at) }}
              </el-tag>
              <el-tag size="large" :color="isDark ? '#2c2c2c' : '#f5f7fa'" class="meta-tag">
                <template #icon><el-icon><View /></el-icon></template>
                {{ article.views }} 阅读
              </el-tag>
              <el-tag size="large" :color="isDark ? '#2c2c2c' : '#f5f7fa'" class="meta-tag">
                <template #icon><el-icon><ChatLineRound /></el-icon></template>
                {{ article.comments }} 评论
              </el-tag>
              <el-tag size="large" :color="isDark ? '#2c2c2c' : '#f5f7fa'" class="meta-tag">
                <template #icon><el-icon><Collection /></el-icon></template>
                <router-link :to="`/blog/category/${article.category.id}`">{{ article.category.name }}</router-link>
              </el-tag>
            </el-space>
          </div>

          <div class="article-content markdown-body" v-html="renderedContent"></div>

          <footer class="article-footer">
            <el-alert
              :title="'本文作者：' + article.author"
              type="info"
              :closable="false"
              class="copyright-alert"
            >
              <p>本文链接：{{ articleUrl }}</p>
              <p>版权声明：本博客所有文章除特别声明外，均采用 CC BY-NC-SA 4.0 许可协议。转载请注明出处！</p>
            </el-alert>

            <el-divider />

            <nav class="article-navigation">
              <el-row :gutter="24">
                <el-col :span="12" v-if="article.prev">
                  <el-card
                    shadow="hover"
                    class="nav-card prev"
                    @click="router.push(`/blog/article/${article.prev.id}`)"
                  >
                    <template #header>
                      <div class="nav-card-header">
                        <el-icon><ArrowLeft /></el-icon>
                        上一篇
                      </div>
                    </template>
                    {{ article.prev.title }}
                  </el-card>
                </el-col>
                <el-col :span="12" v-if="article.next">
                  <el-card
                    shadow="hover"
                    class="nav-card next"
                    @click="router.push(`/blog/article/${article.next.id}`)"
                  >
                    <template #header>
                      <div class="nav-card-header">
                        下一篇
                        <el-icon><ArrowRight /></el-icon>
                      </div>
                    </template>
                    {{ article.next.title }}
                  </el-card>
                </el-col>
              </el-row>
            </nav>
          </footer>
        </article>
      </el-card>
    </el-main>

    <!-- 右侧边栏 -->
    <el-aside width="280px" class="right-sidebar">
      <el-card shadow="never" class="toc-card">
        <template #header>
          <div class="toc-title">
            <el-icon><Document /></el-icon>
            目录
          </div>
        </template>
        <el-tree
          :data="tocTree"
          :props="{
            label: 'text',
            children: 'children'
          }"
          node-key="id"
          :highlight-current="true"
          @node-click="scrollToHeading"
          class="toc-tree"
        >
          <template #default="{ node }">
            <span :style="{ paddingLeft: (node.level - 1) * 12 + 'px' }">{{ node.label }}</span>
          </template>
        </el-tree>
      </el-card>
    </el-aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Calendar, View, ChatLineRound, Collection,
  Document, Folder, User, ArrowLeft, ArrowRight
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { marked } from 'marked'
import { useDark } from '@vueuse/core'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const isDark = useDark()

// 文章数据
const article = ref({
  id: 1,
  title: 'Git笔记',
  author: '星梦启航',
  created_at: '2024-03-20',
  views: 1234,
  comments: 23,
  category: { id: 1, name: '前端开发' },
  content: '# Git笔记\n\n## 基本概念\nGit是一个开源的分布式版本控制系统...\n\n### 工作区域\nGit的工作区域主要分为三个部分：\n- 工作区（Working Directory）\n- 暂存区（Stage/Index）\n- 版本库（Repository）\n\n### 基本命令\n```bash\ngit init          # 初始化仓库\ngit add .         # 添加文件到暂存区\ngit commit -m "消息"  # 提交更改\ngit status        # 查看状态\ngit log           # 查看提交历史\n```\n\n> 注意：在使用Git时，要养成良好的提交习惯，每次提交都应该有清晰的提交信息。\n\n## 分支管理\n分支是Git中最重要的概念之一，它允许我们并行开发而不互相干扰。\n\n```bash\ngit branch        # 查看分支\ngit branch dev    # 创建dev分支\ngit checkout dev  # 切换到dev分支\ngit merge dev     # 合并dev分支\n```',
  prev: { id: 1, title: 'TypeScript 高级特性详解' },
  next: { id: 2, title: 'Node.js 性能优化实践' }
})

// 分类树数据
const categoryTree = ref([
  {
    id: 1,
    name: '前端开发',
    articles: [
      {
        id: 101,
        name: 'Git笔记',
        created_at: '2024-03-20'
      },
      {
        id: 102,
        name: 'TypeScript 高级特性详解',
        created_at: '2024-03-19'
      }
    ]
  },
  {
    id: 2,
    name: '后端开发',
    articles: [
      {
        id: 201,
        name: 'Node.js 性能优化实践',
        created_at: '2024-03-18'
      }
    ]
  }
])

// 目录树数据
const tocTree = ref([])

// 生成目录树
const generateTocTree = (content: string) => {
  const headings = []
  const tokens = marked.lexer(content)
  let id = 1

  tokens.forEach(token => {
    if (token.type === 'heading') {
      headings.push({
        id: id++,
        text: token.text,
        level: token.depth,
        children: []
      })
    }
  })

  // 构建树结构
  const result = []
  const stack = [{ level: 0, children: result }]

  headings.forEach(heading => {
    while (heading.level <= stack[stack.length - 1].level) {
      stack.pop()
    }
    const parent = stack[stack.length - 1].children
    parent.push(heading)
    stack.push(heading)
  })

  return result
}

// 渲染 Markdown 内容
const renderedContent = computed(() => {
  return marked(article.value.content, {
    gfm: true,
    breaks: true,
    highlight: function(code, lang) {
      if (window.hljs && lang) {
        try {
          return window.hljs.highlight(code, { language: lang }).value
        } catch (e) {
          return code
        }
      }
      return code
    }
  })
})

// 计算文章完整URL
const articleUrl = computed(() => {
  return window.location.href
})

const currentArticleId = computed(() => Number(route.params.id))

// 处理分类树节点点击
const handleNodeClick = (data: any) => {
  if (!data.articles) {
    router.push(`/blog/article/${data.id}`)
  }
}

// 滚动到指定标题
const scrollToHeading = (data: any) => {
  const element = document.getElementById(data.text)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 监听文章内容变化，更新目录
watch(() => article.value.content, (newContent) => {
  tocTree.value = generateTocTree(newContent)
}, { immediate: true })

onMounted(() => {
  // 获取文章详情
  console.log('获取文章详情:', route.params.id)
})
</script>

<style scoped>
.article-page {
  display: grid;
  grid-template-columns: 280px minmax(0, 1200px) 280px;
  gap: 32px;
  max-width: 1800px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 64px);
}

/* Left sidebar styles */
.left-sidebar {
  position: sticky;
  top: 24px;
  height: calc(100vh - 48px);
  width: 280px !important;
}

.nav-card {
  height: 100%;
}

.nav-group-title {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-tree {
  height: calc(100% - 48px);
  overflow-y: auto;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 14px;
}

/* Article main styles */
.article-main {
  padding: 0;
}

.article-card {
  margin-bottom: 24px;
}

.article-title {
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 24px;
  line-height: 1.4;
}

.article-meta {
  margin-bottom: 32px;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
}

.meta-tag a {
  color: inherit;
  text-decoration: none;
}

/* Article content styles */
.article-content {
  line-height: 1.8;
  font-size: 16px;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4),
.article-content :deep(h5),
.article-content :deep(h6) {
  font-weight: 600;
  margin: 36px 0 16px;
  line-height: 1.4;
  scroll-margin-top: 80px;
}

.article-content :deep(h1) { font-size: 32px; }
.article-content :deep(h2) { font-size: 28px; }
.article-content :deep(h3) { font-size: 24px; }
.article-content :deep(h4) { font-size: 20px; }
.article-content :deep(h5) { font-size: 18px; }
.article-content :deep(h6) { font-size: 16px; }

.article-content :deep(p) {
  margin: 16px 0;
}

/* Article footer styles */
.article-footer {
  margin-top: 48px;
}

.copyright-alert {
  margin-bottom: 24px;
}

.nav-card {
  cursor: pointer;
}

.nav-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.nav-card.next .nav-card-header {
  justify-content: flex-end;
}

/* Right sidebar styles */
.right-sidebar {
  position: sticky;
  top: 24px;
  height: calc(100vh - 48px);
  width: 280px !important;
}

.toc-card {
  height: 100%;
}

.toc-title {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toc-tree {
  height: calc(100% - 48px);
  overflow-y: auto;
}

/* Responsive styles */
@media screen and (max-width: 1800px) {
  .article-page {
    grid-template-columns: 280px minmax(0, 1fr);
  }

  .right-sidebar {
    display: none;
  }
}

@media screen and (max-width: 1200px) {
  .article-page {
    grid-template-columns: minmax(0, 1fr);
  }

  .left-sidebar {
    display: none;
  }

  .article-title {
    font-size: 28px;
  }
}

@media screen and (max-width: 640px) {
  .article-page {
    padding: 16px;
  }

  .article-title {
    font-size: 24px;
    margin-bottom: 16px;
  }

  .article-meta {
    margin-bottom: 24px;
  }

  .article-content :deep(h1) { font-size: 24px; }
  .article-content :deep(h2) { font-size: 22px; }
  .article-content :deep(h3) { font-size: 20px; }
  .article-content :deep(h4) { font-size: 18px; }
  .article-content :deep(h5),
  .article-content :deep(h6) { font-size: 16px; }
}
</style> 