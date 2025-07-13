import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Register from '../Register.vue'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { register } from '../../api/auth'
import { ElMessage } from 'element-plus'
import type { AxiosResponse } from 'axios'

interface LoginResponse {
  token: string
}

// Mock API calls
vi.mock('../../api/auth', () => ({
  register: vi.fn()
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

// Mock Element Plus components
const mockElComponents = {
  ElForm: {
    name: 'ElForm',
    template: '<form @submit.prevent="$emit(\'submit\')"><slot></slot></form>',
    props: ['model'],
    emits: ['submit']
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot></slot></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input :type="type || \'text\'" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'type'],
    emits: ['update:modelValue']
  },
  ElButton: {
    name: 'ElButton',
    template: '<button type="button" @click="$emit(\'click\')"><slot></slot></button>',
    props: ['type'],
    emits: ['click']
  },
  ElRadioGroup: {
    name: 'ElRadioGroup',
    template: '<div @change="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></div>',
    props: ['modelValue'],
    emits: ['update:modelValue']
  },
  ElRadio: {
    name: 'ElRadio',
    template: '<input type="radio" :value="label" @change="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['label', 'modelValue'],
    emits: ['update:modelValue']
  }
}

// Mock router
const mockRouter = {
  push: vi.fn()
}

// Mock useRouter
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

describe('Register.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('页面能正常渲染', () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [createPinia()],
        components: mockElComponents
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('表单验证 - 空用户名', async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [createPinia()],
        components: mockElComponents
      }
    })
    await wrapper.vm.$nextTick()

    const registerButton = wrapper.find('button')
    await registerButton.trigger('click')
    await wrapper.vm.$nextTick()
    expect(ElMessage.error).toHaveBeenCalledWith('请输入用户名')
  })

  it('表单验证 - 空密码', async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [createPinia()],
        components: mockElComponents
      }
    })
    await wrapper.vm.$nextTick()

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('testuser')
    await wrapper.vm.$nextTick()
    
    const registerButton = wrapper.find('button')
    await registerButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(ElMessage.error).toHaveBeenCalledWith('请输入密码')
  })

  it('表单验证 - 密码不匹配', async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [createPinia()],
        components: mockElComponents
      }
    })
    await wrapper.vm.$nextTick()

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('testuser')
    await inputs[1].setValue('password123')
    await inputs[2].setValue('password456')
    await wrapper.vm.$nextTick()
    
    const registerButton = wrapper.find('button')
    await registerButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(ElMessage.error).toHaveBeenCalledWith('两次输入的密码不一致')
  })

  it('注册成功', async () => {
    const mockResponse: AxiosResponse<LoginResponse> = {
      data: { token: 'test-token' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    }
    vi.mocked(register).mockResolvedValueOnce(mockResponse)

    const wrapper = mount(Register, {
      global: {
        plugins: [createPinia()],
        components: mockElComponents
      }
    })
    await wrapper.vm.$nextTick()

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('testuser')
    await inputs[1].setValue('password123')
    await inputs[2].setValue('password123')
    await wrapper.vm.$nextTick()
    
    const registerButton = wrapper.find('button')
    await registerButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(register).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    })
    expect(ElMessage.success).toHaveBeenCalledWith('注册成功')
    expect(mockRouter.push).toHaveBeenCalledWith('/login')
  })

  it('注册失败', async () => {
    const error = new Error('注册失败')
    vi.mocked(register).mockRejectedValueOnce(error)

    const wrapper = mount(Register, {
      global: {
        plugins: [createPinia()],
        components: mockElComponents
      }
    })
    await wrapper.vm.$nextTick()

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('testuser')
    await inputs[1].setValue('password123')
    await inputs[2].setValue('password123')
    await wrapper.vm.$nextTick()
    
    const registerButton = wrapper.find('button')
    await registerButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(ElMessage.error).toHaveBeenCalledWith('注册失败')
  })

  it('返回登录按钮功能', async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [createPinia()],
        components: mockElComponents
      }
    })
    await wrapper.vm.$nextTick()

    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(mockRouter.push).toHaveBeenCalledWith('/login')
  })

  it('性别选择功能', async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [createPinia()],
        components: mockElComponents
      }
    })
    await wrapper.vm.$nextTick()

    const radioButtons = wrapper.findAll('input[type="radio"]')
    await radioButtons[0].setValue('男')
    await wrapper.vm.$nextTick()
    expect((radioButtons[0].element as HTMLInputElement).checked).toBe(true)
    
    await radioButtons[1].setValue('女')
    await wrapper.vm.$nextTick()
    expect((radioButtons[1].element as HTMLInputElement).checked).toBe(true)
  })
}) 