// 这是一个立即执行函数，用于处理SQL解析和数据编辑标签的切换
(function () {
  const sqlanalysis = document.querySelector(".FunctionalArea .edit .tagPage .analysis");
  const editor = document.querySelector(".FunctionalArea .edit .tagPage .editor");
  const SQLinputbox = document.querySelector(".FunctionalArea .edit .SQLinputbox");
  const eredit = document.querySelector("body > div.FunctionalArea > div.edit > div.eredit");
  
  // 为SQL解析标签添加点击监听器
  sqlanalysis.addEventListener("click", function () {
    // 先隐藏数据编辑器
    eredit.style.opacity = "0";
    
    setTimeout(() => {
      // 确保eredit完全隐藏
      eredit.style.display = "none";
      
      // 然后显示SQL输入框
      SQLinputbox.style.display = "flex";
      
      // 同步更新标签选中状态
      sqlanalysis.classList.add("select");
      editor.classList.remove("select");
      
      // 延迟一帧再改变透明度，确保浏览器完成渲染
      requestAnimationFrame(() => {
        SQLinputbox.style.opacity = "1";
      });
    }, 100); // 与淡出时间匹配
  });
  
  // 为数据编辑标签添加点击监听器
  editor.addEventListener("click", function () {
    // 先隐藏SQL输入框
    SQLinputbox.style.opacity = "0";
    
    setTimeout(() => {
      // 确保SQLinputbox完全隐藏
      SQLinputbox.style.display = "none";
      
      // 然后显示数据编辑器
      eredit.style.display = "flex";
      
      // 同步更新标签选中状态
      sqlanalysis.classList.remove("select");
      editor.classList.add("select");
      
      // 延迟一帧再改变透明度，确保浏览器完成渲染
      requestAnimationFrame(() => {
        eredit.style.opacity = "1";
      });
    }, 100); // 与淡出时间匹配
  });
})();