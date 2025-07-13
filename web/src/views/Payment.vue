<script setup lang="ts">

import Bottom from "@/components/bottom.vue";
import PaymentCom from "@/components/PaymentCom.vue";

</script>

<template>
  <div class = "bg-blue-4 h-7% w-full flex justify-center items-center fixed top-0 left-0 z-1000">
    <h1 class="text-center text-1.5xl color-white">在线支付</h1>
  </div>
  <PaymentCom class="mt-10"></PaymentCom>
  <bottom class="fixed bottom-0"></bottom>
</template>

<style scoped>

</style>