import { describe, it, expect } from 'vitest';
import { MarkdownLexer } from '../src/lexer';
import { TokenType } from '../src/types';

describe('MarkdownLexer 集成测试', () => {
  it('应该正确解析完整的 Markdown 文档', () => {
    const markdown = `# 标题

这是一个段落，包含 **粗体** 和 *斜体* 文本。

## 二级标题

> 这是一个引用块
> 
> 包含多行内容

### 代码示例

\`\`\`javascript
const hello = 'world';
console.log(hello);
\`\`\`

行内代码：\`console.log()\`

### 列表

1. 第一项
2. 第二项
   - 子项目
   - 另一个子项目

### 链接和图片

[链接文本](https://example.com)

![图片描述](image.jpg)

---

结束。`;

    const lexer = new MarkdownLexer(markdown);
    const tokens = lexer.tokenize();

    // 验证基本结构
    expect(tokens.length).toBeGreaterThan(50);
    expect(tokens[tokens.length - 1].type).toBe(TokenType.EOF);

    // 验证标题
    const headingTokens = tokens.filter(t => t.type === TokenType.HEADING);
    expect(headingTokens.length).toBe(5); // #, ##, ###, ###

    // 验证粗体
    const boldTokens = tokens.filter(t => t.type === TokenType.BOLD);
    expect(boldTokens.length).toBe(2); // 开始和结束的 **

    // 验证代码块
    const codeBlockTokens = tokens.filter(t => t.type === TokenType.CODE_BLOCK);
    expect(codeBlockTokens.length).toBe(2); // 开始和结束的 ```

    // 验证水平分割线
    const hrTokens = tokens.filter(t => t.type === TokenType.HORIZONTAL_RULE);
    expect(hrTokens.length).toBe(1);

    // 验证数字
    const digitTokens = tokens.filter(t => t.type === TokenType.DIGIT);
    expect(digitTokens.length).toBe(2); // 1., 2.

    // 验证换行符
    const newlineTokens = tokens.filter(t => t.type === TokenType.NEWLINE);
    expect(newlineTokens.length).toBeGreaterThan(10);
  });

  it('应该正确处理空行和多个连续空格', () => {
    const markdown = `第一行

第三行（上面有空行）

    缩进的行（4个空格）
\t制表符缩进

多个    空格    之间`;

    const lexer = new MarkdownLexer(markdown);
    const tokens = lexer.tokenize();

    // 验证空白字符被正确保留
    const whitespaceTokens = tokens.filter(t => t.type === TokenType.WHITESPACE);
    expect(whitespaceTokens.length).toBeGreaterThan(0);

    // 验证制表符
    const tabTokens = tokens.filter(t => t.type === TokenType.TAB);
    expect(tabTokens.length).toBe(1);

    // 验证多个连续空格被合并
    const multipleSpaces = whitespaceTokens.find(t => t.value.length > 1);
    expect(multipleSpaces).toBeDefined();
  });
});
