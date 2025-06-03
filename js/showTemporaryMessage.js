//公共的弹窗函数,2秒后自动消失
function showTemporaryMessage(message, type = 'info') {
  // 创建容器
  const popup = document.createElement('div');
  
  // 定义图标
  const icons = {
    success: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"></path></svg>',
    error: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M13 13H11V7H13M13 17H11V15H13M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2Z"></path></svg>',
    warning: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2L1 21H23M12 6L19.53 19H4.47M11 10V14H13V10M11 16V18H13V16"></path></svg>',
    info: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"></path></svg>'
  };
  
  // 定义颜色
  const colors = {
    success: { bg: '#E7F8F0', border: '#A8EDCF', icon: '#1DB954', text: '#0A683A' },
    error: { bg: '#FEECEB', border: '#F9C6C3', icon: '#ED4337', text: '#8A160C' },
    warning: { bg: '#FFF8EA', border: '#FFE4B0', icon: '#F59E0B', text: '#93580C' },
    info: { bg: '#EDF5FF', border: '#CCE2FF', icon: '#0066FF', text: '#014199' }
  };
  
  const color = colors[type] || colors.info;
  
  // 设置样式
  Object.assign(popup.style, {
    position: 'fixed',
    top: '-100px',  // 从顶部外开始
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '0',
    backgroundColor: color.bg,
    color: color.text,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    maxWidth: '90%',
    minWidth: '300px',
    border: `1px solid ${color.border}`,
    fontFamily: "'Segoe UI', Roboto, Arial, sans-serif",
    fontSize: '14px',
    transition: 'all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
  });
  
  // 创建内部HTML
  popup.innerHTML = `
    <div style="padding: 12px; color:${color.icon};">
      ${icons[type] || icons.info}
    </div>
    <div style="padding: 12px 12px 12px 0; flex: 1; font-weight: 500;">
      ${message}
    </div>
    <button style="background: none; border: none; cursor: pointer; padding: 12px; color: ${color.text}; opacity: 0.7;">
      <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
    </button>
  `;
  
  // 添加到文档
  document.body.appendChild(popup);
  
  // 关闭按钮功能
  const closeButton = popup.querySelector('button');
  closeButton.addEventListener('click', () => {
    popup.style.opacity = '0';
    popup.style.transform = 'translate(-50%, -20px)';
    setTimeout(() => document.body.removeChild(popup), 300);
  });
  
  // 动画显示
  setTimeout(() => {
    popup.style.top = '20px';
  }, 10);
  
  // 自动隐藏
  setTimeout(() => {
    popup.style.opacity = '0';
    popup.style.transform = 'translate(-50%, -20px)';
    
    // 过渡完成后移除元素
    setTimeout(() => {
      if (popup.parentNode) {
        document.body.removeChild(popup);
      }
    }, 300);
  }, 2000);
}