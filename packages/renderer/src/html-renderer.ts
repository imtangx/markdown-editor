import type {
  ASTNode,
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
  Visitor,
} from '@markdown-editor/ast';

/**
 * HTML渲染选项
 */
export interface HTMLRenderOptions {
  /** 是否美化输出HTML */
  pretty?: boolean;
  /** 缩进字符 */
  indent?: string;
  /** 自定义CSS类名前缀 */
  classPrefix?: string;
  /** 是否添加语法高亮支持 */
  syntaxHighlight?: boolean;
  /** 自定义属性 */
  customAttributes?: Record<string, Record<string, string>>;
}

/**
 * HTML转义工具
 */
class HTMLEscaper {
  private static escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  static escape(text: string): string {
    return text.replace(/[&<>"']/g, match => this.escapeMap[match] || match);
  }

  static escapeAttribute(text: string): string {
    return text.replace(/[&<>"']/g, match => this.escapeMap[match] || match);
  }
}

/**
 * HTML渲染器
 */
export class HTMLRenderer implements Visitor<string> {
  private options: HTMLRenderOptions;
  private indentLevel = 0;

  constructor(options: HTMLRenderOptions = {}) {
    this.options = {
      pretty: false,
      indent: '  ',
      classPrefix: 'md-',
      syntaxHighlight: false,
      customAttributes: {},
      ...options,
    };
  }

  /**
   * 渲染AST为HTML
   */
  render(node: ASTNode): string {
    this.indentLevel = 0;
    return this.visitNode(node);
  }

  /**
   * 访问任意节点
   */
  visitNode(node: ASTNode): string {
    switch (node.type) {
      case 'document':
        return this.visitDocument(node as DocumentNode);
      case 'heading':
        return this.visitHeading(node as HeadingNode);
      case 'paragraph':
        return this.visitParagraph(node as ParagraphNode);
      case 'code_block':
        return this.visitCodeBlock(node as CodeBlockNode);
      case 'quote':
        return this.visitQuote(node as QuoteNode);
      case 'list':
        return this.visitList(node as ListNode);
      case 'list_item':
        return this.visitListItem(node as ListItemNode);
      case 'horizontal_rule':
        return this.visitHorizontalRule(node as HorizontalRuleNode);
      case 'text':
        return this.visitText(node as TextNode);
      case 'bold':
        return this.visitBold(node as BoldNode);
      case 'italic':
        return this.visitItalic(node as ItalicNode);
      case 'code':
        return this.visitCode(node as CodeNode);
      case 'link':
        return this.visitLink(node as LinkNode);
      case 'image':
        return this.visitImage(node as ImageNode);
      case 'newline':
        return this.visitNewLine(node as NewLineNode);
      default:
        return '';
    }
  }

  visitDocument(node: DocumentNode): string {
    const content = this.renderChildren(node.children || []);
    return this.wrapWithNewlines(content);
  }

  visitHeading(node: HeadingNode): string {
    const level = Math.max(1, Math.min(6, node.level));
    const content = this.renderChildren(node.children || []);
    const className = this.getClassName('heading', `h${level}`);
    const attrs = this.getCustomAttributes('heading');

    return this.createTag(`h${level}`, content, { class: className, ...attrs });
  }

  visitParagraph(node: ParagraphNode): string {
    const content = this.renderChildren(node.children || []);
    const className = this.getClassName('paragraph');
    const attrs = this.getCustomAttributes('paragraph');

    return this.createTag('p', content, { class: className, ...attrs });
  }

  visitCodeBlock(node: CodeBlockNode): string {
    const code = HTMLEscaper.escape(node.value || '');
    const language = node.language;
    const className = this.getClassName('code-block', language ? `language-${language}` : undefined);
    const attrs = this.getCustomAttributes('code_block');

    const codeElement = this.createTag('code', code, {
      class: language ? `language-${language}` : undefined,
    });

    return this.createTag('pre', codeElement, { class: className, ...attrs });
  }

  visitQuote(node: QuoteNode): string {
    const content = this.renderChildren(node.children || []);
    const className = this.getClassName('quote');
    const attrs = this.getCustomAttributes('quote');

    return this.createTag('blockquote', content, { class: className, ...attrs });
  }

  visitList(node: ListNode): string {
    const content = this.renderChildren(node.children || []);
    const tag = node.ordered ? 'ol' : 'ul';
    const className = this.getClassName('list', node.ordered ? 'ordered' : 'unordered');
    const attrs = this.getCustomAttributes('list');

    const attributes: Record<string, string> = { class: className, ...attrs };
    if (node.ordered && node.start && node.start !== 1) {
      attributes.start = node.start.toString();
    }

    return this.createTag(tag, content, attributes);
  }

  visitListItem(node: ListItemNode): string {
    const content = this.renderChildren(node.children || []);
    const className = this.getClassName(
      'list-item',
      node.checked !== undefined ? 'task' : undefined,
      node.checked === true ? 'checked' : node.checked === false ? 'unchecked' : undefined,
    );
    const attrs = this.getCustomAttributes('list_item');

    let itemContent = content;

    // 添加复选框（如果是任务列表项）
    if (node.checked !== undefined) {
      const checkbox = this.createTag('input', '', {
        type: 'checkbox',
        ...(node.checked ? { checked: 'checked' } : {}),
        disabled: 'disabled',
      });
      itemContent = checkbox + (content ? ' ' + content : '');
    }

    return this.createTag('li', itemContent, { class: className, ...attrs });
  }

  visitHorizontalRule(_node: HorizontalRuleNode): string {
    const className = this.getClassName('horizontal-rule');
    const attrs = this.getCustomAttributes('horizontal_rule');

    return this.createTag('hr', '', { class: className, ...attrs }, true);
  }

  visitText(node: TextNode): string {
    return HTMLEscaper.escape(node.value || '');
  }

  visitBold(node: BoldNode): string {
    const content = this.renderChildren(node.children || []);
    const className = this.getClassName('bold');
    const attrs = this.getCustomAttributes('bold');

    return this.createTag('strong', content, { class: className, ...attrs });
  }

  visitItalic(node: ItalicNode): string {
    const content = this.renderChildren(node.children || []);
    const className = this.getClassName('italic');
    const attrs = this.getCustomAttributes('italic');

    return this.createTag('em', content, { class: className, ...attrs });
  }

  visitCode(node: CodeNode): string {
    const content = HTMLEscaper.escape(node.value || '');
    const className = this.getClassName('code');
    const attrs = this.getCustomAttributes('code');

    return this.createTag('code', content, { class: className, ...attrs });
  }

  visitLink(node: LinkNode): string {
    const content = this.renderChildren(node.children || []);
    const className = this.getClassName('link');
    const attrs = this.getCustomAttributes('link');

    const attributes: Record<string, string> = {
      href: HTMLEscaper.escapeAttribute(node.url || ''),
      class: className,
      ...attrs,
    };

    if (node.title) {
      attributes.title = HTMLEscaper.escapeAttribute(node.title);
    }

    return this.createTag('a', content, attributes);
  }

  visitImage(node: ImageNode): string {
    const className = this.getClassName('image');
    const attrs = this.getCustomAttributes('image');

    const attributes: Record<string, string> = {
      src: HTMLEscaper.escapeAttribute(node.url || ''),
      alt: HTMLEscaper.escapeAttribute(node.alt || ''),
      class: className,
      ...attrs,
    };

    if (node.title) {
      attributes.title = HTMLEscaper.escapeAttribute(node.title);
    }

    return this.createTag('img', '', attributes, true);
  }

  visitNewLine(_node: NewLineNode): string {
    const className = this.getClassName('new-line');
    const attrs = this.getCustomAttributes('new_line');

    return this.createTag('br', '', { class: className, ...attrs }, true);
  }

  // 工具方法

  /**
   * 渲染子节点
   */
  private renderChildren(children: ASTNode[]): string {
    return children.map(child => this.visitNode(child)).join('');
  }

  /**
   * 创建HTML标签
   */
  private createTag(
    tag: string,
    content: string,
    attributes: Record<string, string | undefined> = {},
    selfClosing = false,
  ): string {
    const attrs = Object.entries(attributes)
      .filter(([_key, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}="${HTMLEscaper.escapeAttribute(value!)}"`)
      .join(' ');

    const attrString = attrs ? ' ' + attrs : '';

    if (selfClosing) {
      return this.formatTag(`<${tag}${attrString} />`);
    }

    if (!content) {
      return this.formatTag(`<${tag}${attrString}></${tag}>`);
    }

    const openTag = `<${tag}${attrString}>`;
    const closeTag = `</${tag}>`;

    if (this.isInlineElement(tag)) {
      return openTag + content + closeTag;
    }

    return this.formatTag(openTag) + this.indentContent(content) + this.formatTag(closeTag);
  }

  /**
   * 格式化标签（添加缩进和换行）
   */
  private formatTag(tag: string): string {
    if (!this.options.pretty) {
      return tag;
    }

    return this.getIndent() + tag + '\n';
  }

  /**
   * 缩进内容
   */
  private indentContent(content: string): string {
    if (!this.options.pretty) {
      return content;
    }

    this.indentLevel++;
    const result = content;
    this.indentLevel--;

    return result;
  }

  /**
   * 获取缩进字符串
   */
  private getIndent(): string {
    if (!this.options.pretty) {
      return '';
    }

    return (this.options.indent || '  ').repeat(this.indentLevel);
  }

  /**
   * 判断是否为行内元素
   */
  private isInlineElement(tag: string): boolean {
    const inlineTags = ['strong', 'em', 'code', 'a', 'img', 'br', 'span'];
    return inlineTags.includes(tag);
  }

  /**
   * 在内容前后添加换行
   */
  private wrapWithNewlines(content: string): string {
    if (!this.options.pretty) {
      return content;
    }

    return content.endsWith('\n') ? content : content + '\n';
  }

  /**
   * 获取CSS类名
   */
  private getClassName(...parts: (string | undefined)[]): string {
    const prefix = this.options.classPrefix || '';
    const validParts = parts.filter(Boolean);

    if (validParts.length === 0) {
      return '';
    }

    return prefix + validParts.join('-');
  }

  /**
   * 获取自定义属性
   */
  private getCustomAttributes(nodeType: string): Record<string, string> {
    return this.options.customAttributes?.[nodeType] || {};
  }
}

/**
 * 默认HTML渲染器实例
 */
export const htmlRenderer = new HTMLRenderer();
