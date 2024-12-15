import { defineConfig } from '@umijs/max';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';


export default defineConfig({
  model: {},
  initialState: {},
  request: {},
  dva: {},
  routes: [
    {
      path: '/',
      redirect: '/home',
      layout: false,
    },
    {
      path: '/home',
      component: './Home',
      layout: false,
    },
  ],
  npmClient: 'pnpm',
  chainWebpack(memo) {
    // 代码高亮显示
      memo.plugin('monaco-editor').use(MonacoWebpackPlugin, [
          {
            // 支持高亮显示的代码语言
          languages: ['json', 'sql','yaml']
      }
    ])
  }
});

