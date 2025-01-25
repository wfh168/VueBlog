<template>
  <el-config-provider
    :locale="locale"
    :size="size"
    :z-index="3000"
  >
    <router-view />
    <BackToTop />
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import BackToTop from '@/components/BackToTop.vue'

const locale = ref(zhCn)
const size = ref('default')
</script>

<style>
@import 'bootstrap/dist/css/bootstrap.min.css';
@import 'element-plus/theme-chalk/dark/css-vars.css';

:root {
  /* 主色调 */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;

  /* 中性色 */
  --neutral-50: #f9fafb;
  --neutral-100: #f3f4f6;
  --neutral-200: #e5e7eb;
  --neutral-300: #d1d5db;
  --neutral-400: #9ca3af;
  --neutral-500: #6b7280;
  --neutral-600: #4b5563;
  --neutral-700: #374151;
  --neutral-800: #1f2937;
  --neutral-900: #111827;

  /* 基础变量 */
  --bg-color: var(--neutral-50);
  --bg-color-soft: #ffffff;
  --text-color: var(--neutral-900);
  --text-color-light: var(--neutral-600);
  --border-color: var(--neutral-200);
  --hover-bg: var(--neutral-100);
  --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --header-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.05);

  /* Element Plus 变量 */
  --el-color-primary: var(--primary-600);
  --el-menu-bg-color: var(--bg-color-soft);
  --el-menu-text-color: var(--text-color);
  --el-menu-active-color: var(--primary-600);
  --el-menu-hover-bg-color: var(--hover-bg);
  --el-menu-active-bg-color: var(--hover-bg);
}

html.dark {
  --bg-color: var(--neutral-900);
  --bg-color-soft: var(--neutral-800);
  --text-color: var(--neutral-100);
  --text-color-light: var(--neutral-400);
  --border-color: var(--neutral-700);
  --hover-bg: var(--neutral-700);
  --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --header-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px -1px rgba(0, 0, 0, 0.1);

  /* Element Plus 暗黑模式 */
  --el-bg-color: var(--bg-color);
  --el-bg-color-overlay: var(--bg-color-soft);
  --el-text-color-primary: var(--text-color);
  --el-border-color: var(--border-color);
  --el-border-color-light: var(--neutral-700);
  --el-fill-color-blank: var(--neutral-900);
  --el-menu-bg-color: var(--bg-color-soft);
  --el-menu-text-color: var(--text-color);
  --el-menu-active-color: var(--primary-400);
  --el-menu-hover-bg-color: var(--hover-bg);
  --el-menu-active-bg-color: var(--hover-bg);
}

html {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--bg-color);
  transition: background-color 0.3s, color 0.3s;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: var(--bg-color);
}

#app {
  height: 100vh;
}

/* Element Plus 样式覆盖 */
.el-button {
  border-radius: 6px;
  font-weight: 500;
}

.el-button--primary {
  --el-button-bg-color: var(--primary-600);
  --el-button-border-color: var(--primary-600);
  --el-button-hover-bg-color: var(--primary-700);
  --el-button-hover-border-color: var(--primary-700);
  --el-button-active-bg-color: var(--primary-800);
  --el-button-active-border-color: var(--primary-800);
}

.el-card {
  --el-card-border-color: var(--border-color);
  --el-card-border-radius: 12px;
  box-shadow: var(--card-shadow) !important;
  transition: all 0.3s;
  background-color: var(--bg-color-soft);
}

.el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px -4px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1) !important;
}

.el-input__wrapper {
  background-color: var(--bg-color-soft);
  border-radius: 8px;
}

.el-table {
  --el-table-border-color: var(--border-color);
  --el-table-header-bg-color: var(--hover-bg);
  --el-table-row-hover-bg-color: var(--hover-bg);
  background-color: var(--bg-color-soft);
  border-radius: 12px;
  overflow: hidden;
}

.el-menu {
  border-right: none !important;
  transition: background-color 0.3s, border-color 0.3s !important;
}

.el-menu-item,
.el-sub-menu__title {
  transition: color 0.3s, background-color 0.3s !important;
  border-radius: 8px;
  margin: 4px 8px;
}

.el-menu-item.is-active {
  background-color: var(--el-menu-active-bg-color) !important;
  color: var(--el-menu-active-color) !important;
  font-weight: 500;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--el-fill-color-blank);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb {
  background: var(--el-color-primary-light-5);
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--el-color-primary);
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--el-color-primary-light-5) var(--el-fill-color-blank);
}

/* Bootstrap 样式优化 */
.container-fluid {
  padding: 1.5rem;
  max-width: 1440px;
  margin: 0 auto;
}

.card {
  background-color: var(--bg-color-soft);
  border-color: var(--border-color);
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  transition: all 0.3s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px -4px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
}

.table {
  color: var(--text-color);
}

.form-control {
  background-color: var(--bg-color-soft);
  border-color: var(--border-color);
  color: var(--text-color);
  border-radius: 8px;
}

/* 通用样式 */
.page-container {
  padding: 24px;
  background-color: var(--bg-color);
  min-height: calc(100vh - 64px);
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 24px;
}

.text-muted {
  color: var(--text-color-light) !important;
}

.border-light {
  border-color: var(--border-color) !important;
}
</style>
