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

// React类型定义（避免直接依赖React）
type ReactElement = any;
type ReactNode = any;
type ComponentType<_P = {}> = any;

/**
 * React组件映射
 */
export interface ComponentMap {
  document?: ComponentType<any>;
  heading?: ComponentType<{ level: number; children: ReactNode }>;
  paragraph?: ComponentType<{ children: ReactNode }>;
  codeBlock?: ComponentType<{ language?: string; children: string }>;
  quote?: ComponentType<{ children: ReactNode }>;
  list?: ComponentType<{ ordered: boolean; start?: number; children: ReactNode }>;
  listItem?: ComponentType<{ checked?: boolean; children: ReactNode }>;
  horizontalRule?: ComponentType<{}>;
  text?: ComponentType<{ children: string }>;
  bold?: ComponentType<{ children: ReactNode }>;
  italic?: ComponentType<{ children: ReactNode }>;
  code?: ComponentType<{ children: string }>;
  link?: ComponentType<{ href: string; title?: string; children: ReactNode }>;
  image?: ComponentType<{ src: string; alt: string; title?: string }>;
  newline?: ComponentType<{}>;
}

/**
 * React渲染选项
 */
export interface ReactRenderOptions {
  /** 自定义组件映射 */
  components?: ComponentMap;
  /** CSS类名前缀 */
  classPrefix?: string;
  /** 是否使用默认样式 */
  useDefaultStyles?: boolean;
  /** 自定义属性 */
  customProps?: Record<string, Record<string, any>>;
}

/**
 * React渲染器
 */
export class ReactRenderer implements Visitor<ReactElement | ReactNode> {
  private options: ReactRenderOptions;
  private React: any;
  private listNestLevel = 0; // 跟踪列表嵌套层级

  constructor(React: any, options: ReactRenderOptions = {}) {
    this.React = React;
    this.options = {
      classPrefix: 'md-',
      useDefaultStyles: true,
      components: {},
      customProps: {},
      ...options,
    };
  }

  /**
   * 渲染AST为React元素
   */
  render(node: ASTNode): ReactElement {
    const result = this.visitNode(node);
    return result as ReactElement;
  }

