<template>
  <div class="blog-layout">
    <!-- 顶部导航 -->
    <header class="header" :class="{ 'header-shadow': isScrolled }">
      <div class="container">
        <div class="header-content" :class="{ 'mobile-center': isMobile }">
          <!-- 移动端/iPad端只显示 stats、搜索、黑白模式 -->
          <template v-if="isMobile">
            <div class="stats mobile-stats">
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
          </template>
          <!-- 桌面端显示原有内容 -->
          <template v-else>
            <div class="logo">
              <router-link to="/blog" class="logo-text">
                <el-icon class="logo-icon"><Platform /></el-icon>
                WFH Blog
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
              <div class="stats desktop-stats">
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
              <el-dropdown>
                <span class="user-dropdown">
                  <el-avatar :src="userInfo.avatar" size="small" />
                  <span class="username">{{ userInfo.username }}</span>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <template v-if="userInfo.username !== '未登录'">
                      <el-dropdown-item @click="goProfile">个人中心</el-dropdown-item>
                      <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                    </template>
                    <template v-else>
                      <el-dropdown-item @click="goLogin">去登录</el-dropdown-item>
                    </template>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </div>
      </div>
    </header>
    <!-- 悬浮球（右上角） -->
    <el-button class="floating-menu-btn top-right" icon="Menu" circle @click="drawerVisible = true" />
    <!-- 悬浮球Drawer -->
    <el-drawer v-model="drawerVisible" direction="rtl" size="70vw" class="mobile-drawer">
      <div class="drawer-user">
        <div class="drawer-logo">
          <el-icon class="logo-icon"><Platform /></el-icon>
          <span class="logo-text">WFH Blog</span>
        </div>
        <el-avatar :src="userInfo.avatar" size="large" />
        <div class="drawer-username">{{ userInfo.username }}</div>
      </div>
      <div class="drawer-menu">
        <router-link to="/blog" class="drawer-nav-item" :class="{ active: isActive('/blog') || isActive('/blog/') }" @click="drawerVisible = false">
          <el-icon><HomeFilled /></el-icon> 首页
        </router-link>
        <router-link to="/blog/category" class="drawer-nav-item" :class="{ active: isActive('/blog/category') }" @click="drawerVisible = false">
          <el-icon><Folder /></el-icon> 分类
        </router-link>
        <router-link to="/blog/tag" class="drawer-nav-item" :class="{ active: isActive('/blog/tag') }" @click="drawerVisible = false">
          <el-icon><Collection /></el-icon> 标签
        </router-link>
        <router-link to="/blog/archive" class="drawer-nav-item" :class="{ active: isActive('/blog/archive') }" @click="drawerVisible = false">
          <el-icon><Calendar /></el-icon> 归档
        </router-link>
        <router-link to="/blog/about" class="drawer-nav-item" :class="{ active: isActive('/blog/about') }" @click="drawerVisible = false">
          <el-icon><User /></el-icon> 关于
        </router-link>
      </div>
      <div class="drawer-actions">
        <el-button v-if="userInfo.username !== '未登录'" type="primary" @click="goProfile">个人中心</el-button>
        <el-button v-if="userInfo.username !== '未登录'" @click="handleLogout">退出登录</el-button>
        <el-button v-else type="primary" @click="goLogin">去登录</el-button>
      </div>
    </el-drawer>

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
            <router-link v-if="showAdminLink" to="/dashboard">后台管理</router-link>
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
import { ElMessage, ElAvatar, ElDropdown, ElDropdownMenu, ElDropdownItem, ElDrawer, ElButton } from 'element-plus'
import { Menu } from '@element-plus/icons-vue'

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
  const baseTitle = 'WFH Blog'
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
const blogName = ref('WFH Blog')
const icp = ref('京ICP备XXXXXXXX号')
const searchKeyword = ref('')

// 监听滚动
const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

const drawerVisible = ref(false)
const isMobile = ref(window.innerWidth <= 1366)

function handleResize() {
  isMobile.value = window.innerWidth <= 1366
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  refreshUserInfo()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})

