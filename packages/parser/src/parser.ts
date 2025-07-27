import { Token, TokenType } from '@markdown-editor/lexer';
import type { ParseOptions } from '@markdown-editor/shared';
import type {
  DocumentNode,
  BlockNode,
  InlineNode,
  HeadingNode,
  ParagraphNode,
  CodeBlockNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  HorizontalRuleNode,
  TextNode,
  BoldNode,
  ItalicNode,
  CodeNode,
  LinkNode,
  ImageNode,
  NewLineNode,
} from '@markdown-editor/ast';
import { nodeFactory } from '@markdown-editor/ast';

/**
 * 解析错误类
 */
export class ParseError extends Error {
  constructor(
    message: string,
    public token?: Token,
    public expected?: TokenType | TokenType[],
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

/**
 * 解析器接口
 */
export interface Parser {
  parse(tokens: Token[], options?: ParseOptions): DocumentNode;
}

/**
 * 递归下降解析器
 */
export class RecursiveDescentParser implements Parser {
  private tokens: Token[] = [];
  private current = 0;
  private options: ParseOptions = {};

  /**
   * 解析token数组为AST
   */
  parse(tokens: Token[], options: ParseOptions = {}): DocumentNode {
    this.tokens = tokens;
    this.current = 0;
    this.options = options;

    const children = this.parseBlocks();
    return nodeFactory.createDocument(children, { line: 1, column: 1, offset: 0 });
  }

  /**
   * 解析块级元素
   */
  private parseBlocks(): BlockNode[] {
    const blocks: BlockNode[] = [];

    while (!this.isAtEnd()) {
      if (this.check(TokenType.NEWLINE)) {
        // 遇到换行符，消费掉并开始新的段落
        this.advance();
        continue;
      }

      const block = this.parseBlock();
      if (block) {
        blocks.push(block);
      }
    }

    return blocks;
  }

  /**
   * 解析单个块级元素
   */
  private parseBlock(): BlockNode | null {
    if (this.isAtEnd()) return null;

    const token = this.peek();

    switch (token.type) {
      case TokenType.HEADING:
        return this.parseHeading();
      case TokenType.CODE_BLOCK:
        return this.parseCodeBlock();
      case TokenType.QUOTE:
        return this.parseQuote();
      case TokenType.LIST_ITEM:
        return this.parseList();
      case TokenType.HORIZONTAL_RULE:
        return this.parseHorizontalRule();
      default:
        return this.parseParagraph();
    }
  }

  /**
   * 解析标题
   */
  private parseHeading(): HeadingNode {
    const token = this.consume(TokenType.HEADING, 'Expected heading token');
    const level = token.value?.length || 1;
    const children = this.parseInlines();

    return nodeFactory.createHeading(level, children, {
      line: token.position.line,
      column: token.position.column,
      offset: token.position.offset,
    });
  }

  /**
   * 解析段落
   */
  private parseParagraph(): ParagraphNode {
    const startToken = this.peek();
    const children: InlineNode[] = [];

    while (!this.isAtEnd() && !this.isBlockEnd()) {
      const inline = this.parseInline();
      if (inline) {
        children.push(inline);
      }
    }

    return nodeFactory.createParagraph(children, {
      line: startToken.position.line,
      column: startToken.position.column,
      offset: startToken.position.offset,
    });
  }

  /**
   * 解析代码块
   */
  private parseCodeBlock(): CodeBlockNode {
    const token = this.consume(TokenType.CODE_BLOCK, 'Expected code block token');
    const lines = token.value?.split('\n') || [];
    const firstLine = lines[0] || '';
    const language = firstLine.startsWith('```') ? firstLine.slice(3).trim() : undefined;
    const code = lines.slice(1, -1).join('\n');

    return nodeFactory.createCodeBlock(code, language, {
      line: token.position.line,
      column: token.position.column,
      offset: token.position.offset,
    });
  }

  /**
   * 解析引用
   */
  private parseQuote(): QuoteNode {
    const token = this.consume(TokenType.QUOTE, 'Expected quote token');
    const children = this.parseBlocks();

    return nodeFactory.createQuote(children, {
      line: token.position.line,
      column: token.position.column,
      offset: token.position.offset,
    });
  }

  /**
   * 解析列表
   */
  private parseList(): ListNode {
    const firstToken = this.peek();
    const ordered = firstToken.value?.match(/^\d+\./) !== null;
    const items = this.parseNestedListItems(0); // 从层级0开始

    return nodeFactory.createList(ordered, items, {
      line: firstToken.position.line,
      column: firstToken.position.column,
      offset: firstToken.position.offset,
    });
  }

  /**
   * 解析嵌套列表项
   */
  private parseNestedListItems(baseIndent: number): ListItemNode[] {
    const items: ListItemNode[] = [];

    while (!this.isAtEnd() && this.check(TokenType.LIST_ITEM)) {
      // 检查当前列表项的缩进层级
      const indent = this.getCurrentIndent();

      if (indent < baseIndent) {
        // 缩进减少，回到上一级
        break;
      } else if (indent === baseIndent) {
        // 同一级别的列表项
        items.push(this.parseListItem());
      } else {
        // 缩进增加，但这种情况应该在parseListItem中处理
        items.push(this.parseListItem());
      }
    }

    return items;
  }

  /**
   * 获取当前列表项前的缩进层级
   */
  private getCurrentIndent(): number {
    // 查看LIST_ITEM token之前是否有WHITESPACE token
    const currentPos = this.current;
    if (currentPos > 0) {
      const prevToken = this.tokens[currentPos - 1];
      if (prevToken.type === TokenType.WHITESPACE) {
        // 计算缩进层级（每2个空格为一级）
        return Math.floor((prevToken.value?.length || 0) / 2);
      }
    }
    return 0; // 没有缩进
  }

  /**
   * 解析列表项
   */
  private parseListItem(): ListItemNode {
    const currentIndent = this.getCurrentIndent();
    const token = this.consume(TokenType.LIST_ITEM, 'Expected list item token');

    // 检查是否是任务列表项
    let checked: boolean | undefined = undefined;
    if (token.value?.includes('[x]') || token.value?.includes('[X]')) {
      checked = true;
    } else if (token.value?.includes('[ ]')) {
      checked = false;
    }
    // 如果不包含任何复选框标记，checked保持undefined（普通列表项）

    // 解析列表项的内联内容并包装为段落
    const inlines = this.parseInlines();
    const children: BlockNode[] = [];

    if (inlines.length > 0) {
      const paragraph = nodeFactory.createParagraph(inlines, {
        line: token.position.line,
        column: token.position.column,
        offset: token.position.offset,
      });
      children.push(paragraph);
    }

    // 检查是否有嵌套的子列表项
    if (!this.isAtEnd() && this.check(TokenType.LIST_ITEM)) {
      const nextIndent = this.getCurrentIndent();
      if (nextIndent > currentIndent) {
        // 有更深层级的子列表
        const nestedItems = this.parseNestedListItems(nextIndent);
        if (nestedItems.length > 0) {
          // 确定子列表是有序还是无序
          const firstChildToken = this.tokens[this.current - nestedItems.length];
          const childOrdered = firstChildToken.value?.match(/^\d+\./) !== null;

          const nestedList = nodeFactory.createList(childOrdered, nestedItems, {
            line: token.position.line,
            column: token.position.column,
            offset: token.position.offset,
          });
          children.push(nestedList);
        }
      }
    }

    return nodeFactory.createListItem(
      children,
      {
        line: token.position.line,
        column: token.position.column,
        offset: token.position.offset,
      },
      checked,
    );
  }

  /**
   * 解析水平线
   */
  private parseHorizontalRule(): HorizontalRuleNode {
    const token = this.consume(TokenType.HORIZONTAL_RULE, 'Expected horizontal rule token');

    return nodeFactory.createHorizontalRule({
      line: token.position.line,
      column: token.position.column,
      offset: token.position.offset,
    });
  }

  /**
   * 解析行内元素
   */
  private parseInlines(): InlineNode[] {
    const inlines: InlineNode[] = [];

    while (!this.isAtEnd() && !this.isBlockEnd()) {
      const inline = this.parseInline();
      if (inline) {
        inlines.push(inline);
      }
    }

    return inlines;
  }

  /**
   * 解析单个行内元素
   */
  private parseInline(): InlineNode | null {
    if (this.isAtEnd()) return null;

    const token = this.peek();

    switch (token.type) {
      case TokenType.BOLD:
        return this.parseBold();
      case TokenType.ITALIC:
        return this.parseItalic();
      case TokenType.CODE:
        return this.parseCode();
      case TokenType.LINK:
        return this.parseLink();
      case TokenType.BRACKET_OPEN: {
        const linkNode = this.tryParseLink();
        if (linkNode) return linkNode;
        // 如果不是链接，当作普通文本处理
        return this.parseText();
      }
      case TokenType.EXCLAMATION: {
        const imageNode = this.tryParseImage();
        if (imageNode) return imageNode;
        // 如果不是图片，当作普通文本处理
        return this.parseText();
      }
      case TokenType.IMAGE:
        return this.parseImage();
      case TokenType.NEWLINE:
        return this.parseNewline();
      case TokenType.TEXT:
      default:
        return this.parseText();
    }
  }

  /**
   * 解析粗体
   */
  private parseBold(): BoldNode | TextNode {
    const startIndex = this.current;
    const startToken = this.consume(TokenType.BOLD, 'Expected opening ** for bold text');
    const children: InlineNode[] = [];

    // 收集内容，直到遇到结束的 **、换行符或文档结束
    while (!this.check(TokenType.BOLD) && !this.check(TokenType.NEWLINE) && !this.isAtEnd()) {
      const inline = this.parseInline();
      if (inline) children.push(inline);
    }

    // 如果遇到闭合 **，则消费它
    if (this.check(TokenType.BOLD)) {
      this.consume(TokenType.BOLD, 'Expected closing ** for bold text');
      return nodeFactory.createBold(children, {
        line: startToken.position.line,
        column: startToken.position.column,
        offset: startToken.position.offset,
      });
    }

    // 如果没有闭合的 **，则返回文本节点
    // 特殊情况 不做消费check 直接advance
    this.current = startIndex; // 回到开始位置
    this.advance();
    return nodeFactory.createText('**', {
      line: startToken.position.line,
      column: startToken.position.column,
      offset: startToken.position.offset,
    });
  }

  /**
   * 解析斜体
   */
  private parseItalic(): ItalicNode | TextNode {
    const startIndex = this.current;
    const startToken = this.consume(TokenType.ITALIC, 'Expected italic token');
    const children: InlineNode[] = [];

    // 收集内容，直到遇到结束的 *、换行符或文档结束
    while (!this.check(TokenType.ITALIC) && !this.check(TokenType.NEWLINE) && !this.isAtEnd()) {
      const inline = this.parseInline();
      if (inline) children.push(inline);
    }

    // 如果遇到闭合 *，则消费它
    if (this.check(TokenType.ITALIC)) {
      this.consume(TokenType.ITALIC, 'Expected closing * for italic text');
      return nodeFactory.createItalic(children, {
        line: startToken.position.line,
        column: startToken.position.column,
        offset: startToken.position.offset,
      });
    }

    // 如果没有闭合的 *，则返回文本节点
    // 特殊情况 不做消费check 直接advance
    this.current = startIndex; // 回到开始位置
    this.advance();
    return nodeFactory.createText('*', {
      line: startToken.position.line,
      column: startToken.position.column,
      offset: startToken.position.offset,
    });
  }

  /**
   * 解析行内代码
   */
  private parseCode(): CodeNode | TextNode {
    const startIndex = this.current;
    const startToken = this.consume(TokenType.CODE, 'Expected Code token');
    let childrenStr = '';

    // 收集内容，直到遇到结束的 `、换行符或文档结束
    while (!this.check(TokenType.CODE) && !this.check(TokenType.NEWLINE) && !this.isAtEnd()) {
      const inline = this.parseInline();
      if (inline) childrenStr += inline.value || '';
    }

    // 如果遇到闭合 `，则消费它
    if (this.check(TokenType.CODE)) {
      this.consume(TokenType.CODE, 'Expected closing ` for Code text');
      return nodeFactory.createCode(childrenStr, {
        line: startToken.position.line,
        column: startToken.position.column,
        offset: startToken.position.offset,
      });
    }

    // 如果没有闭合的 `，则返回文本节点
    // 特殊情况 不做消费check 直接advance
    this.current = startIndex; // 回到开始位置
    this.advance();
    return nodeFactory.createText('`', {
      line: startToken.position.line,
      column: startToken.position.column,
      offset: startToken.position.offset,
    });
  }

  /**
   * 解析链接
   */
  private parseLink(): LinkNode {
    const token = this.consume(TokenType.LINK, 'Expected link token');
    const match = token.value?.match(/\[([^\]]*)\]\(([^)]*)\)/);
    const text = match?.[1] || '';
    const url = match?.[2] || '';
    const children = [
      nodeFactory.createText(text, {
        line: token.position.line,
        column: token.position.column,
        offset: token.position.offset,
      }),
    ];

    return nodeFactory.createLink(url, children, {
      line: token.position.line,
      column: token.position.column,
      offset: token.position.offset,
    });
  }

