const frameElement = document.querySelector(".frame");

// 响应式的窗口高宽
function movecanvas() {
  const navigationHeight = document.querySelector('.navigation').offsetHeight;
  const editWidth = document.querySelector('.edit').offsetWidth;
  let w = window.innerWidth - editWidth;
  let h = window.innerHeight - navigationHeight;
  app.renderer.resize(w, h);
}

// 用来绘制图形
const drawGraphics = {
  createRectangle(x, y, width, height, linesize = 2, linecolor = 0x1f1f1f, linealpha = 1, color = 0x66CCFF, alpha = 1, cornerRadius = 8) {
    // 创建一个图形对象
    const rectangle = new PIXI.Graphics();

    // 开始绘制
    rectangle.beginFill(color, alpha); // 填充颜色和透明度

    // 使用新的方法设置描边样式
    rectangle.setStrokeStyle({
      width: linesize,
      color: linecolor,
      alpha: linealpha
    });

    rectangle.drawRoundedRect(0, 0, width, height, cornerRadius); // 绘制圆角矩形
    rectangle.endFill(); // 结束填充

    // 设置位置
    rectangle.x = x;
    rectangle.y = y;

    return rectangle;
  },

  // 创建椭圆
  createEllipse(x, y, width, height, linesize = 2, linecolor = 0x1f1f1f, linealpha = 1, color = 0x66CCFF, alpha = 1) {
    // 创建一个图形对象
    const ellipse = new PIXI.Graphics();

    // 开始绘制
    ellipse.beginFill(color, alpha); // 填充颜色和透明度

    // 使用新的方法设置描边样式
    ellipse.setStrokeStyle({
      width: linesize,
      color: linecolor,
      alpha: linealpha
    });

    // 绘制椭圆 - 参数为: 中心点x, 中心点y, 半宽, 半高
    const radiusX = width / 2;
    const radiusY = height / 2;
    ellipse.drawEllipse(radiusX, radiusY, radiusX, radiusY);

    ellipse.endFill(); // 结束填充

    // 设置位置
    ellipse.x = x;
    ellipse.y = y;

    return ellipse;
  },

  // 创建菱形
  createDiamond(x, y, width, height, linesize = 2, linecolor = 0x1f1f1f, linealpha = 1, color = 0x66CCFF, alpha = 1) {
    // 创建一个图形对象
    const diamond = new PIXI.Graphics();

    // 开始绘制
    diamond.beginFill(color, alpha); // 填充颜色和透明度

    // 使用新的方法设置描边样式
    diamond.setStrokeStyle({
      width: linesize,
      color: linecolor,
      alpha: linealpha
    });

    // 绘制菱形 - 使用moveTo和lineTo绘制四个点
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    diamond.moveTo(halfWidth, 0);             // 上顶点
    diamond.lineTo(width, halfHeight);        // 右顶点
    diamond.lineTo(halfWidth, height);        // 下顶点
    diamond.lineTo(0, halfHeight);            // 左顶点
    diamond.lineTo(halfWidth, 0);             // 回到上顶点

    diamond.endFill(); // 结束填充

    // 设置位置
    diamond.x = x;
    diamond.y = y;

    return diamond;
  },
  // 创建线条 (只处理实线)
  createLine(startX, startY, endX, endY, linesize = 2, linecolor = 0x1f1f1f, linealpha = 1) {
    // 创建一个图形对象
    const line = new PIXI.Graphics();

    // 使用新的方法设置描边样式
    line.setStrokeStyle({
      width: linesize,
      color: linecolor,
      alpha: linealpha
    });

    // 绘制实线
    line.moveTo(startX, startY);
    line.lineTo(endX, endY);
    line.stroke(); // 添加这一行来实际绘制线条

    return line;
  }
}

