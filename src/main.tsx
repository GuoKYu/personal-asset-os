import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'tdesign-react/es/_util/react-19-adapter'
import 'tdesign-react/es/style/index.css'
import { ConfigProvider } from 'tdesign-react'
import zhConfig from 'tdesign-react/es/locale/zh_CN'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import { ensureSession } from './services/cloudbaseAuthService'
import { seedAllDemoData } from './services/seedService'
import { useProfileStore } from './store'
import { getCurrentUserUid } from './services/cloudbaseAuthService'

/**
 * 应用启动引导：
 * 1. 建立匿名会话（CloudBase 查询/写入都依赖 _openid）
 * 2. 首次启动时把示例数据写入数据库（幂等，已存在则跳过）
 * 3. 加载用户资料
 *
 * 所有步骤均有独立 try-catch，单步失败不影响后续流程。
 */
async function bootstrap() {
  // Step 1: 建立会话
  try {
    const { uid, error } = await ensureSession()
    if (error) {
      console.warn('[bootstrap] 匿名登录失败（将使用离线模式）:', error)
    }
    if (!uid) {
      console.warn('[bootstrap] 未能获取用户标识，部分功能可能不可用')
    }
  } catch (e) {
    console.warn('[bootstrap] 登录异常（将使用离线模式）:', e)
  }

  // Step 2: 写入示例数据
  const uid = getCurrentUserUid()
  if (uid) {
    try {
      await seedAllDemoData()
    } catch (e) {
      console.warn('[bootstrap] 种子数据写入失败:', e)
    }
    try {
      useProfileStore.getState().loadProfile()
    } catch (e) {
      console.warn('[bootstrap] 用户资料加载失败:', e)
    }
  }
}

// 启动引导，无论成败都渲染 App
bootstrap().finally(() => {
  const rootEl = document.getElementById('root')
  if (!rootEl) {
    document.body.innerHTML = '<div style="padding:2rem;font-family:system-ui">无法找到页面挂载点 #root，请检查 HTML 结构。</div>'
    return
  }
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <ConfigProvider globalConfig={zhConfig}>
          <App />
        </ConfigProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
})
