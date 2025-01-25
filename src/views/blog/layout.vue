<template>
  <div class="blog-layout">
    <!-- 顶部导航 -->
    <header class="header" :class="{ 'header-shadow': isScrolled }">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <router-link to="/blog" class="logo-text">
              <el-icon class="logo-icon"><Platform /></el-icon>
              Vue Blog
            </router-link>
          </div>
          <nav class="nav">
            <div class="nav-menu">
              <router-link to="/blog" class="nav-item" exact-active-class="active">
                <el-icon><HomeFilled /></el-icon>
                首页
              </router-link>
              <router-link to="/blog/category" class="nav-item" active-class="active">
                <el-icon><Folder /></el-icon>
                分类
              </router-link>
              <router-link to="/blog/tag" class="nav-item" active-class="active">
                <el-icon><Collection /></el-icon>
                标签
              </router-link>
              <router-link to="/blog/archive" class="nav-item" active-class="active">
                <el-icon><Calendar /></el-icon>
                归档
              </router-link>
              <router-link to="/blog/about" class="nav-item" active-class="active">
                <el-icon><User /></el-icon>
                关于
              </router-link>
            </div>
          </nav>
          <div class="actions">
            <div class="stats">
              <div class="stat-item" title="文章数">
                <el-icon><Document /></el-icon>
                <span>{{ stats.articles }}</span>
              </div>
              <div class="stat-item" title="评论数">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ stats.comments }}</span>
              </div>
              <div class="stat-item" title="总阅读量">
                <el-icon><View /></el-icon>
                <span>{{ stats.views }}</span>
              </div>
            </div>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索文章..."
              class="search-input"
              :prefix-icon="Search"
              @keyup.enter="handleSearch"
              clearable
            />
            <div class="theme-switch" @click="toggleDark()">
              <el-icon><component :is="isDark ? 'Sunny' : 'Moon'" /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="main">
      <div class="container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-info">
            <p>{{ blogName }} © {{ new Date().getFullYear() }}</p>
            <p v-if="icp">{{ icp }}</p>
          </div>
          <div class="footer-links">
            <a href="#" target="_blank">GitHub</a>
            <a href="#" target="_blank">RSS</a>
            <router-link to="/">后台管理</router-link>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Search, Moon, Sunny, HomeFilled, Grid, 
  Collection, Folder, User, Platform, 
  Document, ChatDotRound, View, Calendar 
} from '@element-plus/icons-vue'
import { useDark, useToggle } from '@vueuse/core'

const router = useRouter()
const route = useRoute()
const isDark = useDark()
const toggleDark = useToggle(isDark)

// 判断是否在首页
const isHome = computed(() => {
  return route.path === '/blog' || route.path === '/blog/'
})

// 监听路由变化更新标题
const updateTitle = () => {
  const baseTitle = 'Vue Blog'
  const routeTitle = route.meta.title as string
  document.title = routeTitle ? `${routeTitle} - ${baseTitle}` : baseTitle
}

watch(() => route.path, updateTitle, { immediate: true })

// 统计数据
const stats = ref({
  articles: 128,
  comments: 356,
  views: 25678
})

// 博客基本信息
const logo = ref('/src/assets/logo.svg')
const blogName = ref('Vue Blog')
const icp = ref('京ICP备XXXXXXXX号')
const searchKeyword = ref('')

// 监听滚动
const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 搜索处理
const handleSearch = () => {
  if (!searchKeyword.value.trim()) return
  // 实现搜索逻辑
  console.log('搜索关键词:', searchKeyword.value)
}
</script>

<style scoped>
.blog-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  z-index: 100;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.header-shadow {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  background-color: rgba(var(--el-bg-color-rgb), 0.8);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo {
  margin-right: 48px;
}

.logo-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  text-decoration: none;
  transition: color 0.3s;
}

.logo-text:hover {
  color: var(--el-color-primary);
}

.logo-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.nav {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 8px;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 64px;
  line-height: 64px;
  padding: 0 16px;
  color: var(--el-text-color-regular);
  text-decoration: none;
  font-size: 15px;
  transition: all 0.3s;
  position: relative;
}

.nav-item:hover {
  color: var(--el-color-primary);
  background-color: var(--el-fill-color-light);
}

.nav-item.active {
  color: var(--el-color-primary);
  font-weight: 500;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 2px;
  background-color: var(--el-color-primary);
}

.actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: 48px;
}

.stats {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-right: 16px;
  padding: 6px 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 20px;
  transition: all 0.3s;
}

.stats:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-regular);
  font-size: 13px;
  transition: color 0.3s;
}

.stat-item:hover {
  color: var(--el-color-primary);
}

.stat-item .el-icon {
  font-size: 14px;
}

.search-input {
  width: 200px;
  transition: all 0.3s;
}

.search-input:focus {
  width: 240px;
}

.theme-switch {
  padding: 8px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  border-radius: 8px;
  transition: all 0.3s;
}

.theme-switch:hover {
  color: var(--el-color-primary);
  background-color: var(--el-fill-color-light);
  transform: rotate(180deg);
}

.main {
  flex: 1;
  margin-top: 64px;
  padding: 24px 0;
  background-color: var(--el-fill-color-blank);
  min-height: calc(100vh - 64px - 80px);
}

.footer {
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
  padding: 24px 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info {
  color: var(--el-text-color-regular);
}

.footer-info p {
  margin: 0;
  line-height: 1.5;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-links a {
  color: var(--el-text-color-regular);
  text-decoration: none;
  transition: color 0.3s;
  font-size: 14px;
}

.footer-links a:hover {
  color: var(--el-color-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    height: auto;
    position: static;
  }

  .header-content {
    flex-direction: column;
    padding: 12px 0;
  }

  .logo {
    margin: 0 0 12px 0;
  }

  .nav {
    width: 100%;
    overflow-x: auto;
    padding: 4px 0;
  }

  .nav-menu {
    width: 100%;
    justify-content: space-between;
  }

  .nav-item {
    height: 40px;
    line-height: 40px;
    padding: 0 12px;
    font-size: 14px;
  }

  .nav-item.active::after {
    bottom: 0;
    left: 12px;
    right: 12px;
  }

  .actions {
    width: 100%;
    margin: 12px 0 0 0;
    justify-content: space-between;
  }

  .search-input {
    width: 100%;
  }

  .stats {
    display: none;
  }

  .main {
    margin-top: 0;
    padding: 16px 0;
  }
}
</style> 