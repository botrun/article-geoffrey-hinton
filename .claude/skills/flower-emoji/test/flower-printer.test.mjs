#!/usr/bin/env node

/**
 * BDD/TDD 测试套件 for Flower Emoji Printer
 * 遵循 BDD (Given-When-Then) 模式
 */

import {
  validateNumber,
  validateInput,
  getRandomFlower,
  generateFlowers,
  countFlowers,
  formatOutput,
  createSuccessResponse,
  createErrorResponse,
  FLOWER_EMOJIS
} from '../scripts/flower-printer.mjs';

// ===== 测试工具 =====

class TestSuite {
  constructor(name) {
    this.name = name;
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  describe(description, testFn) {
    console.log(`\n📋 ${description}`);
    testFn();
  }

  it(description, testFn) {
    try {
      testFn();
      this.passed++;
      console.log(`  ✅ ${description}`);
    } catch (error) {
      this.failed++;
      console.log(`  ❌ ${description}`);
      console.log(`     错误: ${error.message}`);
      this.tests.push({ description, error: error.message, passed: false });
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        message || `Expected ${expected}, but got ${actual}`
      );
    }
  }

  assertDeepEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        message || `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`
      );
    }
  }

  assertTrue(value, message) {
    this.assertEqual(value, true, message || `Expected true, but got ${value}`);
  }

  assertFalse(value, message) {
    this.assertEqual(value, false, message || `Expected false, but got ${value}`);
  }

  assertDefined(value, message) {
    this.assert(value !== undefined, message || 'Expected value to be defined');
  }

  assertInRange(value, min, max, message) {
    this.assert(
      value >= min && value <= max,
      message || `Expected ${value} to be between ${min} and ${max}`
    );
  }

  summary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试总结');
    console.log('='.repeat(60));
    console.log(`✅ 通过: ${this.passed}`);
    console.log(`❌ 失败: ${this.failed}`);
    console.log(`📈 总计: ${this.passed + this.failed}`);
    console.log(`🎯 成功率: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(2)}%`);
    console.log('='.repeat(60));

    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

// ===== 测试套件 =====

const suite = new TestSuite('Flower Emoji Printer');

// ===== 1. 验证模块测试 (Validation Module) =====

suite.describe('验证模块 - validateNumber()', () => {

  suite.it('Given 有效数字 "5" When 验证 Then 应该返回有效结果', () => {
    const result = validateNumber('5', 'testParam');
    suite.assertTrue(result.valid, '结果应该是有效的');
    suite.assertEqual(result.value, 5, '值应该是 5');
  });

  suite.it('Given 零 "0" When 验证 Then 应该返回有效结果', () => {
    const result = validateNumber('0', 'testParam');
    suite.assertTrue(result.valid, '零应该是有效的');
    suite.assertEqual(result.value, 0, '值应该是 0');
  });

  suite.it('Given 大数字 "100" When 验证 Then 应该返回有效结果', () => {
    const result = validateNumber('100', 'testParam');
    suite.assertTrue(result.valid, '100应该是有效的');
    suite.assertEqual(result.value, 100, '值应该是 100');
  });

  suite.it('Given 未定义参数 When 验证 Then 应该返回错误', () => {
    const result = validateNumber(undefined, 'testParam');
    suite.assertFalse(result.valid, '未定义参数应该无效');
    suite.assertDefined(result.error, '应该有错误消息');
  });

  suite.it('Given 空字符串 When 验证 Then 应该返回错误', () => {
    const result = validateNumber('', 'testParam');
    suite.assertFalse(result.valid, '空字符串应该无效');
  });

  suite.it('Given 非数字字符串 "abc" When 验证 Then 应该返回错误', () => {
    const result = validateNumber('abc', 'testParam');
    suite.assertFalse(result.valid, '非数字应该无效');
    suite.assert(result.error.includes('必须是数字'), '错误消息应该提及"必须是数字"');
  });

  suite.it('Given 负数 "-5" When 验证 Then 应该返回错误', () => {
    const result = validateNumber('-5', 'testParam');
    suite.assertFalse(result.valid, '负数应该无效');
    suite.assert(result.error.includes('非负数'), '错误消息应该提及"非负数"');
  });

  suite.it('Given 超大数字 "1001" When 验证 Then 应该返回错误', () => {
    const result = validateNumber('1001', 'testParam');
    suite.assertFalse(result.valid, '超过1000的数字应该无效');
    suite.assert(result.error.includes('过大'), '错误消息应该提及"过大"');
  });

  suite.it('Given 边界值 "1000" When 验证 Then 应该返回有效结果', () => {
    const result = validateNumber('1000', 'testParam');
    suite.assertTrue(result.valid, '1000应该是有效的边界值');
    suite.assertEqual(result.value, 1000, '值应该是 1000');
  });
});

