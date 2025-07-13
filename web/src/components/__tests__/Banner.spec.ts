import { mount } from '@vue/test-utils'
import Banner from '../Banner.vue'

describe('Banner.vue', () => {
  it('组件能正常渲染', () => {
    const wrapper = mount(Banner)
    expect(wrapper.exists()).toBe(true)
  })

  it('应包含品质套餐标题和描述', () => {
    const wrapper = mount(Banner)
    expect(wrapper.text()).toContain('品质套餐')
    expect(wrapper.text()).toContain('搭配齐全吃得好')
    expect(wrapper.text()).toContain('立即抢购')
  })

  it('应包含图片', () => {
    const wrapper = mount(Banner)
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('品质套餐')
  })
}) 