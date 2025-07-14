import { TokenType } from '@markdown-editor/lexer';
import type { ASTNode } from './nodes';

/**
 * 访问者接口
 */
export interface Visitor<T = void> {
  /** 访问文档节点 */
  visitDocument?(node: import('./nodes').DocumentNode): T;
  /** 访问标题节点 */
  visitHeading?(node: import('./nodes').HeadingNode): T;
  /** 访问段落节点 */
  visitParagraph?(node: import('./nodes').ParagraphNode): T;
  /** 访问代码块节点 */
  visitCodeBlock?(node: import('./nodes').CodeBlockNode): T;
  /** 访问引用节点 */
  visitQuote?(node: import('./nodes').QuoteNode): T;
  /** 访问列表节点 */
  visitList?(node: import('./nodes').ListNode): T;
  /** 访问列表项节点 */
  visitListItem?(node: import('./nodes').ListItemNode): T;
  /** 访问分割线节点 */
  visitHorizontalRule?(node: import('./nodes').HorizontalRuleNode): T;
  /** 访问文本节点 */
  visitText?(node: import('./nodes').TextNode): T;
  /** 访问粗体节点 */
  visitBold?(node: import('./nodes').BoldNode): T;
  /** 访问斜体节点 */
  visitItalic?(node: import('./nodes').ItalicNode): T;
  /** 访问行内代码节点 */
  visitCode?(node: import('./nodes').CodeNode): T;
  /** 访问链接节点 */
  visitLink?(node: import('./nodes').LinkNode): T;
  /** 访问图片节点 */
  visitImage?(node: import('./nodes').ImageNode): T;
  /** 访问换行节点 */
  visitNewLine?(node: import('./nodes').NewLineNode): T;
  /** 访问通用节点（fallback） */
  visitNode?(node: ASTNode): T;
}

/**
 * 遍历选项
 */
export interface TraversalOptions {
  /** 是否深度优先遍历 */
  depthFirst?: boolean;
  /** 是否包含当前节点 */
  includeSelf?: boolean;
  /** 过滤器函数 */
  filter?: (node: ASTNode) => boolean;
}

/**
 * AST遍历器
 */
export class ASTTraverser {
  /**
   * 遍历AST并应用访问者
   */
  traverse<T>(node: ASTNode, visitor: Visitor<T>, options: TraversalOptions = {}): T[] {
    const { depthFirst = true, includeSelf = true, filter } = options;

    const results: T[] = [];
    const visited = new Set<ASTNode>();

    const visit = (currentNode: ASTNode): void => {
      // 避免循环引用
      if (visited.has(currentNode)) {
        return;
      }
      visited.add(currentNode);

      // 前序遍历：先访问当前节点
      if (!depthFirst && includeSelf) {
        // 应用过滤器
        if (!filter || filter(currentNode)) {
          const result = this.visitNode(currentNode, visitor);
          if (result !== undefined) {
            results.push(result);
          }
        }
      }

      // 遍历子节点
      if (currentNode.children) {
        for (const child of currentNode.children) {
          visit(child);
        }
      }

      // 后序遍历：后访问当前节点
      if (depthFirst && includeSelf) {
        // 应用过滤器
        if (!filter || filter(currentNode)) {
          const result = this.visitNode(currentNode, visitor);
          if (result !== undefined) {
            results.push(result);
          }
        }
      }
    };

    visit(node);
    return results;
  }

  /**
   * 访问单个节点
   */
  private visitNode<T>(node: ASTNode, visitor: Visitor<T>): T | undefined {
    let result: T | undefined;

    switch (node.type) {
      case TokenType.DOCUMENT:
        result = visitor.visitDocument?.(node as import('./nodes').DocumentNode);
        break;
      case TokenType.HEADING:
        result = visitor.visitHeading?.(node as import('./nodes').HeadingNode);
        break;
      case TokenType.PARAGRAPH:
        result = visitor.visitParagraph?.(node as import('./nodes').ParagraphNode);
        break;
      case TokenType.CODE_BLOCK:
        result = visitor.visitCodeBlock?.(node as import('./nodes').CodeBlockNode);
        break;
      case TokenType.QUOTE:
        result = visitor.visitQuote?.(node as import('./nodes').QuoteNode);
        break;
      case TokenType.LIST:
        result = visitor.visitList?.(node as import('./nodes').ListNode);
        break;
      case TokenType.LIST_ITEM:
        result = visitor.visitListItem?.(node as import('./nodes').ListItemNode);
        break;
      case TokenType.HORIZONTAL_RULE:
        result = visitor.visitHorizontalRule?.(node as import('./nodes').HorizontalRuleNode);
        break;
      case TokenType.TEXT:
        result = visitor.visitText?.(node as import('./nodes').TextNode);
        break;
      case TokenType.BOLD:
        result = visitor.visitBold?.(node as import('./nodes').BoldNode);
        break;
      case TokenType.ITALIC:
        result = visitor.visitItalic?.(node as import('./nodes').ItalicNode);
        break;
      case TokenType.CODE:
        result = visitor.visitCode?.(node as import('./nodes').CodeNode);
        break;
      case TokenType.LINK:
        result = visitor.visitLink?.(node as import('./nodes').LinkNode);
        break;
      case TokenType.IMAGE:
        result = visitor.visitImage?.(node as import('./nodes').ImageNode);
        break;
      case TokenType.NEWLINE:
        result = visitor.visitNewLine?.(node as import('./nodes').NewLineNode);
        break;
    }

    // 如果特定的访问方法没有返回值，则使用通用的访问方法
    return result !== undefined ? result : visitor.visitNode?.(node);
  }