suite.describe('验证模块 - validateInput()', () => {

  suite.it('Given 两个有效数字 ["3", "5"] When 验证 Then 应该返回有效结果', () => {
    const result = validateInput(['3', '5']);
    suite.assertTrue(result.valid, '两个有效数字应该有效');
    suite.assertEqual(result.num1, 3, 'num1应该是3');
    suite.assertEqual(result.num2, 5, 'num2应该是5');
  });

  suite.it('Given 只有一个参数 When 验证 Then 应该返回错误', () => {
    const result = validateInput(['5']);
    suite.assertFalse(result.valid, '只有一个参数应该无效');
    suite.assert(result.error.includes('需要两个'), '错误消息应该提及需要两个参数');
  });

  suite.it('Given 空数组 When 验证 Then 应该返回错误', () => {
    const result = validateInput([]);
    suite.assertFalse(result.valid, '空数组应该无效');
  });

  suite.it('Given 第一个参数无效 When 验证 Then 应该返回错误', () => {
    const result = validateInput(['abc', '5']);
    suite.assertFalse(result.valid, '第一个参数无效应该返回错误');
  });

  suite.it('Given 第二个参数无效 When 验证 Then 应该返回错误', () => {
    const result = validateInput(['5', 'xyz']);
    suite.assertFalse(result.valid, '第二个参数无效应该返回错误');
  });
});

// ===== 2. 花朵生成模块测试 (Flower Generation Module) =====

suite.describe('花朵生成模块 - getRandomFlower()', () => {

  suite.it('Given 默认花朵集合 When 获取随机花朵 Then 应该返回有效的emoji', () => {
    const flower = getRandomFlower();
    suite.assertDefined(flower, '应该返回一个花朵');
    suite.assert(FLOWER_EMOJIS.includes(flower), '返回的花朵应该在预定义集合中');
  });

  suite.it('Given 自定义花朵集合 When 获取随机花朵 Then 应该从该集合中返回', () => {
    const customFlowers = ['🌸', '🌺', '🌻'];
    const flower = getRandomFlower(customFlowers);
    suite.assert(customFlowers.includes(flower), '返回的花朵应该在自定义集合中');
  });

  suite.it('Given 单个花朵的集合 When 获取随机花朵 Then 应该返回该花朵', () => {
    const singleFlower = ['🌸'];
    const flower = getRandomFlower(singleFlower);
    suite.assertEqual(flower, '🌸', '应该返回唯一的花朵');
  });
});

suite.describe('花朵生成模块 - generateFlowers()', () => {

  suite.it('Given 数量 5 When 生成花朵 Then 应该返回5个花朵', () => {
    const flowers = generateFlowers(5);
    suite.assertEqual(flowers.length, 5, '应该生成5个花朵');
  });

  suite.it('Given 数量 0 When 生成花朵 Then 应该返回空数组', () => {
    const flowers = generateFlowers(0);
    suite.assertEqual(flowers.length, 0, '应该返回空数组');
  });

  suite.it('Given 数量 10 When 生成花朵 Then 所有花朵应该是有效emoji', () => {
    const flowers = generateFlowers(10);
    suite.assertEqual(flowers.length, 10, '应该生成10个花朵');
    flowers.forEach(flower => {
      suite.assert(FLOWER_EMOJIS.includes(flower), `${flower} 应该是有效的花朵emoji`);
    });
  });

  suite.it('Given 大数量 100 When 生成花朵 Then 应该正确生成', () => {
    const flowers = generateFlowers(100);
    suite.assertEqual(flowers.length, 100, '应该生成100个花朵');
  });

  suite.it('Given 自定义花朵集合 When 生成花朵 Then 应该使用该集合', () => {
    const customFlowers = ['🌸', '🌺'];
    const flowers = generateFlowers(5, customFlowers);
    flowers.forEach(flower => {
      suite.assert(customFlowers.includes(flower), `${flower} 应该在自定义集合中`);
    });
  });
});

