<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const form = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

// 表单验证
const validateForm = () => {
  if (!form.value.username) {
    ElMessage.error('请输入用户名')
    return false
  }
  if (!form.value.password) {
    ElMessage.error('请输入密码')
    return false
  }
  if (form.value.password !== form.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return false
  }
  return true
}

// 提交注册
const handleRegister = async () => {
  if (!validateForm()) return
  
  try {
    loading.value = true
    await register({
      username: form.value.username,
      password: form.value.password
    })
    
    ElMessage.success('注册成功')
    router.push('/login')
  } catch (error: any) {
    ElMessage.error(error.message || '注册失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="h-full bg-white flex-col">
    <!-- 标题 -->
    <div class="bg-blue-4 h-8% w-full flex justify-center items-center">
      <h1 class="text-center text-2xl color-white">用户注册</h1>
    </div>

    <!-- 注册表单 -->
    <div class="flex-1 flex items-start justify-center mt-8">
      <div class="w-25em px-8">
        <el-form :model="form">
          <!-- 用户名 -->
          <div class="mb-1 text-3.5">用户名:</div>
          <el-form-item>
            <el-input
              v-model="form.username"
              placeholder="用户名"
              prefix-icon="Phone"
            />
          </el-form-item>

          <!-- 密码 -->
          <div class="mb-1 text-3.5">密码:</div>
          <el-form-item>
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <!-- 确认密码 -->
          <div class="mb-1 text-3.5">确认密码:</div>
          <el-form-item>
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="输入密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <!-- 性别 -->
          <div class="mb-1 text-3.5">性别:</div>
          <el-form-item>
            <el-radio-group  class="flex justify-center">
              <el-radio label="男">男</el-radio>
              <el-radio label="女">女</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 注册按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              class="w-full"
              @click="handleRegister"
            >
              注册
            </el-button>
          </el-form-item>

          <!-- 返回登录 -->
          <el-form-item>
            <el-button
              type="primary"
              class="w-full"
              @click="router.push('/login')"
            >
              返回登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-blue-4 {
  background-color: #2395ff;
}
</style>