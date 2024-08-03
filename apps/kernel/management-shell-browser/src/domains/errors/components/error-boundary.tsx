/**
 * Error boundaries require the use of static getDerivedStateFromError and must be created as class components
 *
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 *
 * Alternatively we could also use the following lib, as recommended by React docs:
 *
 * @see https://github.com/bvaughn/react-error-boundary
 */

import React from 'react';

interface IErrorInfo {
  componentStack: any;
}

interface IErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: IErrorInfo) => void;
}

export class ErrorBoundary extends React.Component {
  props: IErrorBoundaryProps;
  state: { hasError: boolean };

  constructor(props: IErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: IErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    // Example "componentStack":
    //   in ComponentThatThrows (created by App)
    //   in ErrorBoundary (created by App)
    //   in div (created by App)
    //   in App
    // logErrorToMyService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    try {
      return this.props.children;
    } catch (error) {
      return this.props.fallback;
    }
  }
}