  /**
   * 尝试解析链接 [text](url)
   */
  private tryParseLink(): LinkNode | null {
    const startPos = this.current;
    const startToken = this.peek();

    try {
      // 检查模式：[text](url)
      if (!this.check(TokenType.BRACKET_OPEN)) {
        return null;
      }

      this.advance(); // 消费 [

      // 收集链接文本，直到遇到 ]
      const textNodes: InlineNode[] = [];
      while (!this.isAtEnd() && !this.check(TokenType.BRACKET_CLOSE)) {
        if (this.check(TokenType.NEWLINE)) {
          // 链接不能跨行
          this.current = startPos;
          return null;
        }

        // 避免嵌套链接，只解析基本的行内元素
        const token = this.peek();
        if (token.type === TokenType.BRACKET_OPEN || token.type === TokenType.EXCLAMATION) {
          // 链接文本中不允许嵌套链接或图片，当作普通文本处理
          const textToken = this.advance();
          textNodes.push(nodeFactory.createText(textToken.value || '', textToken.position));
        } else {
          const inline = this.parseInline();
          if (inline) {
            textNodes.push(inline);
          }
        }
      }

      if (!this.check(TokenType.BRACKET_CLOSE)) {
        this.current = startPos;
        return null;
      }

      this.advance(); // 消费 ]

      // 检查是否跟着 (
      if (!this.check(TokenType.PAREN_OPEN)) {
        this.current = startPos;
        return null;
      }

      this.advance(); // 消费 (

      // 收集URL
      let url = '';
      while (!this.isAtEnd() && !this.check(TokenType.PAREN_CLOSE)) {
        if (this.check(TokenType.NEWLINE)) {
          // URL不能跨行
          this.current = startPos;
          return null;
        }

        const token = this.advance();
        url += token.value || '';
      }

      if (!this.check(TokenType.PAREN_CLOSE)) {
        this.current = startPos;
        return null;
      }

      this.advance(); // 消费 )

      return nodeFactory.createLink(url, textNodes, {
        line: startToken.position.line,
        column: startToken.position.column,
        offset: startToken.position.offset,
      });
    } catch {
      this.current = startPos;
      return null;
    }
  }

