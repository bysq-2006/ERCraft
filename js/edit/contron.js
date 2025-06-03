import { GridManager, ForceLayout, erEvent, Refresh } from "../frame/render.js";

//关于list的页面控制
const entity = document.querySelector('body > div.FunctionalArea > div.edit > div.eredit > div.contron > div.one.block > button.entity');
const relation = document.querySelector('body > div.FunctionalArea > div.edit > div.eredit > div.contron > div.one.block > button.relation');
const entitEdity = document.querySelector('.FunctionalArea>.edit>.eredit>.list>.entitEdity');
const relationEdity = document.querySelector('.FunctionalArea>.edit>.eredit>.list>.relationEdity');

entity.addEventListener('click', function (event) {
  entity.classList.add('select');
  relation.classList.remove('select');
  entitEdity.style.display = 'block';
  relationEdity.style.display = 'none';
});

relation.addEventListener('click', function (event) {
  entity.classList.remove('select');
  relation.classList.add('select');
  entitEdity.style.display = 'none';
  relationEdity.style.display = 'block';
});




//关于保存和导入
const saveBtn = document.querySelector('body > div.FunctionalArea > div.edit > div.eredit > div.contron > div.three.block > button.save');
const importBtn = document.querySelector('body > div.FunctionalArea > div.edit > div.eredit > div.contron > div.three.block > button.export');

// 添加保存功能
saveBtn.addEventListener('click', function () {
  exportToJsonFile(erDiagram, 'er-diagram');
});

// 添加导入功能
importBtn.addEventListener('click', function () {
  importFromJsonFile(function (importedData) {
    // 更新全局erDiagram对象
    erDiagram.entities = importedData.entities || [];
    erDiagram.relationships = importedData.relationships || [];

    // 这里应该添加代码来更新UI显示
    console.log('数据导入成功!', erDiagram);
    showTemporaryMessage('ER图数据导入成功!');

    // 如果有渲染函数，调用它更新视图
    // renderERDiagram();
  });
});

/**
 * 将数据导出为JSON文件下载
 */
function exportToJsonFile(data, filename) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename + '.json';

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  URL.revokeObjectURL(url);
}

/**
 * 从JSON文件导入数据
 */
function importFromJsonFile(callback) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json';
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);

        // 先执行回调函数处理导入的数据
        callback(data);

        // 然后再执行初始化
        Refresh();
      } catch (error) {
        console.error('JSON解析失败:', error);
        showTemporaryMessage('无效的JSON文件格式');
      }
    };

    reader.readAsText(file);
    document.body.removeChild(fileInput);
  });

  document.body.appendChild(fileInput);
  fileInput.click();
}




// 精细模式和网格模式的切换
const findmodeCheckbox = document.querySelector('body > div.FunctionalArea > div.edit > div.eredit > div.contron > div.two.block > button.finemode input[type="checkbox"]')
const gridmodeCheckbox = document.querySelector('body > div.FunctionalArea > div.edit > div.eredit > div.contron > div.two.block > button.gridmode input[type="checkbox"]');

//网格模式
gridmodeCheckbox.addEventListener('change', function () {
  if (gridmodeCheckbox.checked) {
    GridManager.visible = true;
    GridManager.snapEnabled = true;
  } else {
    GridManager.visible = false;
    GridManager.snapEnabled = false;
  }
});

//精细模式
findmodeCheckbox.addEventListener('change', function () {
  if (findmodeCheckbox.checked) {
    ForceLayout.switch = false;
  } else {
    ForceLayout.switch = true;
  }
});

// 应用更改
const startBtn = document.querySelector('body > div.FunctionalArea > div.edit > div.eredit > div.contron > div.one.block > button.start');

// 检查实体中是否有重名
function checkDuplicateEntities() {
  const entityNames = erDiagram.entities.map(entity => entity.name);
  const duplicates = [];
  
  entityNames.forEach((name, index) => {
    if (entityNames.indexOf(name) !== index && !duplicates.includes(name)) {
      duplicates.push(name);
    }
  });
  
  return duplicates;
}


