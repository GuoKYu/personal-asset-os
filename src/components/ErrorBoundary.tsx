import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 全局错误边界 — 捕获 React 渲染树中任何未处理的异常，
 * 防止整个应用白屏崩溃，显示降级 UI 并提示用户刷新。
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] React error caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
            background: '#0f1117',
            color: '#e5e7eb',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>&#x26A0;&#xFE0F;</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            应用加载异常
          </h1>
          <p style={{ color: '#9ca3af', marginBottom: '0.5rem', textAlign: 'center', maxWidth: '400px' }}>
            页面渲染时发生了未预期的错误，可能是网络波动或会话过期导致。
          </p>
          <p style={{
            fontSize: '0.8rem',
            color: '#6b7280',
            fontFamily: 'monospace',
            marginBottom: '1.5rem',
            maxWidth: '500px',
            wordBreak: 'break-all',
            textAlign: 'center',
          }}>
            {this.state.error?.message || '未知错误'}
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: 'linear-gradient(135deg, var(--pao-primary), var(--pao-violet))',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            重试
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #374151',
              background: 'transparent',
              color: '#9ca3af',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            返回首页
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
