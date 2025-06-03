import { root, Transformation, containerConnector, ForceLayout, Refresh } from "../frame/render.js"


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

  // 解析CREATE TABLE语句
  // 使用正则表达式匹配CREATE TABLE语句，包括表名和表内容
  const tableRegex = /CREATE\s+TABLE\s+(?:`|")?(\w+)(?:`|")?\s*\(([\s\S]*?)\)/gi;
  let tableMatch;

  // 依次处理每个CREATE TABLE语句
  while ((tableMatch = tableRegex.exec(sqlText)) !== null) {
    const tableName = tableMatch[1].trim();
    const tableContent = tableMatch[2];

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

    // 按行分割表内容
    const lines = tableContent.split(/,\s*[\r\n]/);
    let attrY = 30; // 属性的初始Y坐标（相对于实体）

    // 处理每一行（每个列定义）
    lines.forEach(line => {
      line = line.trim();
      if (!line || line.startsWith("PRIMARY KEY") || line.startsWith("FOREIGN KEY")) {
        return; // 跳过空行、主键定义和外键定义行
      }

      // 提取字段名和类型
      const fieldMatch = line.match(/^\s*(?:`|")?(\w+)(?:`|")?\s+([^\s,]+)/);
      if (!fieldMatch) return;

      const fieldName = fieldMatch[1];
      const fieldType = fieldMatch[2];

      // 检查是否有COMMENT
      let attributeName = fieldName;
      const commentMatch = line.match(/COMMENT\s+['"](.+?)['"]/i);
      if (commentMatch) {
        attributeName = commentMatch[1]; // 使用COMMENT中的内容作为属性名
      } else {
        attributeName = `${fieldName} (${fieldType})`; // 否则使用字段名和类型
      }

      // 检查是否是主键
      const isPrimary = line.toUpperCase().includes("PRIMARY KEY");

      // 创建属性对象
      entity.attribute.push({
        name: attributeName,
        x: 0,
        y: attrY,
        isPrimary: isPrimary
      });

      attrY += 20; // 下一个属性的Y坐标
    });

    // 添加实体到ER图
    erDiagram.entities.push(entity);
  }

  // 关系处理：按照你的要求，让用户自己定义
  // 这里我们不解析外键关系，只创建实体
}