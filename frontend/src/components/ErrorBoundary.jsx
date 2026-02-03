import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white p-4">
                    <div className="max-w-2xl w-full p-8 border-2 border-red-500 rounded-lg bg-red-50 text-red-900 shadow-xl">
                        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                        <div className="mb-4">
                            <p className="font-semibold">Error:</p>
                            <p className="font-mono text-sm bg-red-100 p-2 rounded">{this.state.error && this.state.error.toString()}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Stack Trace:</p>
                            <pre className="bg-red-100 p-4 rounded overflow-auto text-xs max-h-64 my-2">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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
