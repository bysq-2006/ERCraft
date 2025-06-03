(function () {
  const seekbar = document.querySelector('body > div.FunctionalArea > div.edit > div.eredit > div.list > div.SeekBar');
  const list = document.querySelector('body > div.FunctionalArea > div.edit > div.eredit > div.list');
  const eredit = document.querySelector('body > div.FunctionalArea > div.edit > div.eredit'); // 获取父级容器
  let lastY = 0;
  
  // 创建一个样式元素，用于添加拖动时的全局光标样式
  let dragStyleElement = document.createElement('style');
  dragStyleElement.textContent = 'body * { cursor: ns-resize !important; }';

  seekbar.addEventListener('mousedown', function (event) {
    lastY = event.clientY;
    
    // 添加拖动样式到文档头部
    document.head.appendChild(dragStyleElement);
    
    document.addEventListener('mousemove', mouseMove);
  });

  document.addEventListener('mouseup', function () {
    // 移除拖动样式
    if (dragStyleElement.parentNode) {
      document.head.removeChild(dragStyleElement);
    }
    
    document.removeEventListener('mousemove', mouseMove);
  });

  function mouseMove(e) {
    const maxTop = 5; // 最小top值（距离顶部），百分比
    const minTop = 80; // 最大top值（距离顶部），百分比
    
    // 使用父级容器的高度作为基准
    const parentHeight = eredit.offsetHeight;
    const movePercent = ((e.clientY - lastY) / parentHeight) * 100;
    
    // 获取当前top值（百分比）
    let currentTopPercent = parseFloat(list.style.top) || 50; // 默认50%
    
    // 计算新的top值
    const newTopPercent = currentTopPercent + movePercent;
    
    // 应用top限制
    let finalTopPercent;
    if (newTopPercent < maxTop) {
      finalTopPercent = maxTop;
    } else if (newTopPercent > minTop) {
      finalTopPercent = minTop;
    } else {
      finalTopPercent = newTopPercent;
    }
    
    // 设置top值
    list.style.top = finalTopPercent + '%';
    
    // 同步设置高度，确保对齐底部
    const heightPercent = 100 - finalTopPercent;
    list.style.height = heightPercent + '%';
    
    lastY = e.clientY;
  }
})();