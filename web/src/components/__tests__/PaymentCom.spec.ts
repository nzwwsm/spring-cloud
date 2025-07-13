import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import PaymentCom from '../PaymentCom.vue'
import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
import { nextTick } from 'vue'

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// mock window.location.assign
beforeAll(() => {
  Object.defineProperty(window, 'location', {
    value: {
      ...window.location,
      assign: vi.fn()
    },
    writable: true
  })
})

describe('PaymentCom.vue', () => {
  const mockOrderItems = [
    { name: '纯肉饺子（水饺）', quantity: 2, price: 15 },
    { name: '玉米鲜肉（水饺）', quantity: 1, price: 16 }
  ]

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/order/:id', component: { template: '<div>Order Detail</div>' } }
    ]
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    window.alert = vi.fn()
    localStorageMock.getItem.mockReturnValue('fake-token')
    window.location.assign = vi.fn()
  })

  it('组件能正常渲染', () => {
    const wrapper = mount(PaymentCom, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('显示正确的订单信息', () => {
    const wrapper = mount(PaymentCom, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true
        }
      }
    })

    expect(wrapper.text()).toContain('纯肉饺子（水饺）')
    expect(wrapper.text()).toContain('玉米鲜肉（水饺）')
    expect(wrapper.text()).toContain('¥49')
  })

  it('计算正确的订单总价', () => {
    const wrapper = mount(PaymentCom, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true
        }
      }
    })

    expect(wrapper.text()).toContain('¥49')
  })

  it('切换订单详情显示状态', async () => {
    const wrapper = mount(PaymentCom, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true
        }
      }
    })

    const detailsButton = wrapper.find('.flex.justify-between.items-center.mb-4.cursor-pointer')
    await detailsButton.trigger('click')
    expect(wrapper.find('.space-y-2').isVisible()).toBe(false)
  })

  it('切换支付方式', async () => {
    const wrapper = mount(PaymentCom, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true
        }
      }
    })

    const wechatPayment = wrapper.findAll('.flex.items-center.justify-between.cursor-pointer').at(1)
    await wechatPayment?.trigger('click')
    const wechatRadio = wrapper.find('.w-5.h-5.rounded-full.border-2.border-gray-300')
    expect(wechatRadio.classes()).toContain('border-green-500')
  })

  it('支付按钮在订单为空时禁用', () => {
    const wrapper = mount(PaymentCom, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true
        }
      },
      data() {
        return {
          orderItems: []
        }
      }
    })

    const payButton = wrapper.find('button')
    expect(payButton.classes()).toContain('disabled:opacity-50')
  })

  it('支付按钮在支付中时禁用', () => {
    const wrapper = mount(PaymentCom, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true
        }
      },
      data() {
        return {
          isPaying: true
        }
      }
    })

    const payButton = wrapper.find('button')
    expect(payButton.classes()).toContain('disabled:opacity-50')
  })

  it('支付成功时跳转到订单详情页', async () => {
    const mockOrderId = '12345'
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ success: true, orderId: mockOrderId })
    }
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

    const wrapper = mount(PaymentCom, {
      global: {
        plugins: [router, createPinia()],
        stubs: { 'router-link': true }
      }
    })

    const payButton = wrapper.find('button')
    await payButton.trigger('click')
    
    // 等待所有异步操作完成
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(window.location.assign).toHaveBeenCalledWith(`/order/${mockOrderId}`)
  })

  it('支付失败时显示错误信息', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false
    } as unknown as Response)

    const assignSpy = vi.spyOn(window.location, 'assign')

    const wrapper = mount(PaymentCom, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true
        }
      }
    })

    const payButton = wrapper.find('button')
    await payButton.trigger('click')
    expect(window.alert).toHaveBeenCalledWith('支付失败，请重试')
    expect(assignSpy).not.toHaveBeenCalled()
  })

  it('未登录时支付失败', async () => {
    localStorageMock.getItem.mockReturnValue(null)

    const wrapper = mount(PaymentCom, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true
        }
      }
    })

    const payButton = wrapper.find('button')
    await payButton.trigger('click')
    expect(window.alert).toHaveBeenCalledWith('支付失败，请重试')
  })

  it('显示支付中状态', async () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({ success: true, orderId: '1' }) } as unknown as Response), 100)))
    const wrapper = mount(PaymentCom, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true
        }
      }
    })
    const payButton = wrapper.find('button')
    await payButton.trigger('click')
    // 立即断言"支付中..."
    expect(payButton.text().trim()).toBe('支付中...')
  })
}) 