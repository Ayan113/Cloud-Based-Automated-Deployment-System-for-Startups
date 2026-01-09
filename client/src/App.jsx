import { useState, useEffect } from 'react';
import './App.css';

// API URL - uses environment variable or falls back to production URL
const API_URL = import.meta.env.VITE_API_URL || 'https://mern-deploy-backend-kr8n.onrender.com';

function App() {
    const [healthStatus, setHealthStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkHealth = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/health`);
            const data = await response.json();
            setHealthStatus(data);
        } catch (err) {
            setError('Unable to connect to backend');
            setHealthStatus(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkHealth();
        // Refresh health status every 30 seconds
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="app">
            {/* Hero Section */}
            <header className="hero">
                <div className="container">
                    <div className="hero-content">
                        <span className="hero-badge">🚀 Production Ready</span>
                        <h1>Cloud Deployment System</h1>
                        <p className="hero-subtitle">
                            Automated, reliable deployments for MERN stack applications.
                            Built for startups that need to move fast.
                        </p>
                        <div className="hero-actions">
                            <button className="btn btn-primary" onClick={checkHealth}>
                                <span className="btn-icon">🔄</span>
                                Refresh Status
                            </button>
                            <a href="https://github.com" className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                                <span className="btn-icon">📚</span>
                                Documentation
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Status Dashboard */}
            <main className="dashboard">
                <div className="container">
                    <div className="dashboard-grid">
                        {/* Health Status Card */}
                        <div className="card health-card">
                            <div className="card-header">
                                <h2>System Health</h2>
                                {loading ? (
                                    <span className="status-badge loading">
                                        <span className="spinner"></span>
                                        Checking...
                                    </span>
                                ) : healthStatus?.status === 'ok' ? (
                                    <span className="status-badge success">
                                        <span className="pulse-dot success"></span>
                                        Healthy
                                    </span>
                                ) : (
                                    <span className="status-badge error">
                                        <span className="pulse-dot error"></span>
                                        {error || 'Degraded'}
                                    </span>
                                )}
                            </div>

                            {healthStatus && (
                                <div className="health-details">
                                    <div className="health-item">
                                        <span className="health-label">Database</span>
                                        <span className={`health-value ${healthStatus.checks?.database === 'connected' ? 'connected' : 'disconnected'}`}>
                                            {healthStatus.checks?.database || 'Unknown'}
                                        </span>
                                    </div>
                                    <div className="health-item">
                                        <span className="health-label">Uptime</span>
                                        <span className="health-value">
                                            {healthStatus.uptime ? `${Math.floor(healthStatus.uptime / 60)}m ${Math.floor(healthStatus.uptime % 60)}s` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="health-item">
                                        <span className="health-label">Environment</span>
                                        <span className="health-value">{healthStatus.environment || 'N/A'}</span>
                                    </div>
                                    <div className="health-item">
                                        <span className="health-label">Version</span>
                                        <span className="health-value">{healthStatus.version || 'N/A'}</span>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="error-message">
                                    <p>⚠️ {error}</p>
                                    <p className="error-hint">Make sure the backend server is running on port 5000</p>
                                </div>
                            )}
                        </div>

                        {/* Features Card */}
                        <div className="card features-card">
                            <h2>Features</h2>
                            <ul className="features-list">
                                <li>
                                    <span className="feature-icon">🐳</span>
                                    <div>
                                        <strong>Docker Containerization</strong>
                                        <p>Production-ready containers for consistent deployments</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="feature-icon">⚡</span>
                                    <div>
                                        <strong>GitHub Actions CI/CD</strong>
                                        <p>Automated build, test, and deployment pipeline</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="feature-icon">☁️</span>
                                    <div>
                                        <strong>AWS EC2 Deployment</strong>
                                        <p>Scalable cloud infrastructure with Nginx proxy</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="feature-icon">🔒</span>
                                    <div>
                                        <strong>Secure Secrets</strong>
                                        <p>Environment-based configuration management</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Pipeline Card */}
                        <div className="card pipeline-card">
                            <h2>Deployment Pipeline</h2>
                            <div className="pipeline">
                                <div className="pipeline-step completed">
                                    <div className="step-indicator">1</div>
                                    <div className="step-content">
                                        <strong>Code Push</strong>
                                        <p>Push to GitHub</p>
                                    </div>
                                </div>
                                <div className="pipeline-connector"></div>
                                <div className="pipeline-step completed">
                                    <div className="step-indicator">2</div>
                                    <div className="step-content">
                                        <strong>Build & Test</strong>
                                        <p>Run CI checks</p>
                                    </div>
                                </div>
                                <div className="pipeline-connector"></div>
                                <div className="pipeline-step active">
                                    <div className="step-indicator">3</div>
                                    <div className="step-content">
                                        <strong>Docker Build</strong>
                                        <p>Create images</p>
                                    </div>
                                </div>
                                <div className="pipeline-connector"></div>
                                <div className="pipeline-step">
                                    <div className="step-indicator">4</div>
                                    <div className="step-content">
                                        <strong>Deploy</strong>
                                        <p>Push to AWS</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>Built with ❤️ for startups • MERN Stack Cloud Deployment System</p>
                </div>
            </footer>
        </div>
    );
}

export default App;
