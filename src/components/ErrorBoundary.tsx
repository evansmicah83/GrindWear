import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-16 text-center">
          <div className="max-w-xl rounded-3xl border border-gray-200 bg-white p-10 shadow-xl">
            <p className="text-6xl">😬</p>
            <h1 className="mt-4 text-3xl font-black text-gray-900">Something went wrong</h1>
            <p className="mt-3 text-sm text-gray-500">
              We hit an unexpected issue while loading this page. Refresh to try again or come back later.
            </p>
            <button
              onClick={this.handleReset}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-grind-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-grind-black/90"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
