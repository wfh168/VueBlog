<template>
  <div class="settings-container">
    <el-tabs v-model="activeTab">
      <!-- 基本设置 -->
      <el-tab-pane label="基本设置" name="basic">
        <el-form
          ref="basicFormRef"
          :model="basicForm"
          :rules="basicRules"
          label-width="120px"
        >
          <el-form-item label="博客名称" prop="blogName">
            <el-input v-model="basicForm.blogName" placeholder="请输入博客名称" />
          </el-form-item>
          <el-form-item label="博客描述" prop="blogDescription">
            <el-input
              v-model="basicForm.blogDescription"
              type="textarea"
              :rows="3"
              placeholder="请输入博客描述"
            />
          </el-form-item>
          <el-form-item label="博客Logo">
            <el-upload
              class="logo-uploader"
              action="#"
              :show-file-list="false"
              :before-upload="beforeLogoUpload"
              :http-request="handleLogoUpload"
            >
              <img v-if="basicForm.logo" :src="basicForm.logo" class="logo" />
              <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">建议尺寸: 200x200px, 支持 jpg、png 格式</div>
          </el-form-item>
          <el-form-item label="ICP备案号" prop="icp">
            <el-input v-model="basicForm.icp" placeholder="请输入ICP备案号" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 主题设置 -->
      <el-tab-pane label="主题设置" name="theme">
        <el-form
          ref="themeFormRef"
          :model="themeForm"
          label-width="120px"
        >
          <el-form-item label="主题模式">
            <el-radio-group v-model="themeForm.mode">
              <el-radio-button value="light">浅色</el-radio-button>
              <el-radio-button value="dark">深色</el-radio-button>
              <el-radio-button value="auto">跟随系统</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="主题色">
            <el-color-picker v-model="themeForm.primaryColor" />
          </el-form-item>
          <el-form-item label="导航布局">
            <el-radio-group v-model="themeForm.layout">
              <el-radio-button value="side">侧边导航</el-radio-button>
              <el-radio-button value="top">顶部导航</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 评论设置 -->
      <el-tab-pane label="评论设置" name="comment">
        <el-form
          ref="commentFormRef"
          :model="commentForm"
          label-width="120px"
        >
          <el-form-item label="评论功能">
            <el-switch v-model="commentForm.enabled" />
          </el-form-item>
          <el-form-item label="评论审核">
            <el-switch v-model="commentForm.needReview" />
          </el-form-item>
          <el-form-item label="评论通知">
            <el-switch v-model="commentForm.notification" />
          </el-form-item>
          <el-form-item label="屏蔽词">
            <el-select
              v-model="commentForm.blockWords"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="请输入屏蔽词，回车确认"
            >
              <el-option
                v-for="item in commentForm.blockWords"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <div class="settings-footer">
      <el-button type="primary" @click="handleSave" :loading="saving">
        保存设置
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, UploadProps } from 'element-plus'

const activeTab = ref('basic')
const saving = ref(false)

// 基本设置表单
const basicFormRef = ref<FormInstance>()
const basicForm = reactive({
  blogName: '我的博客',
  blogDescription: '这是一个基于 Vue3 的博客系统',
  logo: '',
  icp: ''
})

const basicRules = {
  blogName: [
    { required: true, message: '请输入博客名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  blogDescription: [
    { required: true, message: '请输入博客描述', trigger: 'blur' },
    { max: 200, message: '不能超过 200 个字符', trigger: 'blur' }
  ]
}

// 主题设置表单
const themeFormRef = ref<FormInstance>()
const themeForm = reactive({
  mode: 'light',
  primaryColor: '#409EFF',
  layout: 'side'
})

// 评论设置表单
const commentFormRef = ref<FormInstance>()
const commentForm = reactive({
  enabled: true,
  needReview: true,
  notification: true,
  blockWords: ['广告', '推广', '色情', '赌博']
})

// Logo上传相关方法
const beforeLogoUpload: UploadProps['beforeUpload'] = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('Logo只能是JPG或PNG格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('Logo大小不能超过2MB!')
    return false
  }
  return true
}

const handleLogoUpload = async (options: any) => {
  try {
    // 这里应该调用API上传文件
    // 模拟上传
    await new Promise(resolve => setTimeout(resolve, 1000))
    const file = options.file
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      basicForm.logo = reader.result as string
    }
    ElMessage.success('上传成功')
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

// 保存设置
const handleSave = async () => {
  if (activeTab.value === 'basic') {
    if (!basicFormRef.value) return
    await basicFormRef.value.validate()
  }

  try {
    saving.value = true
    // 这里应该调用API保存设置
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.settings-footer {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color);
  text-align: right;
}

.logo-uploader {
  width: 200px;
  height: 200px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration);
}

.logo-uploader:hover {
  border-color: var(--el-color-primary);
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 200px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 200px;
  height: 200px;
  object-fit: contain;
}

.upload-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}

:deep(.el-tabs__nav) {
  margin-bottom: 20px;
}

:deep(.el-form-item) {
  max-width: 600px;
}
</style> 