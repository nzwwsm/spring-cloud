import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import User from '../User.vue'

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock confirm
const mockConfirm = vi.fn()
Object.defineProperty(window, 'confirm', {
  value: mockConfirm
})

const router = createRouter({ 
  history: createWebHistory(), 
  routes: [
    { path: '/login', component: { template: '<div>Login</div>' } },
    { path: '/orderList', component: { template: '<div>OrderList</div>' } },
    { path: '/address', component: { template: '<div>Address</div>' } }
  ] 
})

describe('User.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue('valid-token')
    mockConfirm.mockReturnValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('页面能正常渲染', () => {
    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('应该检查登录状态 - 已登录', async () => {
    mockLocalStorage.getItem.mockReturnValue('valid-token')
    
    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证没有跳转到登录页
    expect(router.currentRoute.value.path).not.toBe('/login')
  })

  it('应该检查登录状态 - 未登录时跳转到登录页', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证跳转到登录页
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('应该成功获取用户信息', async () => {
    const mockUserInfo = {
      username: '测试用户',
      phone: '13800138000',
      avatar: 'avatar.jpg'
    }

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserInfo)
    })

    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证用户信息正确显示
    expect(wrapper.text()).toContain('测试用户')
    expect(wrapper.text()).toContain('13800138000')
  })

  it('应该处理获取用户信息失败', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证错误被记录
    expect(consoleSpy).toHaveBeenCalledWith('获取用户信息失败:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('应该处理网络错误', async () => {
    ;(fetch as any).mockRejectedValueOnce(new Error('网络错误'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证错误被记录
    expect(consoleSpy).toHaveBeenCalledWith('获取用户信息失败:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('应该处理没有token的情况', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)

    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证fetch没有被调用
    expect(fetch).not.toHaveBeenCalled()
  })

  it('应该显示默认用户信息', async () => {
    const mockUserInfo = {
      username: '',
      phone: '',
      avatar: ''
    }

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserInfo)
    })

    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证显示默认信息
    expect(wrapper.text()).toContain('未设置昵称')
    expect(wrapper.text()).toContain('未绑定手机号')
  })

  it('应该显示用户头像', async () => {
    const mockUserInfo = {
      username: '测试用户',
      phone: '13800138000',
      avatar: 'avatar.jpg'
    }

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserInfo)
    })

    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证头像显示
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('avatar.jpg')
  })

  it('应该显示默认头像图标', async () => {
    const mockUserInfo = {
      username: '测试用户',
      phone: '13800138000',
      avatar: ''
    }

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserInfo)
    })

    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证显示默认头像图标
    const icon = wrapper.find('.fa-user')
    expect(icon.exists()).toBe(true)
  })

  it('应该处理退出登录 - 用户确认', async () => {
    mockConfirm.mockReturnValue(true)

    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    // 点击退出登录按钮
    const logoutButton = wrapper.find('button')
    await logoutButton.trigger('click')

    // 验证确认对话框被调用
    expect(mockConfirm).toHaveBeenCalledWith('确定要退出登录吗？')
    
    // 验证token被删除
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
    
    // 验证跳转到登录页
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('应该处理退出登录 - 用户取消', async () => {
    mockConfirm.mockReturnValue(false)

    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    // 点击退出登录按钮
    const logoutButton = wrapper.find('button')
    await logoutButton.trigger('click')

    // 验证确认对话框被调用
    expect(mockConfirm).toHaveBeenCalledWith('确定要退出登录吗？')
    
    // 验证token没有被删除
    expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
  })

  it('应该跳转到订单列表页面', async () => {
    // 模拟用户信息获取成功
    const mockUserInfo = {
      username: '测试用户',
      phone: '13800138000',
      avatar: 'avatar.jpg'
    }

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserInfo)
    })

    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // 点击我的订单
    const orderItems = wrapper.findAll('.flex.items-center.justify-between')
    await orderItems[0].trigger('click')
    await flushPromises()

    // 验证路由跳转
    expect(router.currentRoute.value.path).toBe('/orderList')
  })

  it('应该跳转到收货地址页面', async () => {
    // 模拟用户信息获取成功
    const mockUserInfo = {
      username: '测试用户',
      phone: '13800138000',
      avatar: 'avatar.jpg'
    }

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserInfo)
    })

    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // 点击收货地址
    const orderItems = wrapper.findAll('.flex.items-center.justify-between')
    await orderItems[1].trigger('click')
    await flushPromises()

    // 验证路由跳转
    expect(router.currentRoute.value.path).toBe('/address')
  })

  it('应该显示所有功能菜单项', async () => {
    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    // 验证所有菜单项都存在
    expect(wrapper.text()).toContain('我的订单')
    expect(wrapper.text()).toContain('收货地址')
    expect(wrapper.text()).toContain('联系客服')
    expect(wrapper.text()).toContain('设置')
    expect(wrapper.text()).toContain('退出登录')
  })

  it('应该显示正确的图标', async () => {
    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    // 验证图标存在
    expect(wrapper.find('.fa-list-alt').exists()).toBe(true)
    expect(wrapper.find('.fa-map-marker').exists()).toBe(true)
    expect(wrapper.find('.fa-headphones').exists()).toBe(true)
    expect(wrapper.find('.fa-cog').exists()).toBe(true)
  })

  it('应该处理组件挂载时的逻辑', async () => {
    const mockUserInfo = {
      username: '测试用户',
      phone: '13800138000',
      avatar: 'avatar.jpg'
    }

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserInfo)
    })

    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证fetch被调用
    expect(fetch).toHaveBeenCalledWith('/api/user/info', {
      headers: {
        'Authorization': 'valid-token'
      }
    })

    // 验证用户信息被设置
    const vm = wrapper.vm as any
    expect(vm.userInfo).toEqual(mockUserInfo)
  })

  it('应该处理JSON解析错误', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('JSON解析错误'))
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const wrapper = mount(User, {
      global: { plugins: [createPinia(), router] }
    })

    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证错误被记录
    expect(consoleSpy).toHaveBeenCalledWith('获取用户信息失败:', expect.any(Error))

    consoleSpy.mockRestore()
  })
}) 