import { mount } from '@vue/test-utils'
import SuperMember from '../SuperMember.vue'

describe('SuperMember.vue', () => {
  it('组件能正常渲染', () => {
    const wrapper = mount(SuperMember)
    expect(wrapper.exists()).toBe(true)
  })

  it('应包含超级会员文字和按钮', () => {
    const wrapper = mount(SuperMember)
    expect(wrapper.text()).toContain('超级会员')
    expect(wrapper.text()).toContain('每月享超值权益')
    expect(wrapper.text()).toContain('立即开通')
  })

  it('应包含皇冠图片', () => {
    const wrapper = mount(SuperMember)
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
  })
}) 