import { EditorState, Extension } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { markdown } from '@codemirror/lang-markdown';
import { markdownKeymap } from './extensions';

/**
 * 编辑器配置
 */
export interface EditorConfig {
  /** 初始文档内容 */
  doc?: string;
  /** 是否显示行号 */
  lineNumbers?: boolean;
  /** 主题扩展 */
  theme?: Extension;
  /** 自定义扩展 */
  extensions?: Extension[];
  /** 内容变化回调 */
  onChange?: (event: EditorChangeEvent) => void;
  /** 滚动回调 */
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
}

/**
 * 编辑器变化事件
 */
export interface EditorChangeEvent {
  /** 新的文档内容 */
  content: string;
  /** 变化的起始位置 */
  from: number;
  /** 变化的结束位置 */
  to: number;
  /** 插入的文本 */
  insert: string;
}

/**
 * Markdown编辑器类
 */
export class MarkdownEditor {
  private view: EditorView;
  private config: EditorConfig;

  constructor(container: HTMLElement, config: EditorConfig = {}) {
    this.config = config;
    this.view = this.createEditor();
    container.appendChild(this.view.dom);
  }

  /**
   * 创建编辑器实例
   */
  private createEditor(): EditorView {
    const { doc = '', lineNumbers: showLineNumbers = true, theme, extensions = [], onChange, onScroll } = this.config;

    // 基础扩展
    const baseExtensions: Extension[] = [
      // 语言支持
      markdown(),

      // 编辑器功能
      history(),
      indentOnInput(),
      bracketMatching(),
      highlightSelectionMatches(),

      // 语法高亮
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),

      // 键盘快捷键 - 我们的快捷键优先级更高
      markdownKeymap,
      keymap.of([...defaultKeymap, ...searchKeymap, ...historyKeymap]),
    ];

    // 可选扩展
    if (showLineNumbers) {
      baseExtensions.push(lineNumbers(), highlightActiveLineGutter());
    }

    if (theme) {
      baseExtensions.push(theme);
    }

    // 事件监听器
    if (onChange) {
      baseExtensions.push(
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            const changes = update.changes;
            changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
              onChange({
                content: update.state.doc.toString(),
                from: fromA,
                to: toA,
                insert: inserted.toString(),
              });
            });
          }
        }),
      );
    }

    if (onScroll) {
      baseExtensions.push(
        EditorView.domEventHandlers({
          scroll: (event, view) => {
            const { scrollTop, scrollHeight, clientHeight } = view.scrollDOM;
            onScroll(scrollTop, scrollHeight, clientHeight);
            return false;
          },
        }),
      );
    }

    // 添加自定义扩展
    baseExtensions.push(...extensions);

    // 创建编辑器状态
    const state = EditorState.create({
      doc,
      extensions: baseExtensions,
    });

    // 创建编辑器视图
    return new EditorView({
      state,
    });
  }

  /**
   * 获取编辑器内容
   */
  getContent(): string {
    return this.view.state.doc.toString();
  }

  /**
   * 设置编辑器内容
   */
  setContent(content: string): void {
    const transaction = this.view.state.update({
      changes: {
        from: 0,
        to: this.view.state.doc.length,
        insert: content,
      },
    });
    this.view.dispatch(transaction);
  }

  /**
   * 在当前位置插入文本
   */
  insertText(text: string): void {
    const selection = this.view.state.selection.main;
    const transaction = this.view.state.update({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: text,
      },
    });
    this.view.dispatch(transaction);
  }

  /**
   * 获取当前选择
   */
  getSelection(): { from: number; to: number; text: string } {
    const selection = this.view.state.selection.main;
    return {
      from: selection.from,
      to: selection.to,
      text: this.view.state.doc.sliceString(selection.from, selection.to),
    };
  }

  /**
   * 设置选择范围
   */
  setSelection(from: number, to?: number): void {
    const selection = { anchor: from, head: to ?? from };
    this.view.dispatch({
      selection,
    });
  }

  /**
   * 聚焦编辑器
   */
  focus(): void {
    this.view.focus();
  }

  /**
   * 滚动到指定位置
   */
  scrollTo(pos: number): void {
    this.view.dispatch({
      effects: EditorView.scrollIntoView(pos, { y: 'start' }),
    });
  }

  /**
   * 滚动到指定行
   */
  scrollToLine(line: number): void {
    const doc = this.view.state.doc;
    if (line >= 1 && line <= doc.lines) {
      const pos = doc.line(line).from;
      this.scrollTo(pos);
    }
  }

  /**
   * 获取滚动信息
   */
  getScrollInfo(): { top: number; height: number; clientHeight: number } {
    const { scrollTop, scrollHeight, clientHeight } = this.view.scrollDOM;
    return {
      top: scrollTop,
      height: scrollHeight,
      clientHeight,
    };
  }

  /**
   * 设置滚动位置
   */
  setScrollTop(scrollTop: number): void {
    this.view.scrollDOM.scrollTop = scrollTop;
  }

  /**
   * 获取原始编辑器视图
   */
  getView(): EditorView {
    return this.view;
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    this.view.destroy();
  }
}
