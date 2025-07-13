<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Bottom from '@/components/bottom.vue'

const router = useRouter()
const userInfo = ref({
  username: '',
  phone: '',
  avatar: ''
})

// 检查登录状态
const checkLogin = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return false
  }
  return true
}

// 获取用户信息
const getUserInfo = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await fetch('http://localhost:9003/user/info', {
      headers: {
        'Authorization': token
      }
    })

    if (!response.ok) {
      throw new Error('获取用户信息失败')
    }

    const data = await response.json()
    userInfo.value = data
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 退出登录
const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('token')
    router.push('/login')
  }
}

onMounted(() => {
  if (checkLogin()) {
    getUserInfo()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 pb-20">
    <!-- 顶部标题 -->
    <div class="bg-blue-500 h-14 w-full flex justify-center items-center fixed top-0 z-50">
      <h1 class="text-center text-xl text-white">我的</h1>
    </div>

    <!-- 用户信息卡片 -->
    <div class="pt-16 px-4">
      <div class="bg-white rounded-lg p-4 mb-4">
        <div class="flex items-center">
          <!-- 用户头像 -->
          <div class="w-16 h-16 rounded-full bg-gray-200 overflow-hidden mr-4">
            <img 
              v-if="userInfo.avatar" 
              :src="userInfo.avatar" 
              alt="用户头像"
              class="w-full h-full object-cover"
            >
            <i v-else class="fa fa-user text-4xl text-gray-400 flex items-center justify-center h-full"></i>
          </div>
          
          <!-- 用户信息 -->
          <div class="flex-1">
            <h2 class="text-lg font-medium">{{ userInfo.username || '未设置昵称' }}</h2>
            <p class="text-gray-500 text-sm mt-1">{{ userInfo.phone || '未绑定手机号' }}</p>
          </div>
        </div>
      </div>

      <!-- 功能菜单 -->
      <div class="bg-white rounded-lg mb-4">
        <!-- 我的订单 -->
        <div 
          class="flex items-center justify-between p-4 border-b border-gray-100"
          @click="router.push('/orderList')"
        >
          <div class="flex items-center">
            <i class="fa fa-list-alt text-blue-500 text-xl mr-3"></i>
            <span>我的订单</span>
          </div>
          <i class="fa fa-angle-right text-gray-400"></i>
        </div>

        <!-- 收货地址 -->
        <div 
          class="flex items-center justify-between p-4 border-b border-gray-100"
          @click="router.push('/address')"
        >
          <div class="flex items-center">
            <i class="fa fa-map-marker text-green-500 text-xl mr-3"></i>
            <span>收货地址</span>
          </div>
          <i class="fa fa-angle-right text-gray-400"></i>
        </div>

        <!-- 联系客服 -->
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <div class="flex items-center">
            <i class="fa fa-headphones text-orange-500 text-xl mr-3"></i>
            <span>联系客服</span>
          </div>
          <i class="fa fa-angle-right text-gray-400"></i>
        </div>

        <!-- 设置 -->
        <div class="flex items-center justify-between p-4">
          <div class="flex items-center">
            <i class="fa fa-cog text-gray-500 text-xl mr-3"></i>
            <span>设置</span>
          </div>
          <i class="fa fa-angle-right text-gray-400"></i>
        </div>
      </div>

      <!-- 退出登录按钮 -->
      <button 
        @click="logout"
        class="w-full bg-white text-red-500 py-3 rounded-lg text-lg font-medium"
      >
        退出登录
      </button>
    </div>

    <Bottom class="fixed bottom-0"></Bottom>
  </div>
</template>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.fa {
  width: 24px;
  text-align: center;
}
</style> 