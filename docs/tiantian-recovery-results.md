# 甜甜爱消除：首次解包与还原实测结果

日期：2026-11-12  
AppID：`wx402e4490eba51720`  
引擎：Cocos Creator `2.4.12`

## 结论

已实际解开本机的五个包，并调用开源 `cc-reverse` 的脚本与资源解码 API，得到可阅读的脚本、场景结构、预制体、动画和部分图片。

**这是一份可继续分析与重建的资料集，尚不是能在 Cocos 编辑器直接构建或在浏览器运行的完整工程。** 当前最大的缺口是核心配置与地图数据实体，以及部分纹理；不能仅凭已有资源索引推算全量还原比例。

## 实测数量

| 项目 | 结果 | 口径 |
| --- | --- | --- |
| 原始加密包 | 5 个 | V1MMWX，主包、引擎、SDK、两个脚本分包 |
| 解出的包内文件 | 49 个 | 文件偏移、长度与包头均已校验 |
| 复制出的本地缓存文件 | 80 个 | 索引列出的文件全部存在，共 11,606,522 字节 |
| 拆分并格式化的脚本模块 | 1,787 个 | 含业务模块与辅助模块；不是 1,787 份原始 TypeScript 源文件 |
| 解码出的资源文档 | 512 份 | 不代表 512 份完整可运行资源 |
| 场景文档 | 6 份 | 含加载、主界面、iPad、剧情主界面及 GameScene |
| 预制体文档 | 26 份 | 包括合成页面、物品、箱子、引导和辅助界面 |
| 动画片段文档 | 142 份 | 可用于分析曲线与绑定，运行效果尚未验证 |
| SpriteFrame 文档 | 278 份 | 保留图集矩形、旋转、原始尺寸和纹理引用 |
| 实际裁出的图片 | 124 张 | 有对应 PNG/JPEG 纹理且裁切边界有效 |
| 缺少对应纹理的 SpriteFrame | 154 份 | 当前仍无法得到图片实体 |
| Texture2D 元数据索引 | 16,222 条 | 特殊纹理打包格式中的记录；绝不等于 16,222 张图片已恢复 |

脚本拆分情况：启动脚本 63 个模块，主业务分包 935 个模块，扩展业务分包 789 个模块。

其他资源类型包括材质、Effect、音频元数据、Spine 与 DragonBones 数据。部分骨骼资源仍可能缺少配套纹理或运行依赖，因此暂不计为可播放动画。

## 实际使用了哪些工具

- `wedecode` 与 `cc-reverse` 的 npm 安装请求均因当前执行环境无法解析 `registry.npmjs.org` 失败，没有完成全局安装。
- 通过已连接的 GitHub 读取 `Crain99/cc-reverse` 源码，固定提交为 `070cafb3d16cd3ed9346587db41860335fdbd7a9`（源码 package.json 标注版本 2.1.2）。
- 调用了该工具原有的 `extractBrowserifyModules`、`extractWithAst`、`transformModule` 和 `rehydrateIFileData` API，而不是假称完整 CLI 已经运行成功。
- 使用本机已有 Babel 依赖格式化与检查语法，保留原工厂函数参数绑定；没有执行游戏代码或原厂 SDK。
- V1MMWX 容器使用与前次检查相同的已验证解析方式，复制缓存后，再分析 Cocos 构建数据。
- 资源压缩表布局与 Cocos 官方 `v2.4.12` 的 `deserialize-compiled.ts`、`pack-manager.js` 对照核实。
- 没有调用 REA、Hook 微信或修改原微信目录。

## 此次发现并解决的兼容问题

1. 默认快速扫描只能从主业务包读出 301 个模块，而包内有 935 处脚本注册。切换为 `cc-reverse` 的 AST 解析后，恢复 935 个主业务模块，避免把部分成功当成完整成功。
2. Mac 默认文件系统会把 `Debug.js/debug.js`、`Enum.js/enum.js`、`Helper.js/helper.js` 当成同名文件。已在输出前为冲突模块加 `__case1` 后缀，保留全部模块并重新检查数量。
3. Cocos 2.4 的普通 packed JSON 要先补回共享表，再解码每个资源段。另有一份 `cc.Texture2D` 特殊包，按官方格式拆出 16,222 条元数据，单独形成索引，没有伪装成已下载的图片。

## 已能从实际数据确认的细节

