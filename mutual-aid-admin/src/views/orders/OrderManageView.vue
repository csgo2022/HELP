<template>
  <div>
    <el-card>
      <template #header><span>订单管理</span></template>
      <el-table :data="orders" stripe v-loading="loading">
        <el-table-column prop="id" label="订单号" width="80" />
        <el-table-column prop="userId" label="用户ID" width="80" />
        <el-table-column prop="productName" label="商品" min-width="150" />
        <el-table-column prop="totalPoints" label="消耗积分" width="100" />
        <el-table-column prop="courier" label="快递公司" width="120" />
        <el-table-column prop="trackingNo" label="运单号" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'SHIPPED' ? 'success' : row.status === 'PENDING' ? 'warning' : 'info'">
              {{ row.status === 'SHIPPED' ? '已发货' : row.status === 'PENDING' ? '待发货' : row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
            <el-button size="small" type="primary" @click="openLogisticsDialog(row)" v-if="row.status === 'PENDING'">
              发货
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" title="订单详情" width="500px">
      <el-descriptions v-if="currentOrder" :column="2" border>
        <el-descriptions-item label="订单号">{{ currentOrder.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentOrder.userId }}</el-descriptions-item>
        <el-descriptions-item label="商品">{{ currentOrder.productName }}</el-descriptions-item>
        <el-descriptions-item label="消耗积分">{{ currentOrder.totalPoints }}</el-descriptions-item>
        <el-descriptions-item label="收件人">{{ currentOrder.recipientName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentOrder.recipientPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址">{{ currentOrder.address }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentOrder.status }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="logisticsVisible" title="发货" width="400px">
      <el-form :model="logisticsForm" label-width="80px">
        <el-form-item label="快递公司">
          <el-select v-model="logisticsForm.courierCode" placeholder="请选择快递公司" style="width:100%" @change="onCourierChange">
            <el-option v-for="opt in courierOptions" :key="opt.code" :label="opt.name" :value="opt.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="运单号">
          <el-input v-model="logisticsForm.trackingNo" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="logisticsVisible = false">取消</el-button>
        <el-button type="primary" @click="handleShip">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOrders, getOrderDetail, updateLogistics } from '../../api/orders'
import { ElMessage } from 'element-plus'

const orders = ref([])
const loading = ref(false)
const detailVisible = ref(false)
const currentOrder = ref(null)

const logisticsVisible = ref(false)
const shippingOrder = ref(null)
const logisticsForm = ref({ courier: '', courierCode: '', trackingNo: '' })

const courierOptions = [
  { name: '顺丰快递', code: 'shunfeng' },
  { name: '圆通快递', code: 'yuantong' },
  { name: '中通快递', code: 'zhongtong' },
  { name: '韵达快递', code: 'yunda' },
  { name: '申通快递', code: 'shentong' },
  { name: '京东快递', code: 'jd' },
  { name: 'EMS', code: 'ems' },
  { name: '邮政快递', code: 'youzhengguonei' },
  { name: '天天快递', code: 'tiantian' },
  { name: '德邦快递', code: 'debangkuaidi' },
  { name: '百世快递', code: 'baishiwuliu' },
  { name: '宅急送', code: 'zhaijisong' }
]

function onCourierChange(code) {
  const opt = courierOptions.find(o => o.code === code)
  logisticsForm.value.courier = opt ? opt.name : ''
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getOrders()
    orders.value = res.data || []
  } finally {
    loading.value = false
  }
}

async function viewDetail(row) {
  try {
    const res = await getOrderDetail(row.id)
    currentOrder.value = res.data
    detailVisible.value = true
  } catch { /* ignored */ }
}

function openLogisticsDialog(row) {
  shippingOrder.value = row
  logisticsForm.value = { courier: '', courierCode: '', trackingNo: '' }
  logisticsVisible.value = true
}

async function handleShip() {
  try {
    await updateLogistics(shippingOrder.value.id, logisticsForm.value)
    logisticsVisible.value = false
    ElMessage.success('发货成功')
    fetchList()
  } catch { /* ignored */ }
}

onMounted(fetchList)
</script>
