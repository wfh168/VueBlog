<template>
  <div class="gallery-container">
    <div class="loading-overlay" :class="{ active: loading }">
      <div class="loading-spinner">
        <el-loading-spinner />
        <span class="loading-text">加载中...</span>
      </div>
    </div>
    <div class="toolbar">
      <div class="toolbar-left">
        <el-upload
          class="upload-btn"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleUploadSuccess"
          :before-upload="beforeUpload"
          multiple
          accept="image/*"
        >
          <el-button type="primary">
            <el-icon><Upload /></el-icon>
            上传图片
          </el-button>
        </el-upload>
      </div>
      <div class="toolbar-right">
        <el-input
          v-model="searchQuery"
          placeholder="搜索图片..."
          class="search-input"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="filterType"
          placeholder="图片类型"
          class="filter-select"
          clearable
          @change="handleFilterChange"
        >
          <el-option label="全部" value="">
            <el-icon><Picture /></el-icon>
            <span>全部</span>
          </el-option>
          <el-option label="PNG" value="png">
            <el-icon><Picture /></el-icon>
            <span>PNG</span>
          </el-option>
          <el-option label="JPG" value="jpg">
            <el-icon><Picture /></el-icon>
            <span>JPG</span>
          </el-option>
          <el-option label="GIF" value="gif">
            <el-icon><VideoPlay /></el-icon>
            <span>GIF</span>
          </el-option>
          <el-option label="SVG" value="svg">
            <el-icon><Brush /></el-icon>
            <span>SVG</span>
          </el-option>
        </el-select>
      </div>
    </div>

    <el-scrollbar class="gallery-content">
      <div class="image-grid">
        <div v-for="image in images" :key="image.id" class="image-item">
          <div class="image-card" @contextmenu.prevent="handleContextMenu($event, image)">
            <div class="image-wrapper">
              <img :src="image.url" :alt="image.name">
              <div class="image-overlay">
                <div class="image-actions">
                  <el-button-group>
                    <el-button
                      type="primary"
                      link
                      @click="handlePreview(image)"
                    >
                      <el-icon><ZoomIn /></el-icon>
                    </el-button>
                    <el-button
                      type="primary"
                      link
                      @click="handleCopy(image)"
                    >
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                    <el-button
                      type="danger"
                      link
                      @click="handleDelete(image)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </el-button-group>
                </div>
              </div>
            </div>
            <div class="image-info">
              <div class="image-name" :title="image.name">{{ image.name }}</div>
              <div class="image-meta">
                <span>{{ formatSize(image.size) }}</span>
                <span>{{ image.type.toUpperCase() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      :title="previewImage?.name"
      width="800px"
      class="preview-dialog"
    >
      <div class="preview-content">
        <img :src="previewImage?.url" :alt="previewImage?.name">
      </div>
      <div class="preview-info">
        <div class="info-item">
          <span class="label">文件名：</span>
          <span>{{ previewImage?.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">大小：</span>
          <span>{{ formatSize(previewImage?.size) }}</span>
        </div>
        <div class="info-item">
          <span class="label">类型：</span>
          <span>{{ previewImage?.type.toUpperCase() }}</span>
        </div>
        <div class="info-item">
          <span class="label">上传时间：</span>
          <span>{{ formatDate(previewImage?.createTime) }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- 添加右键菜单 -->
    <el-dropdown
      v-if="contextMenuVisible"
      :visible="contextMenuVisible"
      trigger="contextmenu"
      :teleported="false"
      @visible-change="handleContextMenuVisibleChange"
      class="context-menu"
      :style="contextMenuStyle"
    >
      <span></span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="handlePreview(selectedImage)">
            <el-icon><ZoomIn /></el-icon>预览
          </el-dropdown-item>
          <el-dropdown-item @click="handleCopy(selectedImage)">
            <el-icon><CopyDocument /></el-icon>复制链接
          </el-dropdown-item>
          <el-dropdown-item @click="handleDownload(selectedImage)">
            <el-icon><Download /></el-icon>下载
          </el-dropdown-item>
          <el-dropdown-item divided @click="handleDelete(selectedImage)" class="danger">
            <el-icon><Delete /></el-icon>删除
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import {
  Upload,
  Search,
  ZoomIn,
  CopyDocument,
  Delete,
  Picture,
  VideoPlay,
  Brush,
  Download
} from '@element-plus/icons-vue'
import type { UploadRequestOptions } from 'element-plus'

interface ImageItem {
  id: number
  name: string
  url: string
  type: string
  size: number
  createTime: string
}

const loading = ref(false)
const searchQuery = ref('')
const filterType = ref('')
const currentPage = ref(1)
const pageSize = ref(24)
const total = ref(0)

// 预览相关
const previewVisible = ref(false)
const previewImage = ref<ImageItem | null>(null)

// 图片列表
const images = ref<ImageItem[]>([])

// 添加右键菜单相关的状态
const contextMenuVisible = ref(false)
const contextMenuStyle = ref({
  position: 'fixed',
  top: '0px',
  left: '0px'
})
const selectedImage = ref<ImageItem | null>(null)

// 自定义上传方法
const customUpload = async (options: UploadRequestOptions) => {
  const { file } = options
  if (!file) return

  try {
    // 创建 FormData
    const formData = new FormData()
    formData.append('file', file)

    // 将文件复制到 public/img 目录
    const fileName = file.name
    const fileSize = file.size
    const fileType = fileName.split('.').pop() || ''
    
    // 在实际项目中，这里应该调用后端 API 来处理文件上传
    // 现在我们直接添加到列表中
    const newImage: ImageItem = {
      id: Date.now(),
      name: fileName,
      url: `/img/${fileName}`,
      type: fileType,
      size: fileSize,
      createTime: new Date().toISOString()
    }

    // 添加到图片列表
    images.value.unshift(newImage)
    total.value++

    ElMessage.success('上传成功')
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

const handleUploadSuccess = (response: any, file: File) => {
  // 创建新的图片对象
  const newImage: ImageItem = {
    id: Date.now(),
    name: file.name,
    url: URL.createObjectURL(file),
    type: file.name.split('.').pop() || '',
    size: file.size,
    createTime: new Date().toISOString()
  }

  // 添加到图片列表
  images.value.unshift(newImage)
  total.value++
  ElMessage.success('上传成功')
}

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

// 加载图片列表
const loadImages = async () => {
  loading.value = true
  
  try {
    // 使用模拟数据
    const mockImages: ImageItem[] = [
      {
        id: 1,
        name: 'vue-logo.png',
        url: '/src/assets/logo.svg',
        type: 'svg',
        size: 1024,
        createTime: '2024-03-20T10:00:00.000Z'
      },
      {
        id: 2,
        name: 'element-plus.png',
        url: 'https://element-plus.org/images/element-plus-logo.svg',
        type: 'svg',
        size: 2048,
        createTime: '2024-03-20T11:00:00.000Z'
      }
    ]

    await new Promise(resolve => setTimeout(resolve, 300)) // 添加加载延迟效果

    let filteredImages = [...mockImages]

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filteredImages = filteredImages.filter(img => 
        img.name.toLowerCase().includes(query)
      )
    }
    
    if (filterType.value) {
      filteredImages = filteredImages.filter(img => 
        img.type.toLowerCase() === filterType.value.toLowerCase()
      )
    }

    total.value = filteredImages.length
    
    setTimeout(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      images.value = filteredImages.slice(start, end)
      loading.value = false
    }, 100)
  } catch (error) {
    ElMessage.error('加载图片失败')
    loading.value = false
  }
}

// 监听搜索和筛选条件变化
watch([searchQuery, filterType], () => {
  currentPage.value = 1
  loadImages()
})

// 处理分页变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  loadImages()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadImages()
}

// 处理删除
const handleDelete = (image: ImageItem) => {
  ElMessageBox.confirm(
    '确定要删除这张图片吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = images.value.findIndex(item => item.id === image.id)
    if (index > -1) {
      images.value.splice(index, 1)
      total.value--
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

const handlePreview = (image: ImageItem) => {
  previewImage.value = image
  previewVisible.value = true
}

const handleCopy = async (image: ImageItem) => {
  try {
    await navigator.clipboard.writeText(image.url)
    ElMessage.success('链接已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
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

const formatSize = (size: number | undefined) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let value = size

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index++
  }

  return `${value.toFixed(2)} ${units[index]}`
}

const formatDate = (date: string | undefined) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

// 处理右键菜单
const handleContextMenu = (event: MouseEvent, image: ImageItem) => {
  event.preventDefault()
  selectedImage.value = image
  contextMenuVisible.value = true
  contextMenuStyle.value = {
    position: 'fixed',
    top: event.clientY + 'px',
    left: event.clientX + 'px'
  }
}

const handleContextMenuVisibleChange = (visible: boolean) => {
  if (!visible) {
    contextMenuVisible.value = false
  }
}

// 添加下载功能
const handleDownload = async (image: ImageItem) => {
  try {
    const response = await fetch(image.url)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = image.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('下载成功')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// 初始化加载
onMounted(() => {
  loadImages()
})
</script>

<style scoped>
.gallery-container {
  background-color: var(--bg-color);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(var(--el-bg-color-rgb), 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(4px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.loading-overlay.active {
  opacity: 1;
  visibility: visible;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner :deep(.el-loading-spinner) {
  transform: scale(1.5);
}

.loading-text {
  color: var(--text-color);
  font-size: 16px;
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

.gallery-content {
  flex: 1;
  overflow: hidden;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  padding: 16px;
}

.image-item {
  aspect-ratio: 1;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s ease forwards;
}

.image-item:nth-child(1) { animation-delay: 0.05s; }
.image-item:nth-child(2) { animation-delay: 0.1s; }
.image-item:nth-child(3) { animation-delay: 0.15s; }
.image-item:nth-child(4) { animation-delay: 0.2s; }
.image-item:nth-child(5) { animation-delay: 0.25s; }
.image-item:nth-child(6) { animation-delay: 0.3s; }
.image-item:nth-child(7) { animation-delay: 0.35s; }
.image-item:nth-child(8) { animation-delay: 0.4s; }
.image-item:nth-child(9) { animation-delay: 0.45s; }
.image-item:nth-child(10) { animation-delay: 0.5s; }
.image-item:nth-child(11) { animation-delay: 0.55s; }
.image-item:nth-child(12) { animation-delay: 0.6s; }

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.image-card {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.image-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px) scale(1.02);
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.image-wrapper {
  position: relative;
  flex: 1;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-actions {
  display: flex;
  gap: 12px;
  padding: 8px;
  
  :deep(.el-button) {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.9);
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--el-color-primary);
      transform: translateY(-2px);
      
      .el-icon {
        color: white;
      }
    }
    
    .el-icon {
      font-size: 20px;
      color: var(--el-text-color-primary);
    }
  }
  
  :deep(.el-button--danger) {
    &:hover {
      background-color: var(--el-color-danger);
    }
  }
}

.image-info {
  padding: 12px;
  border-top: 1px solid var(--border-color);
}

.image-name {
  color: var(--text-color);
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.8;
}

.pagination-container {
  margin-top: 20px;
  padding: 16px;
  background-color: var(--bg-color);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.preview-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.preview-content {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--hover-bg);
  min-height: 400px;
  overflow: hidden;
  
  img {
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
  }
}

.preview-info {
  padding: 20px;
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color);
}

.info-item {
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .label {
    color: var(--text-color);
    opacity: 0.8;
    margin-right: 8px;
  }
}

.el-select-dropdown__item {
  display: flex;
  align-items: center;
  gap: 8px;
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
  
  .el-icon {
    margin-right: 4px;
  }
  
  &.danger {
    color: var(--el-color-danger);
    
    &:hover {
      background-color: var(--el-color-danger-light-9);
    }
  }
}

:deep(.el-select-dropdown__item) {
  .el-icon {
    margin-right: 8px;
    font-size: 16px;
  }
}

@media (max-width: 640px) {
  .gallery-container {
    padding: 0;
  }

  .toolbar {
    margin: 12px;
    padding: 12px;
  }

  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    padding: 12px;
  }
}
</style> 