<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in statCards" :key="item.label">
        <el-card shadow="hover" style="margin-bottom: 20px">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div style="font-size: 14px; color: #909399">{{ item.label }}</div>
              <div style="font-size: 28px; font-weight: bold; margin-top: 8px">{{ item.value }}</div>
            </div>
            <el-icon :size="48" :color="item.color">
              <component :is="item.icon" />
            </el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStats } from '../../api/dashboard'

const statCards = ref([
  { label: '志愿者总数', value: 0, icon: 'UserFilled', color: '#409EFF' },
  { label: '老人总数', value: 0, icon: 'User', color: '#67C23A' },
  { label: '待处理任务', value: 0, icon: 'Clock', color: '#E6A23C' },
  { label: '进行中任务', value: 0, icon: 'Loading', color: '#409EFF' },
  { label: '已完成任务', value: 0, icon: 'CircleCheckFilled', color: '#67C23A' },
  { label: '总订单数', value: 0, icon: 'Tickets', color: '#909399' },
  { label: '公告总数', value: 0, icon: 'ChatDotSquare', color: '#F56C6C' }
])

onMounted(async () => {
  try {
    const res = await getStats()
    const d = res.data
    statCards.value[0].value = d.totalVolunteers ?? 0
    statCards.value[1].value = d.totalElderly ?? 0
    statCards.value[2].value = d.pendingTasks ?? 0
    statCards.value[3].value = d.inProgressTasks ?? 0
    statCards.value[4].value = d.completedTasks ?? 0
    statCards.value[5].value = d.totalOrders ?? 0
    statCards.value[6].value = d.totalAnnouncements ?? 0
  } catch { /* ignored */ }
})
</script>
