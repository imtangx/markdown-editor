import { describe, it, expect } from 'vitest';
import { nodeFactory, traverser } from '../src';
import type { Visitor } from '../src/visitor';

describe('Visitor Pattern', () => {
  it('应该支持自定义访问者', () => {
    // 创建测试AST
    const textNode = nodeFactory.createText('Hello', { line: 1, column: 1, offset: 0 });
    const boldNode = nodeFactory.createBold([textNode], { line: 1, column: 1, offset: 0 });
    const paragraph = nodeFactory.createParagraph([boldNode], { line: 1, column: 1, offset: 0 });
    const documentNode = nodeFactory.createDocument([paragraph], { line: 1, column: 1, offset: 0 });

    // 创建访问者来收集文本内容
    const textCollector: Visitor<string> = {
      visitText: node => node.value,
      visitBold: node => `**${node.children.map(child => child.value || '').join('')}**`,
    };

    const results = traverser.traverse(documentNode, textCollector);
    expect(results).toContain('Hello');
    expect(results).toContain('**Hello**');
  });

  it('应该支持fallback访问者', () => {
    const textNode = nodeFactory.createText('Test', { line: 1, column: 1, offset: 0 });
    const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });

    const fallbackVisitor: Visitor<string> = {
      visitNode: node => node.type,
    };

    const results = traverser.traverse(paragraph, fallbackVisitor);
    expect(results).toContain('text');
    expect(results).toContain('paragraph');
  });

  it('应该支持条件遍历', () => {
    const textNode1 = nodeFactory.createText('Keep', { line: 1, column: 1, offset: 0 });
    const textNode2 = nodeFactory.createText('Filter', { line: 1, column: 6, offset: 0 });
    const paragraph = nodeFactory.createParagraph([textNode1, textNode2], { line: 1, column: 1, offset: 0 });

    const results = traverser.traverse(
      paragraph,
      {
        visitText: node => node.value,
      },
      {
        filter: node => node.type === 'text' && node.value !== 'Filter',
      },
    );

    expect(results).toContain('Keep');
    expect(results).not.toContain('Filter');
  });

  it('应该支持广度优先遍历', () => {
    const textNode = nodeFactory.createText('Text', { line: 1, column: 1, offset: 0 });
    const paragraph = nodeFactory.createParagraph([textNode], { line: 1, column: 1, offset: 0 });
    const documentNode = nodeFactory.createDocument([paragraph], { line: 1, column: 1, offset: 0 });

    const visitOrder: string[] = [];

    traverser.traverse(
      documentNode,
      {
        visitNode: node => {
          visitOrder.push(node.type);
          return node.type;
        },
      },
      {
        depthFirst: false,
      },
    );

    expect(visitOrder.indexOf('document')).toBeLessThan(visitOrder.indexOf('paragraph'));
    expect(visitOrder.indexOf('paragraph')).toBeLessThan(visitOrder.indexOf('text'));
  });
});
