import { Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { insertNewlineAndIndent, indentMore, indentLess } from '@codemirror/commands';

/**
 * Markdown快捷键扩展
 */
export const markdownKeymap = keymap.of([
  {
    key: 'Ctrl-b',
    mac: 'Cmd-b',
    run: view => {
      const selection = view.state.selection.main;
      const selectedText = view.state.doc.sliceString(selection.from, selection.to);
      const boldText = `**${selectedText}**`;

      view.dispatch({
        changes: {
          from: selection.from,
          to: selection.to,
          insert: boldText,
        },
        selection: {
          anchor: selection.from + 2,
          head: selection.from + 2 + selectedText.length,
        },
      });

      return true;
    },
  },
  {
    key: 'Tab',
    run: indentMore,
  },
  {
    key: 'Shift-Tab',
    run: indentLess,
  },
  {
    key: 'Enter',
    run: view => {
      const selection = view.state.selection.main;
      const line = view.state.doc.lineAt(selection.from);
      const lineText = line.text;

      // 检查是否在列表项中
      const listMatch = lineText.match(/^(\s*)([-*+]|\d+\.)\s/);
      if (listMatch) {
        const indent = listMatch[1];
        const marker = listMatch[2];
        const newLineText = `\n${indent}${marker} `;

        view.dispatch({
          changes: {
            from: selection.from,
            to: selection.to,
            insert: newLineText,
          },
          selection: {
            anchor: selection.from + newLineText.length,
          },
        });

        return true;
      }

      // 检查是否在引用块中
      const quoteMatch = lineText.match(/^(\s*>)\s*/);
      if (quoteMatch) {
        const quotePrefix = quoteMatch[1];
        const newLineText = `\n${quotePrefix} `;

        view.dispatch({
          changes: {
            from: selection.from,
            to: selection.to,
            insert: newLineText,
          },
          selection: {
            anchor: selection.from + newLineText.length,
          },
        });

        return true;
      }

      // 默认换行行为
      return insertNewlineAndIndent(view);
    },
  },
]);

/**
 * 创建Markdown扩展集合
 */
export function createMarkdownExtensions(): Extension[] {
  return [markdownKeymap];
}
