import { relationHeads } from '../ER-Editycss.js';

const RelationRenderer = {
  edit: document.querySelector('body > div.FunctionalArea > div.edit > div.eredit > div.list > div.relationEdity'),

  // 生成单个属性的HTML
  generateAttributeHTML(attr) {
    return `
      <div class="attr">
        <input type="text" class="attr-name-input" value="${attr.name}">
        <span class="iconfont icon-empty"></span>
      </div>
    `;
  },

  // 生成属性列表HTML
  generateAttributesHTML(attributes) {
    return attributes.map(attr => this.generateAttributeHTML(attr)).join('');
  },

  // 生成实体选项HTML
  generateEntityOptions() {
    return erDiagram.entities.map(entity =>
      `<option value="${entity.name}">${entity.name}</option>`
    ).join('');
  },

  // 生成关系头部HTML
  generateRelationHeaderHTML(relation) {
    return `
      <div class="relation-head">
        <span class="icon-xiala iconfont"></span>
        <input type="text" class="relation-name-input" value="${relation.name}">
        <button class="addattr">
          +属性
        </button>
        <button class="remove">
          -删除
        </button>
      </div>
    `;
  },

  // 生成关系内容区域HTML
  generateRelationContentHTML(relation) {
    const attributesHTML = this.generateAttributesHTML(relation.attribute);
    const entityOptions = this.generateEntityOptions();

    return `
      <div class="relation-content">
        <div class="content-wrapper">
          <div class="map">
            <select name="leftEntity" class="left-entity">
              <option value="">选择左实体</option>
            </select>
            <select name="lefttoright" class="relation-type">
              <option value="1">一对一</option>
              <option value="2">一对多</option>
              <option value="3">多对多</option>
            </select>
            <select name="rightEntity" class="right-entity">
              <option value="">选择右实体</option>
            </select>
          </div>
          ${attributesHTML}
        </div>
      </div>
    `;
  },

  // 生成完整的单个关系HTML
  generateRelationHTML(relation) {
    return `
      <div class="relation-item">
        ${this.generateRelationHeaderHTML(relation)}
        ${this.generateRelationContentHTML(relation)}
      </div>
    `;
  },

  // 生成所有关系的HTML
  generateAllRelationsHTML() {
    return erDiagram.relationships.map(relation => this.generateRelationHTML(relation)).join('');
  },

  // 渲染所有关系到DOM
  renderRelations() {
    this.edit.innerHTML = this.generateAllRelationsHTML() + '<div class="addrelation">⊕</div>';

    // 设置选择框的值
    this.setSelectValues();
  },

  // 设置选择框的值
  setSelectValues() {
    const relationItems = this.edit.querySelectorAll('.relation-item');
    relationItems.forEach((item, index) => {
      const relation = erDiagram.relationships[index];
      if (relation && relation.relationship) {
        const leftSelect = item.querySelector('.left-entity');
        const rightSelect = item.querySelector('.right-entity');
        const typeSelect = item.querySelector('.relation-type');

        if (leftSelect) leftSelect.value = relation.relationship.leftEntity || '';
        if (rightSelect) rightSelect.value = relation.relationship.rightEntity || '';
        if (typeSelect) typeSelect.value = relation.relationship.lefttoright || '1';
      }
    });
  },

  // 初始化删除关系功能
  initializeRemoveRelation() {
    this.edit.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove')) {
        const relationItem = e.target.closest('.relation-item');
        const relationName = relationItem.querySelector('.relation-head input').value;

        // 从数据中删除关系
        const relationIndex = erDiagram.relationships.findIndex(relation => relation.name === relationName);
        if (relationIndex !== -1) {
          erDiagram.relationships.splice(relationIndex, 1);
        }

        // 直接删除DOM元素
        relationItem.remove();
      }
    });
  },

  // 初始化添加属性功能
  initializeAddAttribute() {
    this.edit.addEventListener('click', (e) => {
      if (e.target.classList.contains('addattr')) {
        const relationItem = e.target.closest('.relation-item');
        const relationName = relationItem.querySelector('.relation-head input').value;

        // 找到对应的关系
        const relation = erDiagram.relationships.find(relation => relation.name === relationName);
        if (relation) {
          // 添加新属性到数据
          const newAttr = {
            name: "新属性",
            x: 0,
            y: 0
          };
          relation.attribute.push(newAttr);

          // 生成新属性的HTML并添加到DOM
          const contentWrapper = relationItem.querySelector('.content-wrapper');
          const newAttrHTML = this.generateAttributeHTML(newAttr);
          contentWrapper.insertAdjacentHTML('beforeend', newAttrHTML);
        }
      }
    });
  },

  // 提取获取索引的方法
  getRelationAndAttrIndex(target) {
    const relationItem = target.closest('.relation-item');
    const relationIndex = Array.from(this.edit.querySelectorAll('.relation-item')).indexOf(relationItem);

    const attrDiv = target.closest('.attr');
    const attrIndex = attrDiv ? Array.from(relationItem.querySelectorAll('.attr')).indexOf(attrDiv) : -1;

    return { relationIndex, attrIndex };
  },

  // 初始化输入框同步功能
  initializeInputSync() {
    this.edit.addEventListener('input', (e) => {
      if (e.target.classList.contains('relation-name-input')) {
        const { relationIndex } = this.getRelationAndAttrIndex(e.target);
        if (erDiagram.relationships[relationIndex]) {
          erDiagram.relationships[relationIndex].name = e.target.value;
        }
      } else if (e.target.classList.contains('attr-name-input')) {
        const { relationIndex, attrIndex } = this.getRelationAndAttrIndex(e.target);
        if (erDiagram.relationships[relationIndex] && erDiagram.relationships[relationIndex].attribute[attrIndex]) {
          erDiagram.relationships[relationIndex].attribute[attrIndex].name = e.target.value;
        }
      }
    });
  },

  // 初始化选择框同步功能
  initializeSelectSync() {
    this.edit.addEventListener('change', (e) => {
      const { relationIndex } = this.getRelationAndAttrIndex(e.target);

      if (e.target.classList.contains('left-entity')) {
        if (erDiagram.relationships[relationIndex]) {
          erDiagram.relationships[relationIndex].relationship.leftEntity = e.target.value;
        }
      } else if (e.target.classList.contains('right-entity')) {
        if (erDiagram.relationships[relationIndex]) {
          erDiagram.relationships[relationIndex].relationship.rightEntity = e.target.value;
        }
      } else if (e.target.classList.contains('relation-type')) {
        if (erDiagram.relationships[relationIndex]) {
          erDiagram.relationships[relationIndex].relationship.lefttoright = parseInt(e.target.value);
        }
      }
    });
  },

  // 添加空关系
  addEmptyRelation() {
    // 创建新关系数据
    const newRelation = {
      name: "新关系",
      x: 0,
      y: 0,
      textcolor: "#000000",
      textsize: 14,
      relationship: {
        leftEntity: "",
        rightEntity: "",
        lefttoright: 1
      },
      attribute: []
    };

    // 添加到数据中
    erDiagram.relationships.push(newRelation);

    // 生成HTML并添加到DOM
    const newRelationHTML = this.generateRelationHTML(newRelation);
    const addRelationBtn = this.edit.querySelector('.addrelation');
    addRelationBtn.insertAdjacentHTML('beforebegin', newRelationHTML);
  },

  // 初始化添加关系功能
  initializeAddRelation() {
    this.edit.addEventListener('click', (e) => {
      if (e.target.classList.contains('addrelation')) {
        this.addEmptyRelation();
      }
    });
  },

  // 初始化选择框事件委托
  initializeSelectEvents() {
    this.edit.addEventListener('mousedown', (e) => {
      if (e.target.closest('.relation-content') && (e.target.classList.contains('left-entity') || e.target.classList.contains('right-entity'))) {
        const currentValue = e.target.value;

        // 清空并重新填充选项
        e.target.innerHTML = erDiagram.entities.map(entity => `<option value="${entity.name}">${entity.name}</option>`).join('');

        e.target.value = currentValue;
      }
    });
  },

  // 初始化删除属性功能
  initializeRemoveAttribute() {
    this.edit.addEventListener('mouseup', (e) => {
      if (e.target.classList.contains('icon-empty')) {
        const attrDiv = e.target.closest('.attr');
        const { relationIndex, attrIndex } = this.getRelationAndAttrIndex(e.target);

        // 从数据中删除属性
        if (erDiagram.relationships[relationIndex] && erDiagram.relationships[relationIndex].attribute[attrIndex]) {
          erDiagram.relationships[relationIndex].attribute.splice(attrIndex, 1);
        }

        // 删除DOM元素
        attrDiv.remove();
      }
    });
  },

  // 更新实体选项（当实体变化时调用）
  updateEntityOptions() {
    const entityOptions = this.generateEntityOptions();
    const leftSelects = this.edit.querySelectorAll('.left-entity');
    const rightSelects = this.edit.querySelectorAll('.right-entity');

    [...leftSelects, ...rightSelects].forEach(select => {
      const currentValue = select.value;
      select.innerHTML = '<option value="">选择实体</option>' + entityOptions;
      select.value = currentValue; // 恢复之前的选择
    });
  },

  initializeFeatures() {
    relationHeads();
    this.initializeRemoveRelation();
    this.initializeAddAttribute();
    this.initializeRemoveAttribute();
    this.initializeInputSync();
    this.initializeSelectSync();
    this.initializeAddRelation();
    this.initializeSelectEvents();
  },

  // 主函数 - 完整的渲染流程
  main() {
    this.renderRelations(); // 主要是添加html结构
    this.initializeFeatures(); // 主要是功能相关的交互
  }
};

// 渲染关系列表
RelationRenderer.main();

// document.addEventListener('click', (e) => {
//   console.log(erDiagram.relationships);
// })