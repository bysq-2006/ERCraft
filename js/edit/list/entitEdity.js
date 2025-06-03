import { entityHeads } from '../ER-Editycss.js';

export const EntityRenderer = {
  edit: document.querySelector('body > div.FunctionalArea > div.edit > div.eredit > div.list > div.entitEdity'),

  // 生成单个属性的HTML
  generateAttributeHTML(attr) {
    return `
      <div class="attr">
        <input type="text" class="attr-name-input" value="${attr.name}">
        ${attr.isPrimary ? '<span class="primary" id="isprimary">主键</span>' : '<span class="noprimary" id="isprimary">普通</span>'}
        <span class="iconfont icon-empty"></span>
      </div>
    `;
  },

  // 生成属性列表HTML
  generateAttributesHTML(attributes) {
    return attributes.map(attr => this.generateAttributeHTML(attr)).join('');
  },

  // 生成实体头部HTML
  generateEntityHeaderHTML(entity) {
    return `
      <div class="entity-header">
        <span class="icon-xiala iconfont"></span>
        <input type="text" class="entity-name-input" value="${entity.name}">
        <button class="addattr">
          +属性
        </button>
        <button class="remove">
          -删除
        </button>
      </div>
    `;
  },

  // 生成实体内容区域HTML
  generateEntityContentHTML(entity) {
    const attributesHTML = this.generateAttributesHTML(entity.attribute);

    return `
      <div class="entity-content">
        <div class="content-wrapper">
          ${attributesHTML}
        </div>
      </div>
    `;
  },

  // 生成完整的单个实体HTML
  generateEntityHTML(entity) {
    return `
      <div class="entity-item">
        ${this.generateEntityHeaderHTML(entity)}
        ${this.generateEntityContentHTML(entity)}
      </div>
    `;
  },

  // 生成所有实体的HTML
  generateAllEntitiesHTML() {
    return erDiagram.entities.map(entity => this.generateEntityHTML(entity)).join('');
  },

  // 渲染所有实体到DOM
  renderEntities() {
    this.edit.innerHTML = this.generateAllEntitiesHTML() + '<div class="addentity">⊕</div>';
  },

  // 初始化删除实体功能
  initializeRemoveEntity() {
    this.edit.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove')) {
        const entityItem = e.target.closest('.entity-item');
        const entityName = entityItem.querySelector('.entity-header input').value;

        // 从数据中删除实体
        const entityIndex = erDiagram.entities.findIndex(entity => entity.name === entityName);
        if (entityIndex !== -1) {
          erDiagram.entities.splice(entityIndex, 1);
        }

        // 直接删除DOM元素
        entityItem.remove();
      }
    });
  },

  // 初始化添加属性功能
  initializeAddAttribute() {
    this.edit.addEventListener('click', (e) => {
      if (e.target.classList.contains('addattr')) {
        const entityItem = e.target.closest('.entity-item');
        const entityName = entityItem.querySelector('.entity-header input').value;

        // 找到对应的实体
        const entity = erDiagram.entities.find(entity => entity.name === entityName);
        if (entity) {
          // 添加新属性到数据
          const newAttr = {
            name: "新属性",
            x: 0,
            y: 0,
            isPrimary: false
          };
          entity.attribute.push(newAttr);

          // 生成新属性的HTML并添加到DOM
          const contentWrapper = entityItem.querySelector('.content-wrapper');
          const newAttrHTML = this.generateAttributeHTML(newAttr);
          contentWrapper.insertAdjacentHTML('beforeend', newAttrHTML);
        }
      }
    });
  },

  // 提取获取索引的方法
  getEntityAndAttrIndex(target) {
    const entityItem = target.closest('.entity-item');
    const entityIndex = Array.from(this.edit.querySelectorAll('.entity-item')).indexOf(entityItem);

    const attrDiv = target.closest('.attr');
    const attrIndex = attrDiv ? Array.from(entityItem.querySelectorAll('.attr')).indexOf(attrDiv) : -1;

    return { entityIndex, attrIndex };
  },

  // 初始化主键切换功能
  initializePrimaryToggle() {
    this.edit.addEventListener('click', (e) => {
      if (e.target.id === 'isprimary') {
        const entityItem = e.target.closest('.entity-item');
        const { entityIndex, attrIndex } = this.getEntityAndAttrIndex(e.target);

        // 重置该实体所有属性为普通
        entityItem.querySelectorAll('#isprimary').forEach(span => {
          span.className = 'noprimary';
          span.textContent = '普通';
        });

        // 设置点击目标为主键
        e.target.className = 'primary';
        e.target.textContent = '主键';

        // 更新数据
        if (erDiagram.entities[entityIndex]) {
          erDiagram.entities[entityIndex].attribute.forEach((attr, index) => {
            attr.isPrimary = index === attrIndex;
          });
        }
      }
    });
  },

  // 初始化输入框同步功能
  initializeInputSync() {
    this.edit.addEventListener('input', (e) => {
      if (e.target.classList.contains('entity-name-input')) {
        const { entityIndex } = this.getEntityAndAttrIndex(e.target);
        if (erDiagram.entities[entityIndex]) {
          erDiagram.entities[entityIndex].name = e.target.value;
        }
      } else if (e.target.classList.contains('attr-name-input')) {
        const { entityIndex, attrIndex } = this.getEntityAndAttrIndex(e.target);
        if (erDiagram.entities[entityIndex] && erDiagram.entities[entityIndex].attribute[attrIndex]) {
          erDiagram.entities[entityIndex].attribute[attrIndex].name = e.target.value;
        }
      }
    });
  },

  // 添加空实体
  addEmptyEntity() {
    // 创建新实体数据
    const newEntity = {
      name: "新实体",
      x: 0,
      y: 0,
      textcolor: "#000000",
      textsize: 16,
      attribute: [
        { name: "新属性", x: 0, y: 0, isPrimary: true }
      ]
    };

    // 添加到数据中
    erDiagram.entities.push(newEntity);

    // 生成HTML并添加到DOM
    const newEntityHTML = this.generateEntityHTML(newEntity);
    const addEntityBtn = this.edit.querySelector('.addentity');
    addEntityBtn.insertAdjacentHTML('beforebegin', newEntityHTML);
  },

  // 初始化添加实体功能
  initializeAddEntity() {
    this.edit.addEventListener('click', (e) => {
      if (e.target.classList.contains('addentity')) {
        this.addEmptyEntity();
      }
    });
  },

  // 初始化删除属性功能
  initializeRemoveAttribute() {
    this.edit.addEventListener('click', (e) => {
      if (e.target.classList.contains('icon-empty')) {
        const attrDiv = e.target.closest('.attr');
        const { entityIndex, attrIndex } = this.getEntityAndAttrIndex(e.target);

        // 从数据中删除属性
        if (erDiagram.entities[entityIndex] && erDiagram.entities[entityIndex].attribute[attrIndex]) {
          erDiagram.entities[entityIndex].attribute.splice(attrIndex, 1);
        }

        // 删除DOM元素
        attrDiv.remove();
      }
    });
  },

  initializeFeatures() {
    entityHeads();
    this.initializeRemoveEntity();
    this.initializeAddAttribute();
    this.initializeRemoveAttribute();
    this.initializeInputSync();
    this.initializePrimaryToggle();
    this.initializeAddEntity();
  },

  // 主函数 - 完整的渲染流程
  main() {
    this.renderEntities();// 主要是添加html结构
    this.initializeFeatures();// 主要是功能相关的交互
  }
};

// 渲染实体列表
EntityRenderer.main();

// document.addEventListener('click', (e) => {
//   console.log(erDiagram.entities);
// });