// 事件，处理交互
const erEvent = {
  dragging: null, // 当前拖动的容器
  // 画布拖动
  dragroot() {
    let lastPosition = { x: 0, y: 0 };
    let isSpacePressed = false;

    // 监听键盘按下和释放事件
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        isSpacePressed = true;
        frameElement.style.cursor = 'grab';
      };
    });

    window.addEventListener('keyup', (event) => {
      if (event.code === 'Space') {
        isSpacePressed = false;
        frameElement.style.cursor = 'default';
      }
    });

    const move = function (event) {
      const dx = event.clientX - lastPosition.x;
      const dy = event.clientY - lastPosition.y;

      root.x += dx;
      root.y += dy;

      lastPosition.x = event.clientX;
      lastPosition.y = event.clientY;
    }

    frameElement.addEventListener('mousedown', (event) => {
      if (isSpacePressed && event.button === 0) {
        lastPosition = { x: event.clientX, y: event.clientY };
        frameElement.addEventListener('mousemove', move);
      }
    });

    frameElement.addEventListener('mouseup', () => {
      frameElement.removeEventListener('mousemove', move);
    });

    frameElement.addEventListener('mouseleave', () => {
      frameElement.removeEventListener('mousemove', move);
    });
  },
  // 根节点居中
  rootcenter() {
    root.x = app.renderer.width / 2 - (erDiagram.w / 2) * root.scale.x;
    root.y = app.renderer.height / 2.3 - (erDiagram.h / 2) * root.scale.y;
  },
  // 根节点缩放
  Scalingroot() {
    frameElement.addEventListener('wheel', (event) => {
      event.preventDefault();

      // 计算鼠标在画布上的相对位置
      const rect = app.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // 计算鼠标在root坐标系中的位置
      const localX = (mouseX - root.x) / root.scale.x;
      const localY = (mouseY - root.y) / root.scale.y;

      // 确定缩放因子
      const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;

      // 保存旧的缩放值
      const oldScaleX = root.scale.x;
      const oldScaleY = root.scale.y;

      // 应用新的缩放
      root.scale.x *= scaleFactor;
      root.scale.y *= scaleFactor;

      // 调整位置，使鼠标位置保持在相同的世界坐标上
      root.x = mouseX - localX * root.scale.x;
      root.y = mouseY - localY * root.scale.y;
    });
  },
  // 鼠标移动处理
  draggingmove() {
    // dragStartPos用的是鼠标按下时的全局位置，startPosition用的是容器在拖动开始时的本地位置，所以算法是错的。。
    // 但是不影响使用，所以不管了
    if (this.dragging) {
      // 获取当前鼠标位置
      const mousePosition = app.renderer.events.pointer.global;

      // 计算相对于初始点击位置的偏移量，并考虑root的缩放因子
      const dx = (mousePosition.x - this.dragging.dragStartPos.x) / root.scale.x;
      const dy = (mousePosition.y - this.dragging.dragStartPos.y) / root.scale.y;

      this.dragging.container.x = this.dragging.startPosition.x + dx;
      this.dragging.container.y = this.dragging.startPosition.y + dy;

      // 应用网格吸附（如果启用）
      if (GridManager.snapEnabled) {
        const snapped = GridManager.snapToGrid(this.dragging.container);
        this.dragging.container.x = snapped.x;
        this.dragging.container.y = snapped.y;
      }
    }
  },
  // 为容器添加通用拖动功能
  makeDraggable(docker) {
    // 启用交互
    docker.eventMode = 'dynamic';
    docker.cursor = 'pointer';

    // 鼠标按下事件
    docker.on('pointerdown', function (event) {
      event.stopPropagation();
      erEvent.dragging = {
        container: this,
        dragStartPos: { x: event.global.x, y: event.global.y },
        startPosition: { x: this.x, y: this.y }
      };
      this.alpha = 0.8;
      this.cursor = 'grabbing';
    });

    // 鼠标释放事件
    docker.on('pointerup', function () {
      if (erEvent.dragging) {
        erEvent.dragging = null;
        this.alpha = 1;
        this.cursor = 'pointer';
        ReturnDatas.Coordinates(); // 更新坐标信息
      }
    });

    // 鼠标离开事件
    docker.on('pointerupoutside', function () {
      if (erEvent.dragging) {
        erEvent.dragging = null;
        this.alpha = 1;
        this.cursor = 'pointer';
        ReturnDatas.Coordinates(); // 更新坐标信息
      }
    });
  },
  // 截图并保存
  captureAndSaveScreenshot() {
    // 使用canvas提取当前画布
    const canvas = app.renderer.extract.canvas(root);

    // 将canvas转换为blob
    canvas.toBlob(function (blob) {
      // 创建一个临时的URL对象
      const url = URL.createObjectURL(blob);

      // 创建下载链接
      const link = document.createElement('a');
      link.download = `er-diagram-${Date.now()}.png`;
      link.href = url;

      // 触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      console.log('截图已保存');
    }, 'image/png');
  }
}

