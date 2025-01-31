<template>
  <div class="category-page">
    <div class="content">
      <!-- 分类信息 -->
      <div class="category-header">
        <h1 class="category-title">
          <el-icon><Folder /></el-icon>
          {{ category.name }}
          <span class="category-count">({{ category.count }})</span>
        </h1>
        <div class="category-description" v-if="category.description">
          {{ category.description }}
        </div>
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
                v-for="tag in article.tags"
                :key="tag.id"
                :to="`/blog/tag/${tag.id}`"
                class="tag"
              >
                {{ tag.name }}
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
      <!-- 所有分类 -->
      <div class="widget">
        <h3 class="widget-title">所有分类</h3>
        <ul class="category-list">
          <li
            v-for="cat in categories"
            :key="cat.id"
            :class="['category-item', { active: cat.id === category.id }]"
          >
            <router-link :to="`/blog/category/${cat.id}`">
              {{ cat.name }}
              <span class="count">{{ cat.count }}</span>
            </router-link>
          </li>
        </ul>
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
import { Calendar, View, ChatLineRound, Folder, ArrowRight } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const route = useRoute()

// 当前分类信息
const category = ref({
  id: 1,
  name: '前端开发',
  description: '前端开发相关的文章，包括 HTML、CSS、JavaScript、Vue、React 等技术。',
  count: 25
})

// 所有分类列表
const categories = ref([
  { id: 1, name: '前端开发', count: 25 },
  { id: 2, name: '后端开发', count: 18 },
  { id: 3, name: '数据库', count: 12 },
  // 更多分类...
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

// 获取分类信息
const fetchCategory = async (id: string | string[]) => {
  console.log('获取分类信息:', id)
  // 实现获取分类信息的逻辑
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

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchCategory(newId)
    }
  }
)

onMounted(() => {
  if (route.params.id) {
    fetchCategory(route.params.id)
  }
})
</script>

<style scoped>
.category-page {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
}

.content {
  min-height: 200px;
}

.category-header {
  padding: 24px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 24px;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 12px;
}

.category-count {
  font-size: 16px;
  font-weight: normal;
  color: var(--text-color-light);
}

.category-description {
  color: var(--text-color-light);
  line-height: 1.6;
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

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  margin-bottom: 12px;
}

.category-item:last-child {
  margin-bottom: 0;
}

.category-item a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-color);
  text-decoration: none;
  transition: color 0.3s;
}

.category-item a:hover {
  color: var(--el-color-primary);
}

.category-item.active a {
  color: var(--el-color-primary);
  font-weight: 500;
}

.count {
  background-color: var(--tag-bg);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
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
  .category-page {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .category-page {
    grid-template-columns: 1fr;
    padding: 10px;
  }

  .sidebar {
    position: static;
    margin-top: 24px;
  }

  .category-header {
    padding: 16px;
  }

  .category-title {
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
  .category-page {
    margin-top: 10px;
  }

  .article-meta {
    font-size: 12px;
  }

  .widget {
    padding: 16px;
  }
}
</style> 