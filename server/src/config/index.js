module.exports = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB Configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-deploy',
  
  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Application Info
  appName: process.env.APP_NAME || 'MERN Deploy System',
  version: process.env.npm_package_version || '1.0.0',
  
  // Validate required environment variables in production
  validate() {
    const required = ['MONGODB_URI'];
    
    if (this.nodeEnv === 'production') {
      const missing = required.filter(key => !process.env[key]);
      if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
      }
    }
    
    return this;
  }
};