// 检查关系中是否有重名
function checkDuplicateRelationships() {
  const relationshipNames = erDiagram.relationships.map(relationship => relationship.name);
  const duplicates = [];
  
  relationshipNames.forEach((name, index) => {
    if (relationshipNames.indexOf(name) !== index && !duplicates.includes(name)) {
      duplicates.push(name);
    }
  });
  
  return duplicates;
}

// 检查关系中引用的实体是否存在
function checkMissingEntitiesInRelationships() {
  const missingEntities = [];

  for (const relationship of erDiagram.relationships) {
    const leftEntity = relationship.relationship.leftEntity;
    const rightEntity = relationship.relationship.rightEntity;

    // 检查左侧实体是否存在
    const leftExists = erDiagram.entities.some(entity => entity.name === leftEntity);
    if (!leftExists && leftEntity && !missingEntities.includes(leftEntity)) {
      missingEntities.push(leftEntity);
    }

    // 检查右侧实体是否存在
    const rightExists = erDiagram.entities.some(entity => entity.name === rightEntity);
    if (!rightExists && rightEntity && !missingEntities.includes(rightEntity)) {
      missingEntities.push(rightEntity);
    }
  }

  return missingEntities;
}

startBtn.addEventListener('click', function () {
  // 检查实体重名
  const duplicateEntities = checkDuplicateEntities();
  if (duplicateEntities.length > 0) {
    const message = `错误：实体中存在重名：${duplicateEntities.join(', ')}`;
    showTemporaryMessage(message, 'error');
    return;
  }

  // 检查关系重名
  const duplicateRelationships = checkDuplicateRelationships();
  if (duplicateRelationships.length > 0) {
    const message = `错误：关系中存在重名：${duplicateRelationships.join(', ')}`;
    showTemporaryMessage(message, 'error');
    return;
  }

  // 检查关系中的实体是否存在
  const missingEntities = checkMissingEntitiesInRelationships();
  if (missingEntities.length > 0) {
    const message = `警告：以下实体在关系中被引用但不存在：${missingEntities.join(', ')}`;
    showTemporaryMessage(message, 'warning');
    return;
  }

  // 如果所有检查都通过，继续执行刷新
  Refresh();
});

// ...existing code...


// 导出为图片
const img = document.querySelector("body > div.FunctionalArea > div.edit > div.eredit > div.contron > div.three.block > button.img")

img.addEventListener('click', () => {
  erEvent.captureAndSaveScreenshot();
})

const modifyCanvas = document.querySelector("body > div.FunctionalArea > div.edit > div.eredit > div.contron > div.two.block > button.modify-canvas")

modifyCanvas.addEventListener('click', () => {
  showCanvasModal();
});

function showCanvasModal() {
  // 创建弹窗HTML
  const modalHTML = `
    <div class="canvas-modal">
      <div class="canvas-modal-content">
        <h3>调整画布尺寸</h3>
        <div class="canvas-modal-input">
          <label>宽度:</label>
          <input type="number" id="canvas-width" value="${erDiagram.w}" min="400" max="2000">
        </div>
        <div class="canvas-modal-input">
          <label>高度:</label>
          <input type="number" id="canvas-height" value="${erDiagram.h}" min="300" max="1500">
        </div>
        <div class="canvas-modal-buttons">
          <button class="confirm">确认</button>
          <button class="cancel">取消</button>
        </div>
      </div>
    </div>
  `;

  // 添加到页面
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  const modal = document.querySelector('.canvas-modal');
  const confirmBtn = modal.querySelector('.confirm');
  const cancelBtn = modal.querySelector('.cancel');
  
  // 确认按钮事件
  confirmBtn.addEventListener('click', () => {
    const width = parseInt(document.getElementById('canvas-width').value);
    const height = parseInt(document.getElementById('canvas-height').value);
    
    if (width && height) {
      erDiagram.w = width;
      erDiagram.h = height;
      Refresh();
      showTemporaryMessage('画布尺寸已更新');
    }
    
    document.body.removeChild(modal);
  });
  
  // 取消按钮和背景点击事件
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}