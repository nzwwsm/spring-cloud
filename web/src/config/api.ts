// API配置文件 - 微服务端点管理
export const API_CONFIG = {
  // 微服务端口配置（仅文档注释，不参与实际请求）
  GATEWAY_SERVICE: '',
  AUTH_SERVICE: '',
  BUSINESS_SERVICE: '',
  ORDER_SERVICE: '',
  USER_SERVICE: '',
  
  // API端点配置
  ENDPOINTS: {
    // 认证相关
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      RSA_PUBLIC_KEY: '/auth/rsa-public-key',
    },
    
    // 商家相关
    BUSINESS: {
      LIST: '/business/list',
      ITEM_LIST: '/business/itemList',
      BY_ID: '/business',
    },
    
    // 商品相关
    COMMODITY: {
      BY_ID: '/commodity',
    },
    
    // 食品类型相关
    FOOD_TYPE: {
      LIST: '/foodtype/foodTypeList',
    },
    
    // 订单相关
    ORDER: {
      CREATE: '/order/create',
      PAYED: '/order/payed',
      UNPAY: '/order/unpay',
    },
    
    // 用户相关
    USER: {
      INFO: '/user/info',
    },
  }
}

// 获取完整的API URL
export const getApiUrl = (service: keyof typeof API_CONFIG, endpoint: string): string => {
  const baseUrl = API_CONFIG[service]
  return `${baseUrl}${endpoint}`
}

// 常用API URL快捷方法
export const BASE_URL = 'http://localhost:80/api';

export const API_URLS = {
  // 认证服务
  authLogin: () => `${BASE_URL}/auth/login`,
  authRegister: () => `${BASE_URL}/user/register`,
  authRsaPublicKey: () => `${BASE_URL}/auth/rsa-public-key`,

  // 商家服务
  businessList: () => `${BASE_URL}/business/list`,
  businessItemList: (id: number) => `${BASE_URL}/business/itemList?id=${id}`,
  businessById: (id: number) => `${BASE_URL}/business/${id}`,

  // 食品类型服务
  foodTypeList: () => `${BASE_URL}/foodtype/foodTypeList`,

  // 订单服务
  orderCreate: () => `${BASE_URL}/order/create`,
  orderPayed: () => `${BASE_URL}/user/payedorder`,
  orderUnpay: () => `${BASE_URL}/user/unpayorder`,

  // 用户服务
  userInfo: () => `${BASE_URL}/user/info`,
}; 