module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复
        'docs', // 文档
        'style', // 格式
        'refactor', // 重构
        'perf', // 性能优化
        'test', // 测试
        'chore', // 构建过程或辅助工具的变动
        'ci', // CI配置
        'build', // 构建系统
        'revert', // 回滚
      ],
    ],
    'subject-case': [0], // 禁用主题大小写检查
  },
};