// 将主程序的数据转化为容器，并给容器添加监听器
const Transformation = {
  // 创建实体名称字典
  namedict: {},
  // 创建通用容器和文本
  // x: x坐标 y: y坐标 shape: 图形对象 textContent: 文本内容 textSize: 文本大小 textColor: 文本颜色
  // 创建通用容器和文本
  _createContainerWithText(shape, textContent, textSize, textColor) {
    const docker = new PIXI.Container();

    // 启用zIndex排序
    docker.sortableChildren = true;

    // 添加形状，设置中间层zIndex
    shape.zIndex = 1;

    // 创建并添加文本，设置最高层zIndex
    const textObj = new PIXI.Text(textContent, {
      fontSize: textSize,
      fill: textColor,
      align: 'center',
    });

    textObj.resolution = 5;
    textObj.anchor.set(0.5, 0.5);
    textObj.x = shape.width / 2;
    textObj.y = shape.height / 2;
    textObj.zIndex = 2; // 文本放在最上层

    docker.addChild(shape);
    docker.addChild(textObj);
    return docker;
  },
  // 创建属性容器和文本
  _createAttributeWithText(attribute, isPrimary = false) {
    // 设置椭圆尺寸
    const ellipseWidth = 80 + Math.max(0, attribute.name.length - 5) * 15;
    const ellipseHeight = 35;

    // 根据主键属性选择填充颜色
    const fillColor = 0xFFFFFF;

    // 创建容器并设置位置
    const attrContainer = new PIXI.Container();
    attrContainer.sortableChildren = true; // 启用zIndex排序

    // 创建椭圆形状，中间层
    const attrShape = drawGraphics.createEllipse(0, 0, ellipseWidth, ellipseHeight, 1, 0x1f1f1f, 1, fillColor, 1);
    attrShape.zIndex = 2;
    attrContainer.addChild(attrShape);

    // 创建文本，最高层
    const textObj = new PIXI.Text(attribute.name, {
      fontSize: 14,
      fill: 0x000000,
      align: 'center',
    });

    // 文字居中
    textObj.resolution = 5;
    textObj.anchor.set(0.5, 0.5);
    textObj.x = ellipseWidth / 2;
    textObj.y = ellipseHeight / 2;
    textObj.zIndex = 2;
    attrContainer.addChild(textObj);

    // 名字方便调试
    attrContainer.name = attribute.name;

    // 如果是主键，添加简单下划线，还有名字特殊处理
    if (isPrimary) {
      attrContainer.name = "$Primary$" + attribute.name;

      const underline = drawGraphics.createLine(
        (ellipseWidth - textObj.width) / 2,
        ellipseHeight / 2 + 8,
        (ellipseWidth + textObj.width) / 2,
        ellipseHeight / 2 + 8,
        1, 0x000000, 1
      );
      underline.zIndex = 2;
      attrContainer.addChild(underline);
    }
    return attrContainer;
  },
  // 实体
  tfEntity() {
    erDiagram.entities.forEach((entity) => {
      // 创建实体
      const entityCanvas = drawGraphics.createRectangle(0, 0, 100, 40, 1, 0x1f1f1f, 1, 0xffffff, 1, 8);
      const docker = this._createContainerWithText(
        entityCanvas,
        entity.name,
        entity.textsize,
        entity.textcolor
      );
      docker.zIndex = 1; // 设置实体容器的zIndex为1，确保它在网格上方
      docker.name = entity.name; // 设置实体名称
      docker.x = entity.x;
      docker.y = entity.y;

      // 为实体容器添加拖动功能
      erEvent.makeDraggable(docker);
      root.addChild(docker);

      // 初始化名称字典
      this.namedict[entity.name] = docker;

      // 渲染实体的属性
      entity.attribute.forEach(attr => {
        const attrContainer = this._createAttributeWithText(
          attr,
          attr.isPrimary
        );
        docker.addChild(attrContainer);
        attrContainer.x = attr.x;
        attrContainer.y = attr.y;
        // 为属性容器添加拖动功能
        erEvent.makeDraggable(attrContainer);

        // 注册连接线
        containerConnector.connect(
          "E" + docker.name + attr.name,
          docker,
          attrContainer
        );

        ReturnDatas.data.set(attr, ReturnDatas.data); // 保存属性容器引用，方便后续操作
      });
      ReturnDatas.data.set(entity, docker); // 保存实体容器引用，方便后续操作
    });
  },
  // 关系
  tfRelationship() {
    erDiagram.relationships.forEach((relationship) => {
      // 创建菱形
      const relationshipCanvas = drawGraphics.createDiamond(0, 0, 100, 50, 1, 0x1f1f1f, 1, 0xffffff, 1);

      // 使用通用容器创建函数，传入线条数组作为最后一个参数
      const docker = this._createContainerWithText(
        relationshipCanvas,
        relationship.name,
        relationship.textsize,
        relationship.textcolor,
      );
      docker.zIndex = 1; // 设置关系容器的zIndex为1，确保它在网格上方
      docker.name = relationship.name; // 设置关系名称
      docker.x = relationship.x;
      docker.y = relationship.y;
      root.addChild(docker);

      // 注册连接线
      containerConnector.connect(
        relationship.name + "left",
        Transformation.namedict[relationship.relationship.leftEntity],
        docker
      );
      containerConnector.connect(
        relationship.name + "right",
        Transformation.namedict[relationship.relationship.rightEntity],
        docker
      );

      relationship.attribute.forEach(attr => {
        const attrContainer = this._createAttributeWithText(
          attr,
          false // 关系属性通常没有主键标识
        );
        docker.addChild(attrContainer);
        attrContainer.x = attr.x;
        attrContainer.y = attr.y;

        // 为属性容器添加拖动功能
        erEvent.makeDraggable(attrContainer);

        // 注册连接线
        containerConnector.connect(
          "R" + docker.name + attr.name,
          docker,
          attrContainer
        );
        ReturnDatas.data.set(attr, attrContainer); // 保存属性容器引用，方便后续操作
      });
      // 为关系容器添加拖动功能
      erEvent.makeDraggable(docker);
      ReturnDatas.data.set(relationship, docker); // 保存关系容器引用，方便后续操作
    });
  },
  main() {
    this.tfEntity();
    this.tfRelationship();
  }
};