- 场景设计分辨率为 **750×1334**，多个场景启用适配宽度。
- `MainBoardMergeResolver` 显示：相同 ID、目标可合成且双方宝箱状态允许时，进入合成；不同物品在目标可移动时可以交换位置。
- 合成器还处理万能物品，需要确认；最高级、锁定目标和已开启宝箱有不同的阻止原因。
- 已定位 `ComEnergy`、`ConfigModel`、`MapConfig`、`OrderTaskItem` 等模块，可以继续逐项梳理体力、配置读取和订单提交。
- `MapConfig` 列出了 `configs.bin`，以及 Item、Drop、Levelup、Shop、Guide 等配置表名称。这说明能找到配置入口，但不代表表内数值已经拿到。

这些结论属于静态分析发现，尚未通过运行原游戏逐个对照所有分支。

## 当前缺口

1. `data/configs`（BufferAsset）及 `data/mapdata_1` 至 `data/mapdata_5` 有索引，但在此次包与缓存中没有对应实体。缺少它们，无法完整恢复物品升级链、掉落权重、订单参数和地图配置。
2. 154 个已解码精灵帧找不到对应 PNG/JPEG。其他仅在索引中的资源也不能视为已经恢复。
3. `task` bundle 有 9,708 条索引记录，但当前没有对应 import/native 文件。
4. GameScene 的场景文件主要提供 Canvas 与多个相机，主棋盘内容通过额外预制体和业务代码动态组合。恢复一个 `.fire` 文件不等于恢复整张游戏界面。
5. 恢复脚本属于构建后的 JavaScript。格式化及拆分不恢复原始 TypeScript 类型、注释和完整开发目录，也没有验证全部模块的运行依赖。
6. 未验证 Cocos 编辑器导入、资源默认值、完整 .meta、构建和浏览器运行；当前环境也没有找到 Cocos 安装。

## 文件位置

项目工作目录下的 `analysis/`：

| 路径 | 内容 |
| --- | --- |
| `unpacked/` | 解开的包文件与合并到 assets 路径的本地缓存，原厂 SDK 仅作静态检查 |
| `recovered-scripts/` | 1,787 份可阅读、通过语法解析的 JavaScript 模块 |
| `recovered-assets/` | 场景、预制体、动画、精灵帧等分析 JSON 及部分按逻辑路径命名的素材 |
| `previews/` | 124 张裁出的图片、素材联系表和纹理缺失清单 |
| `inventory.json` | 包与缓存文件的来源、大小与 SHA-256 |
| `script-recovery.json` | 模块名、输出位置、依赖表、工具提交与处理统计 |
| `asset-recovery.json` | 资源类型、UUID、逻辑路径、场景节点与处理统计 |
| `verification.json` | 最终验证结果 |

分析包包含还原脚本、资源分析 JSON、预览、报告、统计与本次分析脚本，以及所用 cc-reverse 源码和许可证。未附原始加密包、完整引擎、原厂 SDK 或用户存档。打包时脚本中的固定 Webhook 地址会替换为占位字符串；本地解包原件保持原样。

![恢复素材示例](../analysis/previews/resource-sheet.png)

## 最终验证

- 1,787 个模块的文件数与清单一致，Babel 语法解析全部通过，无大小写覆盖。
- 512 份资源 JSON 均可解析，检查到的实例引用索引全部处于文档范围内，无资源解码错误。
- 五个原包的 SHA-256 与开始时一致，原包未发生变化。
- 裁切图片经过纹理边界检查，并人工查看了 48 张样例组成的预览表。
- 没有运行游戏代码，没有进行编辑器构建；不能据此声称游戏已能运行。

## 推荐下一步

优先让原小游戏正常加载主棋盘、物品图鉴和相关页面后，再比对新增缓存，寻找 `configs.bin`、地图数据和缺失纹理。以主棋盘为范围补齐资源，随后再验证恢复工程的可导入性。

拿到核心配置后，先完成一条物品生产—合成—订单的真实流程对照，再决定直接适配 Cocos Web，还是用 Phaser 实现独立版本。当前证据足以推进恢复工作，尚不足以决定完整原工程导出能够成功。

## 源码依据

- [cc-reverse 固定提交](https://github.com/Crain99/cc-reverse/tree/070cafb3d16cd3ed9346587db41860335fdbd7a9)
- [Cocos 2.4.12 压缩序列化格式](https://github.com/cocos/cocos-engine/blob/v2.4.12/cocos2d/core/platform/deserialize-compiled.ts)
- [Cocos 2.4.12 资源包处理](https://github.com/cocos/cocos-engine/blob/v2.4.12/cocos2d/core/asset-manager/pack-manager.js)
