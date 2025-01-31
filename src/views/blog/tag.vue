<template>
  <div class="tag-page">
    <div class="content">
      <!-- 标签信息 -->
      <div class="tag-header">
        <h1 class="tag-title">
          <el-icon><Collection /></el-icon>
          {{ tag.name }}
          <span class="tag-count">({{ tag.count }})</span>
        </h1>
      </div>

      <!-- 文章列表 -->
      <div class="article-list">
        <div v-for="article in articles" :key="article.id" class="article-card">
          <router-link :to="`/blog/article/${article.id}`" class="article-title">
            {{ article.title }}
          </router-link>
          <div class="article-meta">
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(article.created_at) }}
            </span>
            <span class="meta-item">
              <el-icon><View /></el-icon>
              {{ article.views }} 阅读
            </span>
            <span class="meta-item">
              <el-icon><ChatLineRound /></el-icon>
              {{ article.comments }} 评论
            </span>
            <span class="meta-item">
              <el-icon><Folder /></el-icon>
              <router-link :to="`/blog/category/${article.category.id}`">
                {{ article.category.name }}
              </router-link>
            </span>
          </div>
          <div class="article-summary">{{ article.summary }}</div>
          <div class="article-footer">
            <div class="article-tags">
              <router-link
                v-for="t in article.tags"
                :key="t.id"
                :to="`/blog/tag/${t.id}`"
                :class="['tag', { active: t.id === tag.id }]"
              >
                {{ t.name }}
              </router-link>
            </div>
            <router-link :to="`/blog/article/${article.id}`" class="read-more">
              阅读全文
              <el-icon class="icon"><ArrowRight /></el-icon>
            </router-link>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 侧边栏 -->
    <aside class="sidebar">
      <!-- 标签云 -->
      <div class="widget">
        <h3 class="widget-title">标签云</h3>
        <div class="tag-cloud">
          <router-link
            v-for="t in tags"
            :key="t.id"
            :to="`/blog/tag/${t.id}`"
            :class="['tag', { active: t.id === tag.id }]"
            :style="{ fontSize: getTagSize(t.count) + 'px' }"
          >
            {{ t.name }}
          </router-link>
        </div>
      </div>

      <!-- 相关标签 -->
      <div class="widget">
        <h3 class="widget-title">相关标签</h3>
        <div class="related-tags">
          <router-link
            v-for="t in relatedTags"
            :key="t.id"
            :to="`/blog/tag/${t.id}`"
            class="tag"
          >
            {{ t.name }}
            <span class="count">{{ t.count }}</span>
          </router-link>
        </div>
      </div>

      <!-- 热门文章 -->
      <div class="widget">
        <h3 class="widget-title">热门文章</h3>
        <ul class="popular-posts">
          <li v-for="post in popularPosts" :key="post.id" class="popular-post-item">
            <router-link :to="`/blog/article/${post.id}`">
              {{ post.title }}
            </router-link>
            <div class="post-meta">
              <span class="views">
                <el-icon><View /></el-icon>
                {{ post.views }}
              </span>
              <span class="date">{{ formatDate(post.created_at) }}</span>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Calendar, View, ChatLineRound, Collection, Folder, ArrowRight } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const route = useRoute()

// 当前标签信息
const tag = ref({
  id: 1,
  name: 'Vue',
  count: 15
})

// 所有标签
const tags = ref([
  { id: 1, name: 'Vue', count: 15 },
  { id: 2, name: 'TypeScript', count: 12 },
  { id: 3, name: 'Node.js', count: 8 },
  { id: 4, name: 'JavaScript', count: 20 },
  { id: 5, name: 'HTML', count: 10 },
  { id: 6, name: 'CSS', count: 10 },
  // 更多标签...
])

// 相关标签
const relatedTags = ref([
  { id: 2, name: 'TypeScript', count: 12 },
  { id: 4, name: 'JavaScript', count: 20 },
  { id: 7, name: 'React', count: 8 },
  // 更多相关标签...
])

// 文章列表数据
const articles = ref([
  {
    id: 1,
    title: '使用 Vue 3 和 TypeScript 构建现代化博客系统',
    summary: '本文介绍如何使用 Vue 3、TypeScript 和 Element Plus 构建一个现代化的博客系统，包括前台展示和后台管理功能...',
    views: 1234,
    comments: 23,
    created_at: '2024-01-15',
    category: { id: 1, name: '前端开发' },
    tags: [
      { id: 1, name: 'Vue' },
      { id: 2, name: 'TypeScript' }
    ]
  },
  // 更多文章...
])

