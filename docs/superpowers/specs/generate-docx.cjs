const docx = require('docx');
const fs = require('fs');

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageBreak, TabStopPosition, TabStopType, convertInchesToTwip,
  LevelFormat, NumberFormat, ExternalHyperlink
} = docx;

// ======== 辅助函数 ========
function heading1(text) {
  return new Paragraph({
    text, heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'FF6B35' } },
  });
}
function heading2(text) {
  return new Paragraph({
    text, heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
  });
}
function heading3(text) {
  return new Paragraph({
    text, heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 80 },
  });
}
function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 24, font: { name: 'SimSun' }, ...opts })],
    spacing: { after: 80 },
  });
}
function boldPara(label, value) {
  return new Paragraph({
    children: [
      new TextRun({ text: label, bold: true, size: 24 }),
      new TextRun({ text: value, size: 24 }),
    ],
    spacing: { after: 60 },
  });
}
function bullet(text) {
  return new Paragraph({
    children: [new TextRun({ text: `  ${text}`, size: 24 })],
    bullet: { level: 0 },
    spacing: { after: 40 },
  });
}
function numbered(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 24 })],
    numbering: { reference: 'default', level: 0 },
    spacing: { after: 40 },
  });
}
function codeBlock(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: { name: 'Courier New' }, size: 18, color: '333333' })],
    spacing: { before: 40, after: 40 },
    indent: { left: 400 },
    shading: { type: ShadingType.CLEAR, fill: 'F5F5F5' },
  });
}
function centerPara(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 24, ...opts })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
  });
}
function emptyLine() {
  return new Paragraph({ spacing: { after: 80 } });
}

function makeCell(text, opts = {}) {
  const children = [new TextRun({ text, size: 20, bold: opts.bold || false, font: { name: 'SimSun' } })];
  return new TableCell({
    children: [new Paragraph({ children, alignment: opts.align || AlignmentType.LEFT })],
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
  });
}

