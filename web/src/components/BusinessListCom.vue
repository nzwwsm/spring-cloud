<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { API_URLS } from '@/config/api'



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

const router = useRouter()

const businesses = ref<Business[]>([])
const error = ref('')
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

// base64 转换为图片URL
const convertBase64ToUrl = (base64String: string) => {
  if (base64String.startsWith('data:image')) {
    return base64String
  }
  return `data:image/png;base64,${base64String}`
}

const getBusinessList = async (isLoadMore = false) => {
  if (loading.value) return
  
  error.value = ''
  loading.value = true
  
  if (!isLoadMore) {
    page.value = 1
    businesses.value = []
  }
  
  try {
    const response = await fetch(`${API_URLS.businessList()}?page=${page.value}`)
    if (!response.ok) {
      throw new Error('获取商家列表失败')
    }
    const data = (await response.json())["data"]
    
    if (!Array.isArray(data) || data.length === 0) {
      hasMore.value = false
      if (!isLoadMore) {
        businesses.value = []
      }
      return
    }
    
    // 使用 Set 记录已存在的商家 ID
    const existingIds = new Set(businesses.value.map(b => b.id))
    const newBusinesses = data.filter((business: Business) => {
      if (existingIds.has(business.id)) {
        return false
      }
      existingIds.add(business.id)
      return true
    }).map((business: Business) => ({
      ...business,
      image: convertBase64ToUrl(business.image)
    }))

    if (isLoadMore) {
      businesses.value = [...businesses.value, ...newBusinesses]
    } else {
      businesses.value = newBusinesses
    }
    
    hasMore.value = newBusinesses.length > 0
    if (hasMore.value) {
      page.value++
    }
  } catch (err) {
    console.error('获取商家列表失败:', err)
    error.value = err instanceof Error ? err.message : '网络错误'
    if (!isLoadMore) {
      businesses.value = []
    }
  } finally {
    loading.value = false
  }
}

// 添加跳转方法
const goToBusinessInfo = async (businessId: number) => {
  try {
    // 检查用户是否已登录
    const token = localStorage.getItem('token')
    if (!token) {
      alert('请先登录')
      router.push('/login')
      return
    }
    
    // 修复路由路径，将 {businessId} 改为实际的变量插值
    router.push(`/businessInfo/${encodeURIComponent(businessId)}`)

  } catch (error) {
    console.error('切换商家失败:', error)
  }
}

onMounted(() => {
  getBusinessList()
})
</script>

<template>
  <div class="business-list">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading text-center py-4">
      <div class="loading-spinner inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      <p class="mt-2 text-gray-600">加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-message text-center py-4">
      <p class="text-red-500 mb-2">{{ error }}</p>
      <button 
        @click="() => getBusinessList()" 
        class="retry-btn px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        重试
      </button>
    </div>

    <!-- 空数据状态 -->
    <div v-else-if="businesses.length === 0" class="text-center py-4 text-gray-500">
      暂无商家数据
    </div>

    <!-- 商家列表 -->
    <template v-else>
    <div v-for="(business, index) in businesses" 
         :key="business.id" 
           class="business-item flex p-4 border-b border-gray-100 cursor-pointer"
         @click="goToBusinessInfo(business.id)">
      <!-- 商家图片 -->
        <div class="w-20 h-20 mr-3">
        <img :src="business.image" 
             :alt="business.name"
               class="w-full h-full object-cover rounded-1">
      </div>
      
      <!-- 商家信息 -->
      <div class="flex-1">
          <!-- 商家名称 -->
          <h3 class="text-4 font-bold mb-2">{{ business.name }}</h3>
          
          <!-- 评分和月售 -->
          <div class="flex items-center mb-2 text-3 text-gray-600">
            <span class="mr-2">评分 {{ business.score }}</span>
            <span>月售 {{ business.monthSold }}单</span>
          </div>
          
          <!-- 配送信息 -->
          <div class="text-3 text-gray-600 mb-2">
          <span>¥{{ business.miniDeliveryFee }}起送</span>
            <span class="mx-2 text-gray-300">|</span>
            <span>配送费¥{{ business.deliveryFees }}</span>
          </div>
          
          <!-- 商家描述 -->
          <div class="text-3 text-gray-500">
            {{ business.description }}
          </div>
        </div>
      </div>

      <!-- 加载更多按钮 -->
      <div v-if="hasMore" class="text-center py-4">
        <button 
          @click="() => getBusinessList(true)" 
          class="load-more-btn px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          :disabled="loading"
        >
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
    </div>
    </template>
  </div>
</template>

<style scoped>
.business-list {
  background: #fff;
}

.business-item {
  transition: background-color 0.3s ease;
}

.business-item:hover {
  background-color: #f9f9f9;
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

.retry-btn, .load-more-btn {
  transition: background-color 0.3s ease;
}

.retry-btn:hover, .load-more-btn:hover {
  background-color: #2563eb;
}

.retry-btn:disabled, .load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>