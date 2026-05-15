<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>公告管理</span>
          <el-button type="primary" size="small" @click="openDialog()">发布公告</el-button>
        </div>
      </template>
      <el-table :data="announcements" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="标题" min-width="180" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publisher" label="发布人" width="120" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="isTop" label="置顶" width="60">
          <template #default="{ row }">
            <el-tag v-if="row.isTop" type="danger" size="small">是</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'PUBLISHED' ? 'success' : 'info'" size="small">
              {{ row.status === 'PUBLISHED' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 20px; display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑公告' : '发布公告'" width="700px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" style="width: 100%">
            <el-option label="系统公告" value="系统公告" />
            <el-option label="活动通知" value="活动通知" />
            <el-option label="安全提醒" value="安全提醒" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布人">
          <el-input v-model="form.publisher" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="6" />
        </el-form-item>
        <el-form-item label="置顶">
          <el-switch v-model="form.isTop" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../api/announcements'
import { ElMessage } from 'element-plus'

const announcements = ref([])
const loading = ref(false)
const page = ref(1)
const size = ref(20)
const total = ref(0)

const dialogVisible = ref(false)
const editing = ref(null)
const form = ref({ title: '', content: '', category: '系统公告', publisher: '管理员', isTop: false })

async function fetchList() {
  loading.value = true
  try {
    const res = await getAnnouncements({ page: page.value, size: size.value })
    announcements.value = res.data?.content || res.data || []
    total.value = res.data?.totalElements || 0
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  editing.value = row || null
  if (row) {
    form.value = { title: row.title, content: row.content, category: row.category, publisher: row.publisher, isTop: row.isTop }
  } else {
    form.value = { title: '', content: '', category: '系统公告', publisher: '管理员', isTop: false }
  }
  dialogVisible.value = true
}

async function handleSave() {
  try {
    if (editing.value) {
      await updateAnnouncement(editing.value.id, form.value)
    } else {
      await createAnnouncement(form.value)
    }
    dialogVisible.value = false
    ElMessage.success('保存成功')
    fetchList()
  } catch { /* ignored */ }
}

async function handleDelete(id) {
  try {
    await deleteAnnouncement(id)
    ElMessage.success('删除成功')
    fetchList()
  } catch { /* ignored */ }
}

onMounted(fetchList)
</script>
