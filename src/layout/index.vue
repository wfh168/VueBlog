<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="aside-container">
      <div class="logo-container">
        <img src="../assets/logo.svg" alt="Logo" class="logo-image">
        <h1 class="logo-text" v-show="!isCollapse">博客管理</h1>
      </div>
      <el-scrollbar>
        <el-menu
          :default-active="route.path"
          class="el-menu-vertical"
          :collapse="isCollapse"
          :router="true"
        >
          <el-menu-item index="/dashboard">
            <el-icon><Odometer /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>
          <el-menu-item index="/article">
            <el-icon><Document /></el-icon>
            <template #title>文章管理</template>
          </el-menu-item>
          <el-menu-item index="/category">
            <el-icon><Collection /></el-icon>
            <template #title>分类管理</template>
          </el-menu-item>
          <el-menu-item index="/tag">
            <el-icon><Price-tag /></el-icon>
            <template #title>标签管理</template>
          </el-menu-item>
          <el-menu-item index="/comment">
            <el-icon><ChatDotRound /></el-icon>
            <template #title>评论管理</template>
          </el-menu-item>
          <el-menu-item index="/gallery">
            <el-icon><Picture /></el-icon>
            <template #title>图库管理</template>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <template #title>系统设置</template>
          </el-menu-item>
          <el-sub-menu index="/user">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/user/info">
              <el-icon><UserFilled /></el-icon>
              <template #title>用户信息</template>
            </el-menu-item>
            <el-menu-item index="/user/permission">
              <el-icon><Lock /></el-icon>
              <template #title>权限管理</template>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>
    <el-container class="main-container">
      <el-header class="header-container">
        <div class="header-left">
          <el-button
            class="collapse-btn"
            link
            @click="toggleCollapse"
          >
            <el-icon :size="20"><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ getMenuTitle(route.path) }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-button
            class="theme-toggle-btn"
            link
            @click="toggleTheme"
          >
            <el-icon :size="20">
              <Moon v-if="mode === 'light'" />
              <Sunny v-else />
            </el-icon>
          </el-button>
          <el-button
            class="theme-toggle-btn"
            link
            @click="handleRefresh"
            :loading="refreshing"
          >
            <el-icon :size="20">
              <Refresh />
            </el-icon>
          </el-button>
          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">管理员</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><User /></el-icon>个人信息
                </el-dropdown-item>
                <el-dropdown-item divided>
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <div class="tabs-view-container">
        <div class="tabs-wrapper">
          <div class="tabs-scroll-left" @click="scrollLeft">
            <el-icon><ArrowLeft /></el-icon>
          </div>
          <el-scrollbar ref="scrollbarRef" class="tabs-scrollbar">
            <el-tabs
              v-model="activeTab"
              type="card"
              @tab-click="handleTabClick"
              @tab-remove="handleTabRemove"
            >
              <el-tab-pane
                v-for="(tab, index) in tabs"
                :key="tab.path"
                :label="tab.title"
                :name="tab.path"
                :closable="!tab.fixed && tab.closable"
              >
                <template #label>
                  <div 
                    class="custom-tab-label"
                    :class="{ 'is-fixed': tab.fixed }"
                    @click.stop="handleTabClick(tab)"
                    @contextmenu.prevent.stop="handleContextMenu($event, tab)"
                    draggable="true"
                    @dragstart="handleDragStart($event, index)"
                    @dragover.prevent
                    @dragenter.prevent
                    @drop="handleDrop($event, index)"
                  >
                    <el-icon class="tab-icon"><component :is="getTabIcon(tab.path)" /></el-icon>
                    <span>{{ tab.title }}</span>
                    <el-icon v-if="tab.fixed" class="fixed-icon"><Top /></el-icon>
                  </div>
                </template>
              </el-tab-pane>
            </el-tabs>
          </el-scrollbar>
          <div class="tabs-scroll-right" @click="scrollRight">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <!-- 右键菜单 -->
        <ul
          v-show="contextMenuVisible"
          :style="contextMenuStyle"
          class="contextmenu"
          @click.stop
          @contextmenu.prevent
        >
          <li @click="toggleFixTab(selectedTab)">
            <el-icon><component :is="selectedTab?.fixed ? 'Bottom' : 'Top'" /></el-icon>
            {{ selectedTab?.fixed ? '取消固定' : '固定标签' }}
          </li>
          <li @click="refreshSelectedTab(selectedTab)">
            <el-icon><Refresh /></el-icon>刷新页面
          </li>
          <li 
            @click="closeSelectedTab(selectedTab)"
            :class="{ 'is-disabled': !selectedTab?.closable || selectedTab?.fixed }"
          >
            <el-icon><Close /></el-icon>关闭当前
          </li>
          <li @click="closeOtherTabs(selectedTab)">
            <el-icon><FolderDelete /></el-icon>关闭其他
          </li>
          <li @click="closeAllTabs">
            <el-icon><Delete /></el-icon>关闭全部
          </li>
        </ul>
      </div>
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useColorMode } from '@vueuse/core'
import {
  User,
  SwitchButton,
  Odometer,
  Document,
  Collection,
  PriceTag,
  ChatDotRound,
  Fold,
  Expand,
  ArrowDown,
  UserFilled,
  Lock,
  Close,
  Moon,
  Sunny,
  Picture,
  Refresh,
  FolderDelete,
  Delete,
  Top,
  Bottom,
  ArrowLeft,
  ArrowRight,
  Setting
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface TabItem {
  title: string
  path: string
  name: string
  closable: boolean
  fixed?: boolean
}

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const tabs = ref<TabItem[]>([
  {
    title: '仪表盘',
    path: '/dashboard',
    name: 'Dashboard',
    closable: false
  }
])
const activeTab = ref('/dashboard')

const mode = useColorMode()
const toggleTheme = () => {
  mode.value = mode.value === 'dark' ? 'light' : 'dark'
}

const refreshing = ref(false)

// 全局刷新
const handleRefresh = async () => {
  refreshing.value = true
  try {
    // 重新加载当前路由组件
    await router.replace({
      path: route.path,
      query: route.query,
      params: route.params,
      force: true
    })
    ElMessage.success('刷新成功')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    refreshing.value = false
  }
}

// 根据路径获取菜单标题
const getMenuTitle = (path: string): string => {
  const menuMap: Record<string, string> = {
    '/dashboard': '仪表盘',
    '/article': '文章管理',
    '/article/create': '新建文章',
    '/article/edit': '编辑文章',
    '/category': '分类管理',
    '/tag': '标签管理',
    '/comment': '评论管理',
    '/gallery': '图库管理',
    '/user/info': '用户信息',
    '/user/permission': '权限管理',
    '/settings': '系统设置'
  }
  return menuMap[path] || path
}

// 监听路由变化，动态添加标签页
watch(
  () => route.path,
  (newPath) => {
    const title = getMenuTitle(newPath)
    if (title && !tabs.value.some(tab => tab.path === newPath)) {
      tabs.value.push({
        title,
        path: newPath,
        name: route.name as string,
        closable: newPath !== '/dashboard'
      })
    }
    activeTab.value = newPath
  },
  { immediate: true }
)

// 切换标签页
const handleTabClick = (tab: TabItem) => {
  if (tab.path) {
    router.push(tab.path)
  }
}

// 关闭标签页
const handleTabRemove = (path: string) => {
  const index = tabs.value.findIndex(tab => tab.path === path)
  if (index === -1) return
  
  tabs.value.splice(index, 1)
  if (path === activeTab.value) {
    // 如果关闭的是当前标签，则切换到前一个标签
    const nextTab = tabs.value[index - 1] || tabs.value[index]
    if (nextTab) {
      router.push(nextTab.path)
    }
  }
}

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 访问过的路由标签
const visitedViews = ref([
  { path: '/article', title: '文章管理' },
  { path: '/comment', title: '评论管理' },
  { path: '/category', title: '分类管理' },
  { path: '/tag', title: '标签管理' },
  { path: '/gallery', title: '图库管理' }
])

// 右键菜单相关
const contextMenuVisible = ref(false)
const contextMenuStyle = ref({
  position: 'fixed',
  top: '0px',
  left: '0px'
})
const selectedTab = ref(null)

// 获取标签图标
const getTabIcon = (path: string) => {
  const iconMap = {
    '/dashboard': 'Odometer',
    '/article': 'Document',
    '/comment': 'ChatDotRound',
    '/category': 'Collection',
    '/tag': 'Collection',
    '/gallery': 'Picture'
  }
  return iconMap[path] || 'Document'
}

// 处理右键菜单
const handleContextMenu = (event: MouseEvent, tab: TabItem) => {
  event.preventDefault()
  event.stopPropagation()
  selectedTab.value = tab
  contextMenuVisible.value = true
  nextTick(() => {
    contextMenuStyle.value = {
      position: 'fixed',
      top: `${event.clientY}px`,
      left: `${event.clientX}px`,
      zIndex: '2000'
    }
  })
  
  // 点击其他地方关闭菜单
  const closeMenu = () => {
    contextMenuVisible.value = false
    document.removeEventListener('click', closeMenu)
  }
  document.addEventListener('click', closeMenu)
}

const handleContextMenuVisibleChange = (visible: boolean) => {
  if (!visible) {
    contextMenuVisible.value = false
  }
}

// 刷新选中标签页
const refreshSelectedTab = (tab: TabItem) => {
  if (!tab) return
  const { fullPath, matched } = router.resolve(tab.path)
  router.replace({
    path: '/redirect' + fullPath
  })
  contextMenuVisible.value = false
}

// 关闭选中标签页
const closeSelectedTab = (tab: TabItem) => {
  if (!tab || !tab.closable) return
  handleTabRemove(tab.path)
  contextMenuVisible.value = false
}

// 关闭其他标签页
const closeOtherTabs = (tab: TabItem) => {
  if (!tab) return
  // 保留固定标签和当前标签
  tabs.value = tabs.value.filter(t => t.path === tab.path || !t.closable || t.fixed)
  if (activeTab.value !== tab.path) {
    router.push(tab.path)
  }
  contextMenuVisible.value = false
}

// 关闭所有标签页
const closeAllTabs = () => {
  // 保留固定标签和不可关闭的标签
  tabs.value = tabs.value.filter(tab => !tab.closable || tab.fixed)
  const firstTab = tabs.value[0]
  if (firstTab) {
    router.push(firstTab.path)
  }
  contextMenuVisible.value = false
}

// 添加拖拽相关方法
const handleDragStart = (event: DragEvent, index: number) => {
  event.dataTransfer?.setData('text/plain', index.toString())
}

const handleDrop = (event: DragEvent, dropIndex: number) => {
  const dragIndex = Number(event.dataTransfer?.getData('text/plain'))
  if (isNaN(dragIndex)) return
  
  // 获取要移动的标签
  const dragTab = tabs.value[dragIndex]
  // 从数组中删除拖动的标签
  tabs.value.splice(dragIndex, 1)
  // 在新位置插入标签
  tabs.value.splice(dropIndex, 0, dragTab)
}

// 添加固定/取消固定方法
const toggleFixTab = (tab: TabItem) => {
  if (!tab) return
  tab.fixed = !tab.fixed
  
  // 重新排序标签，固定标签放在最前面
  const fixedTabs = tabs.value.filter(t => t.fixed)
  const unfixedTabs = tabs.value.filter(t => !t.fixed)
  tabs.value = [...fixedTabs, ...unfixedTabs]
  
  contextMenuVisible.value = false
}

const scrollbarRef = ref()

// 左右滚动方法
const scrollLeft = () => {
  const scrollbar = scrollbarRef.value?.wrapRef
  if (scrollbar) {
    scrollbar.scrollLeft -= 200
  }
}

const scrollRight = () => {
  const scrollbar = scrollbarRef.value?.wrapRef
  if (scrollbar) {
    scrollbar.scrollLeft += 200
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside-container {
  background-color: var(--el-menu-bg-color);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0,0,0,0.15);
  border-right: 1px solid var(--border-color);
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  overflow: hidden;
  background-color: var(--el-menu-bg-color);
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s;
}

.logo-image {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.logo-text {
  color: var(--el-menu-text-color);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  transition: color 0.3s;
}

.header-container {
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  padding: 8px;
  color: var(--text-color);
}

.collapse-btn:hover {
  color: var(--el-color-primary);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: var(--hover-bg);
}

.username {
  margin: 0 8px;
  color: var(--text-color);
}

.main-container {
  background-color: var(--bg-color);
}

.main-content {
  padding: 20px;
  overflow-y: auto;
}

.tabs-view-container {
  background-color: var(--bg-color);
  padding: 6px 16px 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-tabs__nav) {
  border: none !important;
}

:deep(.el-tabs__item) {
  height: 32px;
  line-height: 32px;
  color: var(--text-color);
  border: none !important;
}

:deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
  background-color: var(--hover-bg);
  border-radius: 4px 4px 0 0;
}

:deep(.el-tabs__item:hover) {
  color: var(--el-color-primary);
}

:deep(.el-menu) {
  border-right: none;
  background-color: var(--el-menu-bg-color);
  transition: background-color 0.3s;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  color: var(--el-menu-text-color) !important;
  transition: all 0.3s !important;
  
  &:hover {
    background-color: var(--el-menu-hover-bg-color) !important;
  }
  
  &.is-active {
    background-color: var(--el-menu-active-bg-color) !important;
    color: var(--el-menu-active-color) !important;
    border-right: 2px solid var(--el-menu-active-color);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background-color: var(--el-menu-active-color);
      transition: background-color 0.3s;
    }
  }
}

:deep(.el-sub-menu__title) {
  color: var(--el-menu-text-color) !important;
  transition: all 0.3s !important;
  
  &:hover {
    background-color: var(--el-menu-hover-bg-color) !important;
  }
}

:deep(.el-sub-menu.is-active) {
  > .el-sub-menu__title {
    color: var(--el-menu-active-color) !important;
  }
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 220px;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.theme-toggle-btn {
  padding: 8px;
  margin-right: 12px;
  color: var(--text-color);
}

.theme-toggle-btn:hover {
  color: var(--el-color-primary);
  background-color: var(--hover-bg);
}

:deep(.el-menu--collapse) {
  width: 64px;
  
  .el-menu-item {
    padding: 0 !important;
    text-align: center;
    
    .el-icon {
      margin: 0;
    }
  }
}

.tags-view {
  height: 34px;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tags-view-wrapper {
  padding: 0 16px;
  height: 100%;
  display: flex;
  align-items: center;
}

.tags-view-item {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 8px;
  font-size: 12px;
  margin-right: 4px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-color);
  
  &:hover {
    background-color: var(--hover-bg);
    
    .close-icon {
      display: inline-flex;
    }
  }
  
  &.active {
    background-color: var(--el-color-primary);
    border-color: var(--el-color-primary);
    color: white;
    
    .close-icon {
      color: white;
    }
  }
}

.tag-icon {
  margin-right: 4px;
  font-size: 14px;
}

.close-icon {
  display: none;
  margin-left: 4px;
  font-size: 12px;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
}

.context-menu {
  position: fixed;
  z-index: 3000;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 13px;
  
  .el-icon {
    margin-right: 4px;
  }
}

.custom-tab-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 100%;
  cursor: move;
  
  &.is-fixed {
    .fixed-icon {
      color: var(--el-color-primary);
      font-size: 12px;
      margin-left: 4px;
    }
  }
}

.tab-icon {
  font-size: 14px;
}

:deep(.el-tabs__item) {
  padding: 0 16px;
  height: 32px;
  line-height: 32px;
  transition: all 0.3s;
  
  &:hover {
    color: var(--el-color-primary);
    background-color: var(--hover-bg);
  }
  
  &.is-active {
    background-color: var(--el-color-primary-light-9);
  }
}

.context-menu {
  position: fixed;
  z-index: 3000;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 13px;
  
  .el-icon {
    margin-right: 4px;
  }
  
  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.context-menu-trigger {
  position: fixed;
  width: 1px;
  height: 1px;
}

:deep(.tab-context-menu) {
  padding: 4px 0;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  
  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    font-size: 13px;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      background-color: var(--hover-bg);
      color: var(--el-color-primary);
    }
    
    &.is-disabled {
      cursor: not-allowed;
      opacity: 0.5;
      
      &:hover {
        background-color: transparent;
        color: var(--text-color);
      }
    }
    
    .el-icon {
      margin-right: 4px;
      font-size: 16px;
    }
  }
}