// 热门文章
const popularPosts = ref([
  { id: 1, title: '热门文章1', views: 2345, created_at: '2024-01-20' },
  { id: 2, title: '热门文章2', views: 1234, created_at: '2024-01-19' },
  { id: 3, title: '热门文章3', views: 987, created_at: '2024-01-18' },
  // 更多热门文章...
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchArticles()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchArticles()
}

// 获取标签信息
const fetchTag = async (id: string | string[]) => {
  console.log('获取标签信息:', id)
  // 实现获取标签信息的逻辑
}

// 获取文章列表
const fetchArticles = () => {
  console.log('获取文章列表:', currentPage.value, pageSize.value)
  // 实现获取文章列表的逻辑
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 根据标签文章数量计算字体大小
const getTagSize = (count: number) => {
  const minSize = 12
  const maxSize = 20
  const minCount = 1
  const maxCount = Math.max(...tags.value.map(t => t.count))
  return minSize + (count - minCount) * (maxSize - minSize) / (maxCount - minCount)
}

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchTag(newId)
    }
  }
)

onMounted(() => {
  if (route.params.id) {
    fetchTag(route.params.id)
  }
})
</script>

<style scoped>
.tag-page {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
}

.content {
  min-height: 200px;
}

.tag-header {
  padding: 24px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 24px;
}

.tag-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.tag-count {
  font-size: 16px;
  font-weight: normal;
  color: var(--text-color-light);
}

.article-list {
  min-height: 200px;
}

.article-card {
  padding: 24px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 24px;
  transition: all 0.3s;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-title {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  text-decoration: none;
  margin-bottom: 12px;
  transition: color 0.3s;
}

.article-title:hover {
  color: var(--el-color-primary);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  color: var(--text-color-light);
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item a {
  color: var(--text-color-light);
  text-decoration: none;
  transition: color 0.3s;
}

.meta-item a:hover {
  color: var(--el-color-primary);
}

.article-summary {
  color: var(--text-color);
  line-height: 1.6;
  margin-bottom: 16px;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-tags {
  display: flex;
  gap: 8px;
}

.tag {
  padding: 4px 8px;
  background-color: var(--tag-bg);
  color: var(--text-color-light);
  border-radius: 4px;
  text-decoration: none;
  font-size: 12px;
  transition: all 0.3s;
}

.tag:hover {
  background-color: var(--el-color-primary);
  color: #fff;
}

.tag.active {
  background-color: var(--el-color-primary);
  color: #fff;
}

.read-more {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-color-primary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  padding: 6px 16px;
  border-radius: 20px;
  background: var(--el-color-primary-light-9);
}

.read-more:hover {
  color: #fff;
  background: var(--el-color-primary);
  transform: translateX(4px);
}

.read-more .icon {
  transition: transform 0.3s;
}

.read-more:hover .icon {
  transform: translateX(4px);
}

.pagination {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

.sidebar {
  position: sticky;
  top: 88px;
}

.widget {
  padding: 20px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 24px;
}

.widget-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.related-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.count {
  background-color: var(--hover-bg);
  padding: 0 4px;
  border-radius: 4px;
  margin-left: 4px;
}

.popular-posts {
  list-style: none;
  padding: 0;
  margin: 0;
}

.popular-post-item {
  margin-bottom: 16px;
}

.popular-post-item:last-child {
  margin-bottom: 0;
}

.popular-post-item a {
  display: block;
  color: var(--text-color);
  text-decoration: none;
  margin-bottom: 4px;
  transition: color 0.3s;
}

.popular-post-item a:hover {
  color: var(--el-color-primary);
}

.post-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-color-light);
}

.views {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .tag-page {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .tag-page {
    grid-template-columns: 1fr;
    padding: 10px;
  }

  .sidebar {
    position: static;
    margin-top: 24px;
  }

  .tag-header {
    padding: 16px;
  }

  .tag-title {
    font-size: 20px;
  }

  .article-card {
    padding: 16px;
  }

  .article-title {
    font-size: 18px;
  }

  .article-meta {
    flex-wrap: wrap;
    gap: 8px;
  }

  .article-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .article-tags {
    flex-wrap: wrap;
  }

  .tag-cloud {
    gap: 6px;
  }

  .pagination :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }

  .read-more {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .tag-page {
    margin-top: 10px;
  }

  .article-meta {
    font-size: 12px;
  }

  .widget {
    padding: 16px;
  }

  .tag-cloud {
    gap: 4px;
  }

  .tag {
    padding: 2px 6px;
    font-size: 12px;
  }
}
</style> 