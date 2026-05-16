import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Default to employee if manual login used
    navigate('/employee');
  };

  const handleDemoLogin = (role) => {
    navigate(`/${role}`);
  };

  return (
    <div className="login-container">
      <div className="login-left animate-fade-in">
        <div className="login-brand">
          <Target className="login-logo-icon" size={32} />
          <span className="login-logo-text">GoalSync AI</span>
        </div>
        
        <div className="login-form-container">
          <div className="login-header">
            <h1>Welcome back</h1>
            <p>Sign in to your enterprise goal management portal</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">Work Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary login-btn">
              Sign In
            </button>
          </form>

          <div className="divider">
            <span>Or sign in as Demo User</span>
          </div>

          <div className="demo-login-options">
            <button 
              className="btn btn-outline demo-btn" 
              onClick={() => handleDemoLogin('employee')}
            >
              Employee
              <ArrowRight size={16} />
            </button>
            <button 
              className="btn btn-outline demo-btn" 
              onClick={() => handleDemoLogin('manager')}
            >
              Manager (L1)
              <ArrowRight size={16} />
            </button>
            <button 
              className="btn btn-outline demo-btn" 
              onClick={() => handleDemoLogin('admin')}
            >
              Admin / HR
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-illustration-container">
          {/* Abstract illustration built with CSS/Lucide */}
          <div className="illustration-element el-1">
            <Target size={120} strokeWidth={1} />
          </div>
          <div className="illustration-element el-2">
            <CheckCircle2 size={80} strokeWidth={1.5} />
          </div>
          
          <div className="illustration-text">
            <h2>Align. Track. Succeed.</h2>
            <p>Empower your workforce with AI-driven goal management and intelligent performance insights.</p>
          </div>
          
          <div className="glass-card mockup-card">
            <div className="mockup-header">
              <div className="mockup-dot red"></div>
              <div className="mockup-dot yellow"></div>
              <div className="mockup-dot green"></div>
            </div>
            <div className="mockup-body">
              <div className="mockup-line w-3/4"></div>
              <div className="mockup-line w-full"></div>
              <div className="mockup-line w-1/2"></div>
              <div className="mockup-bar-chart">
                <div className="mockup-bar h-60"></div>
                <div className="mockup-bar h-80"></div>
                <div className="mockup-bar h-40"></div>
                <div className="mockup-bar h-100"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