function makeTable(headers, rows) {
  const headerCells = headers.map((h, i) => makeCell(h, { bold: true, align: AlignmentType.CENTER }));
  const headerRow = new TableRow({ children: headerCells, tableHeader: true });
  const dataRows = rows.map(row => {
    const cells = row.map((cell, i) => makeCell(cell));
    return new TableRow({ children: cells });
  });
  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// ======== 构建文档 ========
const children = [];

// ---- 封面 ----
for (let i = 0; i < 6; i++) children.push(emptyLine());
children.push(new Paragraph({
  children: [new TextRun({ text: '点餐小程序（顾客端）', size: 56, bold: true, color: 'FF6B35' })],
  alignment: AlignmentType.CENTER,
}));
children.push(emptyLine());
children.push(new Paragraph({
  children: [new TextRun({ text: '项目设计文档', size: 48, color: '555555' })],
  alignment: AlignmentType.CENTER,
}));
for (let i = 0; i < 3; i++) children.push(emptyLine());
['后端技术：Node.js + Express + MySQL', '前端平台：微信小程序', '文档版本：v1.0', '文档日期：2026年5月15日'].forEach(t => {
  children.push(new Paragraph({
    children: [new TextRun({ text: t, size: 28, color: '666666' })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
  }));
});
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 目录 ----
children.push(heading1('目  录'));
['绪论', '需求分析', '总体设计', '数据库设计', '接口设计', '详细设计', 'API 接口汇总'].forEach((title, i) => {
  children.push(new Paragraph({
    children: [new TextRun({ text: `  ${i + 1}  ${title}`, size: 26 })],
    spacing: { after: 100 },
  }));
});
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 1. 绪论 ----
children.push(heading1('1  绪论'));
children.push(heading2('1.1  项目背景'));
children.push(para('随着移动互联网的普及，餐饮行业的数字化需求日益增长。传统的中餐/快餐门店面临排队时间长、点餐效率低、人工成本高等问题。本项目旨在开发一款微信点餐小程序，让顾客通过手机自助完成浏览菜单、下单、支付的全流程，提升门店运营效率和顾客用餐体验。'));

children.push(heading2('1.2  项目目标'));
['实现顾客通过微信小程序自助点餐', '集成微信支付，完成在线支付闭环', '提供清晰的订单状态跟踪功能', '减轻前台点餐压力，提升翻台率'].forEach(t => children.push(bullet(t)));

children.push(heading2('1.3  技术选型'));
children.push(makeTable(['层面', '技术', '说明'], [
  ['前端', '微信小程序原生', '微信生态内无缝使用'],
  ['后端', 'Node.js + Express', '轻量高效，适合小程序后端'],
  ['数据库', 'MySQL', '关系型数据，结构化存储'],
  ['认证', 'JWT', '无状态认证'],
  ['支付', '微信支付', '原生集成'],
]));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 2. 需求分析 ----
children.push(heading1('2  需求分析'));
children.push(heading2('2.1  用户角色'));
children.push(para('顾客：小程序使用者，可通过微信授权登录，进行点餐、支付、查看订单等操作。'));

children.push(heading2('2.2  功能需求'));
children.push(heading3('2.2.1  用户模块'));
children.push(makeTable(['功能', '描述'], [['微信授权登录', '使用 wx.login 获取 code，后端换取 openid，自动注册/登录'], ['用户信息展示', '展示昵称、头像等基本信息']]));
children.push(heading3('2.2.2  菜品模块'));
children.push(makeTable(['功能', '描述'], [['分类浏览', '按分类浏览菜品'], ['菜品列表', '展示名称、图片、价格、月销量'], ['菜品详情', '查看描述、规格选择'], ['菜品搜索', '按关键字搜索']]));
children.push(heading3('2.2.3  购物车模块'));
children.push(makeTable(['功能', '描述'], [['添加菜品', '选择规格后加入购物车'], ['修改数量', '增减菜品数量'], ['删除菜品', '从购物车移除'], ['查看购物车', '展示已选菜品和总价']]));
children.push(heading3('2.2.4  订单模块'));
children.push(makeTable(['功能', '描述'], [['创建订单', '从购物车生成订单'], ['订单支付', '集成微信支付'], ['订单列表', '按状态查看订单'], ['订单详情', '查看菜品、金额、状态']]));

children.push(heading2('2.3  非功能需求'));
['页面加载时间不超过 3 秒', '支持高峰期 100+ 用户同时在线', '遵循微信支付安全规范', '敏感信息加密存储'].forEach(t => children.push(bullet(t)));

children.push(heading2('2.4  用例描述'));
children.push(para('顾客通过微信小程序进行以下操作：'));
['授权登录 → 浏览菜品 → 管理购物车 → 下单支付 → 查看订单状态'].forEach(t => children.push(numbered(t)));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 3. 总体设计 ----
children.push(heading1('3  总体设计'));
children.push(heading2('3.1  系统架构'));
children.push(para('系统采用前后端分离架构，前端为微信小程序，后端为 Node.js Express 应用，数据层使用 MySQL 数据库。'));
children.push(centerPara('[图 3-1  系统架构图]', { color: '999999' }));
const arch = '┌──────────────────────────────────┐\n│       微信小程序（顾客端）          │\n│  首页  详情页  购物车  订单列表    │\n├──────────────────────────────────┤\n│         HTTPS / JSON API          │\n├──────────────────────────────────┤\n│     Node.js Express 后端           │\n│  路由层 → 控制层 → 数据访问层      │\n├──────────────────────────────────┤\n│            MySQL 数据库            │\n└──────────────────────────────────┘';
children.push(codeBlock(arch));

children.push(heading2('3.2  模块划分'));
children.push(makeTable(['模块', '职责', '关键接口'], [
  ['user', '微信登录、用户管理', '/api/user/*'],
  ['category', '菜品分类管理', '/api/categories'],
  ['dish', '菜品浏览、搜索', '/api/dishes/*'],
  ['order', '订单创建、状态管理', '/api/orders/*'],
  ['pay', '微信支付集成', '/api/pay/*'],
]));

children.push(heading2('3.3  前后端交互流程'));
children.push(para('小程序页面 → HTTP请求 → Express路由 → Controller → Model → MySQL → JSON响应 → 小程序页面'));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 4. 数据库设计 ----
children.push(heading1('4  数据库设计'));
children.push(heading2('4.1  实体关系'));
children.push(para('系统包含 5 个核心实体：User、Category、Dish、Order、OrderItem。'));
children.push(centerPara('[图 4-1  ER 关系图]', { color: '999999' }));
children.push(codeBlock('User(1) ──── N Order(1) ──── N OrderItem\n                                    │\nCategory(1) ── N Dish(1) ──────────┘'));

children.push(heading2('4.2  数据表结构'));

children.push(heading3('4.2.1  user（用户表）'));
children.push(makeTable(['字段', '类型', '约束', '说明'], [
  ['id', 'INT', 'PK AUTO_INCREMENT', '主键'],
  ['openid', 'VARCHAR(64)', 'UNIQUE NOT NULL', '微信 openid'],
  ['nickname', 'VARCHAR(50)', '', '昵称'],
  ['avatar_url', 'VARCHAR(255)', '', '头像 URL'],
  ['phone', 'VARCHAR(20)', '', '手机号'],
  ['create_time', 'DATETIME', 'DEFAULT NOW()', '创建时间'],
]));

children.push(heading3('4.2.2  category（分类表）'));
children.push(makeTable(['字段', '类型', '约束', '说明'], [
  ['id', 'INT', 'PK AUTO_INCREMENT', '主键'],
  ['name', 'VARCHAR(30)', 'NOT NULL', '分类名称'],
  ['sort', 'INT', 'DEFAULT 0', '排序号'],
  ['create_time', 'DATETIME', 'DEFAULT NOW()', '创建时间'],
]));

children.push(heading3('4.2.3  dish（菜品表）'));
children.push(makeTable(['字段', '类型', '约束', '说明'], [
  ['id', 'INT', 'PK AUTO_INCREMENT', '主键'],
  ['category_id', 'INT', 'FK NOT NULL', '所属分类'],
  ['name', 'VARCHAR(50)', 'NOT NULL', '菜品名称'],
  ['price', 'DECIMAL(10,2)', 'NOT NULL', '价格'],
  ['status', 'TINYINT', 'DEFAULT 1', '1=上架 0=下架'],
  ['sales', 'INT', 'DEFAULT 0', '月销量'],
]));

children.push(heading3('4.2.4  order（订单表）'));
children.push(makeTable(['字段', '类型', '约束', '说明'], [
  ['id', 'INT', 'PK AUTO_INCREMENT', '主键'],
  ['order_no', 'VARCHAR(32)', 'UNIQUE NOT NULL', '订单号'],
  ['user_id', 'INT', 'FK NOT NULL', '用户 ID'],
  ['total_amount', 'DECIMAL(10,2)', 'NOT NULL', '总金额'],
  ['status', 'TINYINT', 'DEFAULT 0', '0=待支付 1=已支付 2=制作中 3=已完成 4=已取消'],
  ['create_time', 'DATETIME', 'DEFAULT NOW()', '创建时间'],
]));

children.push(heading3('4.2.5  order_item（订单项表）'));
children.push(makeTable(['字段', '类型', '约束', '说明'], [
  ['id', 'INT', 'PK AUTO_INCREMENT', '主键'],
  ['order_id', 'INT', 'FK NOT NULL', '所属订单'],
  ['dish_id', 'INT', 'FK NOT NULL', '菜品 ID'],
  ['dish_name', 'VARCHAR(50)', 'NOT NULL', '菜品名称（快照）'],
  ['dish_price', 'DECIMAL(10,2)', 'NOT NULL', '单价（快照）'],
  ['quantity', 'INT', 'DEFAULT 1', '数量'],
  ['subtotal', 'DECIMAL(10,2)', 'NOT NULL', '小计'],
]));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 5. 接口设计 ----
children.push(heading1('5  接口设计'));
children.push(heading2('5.1  通用说明'));
children.push(boldPara('Base URL: ', 'https://api.example.com'));
children.push(boldPara('Content-Type: ', 'application/json'));
children.push(para('认证方式：除登录接口外，请求头携带 Authorization: Bearer <token>'));
children.push(para('统一响应格式：'));
children.push(codeBlock('{\n  "code": 0,\n  "message": "success",\n  "data": { }\n}'));

children.push(heading2('5.2  用户接口'));
children.push(heading3('POST /api/user/login'));
children.push(para('登录接口，使用微信临时 code 换取 openid 并返回 token。'));
children.push(boldPara('Request: ', ''));
children.push(codeBlock('{ "code": "wx_login_code" }'));
children.push(boldPara('Response: ', ''));
children.push(codeBlock('{\n  "code": 0,\n  "data": {\n    "token": "eyJ...",\n    "user": { "id": 1, "nickname": "微信用户" }\n  }\n}'));

children.push(heading2('5.3  菜品接口'));
children.push(makeTable(['方法', '路径', '参数', '说明'], [
  ['GET', '/api/categories', '', '获取分类列表'],
  ['GET', '/api/dishes', '?category_id=1', '获取菜品列表'],
  ['GET', '/api/dishes/:id', '', '获取菜品详情'],
  ['GET', '/api/dishes/search', '?keyword=鸡', '搜索菜品'],
]));

children.push(heading2('5.4  订单接口'));
children.push(makeTable(['方法', '路径', '参数', '说明'], [
  ['POST', '/api/orders', '{ items, remark }', '创建订单'],
  ['GET', '/api/orders', '?status=0', '获取订单列表'],
  ['GET', '/api/orders/:id', '', '获取订单详情'],
]));

children.push(heading2('5.5  支付接口'));
children.push(makeTable(['方法', '路径', '参数', '说明'], [
  ['POST', '/api/pay/unified', '{ order_no }', '微信统一下单'],
  ['POST', '/api/pay/notify', '微信回调 XML', '支付回调'],
]));

children.push(emptyLine());
children.push(heading3('创建订单示例'));
children.push(codeBlock('POST /api/orders\nRequest: { "items": [{"dish_id":1,"quantity":2}], "remark":"少辣" }\nResponse: { "code":0, "data": { "order_no":"20260515001", "total_amount":68.00 } }'));

children.push(heading3('支付示例'));
children.push(codeBlock('POST /api/pay/unified\nRequest: { "order_no": "20260515001" }\nResponse: {\n  "code": 0,\n  "data": { "payParams": { "nonceStr": "...", "package": "prepay_id=...", "paySign": "..." } }\n}'));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 6. 详细设计 ----
children.push(heading1('6  详细设计'));
children.push(heading2('6.1  页面结构'));
children.push(makeTable(['页面路径', '页面名称', '功能描述'], [
  ['pages/index/index', '首页', '分类导航 + 菜品列表'],
  ['pages/dish/detail', '菜品详情', '大图、描述、价格、加购'],
  ['pages/cart/cart', '购物车', '已选菜品、数量修改、结算'],
  ['pages/order/confirm', '确认订单', '订单项确认、备注、支付'],
  ['pages/order/list', '订单列表', '按状态切换展示'],
  ['pages/order/detail', '订单详情', '订单信息、状态跟踪'],
  ['pages/user/user', '个人中心', '用户信息、订单入口'],
]));

children.push(heading2('6.2  购物车设计'));
children.push(para('使用微信小程序本地缓存 wx.setStorageSync 存储购物车数据，每次增删改操作后同步更新。下单成功后清空购物车。'));

children.push(heading2('6.3  订单状态机'));
children.push(codeBlock('0(待支付) → 1(已支付) → 2(制作中) → 3(已完成)'));
children.push(codeBlock('0(待支付) → 4(已取消)'));

children.push(heading2('6.4  微信登录流程'));
['wx.login() 获取 code', '请求 /api/user/login', '后端调用微信 jscode2session 换取 openid', '查询/创建用户', '生成 JWT token', '返回 token + 用户信息', '携带 token 访问后续接口', 'auth 中间件解析 token'].forEach(t => children.push(numbered(t)));

children.push(heading2('6.5  微信支付流程'));
['请求 /api/pay/unified', '后端调用微信支付统一下单 API', '获取 prepay_id', '组装支付参数返回给小程序', '小程序调用 wx.requestPayment', '用户确认支付', '微信异步回调 notify_url', '后端验证签名、更新订单状态'].forEach(t => children.push(numbered(t)));

children.push(heading2('6.6  项目目录结构'));
children.push(codeBlock('点餐小程序/\n├── client/              # 小程序前端\n│   ├── app.js/app.json\n│   └── pages/\n│       ├── index/       # 首页\n│       ├── dish/        # 菜品详情\n│       ├── cart/        # 购物车\n│       ├── order/       # 订单\n│       └── user/        # 个人中心\n├── server/              # Node.js 后端\n│   ├── app.js           # 入口\n│   ├── routes/          # 路由\n│   ├── controllers/     # 控制器\n│   ├── models/          # 模型\n│   ├── middleware/      # 中间件\n│   └── utils/           # 工具\n└── docs/SQL/init.sql    # 数据库脚本'));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 7. API 汇总 ----
children.push(heading1('7  API 接口汇总'));
children.push(makeTable(['方法', '路径', '需登录', '说明'], [
  ['POST', '/api/user/login', '否', '微信登录'],
  ['GET', '/api/user/info', '是', '获取用户信息'],
  ['GET', '/api/categories', '是', '获取分类列表'],
  ['GET', '/api/dishes', '是', '获取菜品列表'],
  ['GET', '/api/dishes/:id', '是', '获取菜品详情'],
  ['GET', '/api/dishes/search', '是', '搜索菜品'],
  ['POST', '/api/orders', '是', '创建订单'],
  ['GET', '/api/orders', '是', '获取订单列表'],
  ['GET', '/api/orders/:id', '是', '获取订单详情'],
  ['POST', '/api/pay/unified', '是', '微信统一下单'],
  ['POST', '/api/pay/notify', '否', '支付回调'],
]));

// ======== 生成文档 ========
const doc = new Document({
  numbering: {
    config: [{
      reference: 'default',
      levels: [{
        level: 0,
        format: LevelFormat.DECIMAL,
        text: '%1.',
        alignment: AlignmentType.LEFT,
      }],
    }],
  },
  sections: [{ children }],
});

Packer.toBuffer(doc).then(buffer => {
  const outputPath = 'D:\\互助养老3\\docs\\superpowers\\specs\\点餐小程序项目设计文档.docx';
  fs.writeFileSync(outputPath, buffer);
  console.log('文档已生成: ' + outputPath);
});