// 搜索处理
const handleSearch = () => {
  if (!searchKeyword.value.trim()) return
  // 实现搜索逻辑
  console.log('搜索关键词:', searchKeyword.value)
}

const userInfo = ref({
  username: '未登录',
  avatar: '/src/assets/avatar.png',
  role: ''
})

const showAdminLink = computed(() => {
  return userInfo.value.role === 'admin' || userInfo.value.role === 'editor'
})

function refreshUserInfo() {
  const info = localStorage.getItem('userInfo')
  if (info) {
    const parsed = JSON.parse(info)
    userInfo.value.username = parsed.username || '未登录'
    userInfo.value.avatar = parsed.avatar || '/src/assets/avatar.png'
    userInfo.value.role = parsed.role || ''
  } else {
    userInfo.value.username = '未登录'
    userInfo.value.avatar = '/src/assets/avatar.png'
    userInfo.value.role = ''
  }
}

watch(() => route.fullPath, () => {
  refreshUserInfo()
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('tokenExpire')
  localStorage.removeItem('userInfo')
  refreshUserInfo()
  router.push('/login')
  ElMessage.success('已退出登录')
}

const goLogin = () => {
  router.push('/login')
}

const goProfile = () => {
  router.push('/blog/profile')
}

const normalizePath = (path: string) => path.replace(/\/$/, '')
const isActive = (to: string) => {
  return normalizePath(route.path) === normalizePath(to)
}
</script>

<style>
html, body, #app, .blog-layout {
  max-width: 100vw;
  overflow-x: hidden;
}
/* ====== 桌面端导航栏 ====== */
.blog-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
}
.header {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 64px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  z-index: 100;
  transition: box-shadow 0.3s, background 0.3s;
}
.header-shadow {
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  background: rgba(var(--el-bg-color-rgb), 0.8);
}
.container {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  padding: 0 32px;
  box-sizing: border-box;
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}
.logo {
  flex: 0 0 auto;
  margin-right: 32px;
  display: flex;
  align-items: center;
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
  flex: 1 1 0%;
  display: flex;
  justify-content: center;
  min-width: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.nav-menu {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
  white-space: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
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
  cursor: pointer;
  background: none;
  border: none;
  white-space: nowrap;
}
.nav-item:hover {
  color: var(--el-color-primary);
  background: var(--el-fill-color-light);
}
.nav-item.active {
  color: var(--el-color-primary);
  font-weight: 500;
}
/* 桌面端激活下划线和stats */
@media (min-width: 1200px) {
  .nav-item.active::after {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 0;
    width: 60px;
    max-width: 80%;
    height: 2px;
    background: var(--el-color-primary);
    border-radius: 1px;
    display: block;
  }
  .stats {
    display: flex !important;
  }
}
/* 平板端（iPad）优化 */
@media (min-width: 768px) and (max-width: 1199px) {
  .container {
    max-width: 100vw;
    width: 100vw;
    padding: 0 24px;
  }
  .header-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 56px;
  }
  .logo {
    margin-right: 16px;
  }
  .nav {
    flex: 1 1 0%;
    justify-content: center;
    min-width: 0;
  }
  .actions {
    gap: 10px;
  }
  .search-input {
    width: 120px;
    min-width: 80px;
    font-size: 14px;
  }
  .nav-item {
    height: 48px;
    line-height: 48px;
    font-size: 14px;
    padding: 0 8px;
  }
  .nav-item.active::after {
    display: none !important;
  }
  .stats {
    display: none !important;
  }
}
/* 手机端优化 */
@media (max-width: 1366px) {
  .container {
    max-width: 100vw;
    width: 100vw;
    margin: 0;
    padding: 0 4px;
  }
  .header-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    padding: 0;
  }
  .logo {
    margin-right: 6px;
  }
  .nav,
  .user-dropdown {
    display: none !important;
  }
  .floating-menu-btn {
    display: flex !important;
    z-index: 3000;
  }
  .theme-switch {
    display: none !important;
  }
  .actions {
    gap: 6px;
  }
  .search-input {
    width: 90px;
    min-width: 60px;
    font-size: 12px;
  }
  .nav-menu {
    min-width: 180px;
  }
  .nav-item {
    min-width: 40px;
    font-size: 12px;
    padding: 0 2px;
    height: 40px;
    line-height: 40px;
  }
  .nav-item.active::after {
    display: none !important;
  }
  .stats {
    display: none !important;
  }
}
.actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: 0;
}
.stats {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-right: 16px;
  padding: 6px 16px;
  background: var(--el-fill-color-light);
  border-radius: 20px;
  transition: box-shadow 0.3s, transform 0.3s;
}
.stats:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
  transition: width 0.3s;
}
.search-input:focus {
  width: 240px;
}
.theme-switch {
  padding: 8px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  border-radius: 8px;
  transition: color 0.3s, background 0.3s, transform 0.3s;
}
.theme-switch:hover {
  color: var(--el-color-primary);
  background: var(--el-fill-color-light);
  transform: rotate(180deg);
}
.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 8px;
  height: 40px;
  padding: 0 12px;
  border-radius: 20px;
  transition: background 0.2s;
}
.user-dropdown:hover {
  background: var(--el-fill-color-light);
}
.user-dropdown .el-avatar {
  margin-right: 8px;
  vertical-align: middle;
  border: 1.5px solid var(--el-border-color-light);
}
.username {
  font-size: 15px;
  color: var(--el-text-color-primary);
  font-weight: 500;
  line-height: 40px;
  display: flex;
  align-items: center;
  height: 40px;
  transition: color 0.2s;
}
.user-dropdown:hover .username {
  color: var(--el-color-primary);
}