:deep(.el-tabs__item) {
  &:hover {
    .fixed-icon {
      display: inline-flex;
    }
  }
}

.fixed-icon {
  font-size: 12px;
  margin-left: 4px;
  color: var(--el-color-primary);
}

:deep(.tab-context-menu) {
  .el-dropdown-menu__item {
    &:hover {
      .el-icon {
        color: var(--el-color-primary);
      }
    }
  }
}

.tabs-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.tabs-scrollbar {
  flex: 1;
  overflow: hidden;
}

.tabs-scroll-left,
.tabs-scroll-right {
  position: absolute;
  width: 32px;
  height: 32px;
  background-color: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
  
  &:hover {
    background-color: var(--hover-bg);
    color: var(--el-color-primary);
  }
}

.tabs-scroll-left {
  left: 0;
  border-right: 1px solid var(--border-color);
}

.tabs-scroll-right {
  right: 0;
  border-left: 1px solid var(--border-color);
}

.contextmenu {
  position: fixed;
  z-index: 3000;
  list-style: none;
  padding: 4px 0;
  margin: 0;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  
  li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    font-size: 13px;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      background-color: var(--hover-bg);
      color: var(--el-color-primary);
      
      .el-icon {
        color: var(--el-color-primary);
      }
    }
    
    &.is-disabled {
      cursor: not-allowed;
      opacity: 0.5;
      
      &:hover {
        background-color: transparent;
        color: var(--text-color);
      }
    }
    
    .el-icon {
      font-size: 16px;
    }
  }
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 32px;
}
</style> 