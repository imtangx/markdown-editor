import { parser } from '@codemirror/language';
import { LRLanguage, LanguageSupport } from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
import { MarkdownLexer } from '@markdown-editor/lexer';
import { RecursiveDescentParser } from '@markdown-editor/parser';

/**
 * 自定义Markdown解析器包装器
 */
class CodeMirrorMarkdownParser {
  private lexer: MarkdownLexer;
  private parser: RecursiveDescentParser;

  constructor(input: string = '') {
    this.lexer = new MarkdownLexer(input);
    this.parser = new RecursiveDescentParser();
  }

  /**
   * 解析文档并生成语法树
   */
  parse(input: string, fragments?: any[], ranges?: any[]): any {
    try {
      // 使用我们的词法分析器和解析器
      const tokens = this.lexer.tokenize();
      const ast = this.parser.parse(tokens);

      // 转换为CodeMirror期望的格式
      return this.convertToLezerTree(ast, input);
    } catch (error) {
      console.warn('Markdown parsing failed, using fallback:', error);
      // 返回基本的文本节点
      return {
        type: 'Document',
        from: 0,
        to: input.length,
        children: [
          {
            type: 'Text',
            from: 0,
            to: input.length,
          },
        ],
      };
    }
  }

  /**
   * 将AST转换为Lezer树格式
   */
  private convertToLezerTree(ast: any, input: string): any {
    const convertNode = (node: any, offset = 0): any => {
      const start = offset;
      const end = start + (node.value?.length || 0);

      const result: any = {
        type: this.getLezerType(node.type),
        from: start,
        to: end,
      };

      if (node.children && node.children.length > 0) {
        let childOffset = start;
        result.children = node.children.map((child: any) => {
          const childNode = convertNode(child, childOffset);
          childOffset = childNode.to;
          return childNode;
        });
        result.to = Math.max(result.to, childOffset);
      }

      return result;
    };

    return convertNode(ast);
  }

  /**
   * 映射AST节点类型到Lezer类型
   */
  private getLezerType(nodeType: string): string {
    const typeMap: Record<string, string> = {
      document: 'Document',
      heading: 'ATXHeading',
      paragraph: 'Paragraph',
      code_block: 'CodeBlock',
      quote: 'Blockquote',
      list: 'BulletList',
      list_item: 'ListItem',
      horizontal_rule: 'HorizontalRule',
      text: 'Text',
      bold: 'StrongEmphasis',
      italic: 'Emphasis',
      code: 'InlineCode',
      link: 'Link',
      image: 'Image',
      nreline: 'HardBreak',
    };

    return typeMap[nodeType] || 'Text';
  }
}

/**
 * 创建自定义Markdown语言
 */
function createMarkdownLanguage() {
  const markdownParser = new CodeMirrorMarkdownParser();

  // 创建解析器包装器
  const parserWrapper = parser.configure({
    parse: (input: string, fragments?: any[], ranges?: any[]) => {
      return markdownParser.parse(input, fragments, ranges);
    },
  });

  // 创建语言定义
  const language = LRLanguage.define({
    parser: parserWrapper,
    languageData: {
      name: 'markdown',
      extensions: ['.md', '.markdown'],
      commentTokens: { line: '//' },
    },
  });

  return language;
}

/**
 * 语法高亮样式配置
 */
const markdownHighlighting = styleTags({
  ATXHeading: t.heading,
  'ATXHeading/HeaderMark': t.processingInstruction,
  Blockquote: t.quote,
  'BulletList OrderedList': t.list,
  ListItem: t.listItem,
  CodeBlock: t.codeBlock,
  InlineCode: t.monospace,
  Link: t.link,
  Image: t.contentSeparator,
  Emphasis: t.emphasis,
  StrongEmphasis: t.strong,
  HorizontalRule: t.contentSeparator,
  Table: t.content,
  Text: t.content,
});

/**
 * 创建完整的Markdown语言支持
 */
export function markdown(): LanguageSupport {
  const language = createMarkdownLanguage();

  return new LanguageSupport(language, [
    language.data.of({
      name: 'markdown',
      extensions: ['.md', '.markdown'],
    }),
    markdownHighlighting,
  ]);
}

/**
 * 导出语言定义
 */
export const markdownLanguage = createMarkdownLanguage();

/**
 * 默认的Markdown语言支持实例
 */
export const markdownSupport = markdown();
