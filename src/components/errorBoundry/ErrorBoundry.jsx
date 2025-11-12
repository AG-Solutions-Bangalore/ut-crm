import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.log(`Caught by Error Boundary`, error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.errorCard}>
            <div style={styles.iconContainer}>
              <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 style={styles.title}>Something Went Wrong</h2>
            
            <p style={styles.message}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            
            <div style={styles.actions}>
              <button 
                onClick={this.handleRetry}
                style={styles.primaryButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                Try Again
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                style={styles.secondaryButton}
                onMouseOver={(e) => e.target.style.backgroundColor = '#545b62'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
              >
                Reload Page
              </button>
            </div>
            
            {import.meta.env.DEV && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details (Development)</summary>
                <pre style={styles.errorStack}>
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f8f9fa',
  },
  errorCard: {
    background: 'white',
    padding: '40px',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
    border: '1px solid #e9ecef',
  },
  iconContainer: {
    marginBottom: '20px',
  },
  icon: {
    width: '64px',
    height: '64px',
    color: '#dc3545',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#212529',
    margin: '0 0 16px 0',
  },
  message: {
    fontSize: '16px',
    color: '#6c757d',
    margin: '0 0 32px 0',
    lineHeight: '1.5',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  details: {
    marginTop: '24px',
    textAlign: 'left',
  },
  summary: {
    cursor: 'pointer',
    color: '#6c757d',
    fontSize: '14px',
    marginBottom: '8px',
  },
  errorStack: {
    backgroundColor: '#f8f9fa',
    padding: '16px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#495057',
    overflow: 'auto',
    maxHeight: '200px',
    border: '1px solid #e9ecef',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
};

export default ErrorBoundary;