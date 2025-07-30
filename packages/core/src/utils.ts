/**
 * 创建分割布局
 */
export function createSplitLayout(container: HTMLElement): {
  editorContainer: HTMLElement;
  previewContainer: HTMLElement;
  splitter: HTMLElement;
} {
  // 清空容器
  container.innerHTML = '';
  container.style.cssText = `
    display: flex;
    height: 100%;
    position: relative;
  `;

  // 创建编辑器容器
  const editorContainer = document.createElement('div');
  editorContainer.style.cssText = `
    flex: 1;
    min-width: 0;
    height: 100%;
    position: relative;
  `;

  // 创建分割器
  const splitter = document.createElement('div');
  splitter.style.cssText = `
    width: 4px;
    background: #e5e7eb;
    cursor: col-resize;
    position: relative;
    flex-shrink: 0;
  `;

  // 创建预览容器
  const previewContainer = document.createElement('div');
  previewContainer.style.cssText = `
    flex: 1;
    min-width: 0;
    height: 100%;
    position: relative;
  `;

  // 添加分割器拖拽功能
  let isResizing = false;
  let startX = 0;
  let startEditorWidth = 0;
  let startPreviewWidth = 0;

  splitter.addEventListener('mousedown', e => {
    isResizing = true;
    startX = e.clientX;
    startEditorWidth = editorContainer.offsetWidth;
    startPreviewWidth = previewContainer.offsetWidth;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    splitter.style.background = '#3b82f6';
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  function handleMouseMove(e: MouseEvent) {
    if (!isResizing) return;

    const deltaX = e.clientX - startX;
    const containerWidth = container.offsetWidth;
    const splitterWidth = splitter.offsetWidth;

    let newEditorWidth = startEditorWidth + deltaX;
    let newPreviewWidth = startPreviewWidth - deltaX;

    // 限制最小宽度
    const minWidth = 200;
    if (newEditorWidth < minWidth) {
      newEditorWidth = minWidth;
      newPreviewWidth = containerWidth - newEditorWidth - splitterWidth;
    }
    if (newPreviewWidth < minWidth) {
      newPreviewWidth = minWidth;
      newEditorWidth = containerWidth - newPreviewWidth - splitterWidth;
    }

    const editorPercent = (newEditorWidth / (newEditorWidth + newPreviewWidth)) * 100;
    const previewPercent = 100 - editorPercent;

    editorContainer.style.flex = `0 0 ${editorPercent}%`;
    previewContainer.style.flex = `0 0 ${previewPercent}%`;
  }

  function handleMouseUp() {
    isResizing = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    splitter.style.background = '#e5e7eb';
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  // 组装布局
  container.appendChild(editorContainer);
  container.appendChild(splitter);
  container.appendChild(previewContainer);

  return {
    editorContainer,
    previewContainer,
    splitter,
  };
}

/**
 * 工具栏按钮配置
 */
export interface ToolbarButton {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  action: () => void;
  active?: boolean;
  disabled?: boolean;
}

/**
 * 创建工具栏
 */
export function createToolbar(container: HTMLElement, buttons: ToolbarButton[]): HTMLElement {
  const toolbar = document.createElement('div');
  toolbar.style.cssText = `
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    align-items: center;
    flex-wrap: wrap;
  `;

  buttons.forEach(button => {
    const btn = document.createElement('button');
    btn.id = button.id;
    btn.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: ${button.active ? '#3b82f6' : '#ffffff'};
      color: ${button.active ? '#ffffff' : '#374151'};
      border: 1px solid ${button.active ? '#3b82f6' : '#d1d5db'};
      border-radius: 6px;
      cursor: ${button.disabled ? 'not-allowed' : 'pointer'};
      font-size: 14px;
      transition: all 0.2s;
      opacity: ${button.disabled ? 0.5 : 1};
    `;

    // 图标
    if (button.icon) {
      const icon = document.createElement('span');
      icon.textContent = button.icon;
      icon.style.fontSize = '16px';
      btn.appendChild(icon);
    }

    // 文本
    const text = document.createElement('span');
    text.textContent = button.label;
    btn.appendChild(text);

    // 快捷键提示
    if (button.shortcut) {
      btn.title = `${button.label} (${button.shortcut})`;
    }

    // 点击事件
    btn.addEventListener('click', () => {
      if (!button.disabled) {
        button.action();
      }
    });

    // 悬停效果
    if (!button.disabled) {
      btn.addEventListener('mouseenter', () => {
        if (!button.active) {
          btn.style.background = '#f3f4f6';
          btn.style.borderColor = '#9ca3af';
        }
      });

      btn.addEventListener('mouseleave', () => {
        if (!button.active) {
          btn.style.background = '#ffffff';
          btn.style.borderColor = '#d1d5db';
        }
      });
    }

    toolbar.appendChild(btn);
  });

  container.appendChild(toolbar);
  return toolbar;
}

/**
 * 更新工具栏按钮状态
 */
export function updateToolbarButton(
  toolbar: HTMLElement,
  buttonId: string,
  updates: Partial<Pick<ToolbarButton, 'active' | 'disabled'>>,
): void {
  const button = toolbar.querySelector(`#${buttonId}`) as HTMLButtonElement;
  if (!button) return;

  if (updates.active !== undefined) {
    button.style.background = updates.active ? '#3b82f6' : '#ffffff';
    button.style.color = updates.active ? '#ffffff' : '#374151';
    button.style.borderColor = updates.active ? '#3b82f6' : '#d1d5db';
  }

  if (updates.disabled !== undefined) {
    button.style.opacity = updates.disabled ? '0.5' : '1';
    button.style.cursor = updates.disabled ? 'not-allowed' : 'pointer';
  }
}

/**
 * 创建状态栏
 */
export function createStatusBar(container: HTMLElement): {
  statusBar: HTMLElement;
  updateStatus: (status: Record<string, string>) => void;
} {
  const statusBar = document.createElement('div');
  statusBar.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 12px;
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
    font-size: 12px;
    color: #6b7280;
    flex-shrink: 0;
  `;

  const leftSection = document.createElement('div');
  leftSection.style.cssText = `
    display: flex;
    gap: 16px;
    align-items: center;
  `;

  const rightSection = document.createElement('div');
  rightSection.style.cssText = `
    display: flex;
    gap: 16px;
    align-items: center;
  `;

  statusBar.appendChild(leftSection);
  statusBar.appendChild(rightSection);
  container.appendChild(statusBar);

  function updateStatus(status: Record<string, string>) {
    // 清空现有内容
    leftSection.innerHTML = '';
    rightSection.innerHTML = '';

    // 左侧状态（一般放主要信息）
    const leftKeys = ['mode', 'file', 'saved'];
    leftKeys.forEach(key => {
      if (status[key]) {
        const item = document.createElement('span');
        item.textContent = status[key];
        leftSection.appendChild(item);
      }
    });

    // 右侧状态（一般放次要信息）
    const rightKeys = ['line', 'column', 'selection', 'length', 'encoding'];
    rightKeys.forEach(key => {
      if (status[key]) {
        const item = document.createElement('span');
        item.textContent = status[key];
        rightSection.appendChild(item);
      }
    });
  }

  return {
    statusBar,
    updateStatus,
  };
}