  /**
   * 尝试解析图片 ![alt](src)
   */
  private tryParseImage(): ImageNode | null {
    const startPos = this.current;
    const startToken = this.peek();

    try {
      // 检查模式：![alt](src)
      if (!this.check(TokenType.EXCLAMATION)) {
        return null;
      }

      this.advance(); // 消费 !

      if (!this.check(TokenType.BRACKET_OPEN)) {
        this.current = startPos;
        return null;
      }

      this.advance(); // 消费 [

      // 收集alt文本
      let alt = '';
      while (!this.isAtEnd() && !this.check(TokenType.BRACKET_CLOSE)) {
        if (this.check(TokenType.NEWLINE)) {
          // alt不能跨行
          this.current = startPos;
          return null;
        }

        const token = this.advance();
        alt += token.value || '';
      }

      if (!this.check(TokenType.BRACKET_CLOSE)) {
        this.current = startPos;
        return null;
      }

      this.advance(); // 消费 ]

      // 检查是否跟着 (
      if (!this.check(TokenType.PAREN_OPEN)) {
        this.current = startPos;
        return null;
      }

      this.advance(); // 消费 (

      // 收集src
      let src = '';
      while (!this.isAtEnd() && !this.check(TokenType.PAREN_CLOSE)) {
        if (this.check(TokenType.NEWLINE)) {
          // src不能跨行
          this.current = startPos;
          return null;
        }

        const token = this.advance();
        src += token.value || '';
      }

      if (!this.check(TokenType.PAREN_CLOSE)) {
        this.current = startPos;
        return null;
      }

      this.advance(); // 消费 )

      return nodeFactory.createImage(src, alt, {
        line: startToken.position.line,
        column: startToken.position.column,
        offset: startToken.position.offset,
      });
    } catch {
      this.current = startPos;
      return null;
    }
  }

