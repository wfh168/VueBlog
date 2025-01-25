<template>
  <div class="permission-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户权限管理</span>
          <el-button type="primary" @click="handleAdd">新增角色</el-button>
        </div>
      </template>
      <el-table :data="roles" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="code" label="角色标识" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-space>
              <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="success" size="small" @click="handlePermission(row)">权限设置</el-button>
              <el-button 
                size="small" 
                :type="row.status === 'active' ? 'danger' : 'success'"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 权限设置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="权限设置"
      width="600px"
    >
      <el-tree
        ref="permissionTree"
        :data="permissions"
        show-checkbox
        node-key="id"
        :default-checked-keys="checkedPermissions"
        :props="{ label: 'name' }"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSavePermissions">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ElTree } from 'element-plus'

interface Role {
  id: number
  name: string
  code: string
  description: string
  status: 'active' | 'inactive'
}

interface Permission {
  id: number
  name: string
  children?: Permission[]
}

const loading = ref(false)
const permissionDialogVisible = ref(false)
const permissionTree = ref<InstanceType<typeof ElTree>>()
const checkedPermissions = ref<number[]>([])

const roles = ref<Role[]>([
  {
    id: 1,
    name: '超级管理员',
    code: 'SUPER_ADMIN',
    description: '系统最高权限',
    status: 'active'
  },
  {
    id: 2,
    name: '内容编辑',
    code: 'CONTENT_EDITOR',
    description: '管理文章和评论',
    status: 'active'
  }
])

const permissions = ref<Permission[]>([
  {
    id: 1,
    name: '系统管理',
    children: [
      { id: 11, name: '用户管理' },
      { id: 12, name: '角色管理' },
      { id: 13, name: '权限管理' }
    ]
  },
  {
    id: 2,
    name: '内容管理',
    children: [
      { id: 21, name: '文章管理' },
      { id: 22, name: '分类管理' },
      { id: 23, name: '标签管理' },
      { id: 24, name: '评论管理' }
    ]
  }
])

const handleAdd = () => {
  // 实现新增角色逻辑
}

const handleEdit = (row: Role) => {
  // 实现编辑角色逻辑
}

const handlePermission = (row: Role) => {
  // 模拟获取角色的权限
  checkedPermissions.value = [11, 21, 22]
  permissionDialogVisible.value = true
}

const handleToggleStatus = (row: Role) => {
  // 实现切换角色状态逻辑
}

const handleSavePermissions = () => {
  if (!permissionTree.value) return
  
  const checkedKeys = permissionTree.value.getCheckedKeys()
  const halfCheckedKeys = permissionTree.value.getHalfCheckedKeys()
  
  console.log('选中的权限:', [...checkedKeys, ...halfCheckedKeys])
  permissionDialogVisible.value = false
}
</script>

<style scoped>
.permission-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style> 