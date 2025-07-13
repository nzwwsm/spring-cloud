import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../../views/Login.vue'
import { ElMessage } from 'element-plus'

// Mock element-plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock JSEncrypt
vi.mock('jsencrypt', () => ({
  JSEncrypt: vi.fn().mockImplementation(() => ({
    setPublicKey: vi.fn(),
    encrypt: vi.fn().mockReturnValue('encrypted-data')
  }))
}))

// Mock auth module
vi.mock('../../api/auth', () => ({
  login: vi.fn()
}))

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn()
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// 创建一个存储对象来模拟localStorage的行为
const storage: Record<string, string> = {}

// 设置mock实现
localStorageMock.getItem.mockImplementation((key: string) => {
  return storage[key] || null
})

localStorageMock.setItem.mockImplementation((key: string, value: string) => {
  storage[key] = value
})

localStorageMock.removeItem.mockImplementation((key: string) => {
  delete storage[key]
})

localStorageMock.clear.mockImplementation(() => {
  Object.keys(storage).forEach(key => delete storage[key])
})

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/login', component: Login }
  ]
})

describe('Login.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 清理localStorage存储
    Object.keys(storage).forEach(key => delete storage[key])
  })

  it('应该正确处理登录成功 - 字符串token', async () => {
    const mockPublicKey = 'mock-public-key'
    const mockToken = 'mock-token'

    // Mock axios.get for public key
    const axios = await import('axios')
    ;(axios.default.get as any).mockResolvedValueOnce({
      data: { data: { publicKey: mockPublicKey } }
    })

    // Mock auth.login
    const auth = await import('../../api/auth')
    ;(auth.login as any).mockResolvedValueOnce({
      data: mockToken
    })

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 等待组件挂载和公钥获取
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 设置表单数据
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpass')
    
    // 点击登录按钮
    await wrapper.find('button').trigger('click')
    
    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await flushPromises()
    
    // 验证结果
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken)
    expect(ElMessage.success).toHaveBeenCalledWith('登录成功')
  })

  it('应该正确处理登录成功 - 对象token', async () => {
    const mockPublicKey = 'mock-public-key'
    const mockToken = 'mock-token'

    // Mock axios.get for public key
    const axios = await import('axios')
    ;(axios.default.get as any).mockResolvedValueOnce({
      data: { data: { publicKey: mockPublicKey } }
    })

    // Mock auth.login - 组件只处理字符串token，所以直接返回字符串
    const auth = await import('../../api/auth')
    ;(auth.login as any).mockResolvedValueOnce({
      data: mockToken
    })

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 等待组件挂载和公钥获取
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 设置表单数据
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpass')
    
    // 点击登录按钮
    await wrapper.find('button').trigger('click')
    
    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await flushPromises()
    
    // 验证结果
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken)
    expect(ElMessage.success).toHaveBeenCalledWith('登录成功')
  })

  it('应该处理401错误', async () => {
    const mockPublicKey = 'mock-public-key'

    // Mock axios.get for public key
    const axios = await import('axios')
    ;(axios.default.get as any).mockResolvedValueOnce({
      data: { data: { publicKey: mockPublicKey } }
    })

    // Mock auth.login with 401 error - 需要设置error.message
    const auth = await import('../../api/auth')
    const error = new Error('用户名或密码错误')
    ;(auth.login as any).mockRejectedValueOnce(error)

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 等待组件挂载和公钥获取
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 设置表单数据
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpass')
    
    // 点击登录按钮
    await wrapper.find('button').trigger('click')

    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await flushPromises()
    
    // 验证结果
    expect((wrapper.vm as any).errorMsg).toBe('用户名或密码错误')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
  })

  it('应该处理404错误', async () => {
    const mockPublicKey = 'mock-public-key'

    // Mock axios.get for public key
    const axios = await import('axios')
    ;(axios.default.get as any).mockResolvedValueOnce({
      data: { data: { publicKey: mockPublicKey } }
    })

    // Mock auth.login with 404 error - 需要设置error.message
    const auth = await import('../../api/auth')
    const error = new Error('接口不存在')
    ;(auth.login as any).mockRejectedValueOnce(error)

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 等待组件挂载和公钥获取
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 设置表单数据
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpass')
    
    // 点击登录按钮
    await wrapper.find('button').trigger('click')

    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await flushPromises()
    
    // 验证结果
    expect((wrapper.vm as any).errorMsg).toBe('接口不存在')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
  })

  it('应该处理网络错误', async () => {
    const mockPublicKey = 'mock-public-key'

    // Mock axios.get for public key
    const axios = await import('axios')
    ;(axios.default.get as any).mockResolvedValueOnce({
      data: { data: { publicKey: mockPublicKey } }
    })

    // Mock auth.login with network error
    const auth = await import('../../api/auth')
    ;(auth.login as any).mockRejectedValueOnce(new Error('网络错误'))

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 等待组件挂载和公钥获取
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 设置表单数据
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpass')
    
    // 点击登录按钮
    await wrapper.find('button').trigger('click')

    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await flushPromises()
    
    // 验证结果
    expect((wrapper.vm as any).errorMsg).toBe('网络错误')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
  })

  it('应该处理无效的响应数据', async () => {
    const mockPublicKey = 'mock-public-key'

    // Mock axios.get for public key
    const axios = await import('axios')
    ;(axios.default.get as any).mockResolvedValueOnce({
      data: { data: { publicKey: mockPublicKey } }
    })

    // Mock auth.login with invalid response
    const auth = await import('../../api/auth')
    ;(auth.login as any).mockResolvedValueOnce({
      data: null
    })

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 等待组件挂载和公钥获取
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 设置表单数据
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpass')

    // 点击登录按钮
    await wrapper.find('button').trigger('click')

    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证结果
    expect((wrapper.vm as any).errorMsg).toBe('登录请求失败')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
  })

  it('应该处理公钥获取失败', async () => {
    // Mock axios.get for public key failure
    const axios = await import('axios')
    ;(axios.default.get as any).mockRejectedValueOnce(new Error('网络错误'))

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 等待组件挂载和公钥获取
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证错误信息
    expect((wrapper.vm as any).errorMsg).toBe('获取公钥失败')
  })

  it('应该验证表单 - 用户名为空', async () => {
    const mockPublicKey = 'mock-public-key'

    // Mock axios.get for public key
    const axios = await import('axios')
    ;(axios.default.get as any).mockResolvedValueOnce({
      data: { data: { publicKey: mockPublicKey } }
    })

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 等待组件挂载和公钥获取
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 只设置密码，不设置用户名
    await wrapper.find('input[type="password"]').setValue('testpass')

    // 点击登录按钮
    await wrapper.find('button').trigger('click')

    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证结果
    expect((wrapper.vm as any).errorMsg).toBe('请输入用户名')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
  })

  it('应该验证表单 - 密码为空', async () => {
    const mockPublicKey = 'mock-public-key'

    // Mock axios.get for public key
    const axios = await import('axios')
    ;(axios.default.get as any).mockResolvedValueOnce({
      data: { data: { publicKey: mockPublicKey } }
    })

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 等待组件挂载和公钥获取
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 只设置用户名，不设置密码
    await wrapper.find('input[type="text"]').setValue('testuser')

    // 点击登录按钮
    await wrapper.find('button').trigger('click')

    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证结果
    expect((wrapper.vm as any).errorMsg).toBe('请输入密码')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
  })

  it('应该验证表单 - 用户名和密码都为空', async () => {
    const mockPublicKey = 'mock-public-key'

    // Mock axios.get for public key
    const axios = await import('axios')
    ;(axios.default.get as any).mockResolvedValueOnce({
      data: { data: { publicKey: mockPublicKey } }
    })

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 等待组件挂载和公钥获取
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 不设置任何表单数据
    await wrapper.find('button').trigger('click')

    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证结果 - 应该显示第一个验证错误（用户名）
    expect((wrapper.vm as any).errorMsg).toBe('请输入用户名')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
  })

  it('应该处理公钥未获取的情况', async () => {
    // Mock axios.get for public key failure
    const axios = await import('axios')
    ;(axios.default.get as any).mockRejectedValueOnce(new Error('网络错误'))

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 等待组件挂载和公钥获取
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 设置表单数据
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpass')

    // 点击登录按钮
    await wrapper.find('button').trigger('click')

    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证结果
    expect((wrapper.vm as any).errorMsg).toBe('公钥未获取，无法加密登录信息')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
  })

  it('应该处理加密失败的情况', async () => {
    const mockPublicKey = 'mock-public-key'
    // Mock axios.get for public key
    const axios = await import('axios')
    ;(axios.default.get as any).mockResolvedValueOnce({
      data: { data: { publicKey: mockPublicKey } }
    })
    // Mock JSEncrypt 返回 null，确保加密失败
    const jsencryptModule = await import('jsencrypt')
    const originalJSEncrypt = jsencryptModule.JSEncrypt
    const mockJSEncrypt = vi.fn().mockImplementation(() => ({
      setPublicKey: vi.fn(),
      encrypt: vi.fn().mockReturnValue(null)
    })) as any
    mockJSEncrypt.version = originalJSEncrypt.version
    jsencryptModule.JSEncrypt = mockJSEncrypt
    // Mock login 不应被调用
    const auth = await import('../../api/auth')
    ;(auth.login as any).mockImplementation(() => { throw new Error('login should not be called') })
    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpass')
    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect((wrapper.vm as any).errorMsg).toBe('加密失败，请重试')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
    jsencryptModule.JSEncrypt = originalJSEncrypt
  })

  it('应该处理用户名加密失败的情况', async () => {
    const mockPublicKey = 'mock-public-key'

    // Mock axios.get for public key
    const axios = await import('axios')
    ;(axios.default.get as any).mockResolvedValueOnce({
      data: { data: { publicKey: mockPublicKey } }
    })

    // Mock JSEncrypt to return null for username encryption only
    const { JSEncrypt } = await import('jsencrypt')
    ;(JSEncrypt as any).mockImplementation(() => ({
      setPublicKey: vi.fn(),
      encrypt: vi.fn()
        .mockReturnValueOnce(null) // 用户名加密失败
        .mockReturnValueOnce('encrypted-password') // 密码加密成功
    }))

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 等待组件挂载和公钥获取
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 设置表单数据
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpass')

    // 点击登录按钮
    await wrapper.find('button').trigger('click')

    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证结果
    expect((wrapper.vm as any).errorMsg).toBe('加密失败，请重试')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
  })

  it('应该处理密码加密失败的情况', async () => {
    const mockPublicKey = 'mock-public-key'

    // Mock axios.get for public key
    const axios = await import('axios')
    ;(axios.default.get as any).mockResolvedValueOnce({
      data: { data: { publicKey: mockPublicKey } }
    })

    // Mock JSEncrypt to return null for password encryption only
    const { JSEncrypt } = await import('jsencrypt')
    ;(JSEncrypt as any).mockImplementation(() => ({
      setPublicKey: vi.fn(),
      encrypt: vi.fn()
        .mockReturnValueOnce('encrypted-username') // 用户名加密成功
        .mockReturnValueOnce(null) // 密码加密失败
    }))

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 等待组件挂载和公钥获取
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 设置表单数据
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpass')

    // 点击登录按钮
    await wrapper.find('button').trigger('click')

    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证结果
    expect((wrapper.vm as any).errorMsg).toBe('加密失败，请重试')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
  })

  it('应该处理空token的情况', async () => {
    const mockPublicKey = 'mock-public-key'

    // Mock axios.get for public key
    const axios = await import('axios')
    ;(axios.default.get as any).mockResolvedValueOnce({
      data: { data: { publicKey: mockPublicKey } }
    })

    // Mock auth.login with empty token
    const auth = await import('../../api/auth')
    ;(auth.login as any).mockResolvedValueOnce({
        data: ''
    })

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 等待组件挂载和公钥获取
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 设置表单数据
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpass')
    
    // 点击登录按钮
    await wrapper.find('button').trigger('click')

    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证结果
    expect((wrapper.vm as any).errorMsg).toBe('加密失败，请重试')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
  })

  it('应该处理表单验证 - 用户名只有空格', async () => {
    const mockPublicKey = 'mock-public-key'

    // Mock axios.get for public key
    const axios = await import('axios')
    ;(axios.default.get as any).mockResolvedValueOnce({
      data: { data: { publicKey: mockPublicKey } }
    })

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 等待组件挂载和公钥获取
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 设置用户名只有空格
    await wrapper.find('input[type="text"]').setValue('   ')
    await wrapper.find('input[type="password"]').setValue('testpass')

    // 点击登录按钮
    await wrapper.find('button').trigger('click')

    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 验证结果
    expect((wrapper.vm as any).errorMsg).toBe('请输入用户名')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
  })

  it('应该处理表单验证 - 密码只有空格', async () => {
    const mockPublicKey = 'mock-public-key'

    // Mock axios.get for public key
    const axios = await import('axios')
    ;(axios.default.get as any).mockResolvedValueOnce({
      data: { data: { publicKey: mockPublicKey } }
    })

    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })

    // 等待组件挂载和公钥获取
    await wrapper.vm.$nextTick()
    await flushPromises()

    // 设置密码只有空格
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('   ')

    // 点击登录按钮
    await wrapper.find('button').trigger('click')

    // 等待异步操作完成
    await wrapper.vm.$nextTick()
    await flushPromises()
    
    // 验证结果
    expect((wrapper.vm as any).errorMsg).toBe('请输入密码')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
  })

  it('应该处理错误对象没有message属性的情况', async () => {
    const mockPublicKey = 'mock-public-key'
    // Mock axios.get for public key
    const axios = await import('axios')
    ;(axios.default.get as any).mockResolvedValueOnce({
      data: { data: { publicKey: mockPublicKey } }
    })
    // Mock JSEncrypt 返回 null，确保加密失败
    const jsencryptModule = await import('jsencrypt')
    const originalJSEncrypt = jsencryptModule.JSEncrypt
    const mockJSEncrypt = Object.assign(
      vi.fn().mockImplementation(() => ({
        setPublicKey: vi.fn(),
        encrypt: vi.fn().mockReturnValue(null)
      })),
      { version: originalJSEncrypt.version }
    )
    jsencryptModule.JSEncrypt = mockJSEncrypt
    const wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })
    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpass')
    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect((wrapper.vm as any).errorMsg).toBe('加密失败，请重试')
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
    // 恢复JSEncrypt mock
    jsencryptModule.JSEncrypt = originalJSEncrypt
  })
}) 