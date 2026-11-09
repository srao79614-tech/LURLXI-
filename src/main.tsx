import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.warn("Recovered from interface error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-8 rounded-2xl bg-[#0c1018] border border-amber-500/40 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
              ✦
            </div>
            <h2 className="text-xl font-bold font-['Cinzel'] text-white">LURL Executive Platform</h2>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Recovered successfully. Click below to load the full readymade platform.
            </p>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem('lurl_explicit_logout');
                } catch {}
                window.location.reload();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
            >
              Open Full Readymade Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
