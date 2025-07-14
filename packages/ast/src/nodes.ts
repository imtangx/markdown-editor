import type { Position, Range } from '@markdown-editor/shared';
import type { TokenType } from '@markdown-editor/lexer';
import type { EnumToUnion } from '@markdown-editor/shared';

/**
 * AST节点基础接口
 */
export interface ASTNode {
  /** 节点类型 */
  type: EnumToUnion<TokenType>;
  /** 位置信息 */
  position: Position;
  /** 范围信息 */
  range?: Range;
  /** 父节点引用 */
  parent?: ASTNode;
  /** 子节点数组 */
  children?: ASTNode[];
  /** 节点值 */
  value?: string;
  /** 节点属性 */
  attributes?: Record<string, any>;
}

/**
 * 文档根节点
 */
export interface DocumentNode extends ASTNode {
  type: TokenType.DOCUMENT;
  children: BlockNode[];
}

/**
 * 块级节点基类
 */
export interface BlockNode extends ASTNode {
  type:
    | TokenType.HEADING
    | TokenType.PARAGRAPH
    | TokenType.CODE_BLOCK
    | TokenType.QUOTE
    | TokenType.LIST
    | TokenType.LIST_ITEM
    | TokenType.HORIZONTAL_RULE;
}

/**
 * 行内节点基类
 */
export interface InlineNode extends ASTNode {
  type:
    | TokenType.TEXT
    | TokenType.BOLD
    | TokenType.ITALIC
    | TokenType.CODE
    | TokenType.LINK
    | TokenType.IMAGE
    | TokenType.NEWLINE;
}

/**
 * 标题节点
 */
export interface HeadingNode extends BlockNode {
  type: TokenType.HEADING;
  /** 标题级别 (1-6) */
  level: number;
  children: InlineNode[];
}

/**
 * 段落节点
 */
export interface ParagraphNode extends BlockNode {
  type: TokenType.PARAGRAPH;
  children: InlineNode[];
}

/**
 * 代码块节点
 */
export interface CodeBlockNode extends BlockNode {
  type: TokenType.CODE_BLOCK;
  /** 代码内容 */
  value: string;
  /** 语言标识 */
  language?: string;
  /** 代码块信息字符串 */
  info?: string;
}

/**
 * 引用节点
 */
export interface QuoteNode extends BlockNode {
  type: TokenType.QUOTE;
  children: BlockNode[];
}

/**
 * 列表节点
 */
export interface ListNode extends BlockNode {
  type: TokenType.LIST;
  /** 是否有序列表 */
  ordered: boolean;
  /** 起始编号 (有序列表) */
  start?: number;
  /** 列表标记 */
  marker?: string;
  children: ListItemNode[];
}

/**
 * 列表项节点
 */
export interface ListItemNode extends BlockNode {
  type: TokenType.LIST_ITEM;
  /** 是否选中 (任务列表) */
  checked?: boolean;
  children: BlockNode[];
}

/**
 * 分割线节点
 */
export interface HorizontalRuleNode extends BlockNode {
  type: TokenType.HORIZONTAL_RULE;
}

/**
 * 文本节点
 */
export interface TextNode extends InlineNode {
  type: TokenType.TEXT;
  value: string;
}

/**
 * 粗体节点
 */
export interface BoldNode extends InlineNode {
  type: TokenType.BOLD;
  children: InlineNode[];
}

/**
 * 斜体节点
 */
export interface ItalicNode extends InlineNode {
  type: TokenType.ITALIC;
  children: InlineNode[];
}

/**
 * 行内代码节点
 */
export interface CodeNode extends InlineNode {
  type: TokenType.CODE;
  value: string;
}

/**
 * 链接节点
 */
export interface LinkNode extends InlineNode {
  type: TokenType.LINK;
  /** 链接地址 */
  url: string;
  /** 链接标题 */
  title?: string;
  children: InlineNode[];
}

/**
 * 图片节点
 */
export interface ImageNode extends InlineNode {
  type: TokenType.IMAGE;
  /** 图片地址 */
  url: string;
  /** 图片标题 */
  title?: string;
  /** 替代文本 */
  alt: string;
}

/**
 * 换行节点
 */
export interface NewLineNode extends InlineNode {
  type: TokenType.NEWLINE;
}

/**
 * 节点类型联合类型
 */
export type AnyNode =
  | DocumentNode
  | HeadingNode
  | ParagraphNode
  | CodeBlockNode
  | QuoteNode
  | ListNode
  | ListItemNode
  | HorizontalRuleNode
  | TextNode
  | BoldNode
  | ItalicNode
  | CodeNode
  | LinkNode
  | ImageNode
  | NewLineNode;

/**
 * 节点创建器接口
 */
export interface NodeFactory {
  createDocument(children: BlockNode[], position: Position): DocumentNode;
  createHeading(level: number, children: InlineNode[], position: Position): HeadingNode;
  createParagraph(children: InlineNode[], position: Position): ParagraphNode;
  createCodeBlock(value: string, language: string | undefined, position: Position): CodeBlockNode;
  createQuote(children: BlockNode[], position: Position): QuoteNode;
  createList(ordered: boolean, children: ListItemNode[], position: Position): ListNode;
  createListItem(children: BlockNode[], position: Position, checked?: boolean): ListItemNode;
  createHorizontalRule(position: Position): HorizontalRuleNode;
  createText(value: string, position: Position): TextNode;
  createBold(children: InlineNode[], position: Position): BoldNode;
  createItalic(children: InlineNode[], position: Position): ItalicNode;
  createCode(value: string, position: Position): CodeNode;
  createLink(url: string, children: InlineNode[], position: Position, title?: string): LinkNode;
  createImage(url: string, alt: string, position: Position, title?: string): ImageNode;
  createNewLine(position: Position): NewLineNode;
}