  /**
   * 解析图片
   */
  private parseImage(): ImageNode {
    const token = this.consume(TokenType.IMAGE, 'Expected image token');
    const match = token.value?.match(/!\[([^\]]*)\]\(([^)]*)\)/);
    const alt = match?.[1] || '';
    const url = match?.[2] || '';

    return nodeFactory.createImage(url, alt, {
      line: token.position.line,
      column: token.position.column,
      offset: token.position.offset,
    });
  }

  /**
   * 解析换行
   */
  private parseNewline(): NewLineNode {
    const token = this.consume(TokenType.NEWLINE, 'Expected soft break token');

    return nodeFactory.createNewLine({
      line: token.position.line,
      column: token.position.column,
      offset: token.position.offset,
    });
  }

  /**
   * 解析文本
   */
  private parseText(): TextNode {
    const token = this.advance();
    const value = token.value || '';

    return nodeFactory.createText(value, {
      line: token.position.line,
      column: token.position.column,
      offset: token.position.offset,
    });
  }

  // 工具方法

  /**
   * 是否到达结尾
   */
  private isAtEnd(): boolean {
    return this.current >= this.tokens.length;
  }

  /**
   * 是否是块级元素结尾
   */
  private isBlockEnd(): boolean {
    if (this.isAtEnd()) return true;
    const token = this.peek();
    return [
      TokenType.HEADING,
      TokenType.CODE_BLOCK,
      TokenType.QUOTE,
      TokenType.LIST_ITEM,
      TokenType.HORIZONTAL_RULE,
      TokenType.NEWLINE, // 允许换行符作为块级元素的结束
    ].includes(token.type);
  }

  /**
   * 获取当前token
   */
  private peek(): Token {
    return this.tokens[this.current];
  }

  /**
   * 获取前一个token
   */
  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  /**
   * 检查当前token类型
   */
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  /**
   * 前进到下一个token
   */
  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  /**
   * 消费指定类型的token
   */
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    throw new ParseError(message, this.peek(), type);
  }

  /**
   * 匹配任意类型的token
   */
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }
}

/**
 * 默认解析器实例
 */
export const parser = new RecursiveDescentParser();
