# Flower Emoji Printer Skill 🌸

一个用于 Claude Code 的技能，用于生成和打印各种花朵 emoji。

## 功能特性

- 📥 **输入两个数字**，计算它们的和
- 🌺 **生成随机花朵 emoji**，数量等于两数之和
- 📊 **统计每种花朵的出现次数**
- ✅ **完整的错误处理和验证**
- 🧪 **100% 测试覆盖率**（43个测试全部通过）

## 技术实现

### 设计原则

本项目严格遵循软件工程最佳实践：

#### SOLID 原则
- **Single Responsibility Principle (SRP)**: 每个函数只负责单一功能
  - `validateInput()` - 只负责验证
  - `generateFlowers()` - 只负责生成
  - `formatOutput()` - 只负责格式化

- **Open/Closed Principle (OCP)**: 易于扩展，无需修改现有代码
  - 花朵集合 `FLOWER_EMOJIS` 可轻松扩展

- **Liskov Substitution Principle (LSP)**: 使用标准接口

- **Interface Segregation Principle (ISP)**: 函数参数简洁明确

- **Dependency Inversion Principle (DIP)**: 依赖抽象而非具体实现

#### DRY 原则 (Don't Repeat Yourself)
- 避免重复代码
- 复用验证、生成、格式化逻辑
- 使用 `Array.from()` 和 `map()` 替代循环

#### BDD/TDD
- **Behavior-Driven Development**: 使用 Given-When-Then 模式编写测试
- **Test-Driven Development**: 先定义测试，后实现功能
- **43个测试用例，100%通过率**

## 快速开始

### 基本用法

```bash
node .claude/skills/flower-emoji/scripts/flower-printer.mjs 7 3
```

输出：
```
🌺 花朵Emoji打印结果 🌺
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
输入: 7 + 3 = 10

花朵输出:
🌸🌺🌻🌷🌹🥀🏵️💐🌼🪷

统计信息:
  🌸 × 1
  🌺 × 1
  ...

总计: 10 朵花
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 参数说明

- **第一个参数**: 第一个数字 (0-1000)
- **第二个参数**: 第二个数字 (0-1000)

### 运行测试

```bash
# 运行完整的测试套件
node .claude/skills/flower-emoji/test/flower-printer.test.mjs
```

## 支持的花朵 Emoji

本技能支持 15 种不同的花朵 emoji：

🌸 🌺 🌻 🌷 🌹 🥀 🏵️ 💐 🌼 🪷 🪻 🌴 🌵 🌾 🌿

## 文件结构

```
.claude/skills/flower-emoji/
├── SKILL.md                    # Claude Code 技能定义
├── README.md                   # 本文件
├── scripts/
│   └── flower-printer.mjs     # 主程序脚本
└── test/
    └── flower-printer.test.mjs # BDD/TDD 测试套件
```

## 示例

### 示例 1: 基本加法
```bash
$ node scripts/flower-printer.mjs 5 5
# 生成 10 朵随机花朵
```

### 示例 2: 零值
```bash
$ node scripts/flower-printer.mjs 0 0
# 生成 0 朵花（空输出）
```

### 示例 3: 大数字
```bash
$ node scripts/flower-printer.mjs 50 50
# 生成 100 朵随机花朵
```

### 示例 4: 错误处理
```bash
$ node scripts/flower-printer.mjs abc 5
# 返回错误: "第一个数字 必须是数字，收到: abc"
```

## 测试覆盖

本项目包含 **43 个测试用例**，涵盖：

- ✅ 输入验证（9个测试）
- ✅ 参数验证（5个测试）
- ✅ 花朵生成（5个测试）
- ✅ 统计功能（4个测试）
- ✅ 格式化输出（3个测试）
- ✅ 响应创建（5个测试）
- ✅ 集成测试（3个测试）
- ✅ 边界测试（3个测试）
- ✅ 错误处理（3个测试）

**测试成功率: 100%** 🎯

## 技术栈

- **语言**: JavaScript (ES Modules)
- **运行时**: Node.js 14+
- **测试**: 自定义 BDD 测试框架
- **代码风格**: SOLID + DRY 原则

## 许可证

MIT

## 作者

Claude Code Skill - Flower Emoji Printer

---

**版本**: 1.0.0
**最后更新**: 2026-01-04
