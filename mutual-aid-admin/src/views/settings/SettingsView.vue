<template>
  <div>
    <el-card>
      <template #header><span>系统设置</span></template>
      <el-table :data="settings" stripe v-loading="loading">
        <el-table-column prop="configKey" label="配置键" width="200" />
        <el-table-column prop="configValue" label="配置值" min-width="300" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" @click="editSetting(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="编辑设置" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="配置键">
          <el-input v-model="form.configKey" disabled />
        </el-form-item>
        <el-form-item label="配置值">
          <el-input v-model="form.configValue" type="textarea" :rows="3" />
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
import { getSettings, updateSettings } from '../../api/settings'
import { ElMessage } from 'element-plus'

const settings = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = ref({ configKey: '', configValue: '' })

async function fetchSettings() {
  loading.value = true
  try {
    const res = await getSettings()
    settings.value = res.data || []
  } finally {
    loading.value = false
  }
}

function editSetting(row) {
  form.value = { configKey: row.configKey, configValue: row.configValue }
  dialogVisible.value = true
}

async function handleSave() {
  try {
    await updateSettings({ [form.value.configKey]: form.value.configValue })
    dialogVisible.value = false
    ElMessage.success('保存成功')
    fetchSettings()
  } catch { /* ignored */ }
}

onMounted(fetchSettings)
</script>
