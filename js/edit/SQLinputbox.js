import { root, Transformation, containerConnector, ForceLayout, Refresh } from "../frame/render.js"
import {RelationRenderer} from './list/relationEdity.js'
import {EntityRenderer} from './list/entitEdity.js'


// 这一个模块是处理输入框还有把输入框的内容转发到主程序上
const eraseBtn = document.querySelector("body > div.FunctionalArea > div.edit > div.SQLinputbox > div.top > button.erase")
const start = document.querySelector("body > div.FunctionalArea > div.edit > div.SQLinputbox > div.top > button.start")
const sqlInput = document.querySelector("body > div.FunctionalArea > div.edit > div.SQLinputbox > div.bottom > textarea")
// 下面这三个变量是为了点即解析SQL语句之后跳转到另一个标签页
const sqlanalysis = document.querySelector(".FunctionalArea .edit .tagPage .analysis");
const editor = document.querySelector(".FunctionalArea .edit .tagPage .editor");
const SQLinputbox = document.querySelector(".FunctionalArea .edit .SQLinputbox");
const eredit = document.querySelector("body > div.FunctionalArea > div.edit > div.eredit");

eraseBtn.addEventListener("click", function () {
  sqlInput.value = ""
})

start.addEventListener("click", function () {
  const sqlText = sqlInput.value.trim();
  if (!sqlText) {
    showTemporaryMessage("请输入SQL语句");
    return;
  }

  try {
    // 清空现有数据
    erDiagram.entities = [];
    erDiagram.relationships = [];

    // 解析SQL并生成ER图数据
    parseSqlToErDiagram(sqlText, erDiagram);
    //---------------和tagPage.js里面的东西一样----------------
    SQLinputbox.style.opacity = "0";
    setTimeout(() => {
      SQLinputbox.style.display = "none";
      eredit.style.display = "flex";
      sqlanalysis.classList.remove("select");
      editor.classList.add("select");
      requestAnimationFrame(() => {
        eredit.style.opacity = "1";
      });
    }, 100);
    //-------------------------------------------------------
    showTemporaryMessage("SQL解析完成");
    console.log("解析后的ER图数据:", erDiagram);

    Refresh(); // 刷新ER图显示

    RelationRenderer.renderRelations();
    EntityRenderer.renderEntities();
  } catch (error) {
    console.error("SQL解析错误:", error);
    showTemporaryMessage("SQL解析失败：");
  }
});

/**
 * 解析SQL语句并转换为ER图数据结构
 * @param {string} sqlText - SQL语句
 * @param {object} erDiagram - 存储ER图数据的对象
 */
