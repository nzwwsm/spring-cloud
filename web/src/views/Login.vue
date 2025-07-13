<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { ElMessage } from 'element-plus'
import { login } from '@/api/auth'
import axios from 'axios'
import { JSEncrypt } from 'jsencrypt'
import { API_URLS } from '@/config/api'

const router = useRouter()

const loginForm = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const errorMsg = ref('')
const publicKey = ref('')

// 页面加载时获取公钥
onMounted(async () => {
  try {
    const res = await axios.get(API_URLS.authRsaPublicKey())
    publicKey.value = res.data.data.publicKey
  } catch (e) {
    errorMsg.value = '获取公钥失败'
  }
})

const validateForm = () => {
  if (!loginForm.value.username.trim()) {
    errorMsg.value = '请输入用户名'
    return false
  }
  if (!loginForm.value.password.trim()) {
    errorMsg.value = '请输入密码'
    return false
  }
  return true
}

const handleLogin = async () => {
  try {
    if (!validateForm()) return

    loading.value = true
    errorMsg.value = ''
    
    // 用公钥加密用户名和密码
    if (!publicKey.value) {
      errorMsg.value = '公钥未获取，无法加密登录信息'
      loading.value = false
      return
    }
    const encrypt = new JSEncrypt()
    encrypt.setPublicKey(publicKey.value)
    const encryptedUsername = encrypt.encrypt(loginForm.value.username)
    const encryptedPassword = encrypt.encrypt(loginForm.value.password)
    if (!encryptedUsername || !encryptedPassword) {
      errorMsg.value = '加密失败，请重试'
      loading.value = false
      return
    }
    // 调用原有login方法，传加密后的数据
    const response = await (await login({
      username: encryptedUsername,
      password: encryptedPassword
    })).data
    console.log('登录响应数据:', response)
 // 检查响应状态
    if (!response) {
      throw new Error('登录请求失败')
    }


    // 检查响应数据
    let token = ''
    const data = response
    console.log('data响应数据:', data)
    // 处理新的响应格式
    if (data && typeof data === 'string') {
      token = data
    }

    console.log('解析的token:', token)

    if (!token) {
      throw new Error('登录请求失败')
    }

    // 存储token
    localStorage.setItem('token', token)
    console.log('Token已存储:', {
      token: token.substring(0, 10) + '...',
      length: token.length
    })

    // 验证token是否正确存储
    const storedToken = localStorage.getItem('token')
    console.log('验证存储的token:', {
      token: storedToken?.substring(0, 10) + '...',
      length: storedToken?.length,
      isMatch: storedToken === token
    })

    // 可以添加提示信息
    ElMessage.success('登录成功')

    // 登录成功后跳转
    router.push('/')
  } catch (error: any) {
    console.error('登录失败:', error)
    errorMsg.value = error.message || '登录请求失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部标题栏 -->
    <div class="bg-blue-400 text-white text-center py-4 text-lg">
      用户登录
    </div>
    
    <!-- 登录表单 -->
    <div class="px-4 py-5">
      <div class="space-y-4">
        <!-- 手机号输入框 -->
        <div>
          <input
            v-model.trim="loginForm.username"
            type="text"
            placeholder="用户名"
            class="w-full px-3 py-3 border border-gray-200 rounded-md text-base focus:outline-none focus:border-blue-400"
          >
        </div>
        
        <!-- 密码输入框 -->
        <div>
          <input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            class="w-full px-3 py-3 border border-gray-200 rounded-md text-base focus:outline-none focus:border-blue-400"
          >
        </div>

        <!-- 错误信息 -->
        <div v-if="errorMsg" class="text-red-500 text-center text-sm">
          {{ errorMsg }}
        </div>

        <!-- 登录按钮 -->
        <button
          @click="handleLogin"
          :disabled="loading"
          class="w-full py-3 bg-green-500 text-white rounded-md text-base mt-6 disabled:opacity-50"
        >
          {{ loading ? '登录中...' : '登陆' }}
        </button>

        <!-- 注册链接 -->
        <div 
          class="mt-4 text-center py-3 bg-gray-100 rounded-md"
        >
          <a href="/register" class="text-gray-600">去注册</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>