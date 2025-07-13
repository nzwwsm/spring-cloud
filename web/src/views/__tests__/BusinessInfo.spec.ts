import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import BusinessInfo from '../BusinessInfo.vue'

const router = createRouter({ history: createWebHistory(), routes: [] })

describe('BusinessInfo.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    window.alert = vi.fn()
  })

  it('页面能正常渲染', () => {
    const wrapper = mount(BusinessInfo, {
      global: { plugins: [createPinia(), router] }
    })
    expect(wrapper.exists()).toBe(true)
  })
}) 