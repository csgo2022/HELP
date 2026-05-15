<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>服务类型管理</span>
          <el-button type="primary" size="small" @click="openServiceDialog()">新增服务类型</el-button>
        </div>
      </template>
      <el-table :data="serviceTypes" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" width="150" />
        <el-table-column prop="description" label="描述" min-width="250" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="openServiceDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteService(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>技能管理</span>
          <el-button type="primary" size="small" @click="openSkillDialog()">新增技能</el-button>
        </div>
      </template>
      <el-table :data="skills" stripe v-loading="skillLoading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="技能名称" width="150" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="openSkillDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteSkill(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="serviceDialogVisible" :title="editingService ? '编辑服务类型' : '新增服务类型'" width="500px">
      <el-form :model="serviceForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="serviceForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="serviceForm.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="serviceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveService">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="skillDialogVisible" :title="editingSkill ? '编辑技能' : '新增技能'" width="500px">
      <el-form :model="skillForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="skillForm.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="skillDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveSkill">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getServiceTypes, createServiceType, updateServiceType, deleteServiceType, getSkills, createSkill, updateSkill, deleteSkill } from '../../api/services'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const skillLoading = ref(false)
const serviceTypes = ref([])
const skills = ref([])

const serviceDialogVisible = ref(false)
const editingService = ref(null)
const serviceForm = ref({ name: '', description: '' })

const skillDialogVisible = ref(false)
const editingSkill = ref(null)
const skillForm = ref({ name: '' })

async function fetchServiceTypes() {
  loading.value = true
  try {
    const res = await getServiceTypes()
    serviceTypes.value = res.data || []
  } finally {
    loading.value = false
  }
}

async function fetchSkills() {
  skillLoading.value = true
  try {
    const res = await getSkills()
    skills.value = res.data || []
  } finally {
    skillLoading.value = false
  }
}

function openServiceDialog(row) {
  editingService.value = row || null
  serviceForm.value = row ? { name: row.name, description: row.description } : { name: '', description: '' }
  serviceDialogVisible.value = true
}

async function handleSaveService() {
  try {
    if (editingService.value) {
      await updateServiceType(editingService.value.id, serviceForm.value)
    } else {
      await createServiceType(serviceForm.value)
    }
    serviceDialogVisible.value = false
    ElMessage.success('保存成功')
    fetchServiceTypes()
  } catch { /* ignored */ }
}

async function handleDeleteService(id) {
  try {
    await deleteServiceType(id)
    ElMessage.success('删除成功')
    fetchServiceTypes()
  } catch { /* ignored */ }
}

function openSkillDialog(row) {
  editingSkill.value = row || null
  skillForm.value = row ? { name: row.name } : { name: '' }
  skillDialogVisible.value = true
}

async function handleSaveSkill() {
  try {
    if (editingSkill.value) {
      await updateSkill(editingSkill.value.id, skillForm.value)
    } else {
      await createSkill(skillForm.value)
    }
    skillDialogVisible.value = false
    ElMessage.success('保存成功')
    fetchSkills()
  } catch { /* ignored */ }
}

async function handleDeleteSkill(id) {
  try {
    await deleteSkill(id)
    ElMessage.success('删除成功')
    fetchSkills()
  } catch { /* ignored */ }
}

onMounted(() => {
  fetchServiceTypes()
  fetchSkills()
})
</script>