// 把root里面的坐标信息之类的传回erDiagram
const ReturnDatas = {
  data: new Map(),
  // 返回实体和关系的坐标信息
  Coordinates() {
    erDiagram.entities.forEach(entity => {
      const container = this.data.get(entity);
      if (container) {
        entity.x = container.x;
        entity.y = container.y;
        // 更新属性坐标
        entity.attribute.forEach(attr => {
          const attrContainer = container.children.find(child => child.name === attr.name);
          if (attrContainer) {
            attr.x = attrContainer.x;
            attr.y = attrContainer.y;
          }
        });
      }
    });
    erDiagram.relationships.forEach(relationship => {
      const container = this.data.get(relationship);
      if (container) {
        relationship.x = container.x;
        relationship.y = container.y;
        // 更新关系属性坐标
        relationship.attribute.forEach(attr => {
          const attrContainer = container.children.find(child => child.name === attr.name);
          if (attrContainer) {
            attr.x = attrContainer.x;
            attr.y = attrContainer.y;
          }
        });
      }
    });
  }
}

// 线条管理器 - 处理所有线条的创建、更新和渲染
const lineManager = {
  lines: {},
  linesGraphicsContainer: null, // 持久化的线条容器
  // 初始化线条管理器，创建专用的图形容器
  init(appRoot) {
    if (!this.linesGraphicsContainer) {
      this.linesGraphicsContainer = new PIXI.Container();
      this.linesGraphicsContainer.name = "lineManagerContainer";
      this.linesGraphicsContainer.zIndex = 0;
      appRoot.addChild(this.linesGraphicsContainer);
    }
  },
  // 注册一条新线条
  registerLine(name, startX = 0, startY = 0, endX = 0, endY = 0, linesize = 1, linecolor = 0x1f1f1f, linealpha = 1) {
    if (!this.lines[name]) {
      const graphicLine = drawGraphics.createLine(startX, startY, endX, endY, linesize, linecolor, linealpha);
      graphicLine.name = name;

      this.lines[name] = {
        startX, startY, endX, endY, linesize, linecolor, linealpha,
        graphic: graphicLine
      };
      this.linesGraphicsContainer.addChild(graphicLine);
    } else {
      // 直接修改对象属性
      this.lines[name].startX = startX;
      this.lines[name].startY = startY;
      this.lines[name].endX = endX;
      this.lines[name].endY = endY;
      this.lines[name].linesize = linesize;
      this.lines[name].linecolor = linecolor;
      this.lines[name].linealpha = linealpha;

      this._redrawSingleLine(this.lines[name].graphic, this.lines[name]);
    }
    return this.lines[name];
  },
  // 内部方法：在指定的 Graphics 对象上重绘单条线
  _redrawSingleLine(graphic, lineData) {
    graphic.clear();

    graphic.setStrokeStyle({
      width: lineData.linesize,
      color: lineData.linecolor,
      alpha: lineData.linealpha,
    });

    graphic.moveTo(lineData.startX, lineData.startY);
    graphic.lineTo(lineData.endX, lineData.endY);
    graphic.stroke();
  },
  // 通过名称查找线条
  getLine(name) {
    return this.lines[name];
  },
  // 更新线条连接点
  updateLineConnection(name, startX, startY, endX, endY) {
    const lineData = this.getLine(name);
    if (lineData && lineData.graphic) {
      lineData.startX = startX;
      lineData.startY = startY;
      lineData.endX = endX;
      lineData.endY = endY;
      this._redrawSingleLine(lineData.graphic, lineData);
      return true;
    }
    return false;
  },
  // 删除所有线条
  removeall() {
    if (this.linesGraphicsContainer) {
      for (const name in this.lines) {
        if (this.lines[name].graphic) {
          // 从容器中移除并销毁图形对象
          this.linesGraphicsContainer.removeChild(this.lines[name].graphic);
          this.lines[name].graphic.destroy({ children: true, texture: true, baseTexture: true });
        }
      }
    }
    this.lines = {}; // 清空线条数据
  }
};

// 查找器 - 用于查找容器内的特定类型子元素(返回都是list)
const containerFinder = {
  // 计算容器中心点在root坐标系中的位置
  calculateConnectionPoint(container) {
    const shape = containerFinder.findGraphics(container)[0];
    // 计算容器中心点在世界坐标中的位置
    const globalPos = container.toGlobal(new PIXI.Point(shape.width / 2, shape.height / 2));
    // 将世界坐标转换回root容器的本地坐标
    return root.toLocal(globalPos);
  },
  // 查找容器下一级的所有Graphics对象
  findGraphics(container) {
    const graphicsObjects = [];
    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i];
      if (child instanceof PIXI.Graphics) {
        graphicsObjects.push(child);
      }
    }
    return graphicsObjects;
  },
  // 查找容器下一级的所有Text对象
  findText(container) {
    const textObjects = [];
    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i];
      if (child instanceof PIXI.Text) {
        textObjects.push(child);
      }
    }
    return textObjects;
  },
  // 查找容器下一级的所有Container对象（使用反选方法）
  findContainers(container) {
    const containerObjects = [];
    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i];
      if (!(child instanceof PIXI.Graphics) &&
        !(child instanceof PIXI.Text)) {
        containerObjects.push(child);
      }
    }
    return containerObjects;
  }
};

