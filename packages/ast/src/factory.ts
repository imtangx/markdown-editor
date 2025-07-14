import type { Position, Range } from '@markdown-editor/shared';
import { TokenType } from '@markdown-editor/lexer';
import type { EnumToUnion } from '@markdown-editor/shared';
import type {
  ASTNode,
  NodeFactory,
  DocumentNode,
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
  BlockNode,
  InlineNode,
} from './nodes';

/**
 * 默认节点工厂实现
 */
export class DefaultNodeFactory implements NodeFactory {
  /**
   * 创建基础节点属性
   */
  private createBaseNode(type: EnumToUnion<TokenType>, position: Position, range?: Range): ASTNode {
    return {
      type,
      position,
      range,
      parent: undefined,
      children: undefined,
      value: undefined,
      attributes: undefined,
    };
  }

  /**
   * 设置父子关系
   */
  private setParentChild(parent: ASTNode, children: ASTNode[]): void {
    children.forEach(child => {
      child.parent = parent;
    });
  }

  createDocument(children: BlockNode[], position: Position): DocumentNode {
    const node: DocumentNode = {
      ...this.createBaseNode(TokenType.DOCUMENT, position),
      type: TokenType.DOCUMENT,
      children,
    };
    this.setParentChild(node, children);
    return node;
  }

  createHeading(level: number, children: InlineNode[], position: Position): HeadingNode {
    const node: HeadingNode = {
      ...this.createBaseNode(TokenType.HEADING, position),
      type: TokenType.HEADING,
      level,
      children,
    };
    this.setParentChild(node, children);
    return node;
  }

  createParagraph(children: InlineNode[], position: Position): ParagraphNode {
    const node: ParagraphNode = {
      ...this.createBaseNode(TokenType.PARAGRAPH, position),
      type: TokenType.PARAGRAPH,
      children,
    };
    this.setParentChild(node, children);
    return node;
  }

  createCodeBlock(value: string, language: string | undefined, position: Position): CodeBlockNode {
    return {
      ...this.createBaseNode(TokenType.CODE_BLOCK, position),
      type: TokenType.CODE_BLOCK,
      value,
      language,
      info: language,
    };
  }

  createQuote(children: BlockNode[], position: Position): QuoteNode {
    const node: QuoteNode = {
      ...this.createBaseNode(TokenType.QUOTE, position),
      type: TokenType.QUOTE,
      children,
    };
    this.setParentChild(node, children);
    return node;
  }

  createList(ordered: boolean, children: ListItemNode[], position: Position): ListNode {
    const node: ListNode = {
      ...this.createBaseNode(TokenType.LIST, position),
      type: TokenType.LIST,
      ordered,
      start: ordered ? 1 : undefined,
      marker: ordered ? '1.' : '-',
      children,
    };
    this.setParentChild(node, children);
    return node;
  }

  createListItem(children: BlockNode[], position: Position, checked?: boolean): ListItemNode {
    const node: ListItemNode = {
      ...this.createBaseNode(TokenType.LIST_ITEM, position),
      type: TokenType.LIST_ITEM,
      checked,
      children,
    };
    this.setParentChild(node, children);
    return node;
  }

  createHorizontalRule(position: Position): HorizontalRuleNode {
    return {
      ...this.createBaseNode(TokenType.HORIZONTAL_RULE, position),
      type: TokenType.HORIZONTAL_RULE,
    };
  }

  createText(value: string, position: Position): TextNode {
    return {
      ...this.createBaseNode(TokenType.TEXT, position),
      type: TokenType.TEXT,
      value,
    };
  }

  createBold(children: InlineNode[], position: Position): BoldNode {
    const node: BoldNode = {
      ...this.createBaseNode(TokenType.BOLD, position),
      type: TokenType.BOLD,
      children,
    };
    this.setParentChild(node, children);
    return node;
  }

  createItalic(children: InlineNode[], position: Position): ItalicNode {
    const node: ItalicNode = {
      ...this.createBaseNode(TokenType.ITALIC, position),
      type: TokenType.ITALIC,
      children,
    };
    this.setParentChild(node, children);
    return node;
  }

  createCode(value: string, position: Position): CodeNode {
    return {
      ...this.createBaseNode(TokenType.CODE, position),
      type: TokenType.CODE,
      value,
    };
  }

  createLink(url: string, children: InlineNode[], position: Position, title?: string): LinkNode {
    const node: LinkNode = {
      ...this.createBaseNode(TokenType.LINK, position),
      type: TokenType.LINK,
      url,
      title,
      children,
    };
    this.setParentChild(node, children);
    return node;
  }

  createImage(url: string, alt: string, position: Position, title?: string): ImageNode {
    return {
      ...this.createBaseNode(TokenType.IMAGE, position),
      type: TokenType.IMAGE,
      url,
      alt,
      title,
    };
  }

  createNewLine(position: Position): NewLineNode {
    return {
      ...this.createBaseNode(TokenType.NEWLINE, position),
      type: TokenType.NEWLINE,
    };
  }
}

/**
 * 默认节点工厂实例
 */
export const nodeFactory = new DefaultNodeFactory();
