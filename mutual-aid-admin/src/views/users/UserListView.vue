<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>用户列表</span>
          <el-select v-model="roleFilter" placeholder="角色筛选" clearable style="width: 150px" @change="fetchUsers">
            <el-option label="全部" value="" />
            <el-option label="志愿者" value="VOLUNTEER" />
            <el-option label="老人" value="ELDERLY" />
            <el-option label="管理员" value="ADMIN" />
          </el-select>
        </div>
      </template>
      <el-table :data="users" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="160" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'ADMIN' ? 'danger' : row.role === 'VOLUNTEER' ? 'success' : 'info'">
              {{ row.role === 'ADMIN' ? '管理员' : row.role === 'VOLUNTEER' ? '志愿者' : '老人' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="60" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : row.status === 1 ? 'danger' : 'info'" size="small">
              {{ row.status === 0 ? '正常' : row.status === 1 ? '禁用' : '已注销' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="160">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
            <el-button
              size="small"
              :type="row.status === 0 ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
              :disabled="row.status === 2"
            >
              {{ row.status === 0 ? '禁用' : row.status === 1 ? '启用' : '已注销' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 20px; display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="fetchUsers"
        />
      </div>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header><span>实名认证审核</span></template>
      <el-table :data="auths" stripe v-loading="authLoading">
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="idCard" label="身份证号" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'PENDING' ? 'warning' : row.status === 'APPROVED' ? 'success' : 'danger'">
              {{ row.status === 'PENDING' ? '待审核' : row.status === 'APPROVED' ? '通过' : '拒绝' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="success" @click="handleAuth(row.id, 'APPROVED')">通过</el-button>
            <el-button size="small" type="danger" @click="handleReject(row)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" title="用户详情" width="500px">
      <el-descriptions v-if="currentUser" :column="2" border>
        <el-descriptions-item label="ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentUser.name }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ currentUser.role }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ currentUser.gender }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentUser.status === 0 ? '正常' : currentUser.status === 1 ? '禁用' : '已注销' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUsers, toggleUserStatus, getRealnameAuths, reviewRealnameAuth, getUserDetail } from '../../api/users'
import { ElMessage, ElMessageBox } from 'element-plus'

const users = ref([])
const page = ref(1)
const size = ref(20)
const total = ref(0)
const roleFilter = ref('')
const loading = ref(false)

const auths = ref([])
const authLoading = ref(false)
const detailVisible = ref(false)
const currentUser = ref(null)

async function fetchUsers() {
  loading.value = true
  try {
    const res = await getUsers({ keyword: '', role: roleFilter.value, page: page.value, size: size.value })
    users.value = res.data?.content || res.data || []
    total.value = res.data?.totalElements || 0
  } finally {
    loading.value = false
  }
}

async function fetchAuths() {
  authLoading.value = true
  try {
    const res = await getRealnameAuths()
    auths.value = res.data || []
  } finally {
    authLoading.value = false
  }
}

async function viewDetail(row) {
  try {
    const res = await getUserDetail(row.id)
    currentUser.value = res.data
    detailVisible.value = true
  } catch { /* ignored */ }
}

async function handleToggleStatus(row) {
  try {
    await toggleUserStatus(row.id)
    ElMessage.success('操作成功')
    fetchUsers()
  } catch { /* ignored */ }
}

async function handleAuth(id, status) {
  try {
    await reviewRealnameAuth(id, { status })
    ElMessage.success('审核完成')
    fetchAuths()
  } catch { /* ignored */ }
}

function handleReject(row) {
  ElMessageBox.prompt('请输入拒绝原因', '拒绝认证', { inputType: 'textarea' }).then(async ({ value }) => {
    await reviewRealnameAuth(row.id, { status: 'REJECTED', rejectReason: value })
    ElMessage.success('已拒绝')
    fetchAuths()
  }).catch(() => {})
}

onMounted(() => {
  fetchUsers()
  fetchAuths()
})
</script>
