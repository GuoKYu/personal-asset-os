import cloudbase from '@cloudbase/js-sdk';

// CloudBase 环境配置
const ENV_ID = 'space-d9gig1bg3d7b37c1a';

// Publishable Key（用于 Web SDK 身份认证，从 CloudBase 控制台 API Key 配置获取）
const PUBLISHABLE_KEY =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL3NwYWNlLWQ5Z2lnMWJnM2Q3YjM3YzFhLmFwLXNoYW5naGFpLnRjYi1hcGkudGVuY2VudGNsb3VkYXBpLmNvbSIsInN1YiI6ImFub24iLCJhdWQiOiJzcGFjZS1kOWdpZzFiZzNkN2IzN2MxYSIsImV4cCI6NDA4NzA4OTcyMywiaWF0IjoxNzgzNDA2NTIzLCJub25jZSI6ImNzX1hKVV9IVEltSmoxbXZkUjItZ3ciLCJhdF9oYXNoIjoiY3NfWEpVX0hUSW1KajFtdmRSMi1ndyIsIm5hbWUiOiJBbm9ueW1vdXMiLCJzY29wZSI6ImFub255bW91cyIsInByb2plY3RfaWQiOiJzcGFjZS1kOWdpZzFiZzNkN2IzN2MxYSIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF91c2VyIiwiaXNfc3lzdGVtX2FkbWluIjpmYWxzZX0.AorXskiGzWd7PsJuoVir6mKq6BszaLYRgiejix2yjz-cf6suF6yzt5XcAW5zLMTO1vAP-9gC6-0G64Ael8UlXIPZ2F1IzBFouzucjT99kz9TKXLTN7ZhjxIHfdF8pAxYCtGNdchC4VyPEv-sKQrfwNlwvZUVCWP9ZSEwc1F02KFOtsvGr_c6DqXO4ylnmn-sWWOVRBlKKWU2fg8kLyYCP2ud8CVZupsmpYCZeICVrVGe3N89zxaT1a5utiN2pVMGxqY6C0E9PpVp4H9EoGeEiZ5sjASlJhhGrM4D1dY6ftt3lKWyxijXTeQdBI0dar4D8vq8sED3Cy0tLhly1uc7Cw';

// 初始化 CloudBase
export const app = cloudbase.init({
  env: ENV_ID,
  region: 'ap-shanghai',
  accessKey: PUBLISHABLE_KEY,
  // 启用持久化登录状态
  persistence: 'local',
  auth: {
    detectSessionInUrl: false,
  },
});

// 导出常用服务
export const auth = app.auth({ persistence: 'local' });
export const db = app.database();

export default app;