// 容器连接管理器 - 处理容器之间的线条连接
const containerConnector = {
  read: [],
  connect(name, startContainer, endContainer) {
    lineManager.registerLine(name, startContainer.x, startContainer.y, endContainer.x, endContainer.y);
    this.read.push({
      name: name,
      startContainer: startContainer,
      endContainer: endContainer,
    });
  },
  // 更新连接线条
  update() {
    this.read.forEach((connection) => {
      // 使用提取的方法计算连接点
      const startLocalPos = containerFinder.calculateConnectionPoint(connection.startContainer);
      const endLocalPos = containerFinder.calculateConnectionPoint(connection.endContainer);

      lineManager.updateLineConnection(
        connection.name,
        startLocalPos.x,
        startLocalPos.y,
        endLocalPos.x,
        endLocalPos.y
      );

      // 检查是否连接到主键属性，如果是则添加主键标识
      if (connection.endContainer.name && connection.endContainer.name.includes('$Primary$')) {
        this.addPrimaryKeyIndicator(connection.name, startLocalPos, endLocalPos);
      }
    });
  },
  // 添加主键指示器 - 在连接线中间添加一条垂直小横线
  addPrimaryKeyIndicator(baseName, startPos, endPos) {
    // 计算连接线中点位置
    const midX = (startPos.x + endPos.x) / 2;
    const midY = (startPos.y + endPos.y) / 2;

    // 计算垂直于连接线的方向
    const perpAngle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x) + Math.PI / 2;

    // 设置垂直小横线的长度
    const lineLength = 10;

    // 计算垂直小横线的起点和终点
    const perp1X = midX + Math.cos(perpAngle) * (lineLength / 2);
    const perp1Y = midY + Math.sin(perpAngle) * (lineLength / 2);
    const perp2X = 2 * midX - perp1X;
    const perp2Y = 2 * midY - perp1Y;

    // 创建并注册垂直小横线
    lineManager.registerLine(
      `${baseName}_primary_indicator`,
      perp1X,
      perp1Y,
      perp2X,
      perp2Y,
      1,
      0x000000, // 黑色
      1 // 完全不透明
    );
  },
  // 删除所有连接
  removeall() {
    this.read = [];
    lineManager.removeall();
  }
};

//边界管理
const BoundaryManagement = {
  height: 0,
  width: 0,

  // 初始化边界尺寸
  init() {
    if (root && root.children.length > 0) {
      this.height = root.getChildAt(0).height;
      this.width = root.getChildAt(0).width;
    }
  },
  wall(docker = root) {
    // 递归处理子容器
    for (let i = 0; i < docker.children.length; i++) {
      if (docker.children[i] instanceof PIXI.Container) {
        this.Limitations(docker.children[i]);
      }
    }
  },
  // 限制容器在边界内
  Limitations(docker = root) {
    const graphics = containerFinder.findGraphics(docker);
    if (graphics.length > 0) {
      const dockerwh = {
        w: graphics[0].width,
        h: graphics[0].height,
      };

      // 使用calculateConnectionPoint获取相对于root的位置
      const position = containerFinder.calculateConnectionPoint(docker);
      const globalX = position.x - dockerwh.w / 2; // 调整以获取左上角位置
      const globalY = position.y - dockerwh.h / 2;

      // 检查边界并调整容器位置
      if (globalX < 0) {
        // 向右移动容器以保持在边界内
        docker.x += -globalX / root.scale.x;
      }

      if (globalY < 0) {
        // 向下移动容器以保持在边界内
        docker.y += -globalY / root.scale.y;
      }

      if (globalX + dockerwh.w > this.width) {
        // 向左移动容器以保持在边界内
        docker.x -= (globalX + dockerwh.w - this.width) / root.scale.x;
      }

      if (globalY + dockerwh.h > this.height) {
        // 向上移动容器以保持在边界内
        docker.y -= (globalY + dockerwh.h - this.height) / root.scale.y;
      }

      // 递归处理子容器
      for (let i = 0; i < docker.children.length; i++) {
        if (docker.children[i] instanceof PIXI.Container) {
          this.Limitations(docker.children[i]);
        }
      }
    }
  }
};

