<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToUser = () => {
  const token = localStorage.getItem('token')
  if (token) {
    router.push('/user')
  } else {
    router.push('/login')
  }
}
</script>

<template>
  <ul class="bg-#fff w-full h-8% flex justify-around items-center border-t-#DDD b-1px fixed">
    <li onclick="location.href='/main'" class=" flex-col justify-center items-center color-#999">
      <i class="fa fa-home " ></i>
      <p class="text-2.8vw">首页</p>
    </li>
    <li class=" flex-col justify-center items-center color-#999">
      <i class="fa fa-compass"></i>
      <p class="text-2.8vw">发现</p>
    </li>
    <li onclick="location.href='/orderList'" class=" flex-col justify-center items-center color-#999">
      <i class="fa fa-file-text-o"></i>
      <p class="text-2.8vw">订单</p>
    </li>
    <li @click="goToUser" class=" flex-col justify-center items-center color-#999">
      <i class="fa fa-user-o"></i>
      <p class="text-2.8vw">我的</p>
    </li>
  </ul>

</template>

<style scoped>
.fa {
  width: 24px;
  text-align: center;
}
</style>