// 这个是用来实现展开菜单的效果的

// 实体编辑的展开功能
export const entityHeads = () => {
  document.querySelector('.entitEdity').addEventListener('click', function (e) {
    // 检查是否点击的是实体头部区域
    const header = e.target.closest('.entity-header');
    if (!header) return;

    // 如果点击的是输入框或按钮，不触发折叠
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
      return;
    }

    const entityItem = header.parentElement;
    entityItem.classList.toggle('open');
  });
}

// 关系编辑的展开功能
export const relationHeads = () => {
  document.querySelector('.relationEdity').addEventListener('click', function (e) {
    // 检查是否点击的是关系头部区域
    const head = e.target.closest('.relation-head');
    if (!head) return;

    // 如果点击的是输入框或按钮，不触发折叠
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
      return;
    }

    const relationItem = head.parentElement;
    relationItem.classList.toggle('open');
  });
}