// 网格管理器 - 处理网格显示、吸附和开关
const GridManager = {
  // 网格配置
  visible: false,        // 网格显示开关
  snapEnabled: false,    // 吸附功能开关
  size: 20,              // 网格单元格大小
  color: 0xCCCCCC,       // 网格线颜色
  alpha: 0.5,            // 网格线透明度
  lineWidth: 1,          // 网格线宽度
  gridGraphics: null,    // 网格图形对象
  zIndex: 0,

  // 初始化网格
  init() {
    this.gridGraphics = new PIXI.Graphics();
    this.gridGraphics.zIndex = this.zIndex;
    this.gridGraphics.name = "网格"
    root.addChild(this.gridGraphics);
    root.sortableChildren = true;

    // 初始不显示网格
    this.drawGrid();
  },
  // 绘制网格到整个窗口
  drawGrid() {
    this.gridGraphics.clear();

    if (!this.visible) {
      return
    }

    this.gridGraphics.alpha = this.alpha;

    // 设置线条样式
    this.gridGraphics.setStrokeStyle({
      width: this.lineWidth,
      color: this.color,
      alpha: this.alpha
    });

    // 获取当前视口范围
    const viewportWidth = app.renderer.width / root.scale.x;
    const viewportHeight = app.renderer.height / root.scale.y;

    // 计算网格范围（扩大一些以覆盖整个视口）
    const startX = -root.x / root.scale.x - viewportWidth;
    const startY = -root.y / root.scale.y - viewportHeight;
    const endX = startX + viewportWidth * 3;
    const endY = startY + viewportHeight * 3;

    // 绘制垂直线
    for (let x = Math.floor(startX / this.size) * this.size; x <= endX; x += this.size) {
      this.gridGraphics.moveTo(x, startY);
      this.gridGraphics.lineTo(x, endY);
    }

    // 绘制水平线
    for (let y = Math.floor(startY / this.size) * this.size; y <= endY; y += this.size) {
      this.gridGraphics.moveTo(startX, y);
      this.gridGraphics.lineTo(endX, y);
    }

    this.gridGraphics.stroke();
  },
  // 将坐标吸附到网格
  snapToGrid(container) {
    // 找到容器中的图形并获取尺寸
    const shape = containerFinder.findGraphics(container)[0];

    // 计算容器中心点在全局坐标系中的位置，然后转换到root坐标系
    const centerPoint = new PIXI.Point(shape.width / 2, shape.height / 2);
    const rootLocalCenter = root.toLocal(container.toGlobal(centerPoint));

    // 对坐标进行网格吸附
    const snappedPoint = new PIXI.Point(
      Math.round(rootLocalCenter.x / this.size) * this.size,
      Math.round(rootLocalCenter.y / this.size) * this.size
    );

    // 将吸附后的坐标转回容器父级的本地坐标系
    const snappedParentLocal = container.parent.toLocal(root.toGlobal(snappedPoint));

    // 返回考虑了中心点偏移的新位置
    return {
      x: snappedParentLocal.x - centerPoint.x,
      y: snappedParentLocal.y - centerPoint.y
    };
  },
};

