import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Lock, Mail, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../services/apiClient';
import { entraEnabled, entraLoginRequest, msalInstance, buildEntraProfile } from '../services/entraAuth';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { token, user } = await apiClient.login({ email, password });
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('userRole', user.role);
      toast.success(`Signed in as ${user.name}`);
      navigate(`/${user.role}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    toast('Use the demo password: demo123!');
  };

  const handleEntraLogin = async () => {
    try {
      if (!entraEnabled || !msalInstance) {
        toast.error('Configure VITE_ENTRA_CLIENT_ID and VITE_ENTRA_TENANT_ID to enable Microsoft Entra sign-in.');
        return;
      }

      const loginResult = await msalInstance.loginPopup(entraLoginRequest);
      const account = loginResult.account;
      const profile = buildEntraProfile(account, account?.idTokenClaims || {});

      const { token, user } = await apiClient.loginWithEntra(profile);
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('userRole', user.role);
      toast.success(`Signed in with Microsoft Entra ID as ${user.name}`);
      navigate(`/${user.role}`);
    } catch (error) {
      toast.error(error.message);
    }
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
                  required
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
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#forgot-password" className="forgot-password" onClick={handleForgotPassword}>Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary login-btn mb-4 w-full">
              Sign In
            </button>

            <button
              type="button"
              className="btn btn-outline w-full flex items-center justify-center gap-2 mb-6 border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={handleEntraLogin}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 21 21"><path fill="#f25022" d="M1 1h9v9H1z" /><path fill="#00a4ef" d="M1 11h9v9H1z" /><path fill="#7fba00" d="M11 1h9v9h-9z" /><path fill="#ffb900" d="M11 11h9v9h-9z" /></svg>
              Sign in with Microsoft Entra ID
            </button>
          </form>

          <div className="demo-credentials mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg shadow-inner">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Hackathon Demo Credentials</h4>
            <div className="space-y-2 text-sm text-slate-700">
              <div
                className="flex justify-between items-center cursor-pointer hover:bg-white p-2 rounded border border-transparent hover:border-slate-200 transition-all shadow-sm"
                onClick={() => { setEmail('peter.parker@goalsync.app'); setPassword('demo123!'); }}
              >
                <span><span className="font-semibold text-blue-600 w-24 inline-block italic">Demo Employee</span> peter.parker@goalsync.app</span>
                <span className="font-mono text-xs text-slate-400">demo123!</span>
              </div>
              <div
                className="flex justify-between items-center cursor-pointer hover:bg-white p-2 rounded border border-transparent hover:border-slate-200 transition-all shadow-sm"
                onClick={() => { setEmail('tony.stark@goalsync.app'); setPassword('demo123!'); }}
              >
                <span><span className="font-semibold text-purple-600 w-24 inline-block italic">Demo Manager</span> tony.stark@goalsync.app</span>
                <span className="font-mono text-xs text-slate-400">demo123!</span>
              </div>
              <div
                className="flex justify-between items-center cursor-pointer hover:bg-white p-2 rounded border border-transparent hover:border-slate-200 transition-all shadow-sm"
                onClick={() => { setEmail('admin.hr@goalsync.app'); setPassword('demo123!'); }}
              >
                <span><span className="font-semibold text-teal-600 w-24 inline-block italic">Demo Admin</span> admin.hr@goalsync.app</span>
                <span className="font-mono text-xs text-slate-400">demo123!</span>
              </div>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-3 italic">Click any row to auto-fill the login form.</p>
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
