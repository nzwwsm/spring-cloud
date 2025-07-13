<script setup lang="ts">



import Bottom from "@/components/bottom.vue";
import HomeTop from "@/components/HomeTop.vue";
import Banner from "@/components/Banner.vue";
import SuperMember from "@/components/SuperMember.vue";
import Recommend from "@/components/Recommend.vue";
import FoodType from "@/components/FoodType.vue";
import Business from "@/components/Business.vue";
</script>

<template>
  <div>
    <HomeTop class="w-full fixed top-0"></HomeTop>
    <div>
       <FoodType class="mt-22"></FoodType>
       <Banner></Banner>
       <SuperMember></SuperMember>
       <Recommend></Recommend>
       <Business class="pb-14"></Business>
    </div>
     <bottom class="fixed bottom-0"></bottom>
  </div>
</template>

<style scoped>

</style>