function parseSqlToErDiagram(sqlText, erDiagram) {
  // 实体的初始位置
  let entityX = 100;
  let entityY = 100;

  // 将SQL文本转换为小写以便不区分大小写的匹配
  const lowerSqlText = sqlText.toLowerCase();
  let currentIndex = 0;

  // 查找所有 CREATE TABLE 语句
  while (true) {
    // 查找 "create table"
    const createTableIndex = lowerSqlText.indexOf('create table', currentIndex);
    if (createTableIndex === -1) break;

    // 从 "create table" 后开始查找左括号
    let searchStart = createTableIndex + 12; // "create table" 的长度
    
    // 查找左括号
    let leftParenIndex = searchStart;
    while (leftParenIndex < sqlText.length && sqlText[leftParenIndex] !== '(') {
      leftParenIndex++;
    }
    
    if (leftParenIndex >= sqlText.length) break;

    // 从左括号向前查找表名（向前找到最后一个单词）
    let tableNameEnd = leftParenIndex - 1;
    
    // 跳过左括号前的空格
    while (tableNameEnd >= 0 && /\s/.test(sqlText[tableNameEnd])) {
      tableNameEnd--;
    }
    
    // 向前查找表名的开始位置
    let tableNameStart = tableNameEnd;
    while (tableNameStart >= 0 && 
           !/\s/.test(sqlText[tableNameStart]) &&
           sqlText[tableNameStart] !== '`' &&
           sqlText[tableNameStart] !== '"') {
      tableNameStart--;
    }
    tableNameStart++; // 调整到单词的开始位置

    // 提取表名
    let tableName = sqlText.substring(tableNameStart, tableNameEnd + 1).trim();
    
    // 去除可能的反引号或双引号
    if ((tableName.startsWith('`') && tableName.endsWith('`')) ||
        (tableName.startsWith('"') && tableName.endsWith('"'))) {
      tableName = tableName.substring(1, tableName.length - 1);
    }

    // 查找对应的右括号和分号
    let rightParenIndex = leftParenIndex + 1;
    let parenthesesCount = 1;
    
    while (rightParenIndex < sqlText.length && parenthesesCount > 0) {
      if (sqlText[rightParenIndex] === '(') {
        parenthesesCount++;
      } else if (sqlText[rightParenIndex] === ')') {
        parenthesesCount--;
      }
      rightParenIndex++;
    }

    // 查找分号
    let semicolonIndex = rightParenIndex;
    while (semicolonIndex < sqlText.length && sqlText[semicolonIndex] !== ';') {
      semicolonIndex++;
    }

    if (semicolonIndex >= sqlText.length) break;

    // 提取表内容（括号内的内容）
    const tableContent = sqlText.substring(leftParenIndex + 1, rightParenIndex - 1);

    // 创建实体对象
    const entity = {
      name: tableName,
      x: entityX,
      y: entityY,
      textcolor: "#000000",
      textsize: 14,
      attribute: []
    };

    // 调整下一个实体的位置
    entityX += 250;
    if (entityX > 800) {
      entityX = 100;
      entityY += 200;
    }

    // 手动分割字段定义（用逗号分割，但要考虑括号内的逗号）
    const fieldDefinitions = [];
    let fieldStart = 0;
    let parenthesesLevel = 0;
    
    for (let i = 0; i < tableContent.length; i++) {
      if (tableContent[i] === '(') {
        parenthesesLevel++;
      } else if (tableContent[i] === ')') {
        parenthesesLevel--;
      } else if (tableContent[i] === ',' && parenthesesLevel === 0) {
        fieldDefinitions.push(tableContent.substring(fieldStart, i).trim());
        fieldStart = i + 1;
      }
    }
    // 添加最后一个字段
    if (fieldStart < tableContent.length) {
      fieldDefinitions.push(tableContent.substring(fieldStart).trim());
    }

    let attrY = 30; // 属性的初始Y坐标（相对于实体）

    fieldDefinitions.forEach(fieldDef => {
      fieldDef = fieldDef.trim();
      
      // 跳过空行
      if (!fieldDef) return;

      // 跳过约束语句（检查开头是否为约束关键字）
      const lowerFieldDef = fieldDef.toLowerCase();
      if (lowerFieldDef.startsWith('primary key') ||
          lowerFieldDef.startsWith('foreign key') ||
          lowerFieldDef.startsWith('key') ||
          lowerFieldDef.startsWith('index') ||
          lowerFieldDef.startsWith('unique') ||
          lowerFieldDef.startsWith('constraint')) {
        return;
      }

      // 提取字段名（第一个单词）
      let fieldNameEnd = 0;
      while (fieldNameEnd < fieldDef.length && !/\s/.test(fieldDef[fieldNameEnd])) {
        fieldNameEnd++;
      }
      
      if (fieldNameEnd === 0) return;
      
      let fieldName = fieldDef.substring(0, fieldNameEnd);
      
      // 去除可能的反引号或双引号
      if ((fieldName.startsWith('`') && fieldName.endsWith('`')) ||
          (fieldName.startsWith('"') && fieldName.endsWith('"'))) {
        fieldName = fieldName.substring(1, fieldName.length - 1);
      }
      
      // 检查是否包含 PRIMARY KEY（模糊匹配）
      const isPrimary = lowerFieldDef.includes('primary key');
      
      // 检查是否有 COMMENT
      let attributeName;
      const commentIndex = lowerFieldDef.indexOf('comment');
      
      if (commentIndex !== -1) {
        // 查找 comment 后面的引号内容
        let quoteStart = commentIndex + 7; // "comment" 的长度
        
        // 跳过空格
        while (quoteStart < fieldDef.length && /\s/.test(fieldDef[quoteStart])) {
          quoteStart++;
        }
        
        // 查找引号
        if (quoteStart < fieldDef.length && 
            (fieldDef[quoteStart] === '\'' || fieldDef[quoteStart] === '"')) {
          const quoteChar = fieldDef[quoteStart];
          let quoteEnd = quoteStart + 1;
          
          // 查找结束引号
          while (quoteEnd < fieldDef.length && fieldDef[quoteEnd] !== quoteChar) {
            quoteEnd++;
          }
          
          if (quoteEnd < fieldDef.length) {
            // 提取引号内的内容
            attributeName = fieldDef.substring(quoteStart + 1, quoteEnd);
          } else {
            attributeName = fieldName;
          }
        } else {
          attributeName = fieldName;
        }
      } else {
        // 如果没有 comment，使用字段名
        attributeName = fieldName;
      }

      // 创建属性对象并添加到实体的 attribute 数组中
      entity.attribute.push({
        name: attributeName,
        x: 0,
        y: attrY,
        isPrimary: isPrimary
      });

      attrY += 20; // 下一个属性的Y坐标
    });

    // 添加实体到 erDiagram.entities
    erDiagram.entities.push(entity);

    // 更新下一次搜索的起始位置
    currentIndex = semicolonIndex + 1;
  }
}