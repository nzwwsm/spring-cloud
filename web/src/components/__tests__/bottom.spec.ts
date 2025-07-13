import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import bottom from '../bottom.vue'

describe('bottom.vue', () => {
  const router = createRouter({ history: createWebHistory(), routes: [] })
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('组件能正常渲染', () => {
    const wrapper = mount(bottom, { global: { plugins: [router] } })
    expect(wrapper.exists()).toBe(true)
  })

  it('点击"我的"按钮已登录跳转到/user', async () => {
    window.localStorage.setItem('token', 'mock-token')
    const push = vi.fn()
    router.push = push
    const wrapper = mount(bottom, { global: { plugins: [router] } })
    await wrapper.findAll('li')[3].trigger('click')
    expect(push).toHaveBeenCalledWith('/user')
  })

  it('点击"我的"按钮未登录跳转到/login', async () => {
    window.localStorage.removeItem('token')
    const push = vi.fn()
    router.push = push
    const wrapper = mount(bottom, { global: { plugins: [router] } })
    await wrapper.findAll('li')[3].trigger('click')
    expect(push).toHaveBeenCalledWith('/login')
  })
}) 