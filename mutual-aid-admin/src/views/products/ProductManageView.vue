<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <div style="display: flex; align-items: center; gap: 16px;">
            <span>商品管理</span>
            <el-button-group>
              <el-button :type="viewMode === 'table' ? 'primary' : 'default'" size="small" @click="viewMode = 'table'">
                <el-icon><List /></el-icon>
              </el-button>
              <el-button :type="viewMode === 'card' ? 'primary' : 'default'" size="small" @click="viewMode = 'card'">
                <el-icon><Grid /></el-icon>
              </el-button>
            </el-button-group>
          </div>
          <el-button type="primary" size="small" @click="openDialog()">新增商品</el-button>
        </div>
      </template>

      <!-- Table View -->
      <el-table :data="products" stripe v-loading="loading" v-if="viewMode === 'table'">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="图片" width="80">
          <template #default="{ row }">
            <el-image v-if="row.image" :src="row.image" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;" fit="cover" />
            <span v-else style="color: #ccc; font-size: 20px;">📦</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="pointsRequired" label="所需积分" width="100" />
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ON_SHELF' ? 'success' : 'info'" size="small">
              {{ row.status === 'ON_SHELF' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Card View -->
      <div v-else-if="viewMode === 'card'" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;" v-loading="loading">
        <div v-for="item in products" :key="item.id" style="background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; transition: transform .2s, box-shadow .2s;" @mouseenter="onCardEnter" @mouseleave="onCardLeave">
          <div style="height: 160px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; overflow: hidden;">
            <el-image v-if="item.image" :src="item.image" style="width: 100%; height: 100%; object-fit: cover;" fit="cover" />
            <span v-else style="font-size: 48px; opacity: 0.15;">📦</span>
          </div>
          <div style="padding: 16px;">
            <div style="font-size: 16px; font-weight: 700; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ item.name }}</div>
            <div style="font-size: 13px; color: #e6a23c; font-weight: 700; margin-bottom: 4px;">{{ item.pointsRequired }} 积分</div>
            <div style="font-size: 12px; color: #909399;">库存: {{ item.stock }}</div>
            <div style="margin-top: 4px;">
              <el-tag :type="item.status === 'ON_SHELF' ? 'success' : 'info'" size="small">{{ item.status === 'ON_SHELF' ? '上架' : '下架' }}</el-tag>
            </div>
            <div style="margin-top: 12px; display: flex; gap: 8px;">
              <el-button size="small" style="flex: 1;" @click="openDialog(item)">编辑</el-button>
              <el-button size="small" type="danger" style="flex: 1;" @click="handleDelete(item.id)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑商品' : '新增商品'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="所需积分">
          <el-input-number v-model="form.pointsRequired" :min="0" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>
        <el-form-item label="商品图片">
          <div style="display: flex; align-items: flex-start; gap: 16px;">
            <el-upload
              :show-file-list="false"
              :before-upload="handleBeforeUpload"
              :http-request="handleUpload"
              accept="image/*"
            >
              <div
                style="width: 120px; height: 120px; border: 2px dashed #d9d9d9; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; background: #fafafa; transition: border-color .2s; overflow: hidden;"
                @mouseenter="onUploadEnter"
                @mouseleave="onUploadLeave"
              >
                <img v-if="form.image" :src="form.image" style="width: 100%; height: 100%; object-fit: cover;" />
                <template v-else>
                  <span style="font-size: 28px; color: #999;">+</span>
                  <span style="font-size: 12px; color: #999; margin-top: 4px;">选择图片</span>
                </template>
              </div>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.badge" placeholder="可选，如：热门" />
        </el-form-item>
        <el-form-item label="状态" v-if="editing">
          <el-select v-model="form.status">
            <el-option label="上架" value="ON_SHELF" />
            <el-option label="下架" value="OFF_SHELF" />
          </el-select>
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
import { getProducts, createProduct, updateProduct, deleteProduct, uploadImage } from '../../api/products'
import { ElMessage } from 'element-plus'

const products = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const editing = ref(null)
const viewMode = ref('table')
const form = ref({ name: '', description: '', pointsRequired: 0, stock: 0, image: '', badge: '', status: 'ON_SHELF' })
const uploading = ref(false)

async function fetchList() {
  loading.value = true
  try {
    const res = await getProducts()
    products.value = res.data || []
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  editing.value = row || null
  if (row) {
    form.value = { name: row.name, description: row.description, pointsRequired: row.pointsRequired, stock: row.stock, image: row.image || '', badge: row.badge || '', status: row.status }
  } else {
    form.value = { name: '', description: '', pointsRequired: 0, stock: 0, image: '', badge: '', status: 'ON_SHELF' }
  }
  dialogVisible.value = true
}

function handleBeforeUpload(file) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请选择图片文件')
    return false
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

function onCardEnter(e) {
  e.currentTarget.style.transform = 'translateY(-4px)'
  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
}

function onCardLeave(e) {
  e.currentTarget.style.transform = ''
  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
}

function onUploadEnter(e) {
  e.currentTarget.style.borderColor = '#409eff'
}

function onUploadLeave(e) {
  e.currentTarget.style.borderColor = '#d9d9d9'
}

async function handleUpload(options) {
  uploading.value = true
  try {
    const res = await uploadImage(options.file)
    form.value.image = res.data
    ElMessage.success('图片上传成功')
  } catch {
    ElMessage.error('图片上传失败')
  } finally {
    uploading.value = false
  }
}

async function handleSave() {
  try {
    if (editing.value) {
      await updateProduct(editing.value.id, form.value)
    } else {
      await createProduct(form.value)
    }
    dialogVisible.value = false
    ElMessage.success('保存成功')
    fetchList()
  } catch { /* ignored */ }
}

async function handleDelete(id) {
  try {
    await deleteProduct(id)
    ElMessage.success('删除成功')
    fetchList()
  } catch { /* ignored */ }
}

onMounted(fetchList)
</script>