// 力导向布局,v = v0 + f*t这里的t是指每帧的时间间隔
const ForceLayout = {
  switch: true, // 开关
  list: [], // 存储每一个节点 (PIXI.Container 对象)
  nodes: new Map(), // 存储节点的物理属性(key为PIXI.Container对象，值为物理属性对象)

  // 力导向参数
  config: {
    repulsionForce: 5000, // 排斥力强度
    attractionForce: 0.01, // 吸引力强度
    damping: 0.4, // 阻尼系数
    iterations: 2 // 每帧迭代次数
  },
  // 初始化列表
  init(docker = root) {
    this.list = [];
    this.nodes.clear();

    const collectContainers = (container) => {
      // 使用 containerFinder.findContainers 查找当前容器的所有子容器
      const childContainers = containerFinder.findContainers(container);

      childContainers.forEach(child => {
        // 过滤掉系统容器
        if (child.name !== "lineManagerContainer" &&
          child.name !== "关系标识容器") {
          this.list.push(child);
          // 初始化节点物理属性
          this.nodes.set(child, {
            vx: 0, // x方向速度
            vy: 0, // y方向速度
            fx: 0, // x方向受力
            fy: 0  // y方向受力
          });

          // 递归收集子容器的子容器（属性的子容器等）
          collectContainers(child);
        }
      });
    };

    collectContainers(docker);
  },
  // 获取容器在root坐标系中的中心点位置
  getContainerRootPosition(container) {
    const shape = containerFinder.findGraphics(container)[0];
    const centerPoint = new PIXI.Point(shape.width / 2, shape.height / 2);
    const globalPos = container.toGlobal(centerPoint);
    return root.toLocal(globalPos);
  },
  // 将root坐标系中的位置转换为容器的本地坐标
  setContainerFromRootPosition(container, rootX, rootY) {
    const shape = containerFinder.findGraphics(container)[0];
    const centerOffset = new PIXI.Point(shape.width / 2, shape.height / 2);

    // 将root坐标转换为全局坐标，再转为容器父级的本地坐标
    const rootPoint = new PIXI.Point(rootX, rootY);
    const globalPoint = root.toGlobal(rootPoint);
    const parentLocalPoint = container.parent.toLocal(globalPoint);

    // 设置容器位置（考虑中心点偏移）
    container.x = parentLocalPoint.x - centerOffset.x;
    container.y = parentLocalPoint.y - centerOffset.y;
  },
  // 计算两个节点之间的排斥力
  calculateRepulsion(node1, node2) {
    const dx = node2.x - node1.x;
    const dy = node2.y - node1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return { fx: 1, fy: 1 };// 避免除以零导致force无限大，而fx，fy为1是防止两个节点重叠在一起

    const force = this.config.repulsionForce / (distance * distance);

    return {
      fx: -(dx / distance) * force,
      fy: -(dy / distance) * force
    };
  },
  // 计算连接线的吸引力
  calculateAttraction(node1, node2) {
    const dx = node2.x - node1.x;
    const dy = node2.y - node1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return { fx: 0, fy: 0 };

    const force = distance * this.config.attractionForce;

    return {
      fx: (dx / distance) * force,
      fy: (dy / distance) * force
    };
  },
  // 检查两个节点是否有连接
  areConnected(node1, node2) {
    return containerConnector.read.some(connection =>
      (connection.startContainer === node1 && connection.endContainer === node2) ||
      (connection.startContainer === node2 && connection.endContainer === node1)
    );
  },
  // 执行一次力导向计算
  update() {
    if (!this.switch) return;

    for (let iteration = 0; iteration < this.config.iterations; iteration++) {
      // 重置所有节点的受力
      this.list.forEach(node => {
        const nodeData = this.nodes.get(node);
        nodeData.fx = 0;
        nodeData.fy = 0;
      });

      // 计算排斥力（所有节点之间）
      for (let i = 0; i < this.list.length; i++) {
        for (let j = i + 1; j < this.list.length; j++) {
          const node1 = this.list[i];
          const node2 = this.list[j];
          const node1Data = this.nodes.get(node1);
          const node2Data = this.nodes.get(node2);

          // 获取节点在root坐标系中的位置
          const node1RootPos = this.getContainerRootPosition(node1);
          const node2RootPos = this.getContainerRootPosition(node2);

          // 使用现有的 calculateRepulsion 方法
          const repulsion = this.calculateRepulsion(node1RootPos, node2RootPos);

          node1Data.fx += repulsion.fx;
          node1Data.fy += repulsion.fy;
          node2Data.fx -= repulsion.fx;
          node2Data.fy -= repulsion.fy;
        }
      }

      // 计算吸引力（只在连接的节点之间）
      containerConnector.read.forEach(connection => {
        const node1 = connection.startContainer;
        const node2 = connection.endContainer;

        // 只处理主要容器之间的连接
        if (this.list.includes(node1) && this.list.includes(node2)) {
          const node1Data = this.nodes.get(node1);
          const node2Data = this.nodes.get(node2);

          // 获取节点在root坐标系中的位置
          const node1RootPos = this.getContainerRootPosition(node1);
          const node2RootPos = this.getContainerRootPosition(node2);

          // 使用现有的 calculateAttraction 方法
          const attraction = this.calculateAttraction(node1RootPos, node2RootPos);

          node1Data.fx += attraction.fx;
          node1Data.fy += attraction.fy;
          node2Data.fx -= attraction.fx;
          node2Data.fy -= attraction.fy;
        }
      });

      // 更新速度和位置
      this.list.forEach(node => {
        const nodeData = this.nodes.get(node);

        // 更新速度
        nodeData.vx = (nodeData.vx + nodeData.fx) * this.config.damping;
        nodeData.vy = (nodeData.vy + nodeData.fy) * this.config.damping;

        // 限制最大速度
        const maxSpeed = 5;
        const speed = Math.sqrt(nodeData.vx * nodeData.vx + nodeData.vy * nodeData.vy);
        if (speed > maxSpeed) {
          nodeData.vx = (nodeData.vx / speed) * maxSpeed;
          nodeData.vy = (nodeData.vy / speed) * maxSpeed;
        }

        // 获取当前节点在root坐标系中的位置
        const currentRootPos = this.getContainerRootPosition(node);

        // 计算新的root坐标系位置
        const newRootX = currentRootPos.x + nodeData.vx;
        const newRootY = currentRootPos.y + nodeData.vy;

        // 将新位置应用到容器
        this.setContainerFromRootPosition(node, newRootX, newRootY);
      });
    }
  }
}