  /**
   * 查找节点
   */
  find(node: ASTNode, predicate: (node: ASTNode) => boolean): ASTNode | null {
    const results = this.traverse(node, {
      visitNode: n => (predicate(n) ? n : undefined),
    });
    return results.find(Boolean) || null;
  }

  /**
   * 查找所有匹配的节点
   */
  findAll(node: ASTNode, predicate: (node: ASTNode) => boolean): ASTNode[] {
    const results = this.traverse(node, {
      visitNode: n => (predicate(n) ? n : undefined),
    });
    return results.filter(r => r !== undefined) as ASTNode[];
  }

  /**
   * 获取所有指定类型的节点
   */
  getNodesByType<T extends ASTNode>(node: ASTNode, type: string): T[] {
    return this.findAll(node, n => n.type === type) as T[];
  }

  /**
   * 获取节点的深度
   */
  getDepth(node: ASTNode): number {
    let depth = 0;
    let current = node.parent;
    while (current) {
      depth++;
      current = current.parent;
    }
    return depth;
  }

  /**
   * 获取节点的路径（从根节点到当前节点）
   */
  getPath(node: ASTNode): ASTNode[] {
    const path: ASTNode[] = [];
    let current = node;
    while (current) {
      path.unshift(current);
      current = current.parent!;
    }
    return path;
  }

  /**
   * 获取节点的兄弟节点
   */
  getSiblings(node: ASTNode): ASTNode[] {
    if (!node.parent || !node.parent.children) {
      return [];
    }
    return node.parent.children.filter(child => child !== node);
  }

  /**
   * 获取前一个兄弟节点
   */
  getPreviousSibling(node: ASTNode): ASTNode | null {
    if (!node.parent || !node.parent.children) {
      return null;
    }
    const index = node.parent.children.indexOf(node);
    return index > 0 ? node.parent.children[index - 1] : null;
  }

  /**
   * 获取后一个兄弟节点
   */
  getNextSibling(node: ASTNode): ASTNode | null {
    if (!node.parent || !node.parent.children) {
      return null;
    }
    const index = node.parent.children.indexOf(node);
    return index < node.parent.children.length - 1 ? node.parent.children[index + 1] : null;
  }
}

/**
 * AST转换器
 */
export class ASTTransformer {
  /**
   * 转换节点
   */
  transform<T extends ASTNode>(node: T, transformer: (node: ASTNode) => ASTNode | null): T | null {
    const result = transformer(node);
    if (!result) return null;

    // 递归转换子节点
    if (result.children) {
      result.children = result.children.map(child => this.transform(child, transformer)).filter(Boolean) as ASTNode[];
    }

    return result as T;
  }

  /**
   * 批量转换节点
   */
  transformMany<T extends ASTNode>(nodes: T[], transformer: (node: ASTNode) => ASTNode | null): T[] {
    return nodes.map(node => this.transform(node, transformer)).filter(Boolean) as T[];
  }

  /**
   * 克隆节点
   */
  clone<T extends ASTNode>(node: T): T {
    const cloned = { ...node };

    // 重置父节点引用
    cloned.parent = undefined;

    // 递归克隆子节点
    if (cloned.children) {
      cloned.children = cloned.children.map(child => this.clone(child));
      // 重新设置父子关系
      cloned.children.forEach(child => {
        child.parent = cloned;
      });
    }

    return cloned;
  }

  /**
   * 插入节点
   */
  insertNode(parent: ASTNode, node: ASTNode, index?: number): void {
    if (!parent.children) {
      parent.children = [];
    }

    node.parent = parent;

    if (index === undefined) {
      parent.children.push(node);
    } else {
      parent.children.splice(index, 0, node);
    }
  }

  /**
   * 删除节点
   */
  removeNode(node: ASTNode): void {
    if (!node.parent || !node.parent.children) {
      return;
    }

    const index = node.parent.children.indexOf(node);
    if (index > -1) {
      node.parent.children.splice(index, 1);
      node.parent = undefined;
    }
  }

  /**
   * 替换节点
   */
  replaceNode(oldNode: ASTNode, newNode: ASTNode): void {
    if (!oldNode.parent || !oldNode.parent.children) {
      return;
    }

    const index = oldNode.parent.children.indexOf(oldNode);
    if (index > -1) {
      newNode.parent = oldNode.parent;
      oldNode.parent.children[index] = newNode;
      oldNode.parent = undefined;
    }
  }

  /**
   * 移动节点
   */
  moveNode(node: ASTNode, newParent: ASTNode, index?: number): void {
    this.removeNode(node);
    this.insertNode(newParent, node, index);
  }
}

/**
 * 默认遍历器实例
 */
export const traverser = new ASTTraverser();

/**
 * 默认转换器实例
 */
export const transformer = new ASTTransformer();
