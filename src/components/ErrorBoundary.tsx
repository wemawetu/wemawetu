import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="text-center max-w-xl">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              We're sorry, but something unexpected happened. Please try refreshing the page or go back to the homepage.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={this.handleReload} size="lg" className="gap-2">
                <RefreshCw className="h-5 w-5" />
                Refresh Page
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/">
                  <Home className="h-5 w-5" />
                  Go to Homepage
                </Link>
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 p-4 bg-muted rounded-lg text-left">
                <p className="text-sm font-mono text-destructive break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
