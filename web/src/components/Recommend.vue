<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Business {
  id: number
  name: string
  image: string
  description: string
  score: number
  deliveryFees: number
  miniDeliveryFee: number
  monthSold: number
}

// 当前选中的排序方式
const activeSort = ref('综合排序')
const error = ref('')
const loading = ref(false)
const businesses = ref<Business[]>([])

// base64 转换为图片URL
const convertBase64ToUrl = (base64String: string) => {
  if (!base64String) return ''
  if (base64String.startsWith('data:image')) {
    return base64String
  }
  return `data:image/png;base64,${base64String}`
}

// 处理排序点击
const handleSort = (sort: string) => {
  activeSort.value = sort
}

// 获取商家列表
const getBusinessList = async () => {
  loading.value = true
  error.value = ''
  // 重置商家列表
  businesses.value = []
  
  try {
    const response = await fetch('http://localhost:80/api/business/list')
    if (!response.ok) {
      throw new Error('加载失败')
    }
    const data = (await response.json())["data"]
    businesses.value = data.map((business: Business) => ({
      ...business,
      image: convertBase64ToUrl(business.image)
    }))
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
    console.error('获取商家列表失败:', err)
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  getBusinessList()
})
</script>

<template>
  <!-- 推荐商家标题 -->
  <div class="recommend flex items-center justify-center my-6">
    <div class="recommend-line h-[0.5px] bg-[#EBEBEB] flex-1 mx-4"></div>
    <div class="flex items-center">
      <div class="w-[3px] h-4 bg-[#333333] mx-2"></div>
      <p class="text-4 font-medium text-[#333333]">推荐商家</p>
      <div class="w-[3px] h-4 bg-[#333333] mx-2"></div>
    </div>
    <div class="recommend-line h-[0.5px] bg-[#EBEBEB] flex-1 mx-4"></div>
  </div>

  <!-- 推荐方式部分 -->
  <ul class="recommendtype flex justify-between items-center px-4 py-2 text-[#333333] text-3.5">
    <!-- 左侧选项 -->
    <div class="flex space-x-8">
      <li 
        @click="handleSort('综合排序')"
        :class="{ 'active': activeSort === '综合排序' }"
        class="flex items-center cursor-pointer"
      >
        综合排序
        <i class="fa fa-caret-down ml-1"></i>
      </li>
      <li 
        @click="handleSort('距离最近')"
        :class="{ 'active': activeSort === '距离最近' }"
        class="cursor-pointer"
      >
        距离最近
      </li>
      <li 
        @click="handleSort('销量最高')"
        :class="{ 'active': activeSort === '销量最高' }"
        class="cursor-pointer"
      >
        销量最高
      </li>
    </div>
    
    <!-- 右侧筛选 -->
    <li class="flex items-center cursor-pointer">
      筛选
      <i class="fa fa-filter ml-1"></i>
    </li>
  </ul>

  <!-- 加载状态 -->
  <div v-if="loading" class="loading text-center py-4">
    <div class="loading-spinner inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    <p class="mt-2 text-gray-600">加载中...</p>
  </div>

  <!-- 错误状态 -->
  <div v-else-if="error" class="error-message text-center py-4">
    <p class="text-red-500 mb-2">{{ error }}</p>
    <button 
      @click="getBusinessList" 
      class="retry-button px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      重试
    </button>
  </div>

  <!-- 空数据状态 -->
  <div v-else-if="businesses.length === 0" class="no-data text-center py-4">
    <p class="text-gray-500">暂无商家数据</p>
  </div>

  <!-- 商家列表 -->
  <div v-else class="business-list">
    <div v-for="business in businesses" 
         :key="business.id" 
         class="business-list-item flex p-4 border-b border-gray-100">
      <!-- 商家图片 -->
      <div class="w-20 h-20 mr-3">
        <img :src="business.image" 
             :alt="business.name"
             class="w-full h-full object-cover rounded-1">
      </div>
      
      <!-- 商家信息 -->
      <div class="flex-1">
        <h3 class="business-name text-4 font-bold mb-2">{{ business.name }}</h3>
        <div class="text-3 text-gray-600 mb-2">
          <span>评分 {{ business.score }}</span>
          <span class="mx-2">|</span>
          <span>月售 {{ business.monthSold }}单</span>
        </div>
        <div class="text-3 text-gray-600">
          <span>¥{{ business.miniDeliveryFee }}起送</span>
          <span class="mx-2">|</span>
          <span>配送费¥{{ business.deliveryFees }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recommendtype li {
  transition: color 0.3s ease;
}

.recommendtype li:hover {
  opacity: 0.8;
}

.recommendtype li.active {
  color: #2395ff;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  color: #ef4444;
}

.retry-button {
  transition: background-color 0.3s ease;
}

.retry-button:hover {
  background-color: #2563eb;
}

.business-list-item {
  transition: background-color 0.3s ease;
}

.business-list-item:hover {
  background-color: #f9f9f9;
}
</style>