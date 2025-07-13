import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import BusinessBottom from '../BusinessBottom.vue'
import { useCartStore } from '../../stores/cart'
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../stores/cart', () => ({
  useCartStore: vi.fn()
}))

describe('BusinessBottom.vue', () => {
  const router = createRouter({ 
    history: createWebHistory(), 
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/order', component: { template: '<div>Order</div>' } }
    ] 
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    window.alert = vi.fn()
    vi.mocked(useCartStore).mockReturnValue({
      totalQuantity: 0,
      totalPrice: 0,
      createOrder: () => null,
    } as any)
  })

  it('组件能正常渲染', () => {
    const wrapper = mount(BusinessBottom, { 
      global: { 
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true
        }
      } 
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('购物车有商品时点击结算跳转到/order', async () => {
    vi.mocked(useCartStore).mockReturnValue({
      totalQuantity: 1,
      totalPrice: 10,
      createOrder: () => ({}),
    } as any)
    const push = vi.fn()
    router.push = push
    const wrapper = mount(BusinessBottom, { 
      global: { 
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true
        }
      } 
    })
    await wrapper.find('button').trigger('click')
    expect(push).toHaveBeenCalledWith('/order')
  })

  it('购物车无商品时结算按钮禁用', () => {
    const wrapper = mount(BusinessBottom, { 
      global: { 
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true
        }
      } 
    })
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('创建订单失败时弹窗提示', async () => {
    vi.mocked(useCartStore).mockReturnValue({
      totalQuantity: 1,
      totalPrice: 10,
      createOrder: () => null,
    } as any)
    const wrapper = mount(BusinessBottom, { 
      global: { 
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true
        }
      } 
    })
    await wrapper.find('button').trigger('click')
    expect(window.alert).toHaveBeenCalledWith('创建订单失败，请重试')
  })
}) 