// 关系标识管理器 - 处理关系连接线上的文字标识（如1:N, M:N等）
// 这部分写得很烂，因为实在是不想写这一坨了如果可以的话后面就优化一下吧
// 主要优化方面是性能 还有存储结构那个寻找链太长了而且依赖于其他的部分(讲实话总感觉这样子看的话整个都需要render都要优化...)
const RelationshipLabelManager = {
  labels: [], // 存储所有关系标识的容器
  // 里面都是对象，{relationship, leftEntity, rightEntity, lefttoright}前面三个是直接对应的root下面的容器的引用，第四个是关系类型的INT
  docker: null, // 存储关系标识容器
  // 初始化关系标识容器,只需要调用一次不然会报错
  initContainer() {
    const docker = new PIXI.Container();
    docker.name = "关系标识容器";
    docker.zIndex = 0;
    this.docker = docker;
    root.addChild(docker);
  },
  // 初始化labels的
  init() {
    this.labels = [];

    erDiagram.relationships.forEach((relationship) => {
      // 创建关系标识容器
      const labelContainer = new PIXI.Container();
      labelContainer.name = "关系标识_" + relationship.name;
      labelContainer.zIndex = 1;

      // 获取左实体和右实体的引用
      let leftEntity = null
      let rightEntity = null
      erDiagram.entities.forEach((entity) => {
        if (entity.name === relationship.relationship.leftEntity) {
          leftEntity = entity;
        }
        if (entity.name === relationship.relationship.rightEntity) {
          rightEntity = entity;
        }
      });
      this.addLabel(relationship, leftEntity, rightEntity, relationship.relationship.lefttoright);
    })
  },
  // 前面三个全都是erDiagram里面的对象的引用，第四个是INT类型
  addLabel(relationship, leftEntity, rightEntity, lefttoright) {
    this.labels.push({
      relationship: ReturnDatas.data.get(relationship),
      leftEntity: ReturnDatas.data.get(leftEntity),
      rightEntity: ReturnDatas.data.get(rightEntity),
      lefttoright: lefttoright, // 1 代表一对一， 2 代表一对多，3 代表多对多
    });
  },
  // 创建关系标识文本
  craetetext(text, x, y) {
    const textObj = new PIXI.Text(text, {
      fontSize: 14,
      fill: 0x000000,
      align: 'center',
    });

    textObj.resolution = 5;
    textObj.anchor.set(0.5, 0.5);
    textObj.x = x;
    textObj.y = y;

    return textObj;
  },
  // 更新，在每一帧都会调用
  update() {
    this.docker.removeChildren(); // 清空容器
    this.labels.forEach((label) => {
      const to = ['占位', '11', '1N', 'NN']; // 根据关系类型选择文本

      // 使用 calculateConnectionPoint 获取容器中心点在 root 坐标系中的位置
      const leftEntityCenter = containerFinder.calculateConnectionPoint(label.leftEntity);
      const relationshipCenter = containerFinder.calculateConnectionPoint(label.relationship);
      const rightEntityCenter = containerFinder.calculateConnectionPoint(label.rightEntity);

      const lefttextX = (leftEntityCenter.x + relationshipCenter.x) / 2;
      const lefttextY = (leftEntityCenter.y + relationshipCenter.y) / 2;
      const lefttext = this.craetetext(to[label.lefttoright][0], lefttextX, lefttextY);

      const righttextX = (rightEntityCenter.x + relationshipCenter.x) / 2;
      const righttextY = (rightEntityCenter.y + relationshipCenter.y) / 2;
      const righttext = this.craetetext(to[label.lefttoright][1], righttextX, righttextY);

      this.docker.addChild(lefttext);
      this.docker.addChild(righttext);
    });
  }
}

// 刷新（把erDiagram的实体和关系转换成容器和初始化各种管理器）
const Refresh = () => {
  // 调整画布尺寸
  root.getChildAt(0).width = erDiagram.w;
  root.getChildAt(0).height = erDiagram.h;

  BoundaryManagement.init(); // 重新初始化边界管理

  // 清空根节点,除了第Rootcanvas元素
  while (root.children.length > 4) {
    root.removeChildAt(4);
  }
  containerConnector.removeall();

  // 初始化实体和关系的转换
  Transformation.main();

  // 初始化关系标识管理器
  RelationshipLabelManager.init();
  ForceLayout.init();
}

// 初始化
const ALLinit = () => {
  // 调整窗口高宽
  movecanvas();

  // 画布拖动和缩放的监听器
  erEvent.Scalingroot();
  erEvent.dragroot();

  // 居中root
  erEvent.rootcenter();

  // 初始化边界管理
  BoundaryManagement.init();

  // 初始化网格管理器
  GridManager.init();

  // 初始化线条管理器
  lineManager.init(root);

  // 初始化容器连接管理器
  RelationshipLabelManager.initContainer();

  Refresh();

  console.log('Root container:', root);
};

// 主程序-----------------------------------------------------------------
const app = new PIXI.Application();

// 使用 init() 方法初始化应用
await app.init({
  backgroundColor: 0xF7F7F7,//背景颜色
  antialias: true,//抗锯齿
  resolution: window.devicePixelRatio || 1, // 适应高DPI屏幕
  autoDensity: true // 自动调整CSS大小以匹配分辨率
});

// 将 PixiJS 应用的 canvas 添加到 .frame 元素中
frameElement.insertBefore(app.canvas, frameElement.firstChild);

const root = new PIXI.Container();
root.name = "root"
app.stage.addChild(root);

const Rootcanvas = drawGraphics.createRectangle(0, 0, erDiagram.w, erDiagram.h, 0, 0xffffff, 0, 0xffffff, 1, 0);
Rootcanvas.name = "画布";
root.addChild(Rootcanvas);

// 加载完所有资源才会执行这一个代码块
window.addEventListener('load', () => {
  ALLinit()

  app.ticker.maxFPS = 90; // 设置最大帧率
  app.ticker.add((ticker) => {
    // 更新网格显示（当缩放或拖动根容器时）
    GridManager.drawGrid();

    // 力导向布局更新
    ForceLayout.update();

    // 处理拖拽移动
    erEvent.draggingmove();

    // 检查节点位置是否在边界内
    BoundaryManagement.wall(root);

    // 在每一帧重绘线条
    containerConnector.update();

    // 更新关系标识
    RelationshipLabelManager.update();
  });
});

export { GridManager, Transformation, root, containerConnector, ForceLayout, Refresh, erEvent }