// ===== 3. 格式化模块测试 (Formatting Module) =====

suite.describe('格式化模块 - countFlowers()', () => {

  suite.it('Given 花朵数组 When 统计 Then 应该返回正确的计数', () => {
    const flowers = ['🌸', '🌺', '🌸', '🌻', '🌸'];
    const counts = countFlowers(flowers);
    suite.assertEqual(counts['🌸'], 3, '🌸应该出现3次');
    suite.assertEqual(counts['🌺'], 1, '🌺应该出现1次');
    suite.assertEqual(counts['🌻'], 1, '🌻应该出现1次');
  });

  suite.it('Given 空数组 When 统计 Then 应该返回空对象', () => {
    const flowers = [];
    const counts = countFlowers(flowers);
    suite.assertDeepEqual(counts, {}, '空数组应该返回空对象');
  });

  suite.it('Given 单个花朵 When 统计 Then 应该返回计数1', () => {
    const flowers = ['🌸'];
    const counts = countFlowers(flowers);
    suite.assertEqual(counts['🌸'], 1, '应该返回计数1');
  });

  suite.it('Given 所有相同的花朵 When 统计 Then 应该返回总数', () => {
    const flowers = ['🌸', '🌸', '🌸', '🌸', '🌸'];
    const counts = countFlowers(flowers);
    suite.assertEqual(counts['🌸'], 5, '应该返回计数5');
    suite.assertEqual(Object.keys(counts).length, 1, '应该只有一种花朵');
  });
});

suite.describe('格式化模块 - formatOutput()', () => {

  suite.it('Given 花朵数组和数字 When 格式化 Then 应该包含所有必要信息', () => {
    const flowers = ['🌸', '🌺', '🌻'];
    const output = formatOutput(flowers, 1, 2);

    suite.assert(output.includes('1 + 2 = 3'), '应该包含加法算式');
    suite.assert(output.includes('🌸🌺🌻'), '应该包含花朵输出');
    suite.assert(output.includes('总计: 3 朵花'), '应该包含总计');
    suite.assert(output.includes('统计信息'), '应该包含统计标题');
  });

  suite.it('Given 零花朵 When 格式化 Then 应该显示0', () => {
    const flowers = [];
    const output = formatOutput(flowers, 0, 0);
    suite.assert(output.includes('0 + 0 = 0'), '应该显示0+0=0');
    suite.assert(output.includes('总计: 0 朵花'), '应该显示总计0');
  });

  suite.it('Given 重复花朵 When 格式化 Then 应该正确统计', () => {
    const flowers = ['🌸', '🌸', '🌸'];
    const output = formatOutput(flowers, 1, 2);
    suite.assert(output.includes('🌸 × 3'), '应该显示🌸出现3次');
  });
});

// ===== 4. 输出模块测试 (Output Module) =====

suite.describe('输出模块 - createSuccessResponse()', () => {

  suite.it('Given 数据对象 When 创建成功响应 Then 应该包含success=true', () => {
    const data = { input: { num1: 1, num2: 2 } };
    const response = createSuccessResponse(data);

    suite.assertTrue(response.success, 'success应该为true');
    suite.assertDefined(response.timestamp, '应该有时间戳');
    suite.assertDeepEqual(response.input, data.input, '应该包含输入数据');
  });

  suite.it('Given 空对象 When 创建成功响应 Then 应该有基本字段', () => {
    const response = createSuccessResponse({});
    suite.assertTrue(response.success, 'success应该为true');
    suite.assertDefined(response.timestamp, '应该有时间戳');
  });

  suite.it('Given 时间戳 When 创建成功响应 Then 应该是有效的ISO格式', () => {
    const response = createSuccessResponse({});
    const timestamp = new Date(response.timestamp);
    suite.assert(!isNaN(timestamp.getTime()), '时间戳应该是有效的日期');
  });
});

suite.describe('输出模块 - createErrorResponse()', () => {

  suite.it('Given 错误消息 When 创建错误响应 Then 应该包含success=false', () => {
    const error = '测试错误';
    const response = createErrorResponse(error);

    suite.assertFalse(response.success, 'success应该为false');
    suite.assertEqual(response.error, error, '应该包含错误消息');
    suite.assertDefined(response.timestamp, '应该有时间戳');
  });

  suite.it('Given 空错误消息 When 创建错误响应 Then 应该仍然创建响应', () => {
    const response = createErrorResponse('');
    suite.assertFalse(response.success, 'success应该为false');
    suite.assertEqual(response.error, '', '错误消息应该是空字符串');
  });
});

