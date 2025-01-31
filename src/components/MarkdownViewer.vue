<template>
  <div class="markdown-viewer">
    <MdPreview :modelValue="content" :theme="isDark ? 'dark' : 'light'" />
  </div>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { useDark } from '@vueuse/core'

const isDark = useDark()
const props = defineProps<{
  content: string
}>()
</script>

<style>
.markdown-viewer {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}

/* 调整预览区域的样式 */
.markdown-viewer :deep(.md-preview) {
  padding: 0 !important;
  background: transparent !important;
}

/* 调整代码块样式 */
.markdown-viewer :deep(.code-block) {
  margin: 16px 0;
}

/* 调整标题样式 */
.markdown-viewer :deep(h1),
.markdown-viewer :deep(h2) {
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-viewer.dark :deep(h1),
.markdown-viewer.dark :deep(h2) {
  border-bottom-color: #30363d;
}
</style> 