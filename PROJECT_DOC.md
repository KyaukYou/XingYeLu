# 星夜录（原小柴随心记2.0）— 项目完整开发文档

> 生成时间：2026-05-26 | AppID: `wx7e8eb46444d8dd39` | 云环境: `cloud1-d3g9ga0ffb1a3625a`

---

## 目录

- [一、项目概览](#一项目概览)
- [二、技术架构](#二技术架构)
- [三、目录结构](#三目录结构)
- [四、数据库设计](#四数据库设计)
- [五、云函数架构](#五云函数架构)
- [六、页面清单与跳转关系](#六页面清单与跳转关系)
- [七、页面详细分析](#七页面详细分析)
- [八、组件清单](#八组件清单)
- [九、样式体系](#九样式体系)
- [十、全局状态与数据流](#十全局状态与数据流)
- [十一、权限体系](#十一权限体系)
- [十二、第三方库](#十二第三方库)
- [十三、图片资源清单](#十三图片资源清单)
- [十四、部署与配置](#十四部署与配置)

---

## 一、项目概览

**星夜录**是一款日记/旅行记录类微信小程序，核心功能包括：

1. **日记系统** — 创建多日旅行日记，上传图片，富文本内容，支持公开/私密、锁定
2. **社交互动** — 关注/粉丝体系，点赞/收藏，评论系统（含楼中楼回复）
3. **用户体系** — 微信登录，个人资料，全局配色，隐私模式，毛绒效果
4. **问题反馈** — 提问/回答系统，管理员回复
5. **管理员后台** — 用户管理、日记管理、开关控制、版本管理
6. **版本管理** — 更新日志发布与查看

---

## 二、技术架构

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | 微信小程序原生 | 基础库 3.15.2 |
| 后端服务 | 微信云开发 | 云函数 + 云数据库 + 云存储 |
| UI 组件库 | Lin UI 0.8.x | toast/list/calendar/search-bar/segment/loading/mask 等 |
| 图标组件 | Vant Weapp (部分) | icon + info 徽标组件 |
| 自定义组件 | 3 个 | lc_header / color-picker / userWatch |
| 状态管理 | globalData + Storage | app.globalData + wx.setStorageSync |
| 云函数架构 | 聚合路由模式 | 5 个聚合云函数，通过 action 字段分发 |

---

## 三、目录结构

```
XingYeLu/
├── cloudfunctions/                 # 云函数（5个聚合）
│   ├── adminApi/                   # 管理员+版本+评论开关模块
│   │   ├── index.js                # 路由入口(handlers分发)
│   │   ├── package.json
│   │   └── config.json
│   ├── authApi/                    # 认证模块
│   │   ├── index.js                # login
│   │   ├── package.json
│   │   └── config.json
│   ├── diaryApi/                   # 日记+评论+互动模块
│   │   ├── index.js                # 日记CRUD+搜索+点赞收藏+浏览量+评论
│   │   ├── package.json
│   │   └── config.json
│   ├── questionApi/                # 问题反馈模块
│   │   ├── index.js                # 问题CRUD+回答+取消/删除
│   │   ├── package.json
│   │   └── config.json
│   └── userApi/                    # 用户+社交+万能接口模块
│       ├── index.js                # 用户CRUD+关注/取关+统计+almightyApi
│       ├── package.json
│       └── config.json
│
├── miniprogram/                    # 小程序前端
│   ├── app.js                     # 入口文件（含patchCloudFunction兼容层）
│   ├── app.json                   # 全局配置（页面路由、tabBar、权限）
│   ├── app.wxss                   # 全局样式
│   ├── sitemap.json               # 搜索索引配置
│   │
│   ├── pages/                     # 页面（28个）
│   │   ├── index/                 # 首页-日记列表
│   │   ├── my/                    # 我的-个人中心
│   │   ├── adminUserInfo/         # 管理员-用户详情
│   │   ├── adminDiary/            # 管理员-日记列表
│   │   ├── adminUser/             # 管理员-用户列表
│   │   ├── adminEditDiary/        # 管理员-编辑日记
│   │   ├── userInfo/              # 用户详情(普通)
│   │   ├── userWatch/             # 用户关注列表
│   │   ├── userFans/              # 用户粉丝列表
│   │   ├── userDiary/             # 用户日记列表
│   │   ├── userCollection/        # 用户收藏列表
│   │   ├── userQuestion/          # 用户问题列表
│   │   ├── userDetail/            # 用户资料编辑
│   │   ├── userQuestionDetail/    # 用户问题详情
│   │   ├── myWatch/               # 我的关注列表
│   │   ├── myFans/                # 我的粉丝列表
│   │   ├── myDiary/               # 我的日记列表
│   │   ├── myCollection/          # 我的收藏列表
│   │   ├── myQuestion/            # 我的问题列表
│   │   ├── myQuestionDetail/      # 我的问题详情
│   │   ├── diaryDetail/           # 日记详情+评论
│   │   ├── createDiary/           # 创建日记
│   │   ├── editDiary/             # 编辑日记
│   │   ├── uploadQuestion/        # 提交问题
│   │   ├── answer/                # 回答问题
│   │   ├── version/               # 版本日志
│   │   ├── editVersion/           # 编辑版本
│   │   └── film/                  # 电影日记(特殊页)
│   │
│   ├── components/                # 自定义组件
│   │   ├── lc_header/             # 自定义导航栏
│   │   ├── color-picker/          # 颜色选择器
│   │   ├── userWatch/             # 用户关注(草稿)
│   │   ├── compView/              # 组件视图占位(草稿)
│   │   ├── icon/                  # Vant Icon 图标
│   │   ├── info/                  # Vant Info 徽标
│   │   ├── common/                # Vant 公共工具库
│   │   ├── mixins/                # Vant 行为混入
│   │   └── wxs/                   # Vant WXS 模板辅助
│   │
│   ├── lin-ui/                    # Lin UI 组件库
│   │   └── dist/                  # 50+ 组件
│   │
│   ├── images/                    # 图片资源
│   │   ├── redesign/              # 重设计PNG图标（31个）
│   │   │   ├── tab-home.png / tab-home-active.png     # TabBar-首页
│   │   │   ├── tab-user.png / tab-user-active.png     # TabBar-我的
│   │   │   ├── tab-record.png / tab-record-active.png # TabBar-记录(预留)
│   │   │   ├── action-like.png / action-like-active.png    # 点赞
│   │   │   ├── action-star.png / action-star-active.png    # 收藏
│   │   │   ├── action-comment.png / action-comment-soft.png # 评论
│   │   │   ├── action-edit.png / action-send.png            # 编辑/发送
│   │   │   ├── admin.png / users.png / diary.png            # 管理功能
│   │   │   ├── feedback.png / question.png / version.png     # 功能图标
│   │   │   ├── profile*.png / blur.png / secret.png / image.png # 个人设置
│   │   │   ├── palette.png / record.png / comment.png         # 其他
│   │   ├── tabbar/                 # 旧TabBar图标(已弃用)
│   │   ├── *.svg                   # SVG图标(32个)
│   │   └── *.png                   # 其他PNG(6个)
│   │
│   └── style/                     # 额外样式
│       └── guide.wxss             # 引导页样式
│
├── image.jpg                       # 项目预览图
├── project.config.json            # 项目配置
├── project.private.config.json    # 私有配置
├── package-lock.json              # 依赖锁定
├── README.md                      # 原部署说明
└── PROJECT_DOC.md                 # 本文档
```

---

## 四、数据库设计

### 4.1 集合总览

| 集合名 | 用途 | 权限 |
|--------|------|------|
| `users` | 用户数据 | 所有用户可读，仅创建者可读写 |
| `diarys` | 日记数据 | 所有用户可读，仅创建者可读写 |
| `comments` | 评论数据 | 所有用户可读，仅创建者可读写 |
| `questions` | 问答数据 | 所有用户可读，仅创建者可读写 |
| `admin` | 管理员配置 | 所有用户可读，仅创建者可读写 |
| `versions` | 版本信息 | 所有用户可读，仅创建者可读写 |

### 4.2 users 集合字段

```
{
  _id: String,                    // 系统自动生成
  openid: String,                 // 用户唯一标识
  userInfo: {                     // 微信用户信息
    avatarUrl: String,            // 头像URL
    nickName: String,             // 昵称
    gender: Number,               // 性别(0未知/1男/2女)
  },
  headline: String,               // 个性签名
  created_time: String,           // 注册时间 "YYYY-MM-DD HH:mm:ss"
  updated_time: String,           // 更新时间
  diary: Array,                   // 日记ID列表(已弃用，改用查询)
  diary_num: Number,              // 日记数量
  background_url: String,         // 个人中心背景图URL
  color: String,                  // 全局主题色 "rgb(r,g,b)"
  hue: Number,                    // HSV色相值
  blur: Boolean,                  // 是否启用毛绒效果
  background_bol: Boolean,        // 是否显示背景图
  like: Array,                    // 点赞的日记ID列表
  like_num: Number,               // 点赞总数
  dislike: Array,                 // 取消点赞的日记ID列表
  collection: Array,              // 收藏的日记ID列表
  collection_num: Number,         // 收藏数
  following: Array,               // 关注的用户openid列表
  following_num: Number,          // 关注数
  fans: Number,                   // 粉丝数
  roles: Array,                   // 角色 ["user"] 或 ["admin"]
  lock: Boolean,                  // 是否锁定
  detail: Object,                 // 保留字段
  answer: Boolean,                // 是否有新回复
  message: Boolean,               // 是否有新消息
  userDetail: {                   // 详细资料
    birth: String,                // 生日 "1990-01-01"
    where: Object,                // 地区 {"0":"省","1":"市","2":"区"}
    ifFirst: Boolean,             // 是否首次登录
    finalLogin: Array,            // 最近登录时间列表
    updatedTime: String,          // 资料更新时间
    email: String,                // 邮箱
    info: String,                 // 个人简介
    age: Array,                   // 年龄段
  },
  secret: Boolean,                // 隐私模式开关
}
```

### 4.3 diarys 集合字段

```
{
  _id: String,                    // 系统自动生成
  openid: String,                 // 作者openid
  title: String,                  // 日记标题(最长15字)
  title_image: String,            // 封面图URL
  location: String,               // 地点描述
  beginDate: String,              // 开始日期 "YYYY-MM-DD"
  endDate: String,                // 结束日期
  show: Boolean,                  // 是否公开
  ifDelete: Boolean,              // 是否已删除(软删除)
  lock: Boolean,                  // 是否锁定(私密)
  sort: String,                   // 排序方式
  see: Number,                    // 浏览量
  like: Number,                   // 点赞数
  collection: Number,             // 收藏数
  dayNum: Number,                 // 天数
  createdTime: String,            // 创建时间
  updatedTime: String,            // 更新时间
  diaryArr: [                     // 每日内容数组
    {
      date: String,               // 日期
      content: String,            // 文本内容(最长500字)
      imagesArr: Array,           // 图片URL数组(最多9张)
      show: Boolean,              // 该日是否显示
    }
  ]
}
```

### 4.4 comments 集合字段

> **注意**: comments 采用"每日记一文档"结构（非旧版每条评论独立文档）

```
{
  _id: String,
  diary_id: String,               // 所属日记ID
  createdTime: String,            // 创建时间
  updatedTime: String,            // 最后更新时间
  arr: [                          // 评论数组
    {
      content: String,            // 评论内容
      openid: String,             // 评论者openid
      userInfo: {                 // 评论者信息(查询时关联填充)
        nickName: String,
        avatarUrl: String,
      },
      updatedTime: String,        // 评论时间
      arr: [                      // 子评论(楼中楼)
        {
          content: String,        // 回复内容
          openid: String,         // 回复者openid
          userInfo: {},           // 回复者信息
          comment_openid: String, // 被回复者openid
          comment: {              // 被回复者信息(查询时关联填充)
            nickName: String,
            avatarUrl: String,
          },
          updatedTime: String,    // 回复时间
        }
      ]
    }
  ]
}
```

### 4.5 questions 集合字段

```
{
  _id: String,
  openid: String,                 // 提问者openid
  question: String,               // 问题标题/内容
  answer: Boolean,                // 是否已回答
  answerInfo: {                   // 回答信息对象
    openid: String,               // 回答者openid
    answer: String,               // 回答内容
    updatedTime: String,          // 回答时间
    userInfo: {},                 // 回答者信息(查询时关联填充)
  },
  updatedTime: String,            // 提问/最后更新时间
  ifDelete: Boolean,              // 是否已删除(软删除，false=正常)
}
```

### 4.6 admin 集合字段

```
{
  _id: String,                    // 固定ID: '5290ec146a0faef3001585d25d2205fe'
  controlChat: Boolean,           // 评论开关
  controlDiary: Boolean,          // 日记创建开关
  openid: Array,                  // 管理员openid列表
}
```

### 4.7 versions 集合字段

```
{
  _id: String,                    // 可通过VERSION_ID或openid查找
  arr: Array,                     // 版本记录数组
  updatedTime: String,            // 更新时间
  openid: String,                 // 最后更新者openid
  version: String,                // 当前版本号
}
```

---

## 五、云函数架构

### 5.1 架构概述

项目采用 **聚合路由模式** 将原来 47 个独立云函数合并为 5 个聚合云函数：

```
前端调用: wx.cloud.callFunction({ name: '原函数名', data: {...} })
                    ↓
        patchCloudFunction() 兼容层(app.js)
                    ↓ name映射 + 注入 action
实际调用: wx.cloud.callFunction({ name: '聚合函数名', data: { action: '原函数名', ... } })
                    ↓
        聚合函数 index.js → handlers[action](event, context) 分发
```

**关键特性**:
- **零侵入**: 通过 `patchCloudFunction()` 拦截 `wx.cloud.callFunction`，前端业务代码无需任何修改
- **向后兼容**: 所有页面仍然使用原始函数名调用，内部自动转发
- **统一管理**: 同类操作归集到同一云函数，便于维护和部署

### 5.2 路由映射表

| 原始函数名(action) | 聚合云函数 | 所属模块 |
|---|---|---|
| `login` | authApi | 认证 |
| `createUser`, `ifUser`, `getUserInfo`, `getUserDetail`, `getUserArr`, `getAnswerBol`, `updateCustom`, `updateUserDetail`, `updateUserSecret`, `setUserAnswer`, `setUserDiaryNum`, `setUserCollectionNum`, `setUserLikeNum`, `watchUser`, `unwatchFans`, `ifWatch`, `setUserFans`, `almightyApi` | userApi | 用户+社交+万能 |
| `createDiary`, `updateDiary`, `getDiaryDetail`, `getDiary_noValue`, `getDiary_value`, `getMyDiary`, `getMyDiary_noValue`, `getMyDiary_value`, `getMyCollection`, `addDiarySee`, `lockDiary`, `setDiaryLike`, `setDiaryCollection`, `uploadComment`, `getComment` | diaryApi | 日记+评论+互动 |
| `uploadQuestion`, `getUserQuestion`, `getMyQuestion`, `getMyQuestionDetail`, `answerQuestion`, `cancelQuestion`, `deleteQuestion` | questionApi | 问题反馈 |
| `getAdmin`, `getAdminX`, `getCommentBol`, `controlChat`, `controlDiary`, `getVersion`, `getVersionOne`, `updateVersion` | adminApi | 管理+版本 |

### 5.3 adminApi — 管理/版本/评论开关模块

| action | 输入参数 | 访问集合 | 功能 |
|--------|----------|----------|------|
| `getAdmin` | openid | admin | 获取管理员配置(按openid查) |
| `getAdminX` | 无 | admin | 获取管理员配置(固定ID，仅返回controlDiary) |
| `getCommentBol` | 无 | admin | 获取评论开关(固定ID，仅返回controlChat) |
| `controlChat` | openid, bol | admin | 控制评论开关 |
| `controlDiary` | openid, bol | admin | 控制日记创建开关 |
| `getVersion` | 无 | versions | 获取版本列表(arr+version+updatedTime) |
| `getVersionOne` | 无 | versions | 获取最新版本号 |
| `updateVersion` | openid, arr, version, updatedTime | versions | 更新版本信息(需ADMIN_OPENID验证) |

**特殊逻辑**: `queryVersion()` 函数支持三级回退查找 VERSION_ID → openid → limit(1)；`getVersionDocId()` 同理。

### 5.4 authApi — 认证模块

| action | 输入参数 | 功能 |
|--------|----------|------|
| `login` | 无 | 返回 OPENID/APPID/UNIONID/ENV |

### 5.5 diaryApi — 日记/评论/互动模块

| action | 输入参数 | 访问集合 | 功能 |
|--------|----------|----------|------|
| `createDiary` | diary(完整对象) | diarys | 创建日记 |
| `updateDiary` | id, openid, diary | diarys | 更新日记(验证作者openid) |
| `getDiaryDetail` | id | diarys, users | 获取日记详情(含作者userInfo) |
| `getDiary_noValue` | page, per_page, sort | diarys, users | 获取公开日记(无搜索) |
| `getDiary_value` | page, per_page, sort, value | diarys, users | 搜索公开日记(标题+位置模糊匹配) |
| `getDiary` | (兼容别名→getDiary_noValue) | diarys, users | 同getDiary_noValue |
| `getMyDiary` | id | diarys | 获取指定日记(简单版) |
| `getMyDiary_noValue` | page, per_page, sort, openid | diarys, users | 获取我的日记(含未公开/已删除) |
| `getMyDiary_value` | page, per_page, sort, value, openid | diarys, users | 搜索我的日记 |
| `getMyCollection` | openid, sort, value, page, per_page | users, diarys | 获取我的收藏列表 |
| `addDiarySee` | id | diarys | 浏览量+1(原子操作 _.inc) |
| `lockDiary` | id, lock | diarys | 锁定/解锁日记 |
| `setDiaryLike` | id, num(+1/-1) | diarys | 日记点赞数增减 |
| `setDiaryCollection` | id, num(+1/-1) | diarys | 日记收藏数增减 |
| `uploadComment` | diary_id, content, openid, bol, comment_index, comment_openid, updatedTime, createdTime | comments | 上传评论/回复(bol=false一级/bol=true二级) |
| `getComment` | diary_id | comments, users | 获取日记评论(含楼中楼+用户信息关联) |

**排序方式 sort**: `updatedTimeA`(更新时间升序) / `updatedTimeB`(更新时间降序) / `like`(点赞数) / `see`(浏览量)

**comments 结构特点**: 每篇日记对应一条 comments 文档，评论存储在 `arr` 数组中，子评论嵌套在父评论的 `arr` 中。上传时通过 `bol` 参数区分一级/二级评论，通过 `comment_index` 定位父评论。

### 5.6 questionApi — 问题反馈模块

| action | 输入参数 | 访问集合 | 功能 |
|--------|----------|----------|------|
| `uploadQuestion` | question, openid, updatedTime | questions | 提交问题 |
| `getUserQuestion` | page, per_page | questions, users | 获取所有问题列表(管理员) |
| `getMyQuestion` | openid | questions | 获取我的问题 |
| `getMyQuestionDetail` | id | questions, users | 获取我的问题详情(含回答者信息) |
| `answerQuestion` | id, openid(userOpenid), openid, answer, updatedTime | questions, users | 回答问题(同时更新用户answer标记) |
| `cancelQuestion` | id | questions | 取消问题(恢复ifDelete=false) |
| `deleteQuestion` | id | questions | 删除问题(ifDelete=true) |

### 5.7 userApi — 用户/社交/万能接口模块

#### 5.7.1 用户基础

| action | 输入参数 | 访问集合 | 功能 |
|--------|----------|----------|------|
| `createUser` | user(完整对象) | users | 注册新用户 |
| `ifUser` | openid, time | users | 判断用户是否存在+更新登录时间 |
| `getUserInfo` | openid | users | 获取用户信息(遵守隐私设置，secret=true时隐藏详情) |
| `getUserDetail` | openid | users | 获取用户详情(仅userDetail字段) |
| `getUserArr` | openid | users | 获取用户like/collection数组 |
| `getAnswerBol` | openid | users | 获取问题回复状态 |
| `updateCustom` | openid, update(对象) | users | 更新用户自定义字段(color/hue/blur/background_bol/userInfo等) |
| `updateUserDetail` | openid, userDetail(对象) | users | 更新用户详情 |
| `updateUserSecret` | openid, secret(布尔) | users | 更新隐私模式开关 |

#### 5.7.2 统计计数

| action | 输入参数 | 访问集合 | 功能 |
|--------|----------|----------|------|
| `setUserAnswer` | openid | users | 清除用户回复状态(answer→false) |
| `setUserDiaryNum` | openid | users | 用户日记数+1 |
| `setUserCollectionNum` | openid, num, collection | users | 用户收藏数增减+更新collection数组 |
| `setUserLikeNum` | openid, num, like | users | 用户点赞数增减+更新like数组 |

#### 5.7.3 社交模块

| action | 输入参数 | 访问集合 | 功能 |
|--------|----------|----------|------|
| `watchUser` | openid, userOpenid | users | 关注用户(following push+1, 对方fans inc+1) |
| `unwatchFans` | openid, userOpenid | users | 取消关注(following pull-1, 对方fans inc-1) |
| `ifWatch` | openid, userOpenid | users | 判断是否关注了某用户 |
| `setUserFans` | 无(保留) | - | 占位(实际返回WX Context) |

#### 5.7.4 almightyApi — 万能管理接口

| type(通过event.type传入) | 额外参数 | 访问集合 | 功能 |
|---|---|---|---|
| `getFollow` | openid | users | 获取用户的关注列表(含userInfo) |
| `getMyFollow` | openid | users | 获取"我"的关注列表(同上) |
| `getFans` | openid | users | 获取用户的粉丝列表(反查following) |
| `getDiaryNo` | page, per_page, sort | diarys, users | 获取所有日记(无搜索，含私密) |
| `getDiary` | page, per_page, sort, value, openid | diarys, users | 搜索指定用户日记 |
| `getMyDiary` | id | diarys | 获取指定日记(简单版) |
| `getUsers` | page, per_page, sort, keyWords | users | 获取用户列表(搜索/排序/分页) |
| `adminGetUserInfo` | openid | users | 管理员获取用户信息(忽略隐私) |

---

## 六、页面清单与跳转关系

### 6.1 页面路由表

| 序号 | 路由 | 页面名称 | 是否TabBar |
|------|------|----------|------------|
| 1 | pages/index/index | 首页(日记列表) | ✓ |
| 2 | pages/my/my | 我的(个人中心) | ✓ |
| 3 | pages/adminUserInfo/adminUserInfo | 管理员-用户详情 | |
| 4 | pages/adminDiary/adminDiary | 管理员-日记列表 | |
| 5 | pages/adminUser/adminUser | 管理员-用户列表 | |
| 6 | pages/adminEditDiary/adminEditDiary | 管理员-编辑日记 | |
| 7 | pages/userInfo/userInfo | 用户详情(普通) | |
| 8 | pages/userWatch/userWatch | 用户关注列表 | |
| 9 | pages/userFans/userFans | 用户粉丝列表 | |
| 10 | pages/userDiary/userDiary | 用户日记列表 | |
| 11 | pages/userCollection/userCollection | 用户收藏列表 | |
| 12 | pages/userQuestion/userQuestion | 问题列表(管理员) | |
| 13 | pages/userDetail/userDetail | 个人资料编辑 | |
| 14 | pages/userQuestionDetail/userQuestionDetail | 问题详情(管理员) | |
| 15 | pages/myWatch/myWatch | 我的关注列表 | |
| 16 | pages/myFans/myFans | 我的粉丝列表 | |
| 17 | pages/myDiary/myDiary | 我的日记列表 | |
| 18 | pages/myCollection/myCollection | 我的收藏列表 | |
| 19 | pages/myQuestion/myQuestion | 我的问题列表 | |
| 20 | pages/myQuestionDetail/myQuestionDetail | 我的问题详情 | |
| 21 | pages/diaryDetail/diaryDetail | 日记详情+评论 | |
| 22 | pages/createDiary/createDiary | 创建日记 | |
| 23 | pages/editDiary/editDiary | 编辑日记 | |
| 24 | pages/uploadQuestion/uploadQuestion | 提交问题 | |
| 25 | pages/answer/answer | 回答问题 | |
| 26 | pages/version/version | 版本日志 | |
| 27 | pages/editVersion/editVersion | 编辑版本 | |
| 28 | pages/film/film | 电影日记(特殊页) | |

### 6.2 页面跳转关系图

```
┌─────────────────────────────────────────────────────────────┐
│                     TabBar 页面                              │
│  ┌──────────────┐              ┌──────────────┐             │
│  │    index     │              │     my       │             │
│  │  (首页列表)  │              │  (个人中心)   │             │
│  └──────┬───────┘              └──────┬───────┘             │
└─────────┼─────────────────────────────┼─────────────────────┘
          │                             │
    ┌─────┴──────┐           ┌──────────┼──────────────┐
    │            │           │          │              │
    ▼            ▼           ▼          ▼              ▼
diaryDetail  userInfo   userDetail  myDiary      myWatch
(日记详情)  (用户详情)  (资料编辑)  (我的日记)    (我的关注)
    │            │                      │              │
    │      ┌─────┼──────┐         ┌─────┼─────┐       │
    │      ▼     ▼      ▼         ▼     ▼     ▼       ▼
    │   userDiary userWatch  createDiary editDiary  myFans
    │   (用户日记)(用户关注)  (创建日记)  (编辑日记) (我的粉丝)
    │      │        │                       │
    │      ▼        ▼                       │
    │   userColl  userFans                  │
    │   (用户收藏)(用户粉丝)                │
    │                                       │
    │     my ──► myCollection ──► diaryDetail
    │          (我的收藏)
    │     my ──► myQuestion ──► myQuestionDetail
    │          (我的问题)       (问题详情)
    │
    │     my ──► adminUser ──► adminUserInfo ──► userDiary/userColl/userWatch/userFans
    │          (用户管理)      (管理员-用户详情)
    │
    │     my ──► adminDiary ──► adminEditDiary
    │          (日记管理)      (管理员-编辑)
    │
    │     my ──► adminUser ──► userQuestion ──► userQuestionDetail ──► answer
    │          (问题管理)      (问题列表)       (问题详情)            (回答)
    │
    │     my ──► version / editVersion
    │          (版本日志) (编辑版本)
    │
    │     my ──► film
    │          (电影日记)
    │
    │     index ──► createDiary
    │            (创建日记)
    │
    └──── diaryDetail (从各日记列表页均可跳入)
```

### 6.3 跳转方式与参数

| 来源 | 目标 | 方式 | 参数 |
|------|------|------|------|
| index | createDiary | navigateTo | 无 |
| index | diaryDetail | navigateTo | `?id=日记ID` |
| index | userInfo | navigateTo | `?id=用户openid` |
| my | userDetail | navigateTo | 无 |
| my | myDiary | navigateTo | 无 |
| my | myCollection | navigateTo | 无 |
| my | myWatch | navigateTo | `?id=openid` |
| my | myFans | navigateTo | `?id=openid` |
| my | myQuestion | navigateTo | 无 |
| my | version | navigateTo | 无 |
| my | editVersion | navigateTo | 无 |
| my | adminUser | navigateTo | 无 |
| my | adminDiary | navigateTo | 无 |
| my | film | navigateTo | 无 |
| my | userQuestion | navigateTo | 无 |
| userInfo | userDiary | navigateTo | `?id=&name=` |
| userInfo | userCollection | navigateTo | `?id=&name=` |
| userInfo | userWatch | navigateTo | `?id=&name=` |
| userInfo | userFans | navigateTo | `?id=&name=` |
| adminUserInfo | userDiary | navigateTo | `?id=&name=` |
| adminUserInfo | userCollection | navigateTo | `?id=&name=` |
| adminUserInfo | userWatch | navigateTo | `?id=&name=` |
| adminUserInfo | userFans | navigateTo | `?id=&name=` |
| adminDiary | adminEditDiary | navigateTo | `?id=日记ID` |
| adminDiary | adminUserInfo | navigateTo | `?id=用户openid` |
| adminUser | adminUserInfo | navigateTo | `?id=用户openid` |
| myDiary | editDiary | navigateTo | `?id=日记ID` |
| userQuestion | userQuestionDetail | navigateTo | `?id=问题ID` |
| userQuestionDetail | answer | navigateTo | `?id=问题ID` |
| myQuestion | myQuestionDetail | navigateTo | `?id=问题ID` |
| myQuestion | uploadQuestion | navigateTo | 无 |

---

## 七、页面详细分析

### 7.1 index — 首页（日记列表）

**功能**: 展示所有公开日记，支持搜索/排序/点赞/收藏

**核心数据**:
- `diaryArr`: 日记列表数组
- `page/per_page`: 分页控制
- `like/collection`: 当前用户的点赞/收藏日记ID数组
- `searchValue`: 搜索关键词
- `tabCurrent`: 当前排序标签索引

**关键云函数调用**:
- `getDiary_value` / `getDiary_noValue` — 获取日记列表
- `getUserArr` — 获取用户点赞/收藏状态
- `getAdminX` — 获取日记创建权限
- `addDiarySee` — 增加浏览量
- `setDiaryLike` + `setUserLikeNum` — 点赞
- `setDiaryCollection` + `setUserCollectionNum` — 收藏
- `lockDiary` — 锁定日记

**UI结构**: 自定义导航栏 → 搜索栏 → 标签切换(4种排序) → 滚动列表(日记卡片左右交替布局) → 悬浮创建按钮

### 7.2 my — 我的（个人中心）

**功能**: 展示用户信息、统计数据、系统设置、管理员入口

**核心数据**:
- `info`: 用户完整信息
- `background_url`: 背景图URL
- `controlDiary_bol/controlChat_bol`: 管理开关
- `version_text/version_num`: 版本信息

**关键云函数调用**:
- `updateCustom` — 更新用户自定义设置
- `updateUserSecret` — 更新隐私
- `controlDiary` / `controlChat` — 管理开关控制
- `getAdmin` — 获取管理员配置
- `getVersionOne` — 获取最新版本号
- `getAnswerBol` — 获取问题回复状态

**特色功能**: 全局配色(color-picker组件)、毛绒效果、隐私模式、背景图上传

### 7.3 diaryDetail — 日记详情

**功能**: 展示日记完整内容、每日时间线、评论系统

**核心数据**:
- `info`: 日记详情
- `commentArr`: 评论列表
- `commentBol`: 评论权限

**关键云函数调用**:
- `getDiaryDetail` — 获取日记详情
- `addDiarySee` — 增加浏览量
- `getComment` — 获取评论(从comments集合按diary_id查询arr)
- `getCommentBol` — 获取评论权限
- `uploadComment` — 发表评论(需传bol区分一级/二级)
- `setDiaryLike` + `setUserLikeNum` — 点赞
- `setDiaryCollection` + `setUserCollectionNum` — 收藏

**UI结构**: 封面大图 → 用户信息 → 互动按钮 → 时间线(每日记录+图片+富文本) → 评论区(含楼中楼)

### 7.4 createDiary / editDiary — 创建/编辑日记

**功能**: 创建或编辑日记，支持多日内容、图片上传

**核心数据**:
- `title/title_image/location/beginDate/endDate`: 日记基本信息
- `diaryArr`: 每日内容数组
- `lock/show/sort`: 控制字段

**关键云函数调用**:
- `createDiary` — 创建日记
- `updateDiary` — 更新日记
- `setUserDiaryNum` — 更新用户日记计数

**特色功能**: 日历选择日期范围、每日内容独立编辑、图片上传(每日最多9张)、自动计算天数

### 7.5 userInfo / adminUserInfo — 用户详情页

**功能**: 查看其他用户资料、关注/取关、查看其日记/收藏/关注/粉丝

**区别**:
- `userInfo` 遵守隐私设置（secret=true时不显示详情）
- `adminUserInfo` 忽略隐私（使用 almightyApi）

**关键云函数调用**:
- `getUserInfo` / `almightyApi(adminGetUserInfo)` — 获取用户信息
- `ifWatch` — 判断关注状态
- `watchUser` / `unwatchFans` — 关注/取关

### 7.6 adminDiary — 管理员日记管理

**功能**: 管理员查看所有日记，可搜索/排序/编辑/锁定

**与index区别**: 使用 `almightyApi(type: 'getDiaryNo')` 获取所有日记（包括私密），点击跳转 `adminEditDiary`

### 7.7 adminUser — 管理员用户管理

**功能**: 管理员查看所有用户，可搜索/排序/分页

**关键云函数**: `almightyApi(type: 'getUsers')`

### 7.8 myDiary — 我的日记

**功能**: 展示当前用户所有日记（含未公开/已删除），可编辑

**与index区别**: 使用 `getMyDiary_noValue/getMyDiary_value`（含私密日记），点击跳转 `editDiary`，悬浮按钮支持拖拽

### 7.9 问题系统页面

| 页面 | 功能 | 云函数 |
|------|------|--------|
| uploadQuestion | 提交问题 | uploadQuestion |
| myQuestion | 我的问题列表 | getMyQuestion |
| myQuestionDetail | 我的问题详情 | getMyQuestionDetail(含answerInfo.userInfo) |
| userQuestion | 所有问题(管理员) | getUserQuestion |
| userQuestionDetail | 问题详情(管理员) | getMyQuestionDetail(同上) |
| answer | 回答问题 | answerQuestion |

### 7.10 其他页面

| 页面 | 功能 |
|------|------|
| myWatch / userWatch | 关注列表(使用ifWatch/watchUser/unwatchFans或almightyApi getFollow) |
| myFans / userFans | 粉丝列表(使用almightyApi getFans) |
| myCollection / userCollection | 收藏列表(使用getMyCollection) |
| userDetail | 个人资料编辑(使用updateUserDetail) |
| version | 版本日志查看(使用getVersion) |
| editVersion | 版本编辑(使用updateVersion) |
| film | 电影日记(特殊页，样式与日记类似) |

---

## 八、组件清单

### 8.1 自定义组件

#### lc_header — 自定义导航栏

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| header_title | String | "" | 标题文本 |
| header_color | String | "" | 背景色 |
| blur | Boolean | false | 毛绒效果(点阵背景) |
| back | Boolean | false | 显示返回按钮 |

**适配方案**: 通过 `wx.getMenuButtonBoundingClientRect()` 获取胶囊按钮位置，动态计算导航栏高度

**使用页面**: 几乎所有页面

#### color-picker — 颜色选择器

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| initColor | String | 'rgb(255,0,0)' | 初始颜色 |
| maskClosable | Boolean | true | 点击遮罩关闭 |
| show | Boolean | false | 显示选择器 |
| initBol | Boolean | false | 初始化完成标志 |

| 事件 | 数据 | 说明 |
|------|------|------|
| changeColor | { color: 'rgb(r,g,b)' } | 选中颜色 |
| close | 无 | 关闭选择器 |

**算法**: HSV色彩模型，拖拽SV区域 + 色相滑块选色

#### userWatch / compView — 占位草稿组件

代码相同的空壳组件，预留用于"关注列表"组件化开发

### 8.2 Vant Weapp 组件（已引入部分）

| 组件 | 用途 |
|------|------|
| icon | 图标(点赞good-job/收藏star/评论chat/锁定等) |
| info | 徽标/红点(icon的子组件) |

**辅助模块**: common/(component/utils/validator/version/color) + mixins/(basic/button/link/open-type/touch/transition/page-scroll) + wxs/(add-unit/bem/style/memoize/object/array)

### 8.3 Lin UI 组件（项目实际使用的）

| 组件 | 使用场景 |
|------|----------|
| l-toast | 消息提示(所有页面) |
| l-search-bar | 搜索栏(index/adminDiary/myDiary) |
| l-segment / l-segment-item | 标签切换/排序(index/adminDiary/myDiary) |
| l-list | 设置列表(my) |
| l-calendar | 日期选择(createDiary) |
| l-loading | 加载动画(多个页面) |
| l-mask | 遮罩层(createDiary) |
| l-icon | 图标(createDiary删除图片) |

---

## 九、样式体系

### 9.1 全局样式 (app.wxss)

**日记卡片样式** (多个页面复用):
- `.diary_main` — 卡片主体(314rpx高, 白底, 圆角12rpx, 阴影)
- `.diary_main_left` / `.diary_main_right` — 左图右文/左文右图交替布局
- `.diary_title` — 标题(32rpx, 加粗, 单行省略)
- `.diary_time` — 时间(24rpx, 灰色)
- `.diary_location` — 位置(22rpx, 3行省略)
- `.diary_bottom` — 底部互动栏(点赞+收藏)
- `.diary_lock` — 锁定图标

**个人中心样式**:
- `.my` — 全屏fixed布局
- `.my_header` — 400rpx高头部
- `.my_info` — 用户信息区(头像+昵称+签名)
- `.my_info_bottom` — 统计栏(日记数/收藏数/关注数/粉丝数)

**评论样式**:
- `.chat` — 评论容器
- `.chat-wrap-list` — 单条评论(头像+昵称+内容+时间)
- `.chat-wrap-child` — 楼中楼回复
- `.chat-write-textarea` — 评论输入区(280rpx高)

**通用样式**:
- `.to_create` — 悬浮创建按钮(90rpx圆形, fixed右下角)
- `.opacity_button` — 点击透明度反馈(0.72)

### 9.2 页面级样式

各页面在自身 `.wxss` 文件中定义局部样式，主要特点：
- 大量使用 `position: fixed/absolute` 定位
- 颜色值通过 `globalData.color` 动态设置 inline style
- 统一使用 `rpx` 单位适配不同屏幕
- 背景图使用 `wx.cloud.uploadFile` 上传到云存储

### 9.3 主题色系统

通过 `app.globalData.color` 全局控制，默认 `rgb(244,118,149)`（粉色），用户可通过 color-picker 组件自定义。

**应用范围**: 创建按钮背景、点赞/收藏图标选中色、分割线、标签选中色等

---

## 十、全局状态与数据流

### 10.1 globalData

```
globalData: {
  color: "rgb(244,118,149)",   // 全局主题色
  blur: false,                  // 毛绒效果开关
  background: false,            // 背景图显示开关
  initBol: false,               // 初始化完成标志
  userInfo: {},                 // 当前用户微信信息
  roles: ["user"],              // 用户角色
  navHeight: 0,                 // 状态栏高度
  customHeight: {},             // 胶囊按钮尺寸
}
```

### 10.2 本地缓存 (Storage)

| Key | 类型 | 说明 |
|-----|------|------|
| openid | String | 用户唯一标识 |
| user | Object | 用户完整数据(含userInfo/diary/collection等) |
| color | String | 全局主题色 |
| hue | Number | 色相值 |
| blur | Boolean | 毛绒效果 |
| background | Boolean | 背景图显示 |

### 10.3 数据流图

```
用户操作
  │
  ▼
页面事件处理
  │
  ├──► wx.cloud.callFunction({ name: '原始名' })
  │         │
  │         ▼ patchCloudFunction()
  │   wx.cloud.callFunction({ name: '聚合名', data: { action: '原始名', ... } })
  │         │
  │         ▼
  │   云函数(handlers[action]) ──► 云数据库
  │                                                    │
  │    ◄── 返回结果 ◄─────────────────────────────────┘
  │
  ├──► this.setData() ──► 视图更新
  │
  ├──► app.globalData ──► 跨页面共享
  │
  └──► wx.setStorageSync() ──► 本地持久化
       │
       └──► app.js onLaunch() ──► 从Storage恢复状态
```

### 10.4 初始化流程

```
App.onLaunch()
  │
  ├── wx.cloud.init(env: 'cloud1-d3g9ga0ffb1a3625a')
  │
  ├── this.patchCloudFunction() ◄── 初始化云函数路由兼容层
  │
  ├── wx.getSystemInfo() → globalData.navHeight/customHeight
  │
  ├── 检查 Storageopenid
  │   ├── 有openid+有user → initData() → 从云函数获取最新数据 → 更新globalData+Storage
  │   └── 无openid → 从Storage恢复color/blur/background → initBol=true
  │
  └── initData()
      ├── ifUser(openid) → 获取用户数据
      ├── 初始化globalData(color/blur/background/userInfo/roles)
      └── initBol = true → 各页面开始轮询等待initBol
```

### 10.5 patchCloudFunction 兼容层详解 (新增)

```javascript
// app.js 中的核心逻辑:
// 1. 定义 functionRoute 映射表: 原始函数名 → 聚合云函数名
// 2. 拦截 wx.cloud.callFunction
// 3. 当调用 name 在 functionRoute 中时:
//    - 替换 name 为聚合函数名
//    - 在 data 中注入 action: 原始函数名
// 4. 设置 __mergedApiPatched 防止重复拦截
```

**优势**:
- 前端 47 处调用无需修改任何代码
- 新增云函数只需在 handlers 和 functionRoute 各加一行
- 便于后续迁移和扩展

---

## 十一、权限体系

### 11.1 角色模型

| 角色 | 说明 | 判断方式 |
|------|------|----------|
| user | 普通用户 | `globalData.roles[0] === 'user'` |
| admin | 管理员 | `globalData.roles[0] === 'admin'` |

### 11.2 权限控制点

| 功能 | 条件 | 控制方式 |
|------|------|----------|
| 创建日记 | `showBtn` (由getAdminX控制) + admin全局开关 | 云函数controlDiary + 前端按钮显示 |
| 发表评论 | 评论开关 + 日记未锁定 | 云函数controlChat + getCommentBol |
| 管理员页面 | roles[0]==='admin' | 前端条件渲染 |
| 隐私保护 | user.secret===true | getUserInfo隐藏详情 / almightyApi忽略 |
| 日记编辑 | openid匹配 | updateDiary云函数验证openid |
| 版本更新 | ADMIN_OPENID校验 | updateVersion云函数硬编码校验 |

### 11.3 管理员功能

- 用户管理（搜索/查看/强制查看隐私用户）
- 日记管理（搜索/编辑/锁定所有日记）
- 问题管理（查看/回答所有问题）
- 全局开关（日记创建/评论功能）
- 版本管理

---

## 十二、第三方库

### 12.1 Lin UI

- **版本**: 0.8.x
- **路径**: `miniprogram/lin-ui/dist/`
- **组件数量**: 50+（实际使用约8个）
- **组件列表**: action-sheet, album, avatar, badge, button, calendar, card, checkbox, circle, collapse, dialog, form, grid, icon, image-clipper, image-picker, input, list, loading, mask, notice-bar, popup, price, progress, radio, rate, search-bar, segment, skeleton, slide-view, spin, status-show, steps, sticky, tab-bar, tabs, tag, textarea, toast, transition, water-flow 等

### 12.2 Vant Weapp（部分引入）

- **引入组件**: icon, info
- **辅助代码**: common/(component/color/utils/validator/version), mixins/(basic/button/link/open-type/touch/transition/page-scroll), wxs/(add-unit/bem/style/memoize/object/array)

---

## 十三、图片资源清单

### 13.1 SVG 图标（32个）

| 图标 | 用途 |
|------|------|
| add.svg / add_black.svg | 创建日记按钮 / 添加图片 |
| back.svg | 导航栏返回 |
| lock.svg / unlock.svg | 日记锁定/解锁 |
| man.svg / woman.svg | 性别图标 |
| color.svg | 配色设置 |
| info.svg | 个人资料 |
| image.svg | 显示背景 |
| blur.svg | 毛绒效果 |
| secret.svg | 隐私模式 |
| ver.svg | 版本日志 |
| bug.svg | 问题反馈 |
| chat.svg | 评论开关 |
| create.svg | 日记开关 |
| user.svg | 用户管理 |
| diaryList.svg | 日记列表 |
| userQuestion.svg | 问题列表 |
| editVersion.svg | 日志管理 |
| notice.svg | 消息通知 |
| pen.svg | 编辑 |
| film.svg | 电影日记 |
| load.svg | 图片加载占位 |
| img.svg | 编辑背景 |
| create_date.svg | 日期选择 |
| age.svg / area.svg / birth.svg / email.svg | 个人资料项 |
| set.svg / set1.svg | 设置 |

### 13.2 PNG 图标 — redesign 系列（31个，UI重设计）

| 图标 | 用途 |
|------|------|
| tab-home.png / tab-home-active.png | TabBar首页(当前使用) |
| tab-user.png / tab-user-active.png | TabBar我的(当前使用) |
| tab-record.png / tab-record-active.png | TabBar记录(预留) |
| action-like.png / action-like-active.png | 点赞(默认/选中态) |
| action-star.png / action-star-active.png | 收藏(默认/选中态) |
| action-comment.png / action-comment-soft.png | 评论(默认/按下态) |
| action-edit.png | 编辑 |
| action-send.png | 发送 |
| admin.png | 管理入口 |
| users.png | 用户管理 |
| diary.png | 日记管理 |
| feedback.png | 反馈 |
| question.png | 问题 |
| version.png | 版本 |
| profile.png / profile-age.png / profile-area.png / profile-birth.png / profile-email.png | 个人资料相关 |
| palette.png | 配色 |
| blur.png | 毛绒 |
| secret.png | 隐私 |
| image.png | 背景 |
| record.png | 记录 |
| comment.png | 评论 |

### 13.3 其他 PNG 图片（6个）

| 图片 | 用途 |
|------|------|
| dot.png | 毛绒效果背景点阵图 |
| wx.png | 微信默认头像 |
| tabbar/index1.png | 旧首页Tab(已弃用) |
| tabbar/index2.png | 旧首页Tab选中(已弃用) |
| tabbar/my1.png | 旧我的Tab(已弃用) |
| tabbar/my2.png | 旧我的Tab选中(已弃用) |

---

## 十四、部署与配置

### 14.1 环境要求

- 微信开发者工具（稳定版/预发布版/开发版）
- 基础库 3.15.2+
- 云开发环境（需开通特惠基础版1，6.9元/月，支持5个聚合云函数）

### 14.2 部署步骤

1. **修改AppID**: `project.config.json` 第47行
2. **修改云环境ID**: `app.js` 第13行 `env: '你的环境ID'`
3. **部署云函数**: cloudfunctions 下 5 个文件夹各自右键 → 创建并部署(云端安装依赖):
   - adminApi
   - authApi
   - diaryApi
   - questionApi
   - userApi
4. **创建数据库集合**: admin / comments / diarys / questions / users / versions
5. **配置admin集合**: 添加 _id('5290ec146a0faef3001585d25d2205fe') + controlChat(false) + controlDiary(false) + openid([])
6. **配置versions集合**: 添加 arr([]) + updatedTime("") + openid("") + version("")
7. **更新云函数中的常量**:
   - `adminApi/index.js`: `VERSION_ID` 和 `_id`(getAdminX/getCommentBol中的硬编码ID)
   - `adminApi/index.js`: `ADMIN_OPENID`(updateVersion权限校验)
8. **设置集合权限**: 全部设为"所有用户可读，仅创建者可读写"
9. **注册管理员**: 登录后在users集合中将roles改为["admin"]，在admin集合openid数组中添加openid

### 14.3 注意事项

- **云函数常量**: adminApi 中 `VERSION_ID`、getAdminX/getCommentBol 的 `_id`、`ADMIN_OPENID` 为硬编码，部署时必须根据实际环境修改
- **默认背景图URL**: 存储在 `createUser` 函数中的 userSchema 里
- **登录流程**: 已迁移到 `wx.getUserProfile` 方式（旧API已注释）
- **patchCloudFunction**: 在 `onLaunch` 中调用，必须在 `wx.cloud.init()` 之后执行
- **comments 数据结构变更**: 已从"每条评论独立文档"改为"每日记一文档(arr数组)"，旧数据需迁移
- **questions 数据结构变更**: 字段名调整(title→question, answerContent/answerTime→answerInfo, cancel→ifDelete)
- **diarys 新增 dayNum 字段**: 用于显示日记天数
