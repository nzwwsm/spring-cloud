import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import BusinessHeader from '../BusinessHeader.vue'

// Mock fetch
global.fetch = vi.fn()

// 创建路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/businessInfo/:id',
      name: 'BusinessInfo',
      component: { template: '<div>BusinessInfo</div>' }
    }
  ]
})

describe('BusinessHeader.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确获取并显示商家信息', async () => {
    const mockBusinessData = [
      {
        id: 1,
        businessName: '测试商家1',
        image: 'base64image1',
        description: '测试描述1',
        score: 4.5,
        deliveryFees: 5,
        miniDeliveryFee: 20,
        monthSold: 15000
      }
    ]

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockBusinessData })
    })

    // 先设置路由，再挂载组件
    await router.push('/businessInfo/1')
    
    const wrapper = mount(BusinessHeader, {
      global: {
        plugins: [router]
      }
    })

    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // 验证商家信息显示
    expect(wrapper.text()).toContain('测试商家1')
    expect(wrapper.text()).toContain('1.5万')
    expect(wrapper.text()).toContain('4.5')
  })

  it('应该正确处理图片base64转换', async () => {
    const mockBusinessData = [
      {
        id: 1,
        businessName: '测试商家1',
        image: 'base64image1',
        description: '测试描述1',
        score: 4.5,
        deliveryFees: 5,
        miniDeliveryFee: 20,
        monthSold: 15000
      }
    ]

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockBusinessData })
    })

    await router.push('/businessInfo/1')
    
    const wrapper = mount(BusinessHeader, {
      global: {
        plugins: [router]
      }
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // 验证图片src包含base64前缀
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toContain('data:image/png;base64,')
  })

  it('应该正确格式化月销量', async () => {
    const mockBusinessData = [
      {
        id: 1,
        businessName: '测试商家1',
        image: 'base64image1',
        description: '测试描述1',
        score: 4.5,
        deliveryFees: 5,
        miniDeliveryFee: 20,
        monthSold: 15000
      }
    ]

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockBusinessData })
    })

    await router.push('/businessInfo/1')
    
    const wrapper = mount(BusinessHeader, {
      global: {
        plugins: [router]
      }
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // 验证月销量格式化
    expect(wrapper.text()).toContain('1.5万')
  })

  it('应该处理获取商家信息失败的情况', async () => {
    ;(fetch as any).mockRejectedValueOnce(new Error('网络错误'))

    await router.push('/businessInfo/1')
    
    const wrapper = mount(BusinessHeader, {
      global: {
        plugins: [router]
      }
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // 验证组件不显示内容（因为business为null）
    expect(wrapper.find('.business-info').exists()).toBe(false)
  })

  it('应该处理商家ID不存在的情况', async () => {
    const mockBusinessData = []

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockBusinessData })
    })

    await router.push('/businessInfo/999')
    
    const wrapper = mount(BusinessHeader, {
      global: {
        plugins: [router]
      }
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // 验证组件不显示内容
    expect(wrapper.find('.business-info').exists()).toBe(false)
  })

  it('应该处理未找到商家的情况', async () => {
    const mockBusinessData = []

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockBusinessData })
    })

    await router.push('/businessInfo/1')
    
    const wrapper = mount(BusinessHeader, {
      global: {
        plugins: [router]
      }
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // 验证组件不显示内容
    expect(wrapper.find('.business-info').exists()).toBe(false)
  })

  it('应该正确处理商家信息更新', async () => {
    const mockBusinessData = [
      {
        id: 1,
        businessName: '测试商家1',
        image: 'base64image1',
        description: '测试描述1',
        score: 4.5,
        deliveryFees: 5,
        miniDeliveryFee: 20,
        monthSold: 15000
      }
    ]

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockBusinessData })
    })

    await router.push('/businessInfo/1')
    
    const wrapper = mount(BusinessHeader, {
      global: {
        plugins: [router]
      }
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // 验证商家信息正确显示
    expect(wrapper.text()).toContain('测试商家1')
  })

  it('应该正确处理商家信息加载失败', async () => {
    ;(fetch as any).mockRejectedValueOnce(new Error('网络错误'))

    await router.push('/businessInfo/1')
    
    const wrapper = mount(BusinessHeader, {
      global: {
        plugins: [router]
      }
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()

    // 验证组件不显示内容
    expect(wrapper.find('.business-info').exists()).toBe(false)
  })
}) 