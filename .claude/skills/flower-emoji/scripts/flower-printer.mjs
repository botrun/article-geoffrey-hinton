#!/usr/bin/env node

/**
 * Flower Emoji Printer
 * 遵循 SOLID 和 DRY 原则的花朵emoji打印工具
 */

// ===== Configuration (Open/Closed Principle - 易于扩展) =====
const FLOWER_EMOJIS = [
  '🌸', '🌺', '🌻', '🌷', '🌹',
  '🥀', '🏵️', '💐', '🌼', '🪷',
  '🪻', '🌴', '🌵', '🌾', '🌿'
];

// ===== Validation Module (Single Responsibility Principle) =====

/**
 * 验证单个数字参数
 * @param {string} arg - 命令行参数
 * @param {string} paramName - 参数名称
 * @returns {Object} { valid: boolean, value?: number, error?: string }
 */
function validateNumber(arg, paramName) {
  if (arg === undefined || arg === '') {
    return {
      valid: false,
      error: `缺少参数: ${paramName}`
    };
  }

  const num = parseInt(arg, 10);

  if (isNaN(num)) {
    return {
      valid: false,
      error: `${paramName} 必须是数字，收到: ${arg}`
    };
  }

  if (num < 0) {
    return {
      valid: false,
      error: `${paramName} 必须是非负数，收到: ${num}`
    };
  }

  if (num > 1000) {
    return {
      valid: false,
      error: `${paramName} 过大（最大1000），收到: ${num}`
    };
  }

  return { valid: true, value: num };
}

/**
 * 验证所有输入参数
 * @param {string[]} args - 命令行参数数组
 * @returns {Object} { valid: boolean, num1?: number, num2?: number, error?: string }
 */
function validateInput(args) {
  if (args.length < 2) {
    return {
      valid: false,
      error: `需要两个数字参数，收到 ${args.length} 个参数`
    };
  }

  const validation1 = validateNumber(args[0], '第一个数字');
  if (!validation1.valid) {
    return validation1;
  }

  const validation2 = validateNumber(args[1], '第二个数字');
  if (!validation2.valid) {
    return validation2;
  }

  return {
    valid: true,
    num1: validation1.value,
    num2: validation2.value
  };
}

// ===== Flower Generation Module (Single Responsibility) =====

/**
 * 从花朵数组中随机选择一个花朵emoji
 * @param {string[]} flowers - 花朵emoji数组
 * @returns {string} 随机选择的花朵emoji
 */
function getRandomFlower(flowers = FLOWER_EMOJIS) {
  const index = Math.floor(Math.random() * flowers.length);
  return flowers[index];
}

/**
 * 生成指定数量的随机花朵emoji
 * @param {number} count - 花朵数量
 * @param {string[]} flowerSet - 可选的花朵集合
 * @returns {string[]} 花朵emoji数组
 */
function generateFlowers(count, flowerSet = FLOWER_EMOJIS) {
  // DRY: 使用 Array.from + map，避免重复循环逻辑
  return Array.from({ length: count }, () => getRandomFlower(flowerSet));
}

// ===== Formatting Module (Single Responsibility) =====

/**
 * 统计每种花朵的出现次数
 * @param {string[]} flowers - 花朵数组
 * @returns {Object} { emoji: count }
 */
function countFlowers(flowers) {
  return flowers.reduce((acc, flower) => {
    acc[flower] = (acc[flower] || 0) + 1;
    return acc;
  }, {});
}

/**
 * 格式化输出文本
 * @param {string[]} flowers - 花朵数组
 * @param {number} num1 - 第一个数字
 * @param {number} num2 - 第二个数字
 * @returns {string} 格式化的输出文本
 */
function formatOutput(flowers, num1, num2) {
  const total = num1 + num2;
  const counts = countFlowers(flowers);
  const flowerLine = flowers.join('');

  // 构建统计信息
  const stats = Object.entries(counts)
    .map(([emoji, count]) => `  ${emoji} × ${count}`)
    .join('\n');

  return `
🌺 花朵Emoji打印结果 🌺
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
输入: ${num1} + ${num2} = ${total}

花朵输出:
${flowerLine}

统计信息:
${stats}

总计: ${total} 朵花
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
}

// ===== Output Module (Single Responsibility) =====

/**
 * 创建成功响应
 * @param {Object} data - 数据对象
 * @returns {Object} JSON响应对象
 */
function createSuccessResponse(data) {
  return {
    success: true,
    timestamp: new Date().toISOString(),
    ...data
  };
}

/**
 * 创建错误响应
 * @param {string} error - 错误消息
 * @returns {Object} JSON响应对象
 */
function createErrorResponse(error) {
  return {
    success: false,
    timestamp: new Date().toISOString(),
    error
  };
}

/**
 * 输出JSON响应
 * @param {Object} response - 响应对象
 */
function outputJSON(response) {
  console.log(JSON.stringify(response, null, 2));
}

// ===== Main Execution (Dependency Inversion - 依赖抽象接口) =====

/**
 * 主程序入口
 * @param {string[]} args - 命令行参数
 */
function main(args) {
  try {
    // 1. 验证输入 (使用抽象的验证接口)
    const validation = validateInput(args);

    if (!validation.valid) {
      outputJSON(createErrorResponse(validation.error));
      process.exit(1);
    }

    const { num1, num2 } = validation;
    const total = num1 + num2;

    // 2. 生成花朵 (使用抽象的生成接口)
    const flowers = generateFlowers(total);

    // 3. 格式化输出 (使用抽象的格式化接口)
    const formattedOutput = formatOutput(flowers, num1, num2);

    // 4. 创建响应
    const response = createSuccessResponse({
      input: { num1, num2, total },
      flowers,
      counts: countFlowers(flowers),
      output: formattedOutput
    });

    // 5. 输出结果
    outputJSON(response);
    console.error('\n' + formattedOutput + '\n'); // 同时输出到 stderr 用于显示

  } catch (error) {
    outputJSON(createErrorResponse(error.message));
    process.exit(1);
  }
}

// ===== Entry Point =====
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  main(args);
}

// ===== Exports for Testing (支持 TDD) =====
export {
  validateNumber,
  validateInput,
  getRandomFlower,
  generateFlowers,
  countFlowers,
  formatOutput,
  createSuccessResponse,
  createErrorResponse,
  FLOWER_EMOJIS
};
