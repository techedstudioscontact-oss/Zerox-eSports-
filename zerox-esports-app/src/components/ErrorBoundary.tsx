import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-royal-black text-white flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full bg-dark-gray border border-red-500 rounded-lg p-8">
                        <h1 className="text-3xl font-bold text-red-500 mb-4">⚠️ Application Error</h1>
                        <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>

                        {this.state.error && (
                            <div className="bg-royal-black p-4 rounded mb-4">
                                <p className="font-mono text-sm text-red-400">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        {this.state.errorInfo && (
                            <details className="mb-4">
                                <summary className="cursor-pointer text-gray-400 hover:text-white">
                                    Stack Trace (click to expand)
                                </summary>
                                <pre className="bg-royal-black p-4 rounded mt-2 overflow-auto text-xs text-gray-500">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="bg-metallic-gold text-royal-black px-6 py-3 rounded-lg font-bold hover:bg-bright-gold transition-all"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