// ===== 5. 集成测试 (Integration Tests) =====

suite.describe('集成测试 - 完整工作流', () => {

  suite.it('Given 输入[3, 5] When 完整执行 Then 应该生成8朵花', () => {
    const validation = validateInput(['3', '5']);
    suite.assertTrue(validation.valid, '验证应该通过');

    const { num1, num2 } = validation;
    const total = num1 + num2;
    const flowers = generateFlowers(total);

    suite.assertEqual(flowers.length, 8, '应该生成8朵花');
    suite.assertEqual(total, 8, '总数应该是8');
  });

  suite.it('Given 输入[0, 0] When 完整执行 Then 应该生成0朵花', () => {
    const validation = validateInput(['0', '0']);
    suite.assertTrue(validation.valid, '验证应该通过');

    const { num1, num2 } = validation;
    const total = num1 + num2;
    const flowers = generateFlowers(total);

    suite.assertEqual(flowers.length, 0, '应该生成0朵花');
  });

  suite.it('Given 完整工作流 When 包含格式化 Then 应该生成完整输出', () => {
    const validation = validateInput(['5', '5']);
    const { num1, num2 } = validation;
    const flowers = generateFlowers(num1 + num2);
    const output = formatOutput(flowers, num1, num2);
    const response = createSuccessResponse({
      input: { num1, num2, total: num1 + num2 },
      flowers,
      counts: countFlowers(flowers),
      output
    });

    suite.assertTrue(response.success, '响应应该成功');
    suite.assertDefined(response.input, '应该有输入信息');
    suite.assertDefined(response.flowers, '应该有花朵数组');
    suite.assertDefined(response.counts, '应该有统计信息');
    suite.assertDefined(response.output, '应该有格式化输出');
  });
});

// ===== 6. 边界测试 (Boundary Tests) =====

suite.describe('边界测试', () => {

  suite.it('Given 最大允许值[1000, 0] When 验证 Then 应该通过', () => {
    const result = validateInput(['1000', '0']);
    suite.assertTrue(result.valid, '1000应该是有效的');
    suite.assertEqual(result.num1, 1000, 'num1应该是1000');
  });

  suite.it('Given 边界值[500, 500] When 生成 Then 应该生成1000朵花', () => {
    const validation = validateInput(['500', '500']);
    const { num1, num2 } = validation;
    const flowers = generateFlowers(num1 + num2);
    suite.assertEqual(flowers.length, 1000, '应该生成1000朵花');
  });

  suite.it('Given 超出范围[1001, 0] When 验证 Then 应该失败', () => {
    const result = validateInput(['1001', '0']);
    suite.assertFalse(result.valid, '1001应该无效');
  });
});

// ===== 7. 错误处理测试 (Error Handling Tests) =====

suite.describe('错误处理测试', () => {

  suite.it('Given 浮点数"3.5" When 验证 Then 应该转换为整数3', () => {
    const result = validateNumber('3.5', 'test');
    suite.assertTrue(result.valid, '浮点数应该被接受');
    suite.assertEqual(result.value, 3, '应该转换为整数3');
  });

  suite.it('Given 带空格的数字" 5 " When 验证 Then 应该正确解析', () => {
    const result = validateNumber(' 5 ', 'test');
    suite.assertTrue(result.valid, '带空格的数字应该被接受');
    suite.assertEqual(result.value, 5, '应该解析为5');
  });

  suite.it('Given 多个参数超过2个 When 验证 Then 应该只使用前两个', () => {
    const result = validateInput(['3', '5', '7']);
    suite.assertTrue(result.valid, '应该接受并使用前两个参数');
    suite.assertEqual(result.num1, 3, 'num1应该是3');
    suite.assertEqual(result.num2, 5, 'num2应该是5');
  });
});

// ===== 运行测试并输出总结 =====

console.log('\n' + '='.repeat(60));
console.log('🌸 Flower Emoji Printer - BDD/TDD 测试套件 🌸');
console.log('='.repeat(60));

suite.summary();
