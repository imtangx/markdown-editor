import { EditorView } from '@codemirror/view';

/**
 * 亮色主题
 */
export const lightTheme = EditorView.theme({
  '&': {
    fontSize: '14px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  '.cm-content': {
    padding: '16px',
    minHeight: '300px',
    lineHeight: '1.6',
    color: '#374151',
  },
  '.cm-focused': {
    outline: 'none',
  },
  '.cm-editor': {
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
  },
  '.cm-editor.cm-focused': {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
  '.cm-scroller': {
    fontFamily: 'inherit',
  },
  '.cm-gutters': {
    backgroundColor: '#f9fafb',
    borderRight: '1px solid #e5e7eb',
    color: '#9ca3af',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    minWidth: '3ch',
    color: '#9ca3af',
    fontSize: '13px',
  },
  '.cm-activeLine': {
    backgroundColor: '#f3f4f6',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#e5e7eb',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#dbeafe',
  },
  '.cm-cursor': {
    borderLeftColor: '#3b82f6',
  },
  '.cm-searchMatch': {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: '#fbbf24',
  },
});

/**
 * 暗色主题
 */
export const darkTheme = EditorView.theme(
  {
    '&': {
      fontSize: '14px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    '.cm-content': {
      padding: '16px',
      minHeight: '300px',
      lineHeight: '1.6',
      color: '#e5e7eb',
      backgroundColor: '#1f2937',
    },
    '.cm-focused': {
      outline: 'none',
    },
    '.cm-editor': {
      borderRadius: '8px',
      border: '1px solid #374151',
      backgroundColor: '#1f2937',
    },
    '.cm-editor.cm-focused': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)',
    },
    '.cm-scroller': {
      fontFamily: 'inherit',
    },
    '.cm-gutters': {
      backgroundColor: '#111827',
      borderRight: '1px solid #374151',
      color: '#6b7280',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      minWidth: '3ch',
      color: '#6b7280',
      fontSize: '13px',
    },
    '.cm-activeLine': {
      backgroundColor: '#374151',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#4b5563',
    },
    '.cm-selectionBackground': {
      backgroundColor: '#1e3a8a',
    },
    '.cm-cursor': {
      borderLeftColor: '#3b82f6',
    },
    '.cm-searchMatch': {
      backgroundColor: '#451a03',
      border: '1px solid #d97706',
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: '#92400e',
    },
  },
  { dark: true },
);
