<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface FoodType {
  typeName: string;
  image: string;
}

const foodTypes = ref<FoodType[]>([]);

// base64 转换为 Blob
const base64ToBlob = (base64String: string) => {
  // 去掉 data URI 前缀
  const base64 = base64String.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
  
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/png' });
}

// 获取食物类型列表
const getFoodTypes = async () => {
  try {
    const response = await fetch('http://localhost:80/api/foodtype/foodTypeList');
    const rawData = await response.text();
    try {
      const data = JSON.parse(rawData)["data"];
      // 处理每个食物类型的图片
      foodTypes.value = data.map((item: any) => ({
        typeName: item.name,
        image: item.img.startsWith('data:image') ? 
          item.img : 
          `data:image/png;base64,${item.img}`
      }));
    } catch (parseError) {
      console.error('解析数据失败:', rawData);
      console.error('解析错误:', parseError);
    }
  } catch (error) {
    console.error('获取食物类型失败:', error);
  }
};


// 组件挂载时获取数据
onMounted(() => {
  getFoodTypes();
});
</script>

<template>
  <div class="food-type-container">
    <div v-for="type in foodTypes" 
         :key="type.typeName" 
         class="food-type-item"
         onclick="location.href='businessList'">
      <img :src="type.image" :alt="type.typeName">
      <span>{{ type.typeName }}</span>
    </div>
  </div>
</template>

<style scoped>
.food-type-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  padding: 16px;
}

.food-type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.food-type-item img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  margin-bottom: 8px;
}

.food-type-item span {
  font-size: 10px;
  color: #333;
}
</style>