  /**
   * 访问任意节点
   */
  visitNode(node: ASTNode): ReactElement | ReactNode {
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
        return null;
    }
  }

  visitDocument(node: DocumentNode): ReactElement {
    const Component = this.options.components?.document || 'div';
    const children = this.renderChildren(node.children || []);
    const props = this.getProps('document', {
      className: this.getClassName('document'),
    });

    return this.React.createElement(Component, props, ...children);
  }

  visitHeading(node: HeadingNode): ReactElement {
    const level = Math.max(1, Math.min(6, node.level));
    const Component = this.options.components?.heading || `h${level}`;
    const children = this.renderChildren(node.children || []);
    const props = this.getProps('heading', {
      level,
      className: this.getClassName('heading', `h${level}`),
    });

    return this.React.createElement(Component, props, ...children);
  }

  visitParagraph(node: ParagraphNode): ReactElement {
    const Component = this.options.components?.paragraph || 'p';
    const children = this.renderChildren(node.children || []);
    const props = this.getProps('paragraph', {
      className: this.getClassName('paragraph'),
    });

    return this.React.createElement(Component, props, ...children);
  }

  visitCodeBlock(node: CodeBlockNode): ReactElement {
    const Component = this.options.components?.codeBlock || DefaultCodeBlock;
    const props = this.getProps('codeBlock', {
      language: node.language,
      className: this.getClassName('code-block', node.language ? `language-${node.language}` : undefined),
      children: node.value || '',
    });

    return this.React.createElement(Component, props);
  }

  visitQuote(node: QuoteNode): ReactElement {
    const Component = this.options.components?.quote || 'blockquote';
    const children = this.renderChildren(node.children || []);
    const props = this.getProps('quote', {
      className: this.getClassName('quote'),
    });

    return this.React.createElement(Component, props, ...children);
  }

  visitList(node: ListNode): ReactElement {
    const currentNestLevel = this.listNestLevel;
    this.listNestLevel++; // 进入嵌套层级

    const Component = this.options.components?.list || (node.ordered ? 'ol' : 'ul');
    const children = this.renderChildren(node.children || []);

    const baseProps: Record<string, any> = {
      ordered: node.ordered,
      start: node.ordered && node.start !== 1 ? node.start : undefined,
      className: this.getClassName('list', node.ordered ? 'ordered' : 'unordered'),
    };

    // 为嵌套列表添加padding-left样式（每层级一个tab=16px）
    if (currentNestLevel > 0) {
      baseProps.style = { paddingLeft: `${currentNestLevel * 16}px` };
    }

    const props = this.getProps('list', baseProps);

    this.listNestLevel = currentNestLevel; // 恢复嵌套层级

    return this.React.createElement(Component, props, ...children);
  }

  visitListItem(node: ListItemNode): ReactElement {
    const Component = this.options.components?.listItem || DefaultListItem;
    const children = this.renderChildren(node.children || []);
    const props = this.getProps('listItem', {
      checked: node.checked,
      className: this.getClassName(
        'list-item',
        node.checked !== undefined ? 'task' : undefined,
        node.checked === true ? 'checked' : node.checked === false ? 'unchecked' : undefined,
      ),
      children,
    });

    return this.React.createElement(Component, props);
  }

  visitHorizontalRule(_node: HorizontalRuleNode): ReactElement {
    const Component = this.options.components?.horizontalRule || 'hr';
    const props = this.getProps('horizontalRule', {
      className: this.getClassName('horizontal-rule'),
    });

    return this.React.createElement(Component, props);
  }

  visitText(node: TextNode): ReactNode {
    const Component = this.options.components?.text;
    const text = node.value || '';

    if (Component) {
      const props = this.getProps('text', { children: text });
      return this.React.createElement(Component, props);
    }

    return text;
  }

  visitBold(node: BoldNode): ReactElement {
    const Component = this.options.components?.bold || 'strong';
    const children = this.renderChildren(node.children || []);
    const props = this.getProps('bold', {
      className: this.getClassName('bold'),
    });

    return this.React.createElement(Component, props, ...children);
  }

  visitItalic(node: ItalicNode): ReactElement {
    const Component = this.options.components?.italic || 'em';
    const children = this.renderChildren(node.children || []);
    const props = this.getProps('italic', {
      className: this.getClassName('italic'),
    });

    return this.React.createElement(Component, props, ...children);
  }

  visitCode(node: CodeNode): ReactElement {
    const Component = this.options.components?.code || 'code';
    const props = this.getProps('code', {
      className: this.getClassName('code'),
      children: node.value || '',
    });

    return this.React.createElement(Component, props);
  }

  visitLink(node: LinkNode): ReactElement {
    const Component = this.options.components?.link || 'a';
    const children = this.renderChildren(node.children || []);
    const props = this.getProps('link', {
      href: node.url || '',
      title: node.title,
      className: this.getClassName('link'),
    });

    return this.React.createElement(Component, props, ...children);
  }

  visitImage(node: ImageNode): ReactElement {
    const Component = this.options.components?.image || 'img';
    const props = this.getProps('image', {
      src: node.url || '',
      alt: node.alt || '',
      title: node.title,
      className: this.getClassName('image'),
    });

    return this.React.createElement(Component, props);
  }

  visitNewLine(_node: NewLineNode): ReactElement {
    const Component = this.options.components?.newline || 'br';
    const props = this.getProps('newline', {
      className: this.getClassName('new-line'),
    });

    return this.React.createElement(Component, props);
  }

  // 工具方法

  /**
   * 渲染子节点
   */
  private renderChildren(children: ASTNode[]): ReactNode[] {
    return children
      .map((child, index) => {
        const element = this.visitNode(child);
        // 为React元素添加key
        if (this.React.isValidElement(element)) {
          return this.React.cloneElement(element, { key: index });
        }
        return element;
      })
      .filter(Boolean);
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
   * 获取组件属性
   */
  private getProps(nodeType: string, baseProps: Record<string, any>): Record<string, any> {
    const customProps = this.options.customProps?.[nodeType] || {};
    return { ...baseProps, ...customProps };
  }
}

// 默认组件

/**
 * 默认代码块组件
 */
function DefaultCodeBlock({ language, children, className, ...props }: any) {
  // 这里不能直接使用require，因为在测试环境中可能没有React
  // 组件会通过工厂函数创建，React实例通过上下文传递
  return {
    type: 'pre',
    props: {
      className,
      ...props,
      children: {
        type: 'code',
        props: {
          className: language ? `language-${language}` : undefined,
          children,
        },
      },
    },
  };
}

/**
 * 默认列表项组件
 */
function DefaultListItem({ checked, children, className, ...props }: any) {
  const content = [];

  // 添加复选框（如果是任务列表项）
  if (checked !== undefined) {
    content.push({
      type: 'input',
      props: {
        key: 'checkbox',
        type: 'checkbox',
        checked: !!checked,
        disabled: true,
        style: { marginRight: '0.5em' },
      },
    });
  }

  content.push(...(Array.isArray(children) ? children : [children]));

  return {
    type: 'li',
    props: {
      className,
      ...props,
      children: content,
    },
  };
}

/**
 * 创建React渲染器的工厂函数
 */
export function createReactRenderer(React: any, options?: ReactRenderOptions): ReactRenderer {
  return new ReactRenderer(React, options);
}
