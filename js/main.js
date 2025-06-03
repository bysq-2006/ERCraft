//对于 节点 一个list里面嵌入object
//这个object的属性是这样
//1. name 这个是实体的名字
//2. x 这个是实体的x坐标
//3. y 这个是实体的y坐标
//4. textcolor 这个是实体的字的颜色
//5. textsize 这个是实体的字号
//6. attribute 这个是实体的属性列表
//  对于属性列表,里面的每一个属性也是一个object
//  1. name 这个是属性的名字
//  2. x 这个是属性的x坐标
//  3. y 这个是属性的y坐标
//  4. isPrimary 这个是属性是否是主键

//对于 关系 一个list里面嵌入object
//这个object的属性是这样
//1. name 这个是关系的名字
//2. x 这个是关系的x坐标
//3. y 这个是关系的y坐标
//4. textcolor 这个是关系的字的颜色
//5. textsize 这个是关系的字号
//6. relationship 这个是关系，是一个object
//  1. leftEntity 这个是关系的左边的实体
//  2. rightEntity 这个是关系的右边的实体
//  3. lefttoright 这个是关系的左边的实体对于于右边的实体的关系
//    lefttoright的值是一个int ，
//      1. 1 代表一对一
//      2. 2 代表一对多
//      3. 3 代表多对多
//7. attribute 这个是关系的属性列表
//  对于属性列表,里面的每一个属性也是一个object
//  1. name 这个是属性的名字
//  2. x 这个是属性的x坐标
//  3. y 这个是属性的y坐标

// 全局数据存储
const erDiagram = {
  w: 800,
  h: 600,
  entities: [],      // 存储所有实体
  relationships: []  // 存储所有关系
};

// 测试用的数据
erDiagram.entities = [
  {
    name: "学生",
    x: 100,
    y: 100,
    textcolor: "#000000",
    textsize: 16,
    attribute: [
      { name: "学号", x: 50, y: 150, isPrimary: true },
      { name: "姓名", x: 100, y: 150, isPrimary: false },
      { name: "年龄", x: 150, y: 150, isPrimary: false }
    ]
  },
  {
    name: "课程",
    x: 500,
    y: 100,
    textcolor: "#000000",
    textsize: 16,
    attribute: [
      { name: "课程号", x: 50, y: 150, isPrimary: true },
      { name: "课程名", x: 100, y: 150, isPrimary: false },
      { name: "学分", x: 50, y: 150, isPrimary: false }
    ]
  },
  {
    name: "教师",
    x: 300,
    y: 300,
    textcolor: "#000000",
    textsize: 16,
    attribute: [
      { name: "工号", x: 70, y: 350, isPrimary: true },
      { name: "姓名", x: 100, y: 350, isPrimary: false },
      { name: "职称", x: 50, y: 350, isPrimary: false }
    ]
  }
];

// 添加关系
erDiagram.relationships = [
  {
    name: "选修",
    x: 300,
    y: 100,
    textcolor: "#000000",
    textsize: 14,
    relationship: {
      leftEntity: "学生",
      rightEntity: "课程",
      lefttoright: 3 // 多对多
    },
    attribute: [
      { name: "成绩", x: 300, y: 150 }
    ]
  },
  {
    name: "教授",
    x: 400,
    y: 200,
    textcolor: "#000000",
    textsize: 14,
    relationship: {
      leftEntity: "教师",
      rightEntity: "课程",
      lefttoright: 2 // 一对多
    },
    attribute: []
  }
];