/* ====== 主体内容区 ====== */
.main {
  flex: 1;
  margin-top: 64px;
  padding: 24px 0;
  background: var(--el-fill-color-blank);
  min-height: calc(100vh - 64px - 80px);
}

/* ====== 页脚 ====== */
.footer {
  background: var(--el-bg-color);
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

/* ====== 动画 ====== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ====== 响应式设计 ====== */
@media (max-width: 1199px) {
  .header-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    position: static;
    height: auto;
    padding: 8px 0;
  }
  .logo {
    margin: 0 8px 0 0;
  }
  .nav {
    flex: 1 1 0%;
    justify-content: center;
    min-width: 0;
  }
  .actions {
    margin: 0 0 0 8px;
    gap: 8px;
  }
  .stats {
    display: none !important;
  }
}

@media (max-width: 1366px) {
  .header-content.mobile-center {
    justify-content: center;
    gap: 16px;
  }
  .logo,
  .nav,
  .user-dropdown {
    display: none !important;
  }
  .mobile-stats {
    display: flex !important;
    gap: 16px;
    background: var(--el-fill-color-light);
    border-radius: 20px;
    padding: 6px 16px;
    margin-right: 8px;
    align-items: center;
  }
  .floating-menu-btn.top-right {
    display: flex !important;
    position: fixed;
    top: 24px;
    right: 20px;
    z-index: 3000;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    background: var(--el-bg-color);
    color: var(--el-text-color-primary);
    border: none;
    width: 48px;
    height: 48px;
    align-items: center;
    justify-content: center;
  }
  .container {
    max-width: 100vw;
    width: 100vw;
    margin: 0;
    padding-left: 0;
    padding-right: 0;
    box-sizing: border-box;
  }
  .desktop-stats {
    display: none !important;
  }
}
@media (min-width: 1367px) {
  .mobile-stats {
    display: none !important;
  }
}
.floating-menu-btn {
  display: none;
}
.mobile-drawer .el-drawer__body {
  padding: 24px 12px 12px 12px;
}
.drawer-user {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}
.drawer-username {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 500;
}
.drawer-menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.drawer-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: var(--el-text-color-primary);
  text-decoration: none;
  padding: 8px 0;
  border-radius: 6px;
  transition: background 0.2s;
}
.drawer-nav-item.router-link-active,
.drawer-nav-item:hover {
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
}
.drawer-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
}
</style> 