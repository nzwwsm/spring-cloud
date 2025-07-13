import { defineStore } from 'pinia'

interface CartItem {
  id: number
  commodityName: string
  price: number
  quantity: number
  image: string
}

interface OrderInfo {
  businessId: number | null
  items: CartItem[]
  totalPrice: number
  createTime: string
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    businessId: null as number | null,
    currentOrder: null as OrderInfo | null,
  }),

  getters: {
    totalPrice: (state) => {
      return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
    },
    totalQuantity: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    }
  },

  actions: {
    addItem(item: CartItem) {
      const existingItem = this.items.find(i => i.id === item.id)
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({ ...item, quantity: 1 })
      }
    },

    removeItem(itemId: number) {
      const existingItem = this.items.find(i => i.id === itemId)
      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity--
        } else {
          this.items = this.items.filter(i => i.id !== itemId)
        }
      }
    },

    setBusinessId(id: number) {
      this.businessId = id
    },

    clearCart() {
      this.items = []
      this.businessId = null
    },

    // 创建订单
    createOrder() {
      if (this.items.length === 0 || !this.businessId) {
        return null
      }

      this.currentOrder = {
        businessId: this.businessId,
        items: [...this.items],
        totalPrice: this.totalPrice,
        createTime: new Date().toISOString()
      }

      return this.currentOrder
    },

    // 获取当前订单
    getCurrentOrder() {
      return this.currentOrder
    },

    // 清除当前订单
    clearCurrentOrder() {
      this.currentOrder = null
    }
  }
})