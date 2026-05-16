import { 
  Server, Database, Cloud, Shield, MonitorSmartphone, 
  ArrowRight, Key, Layers
} from 'lucide-react';
import './Architecture.css';

const Architecture = () => {
  return (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1 className="text-2xl font-bold">System Architecture</h1>
          <p className="text-secondary mt-1">High-level overview of the GoalSync AI technology stack and data flow.</p>
        </div>
      </div>

      <div className="card arch-container">
        <div className="arch-canvas">
          
          {/* Client Tier */}
          <div className="arch-tier client-tier">
            <h3 className="tier-label">Client Tier (Frontend)</h3>
            <div className="arch-box react-box">
              <MonitorSmartphone size={32} className="mb-2 text-blue-500" />
              <div className="font-bold">React SPA</div>
              <div className="text-xs mt-1">Vite, Recharts, Lucide</div>
              
              <div className="role-tags mt-3 flex gap-1 justify-center">
                <span className="badge badge-info">Emp</span>
                <span className="badge badge-warning">Mgr</span>
                <span className="badge badge-danger">Admin</span>
              </div>
            </div>
            <div className="arch-label">Vercel Deployment</div>
          </div>

          <div className="arch-arrow">
            <div className="arrow-line"></div>
            <div className="arrow-head"><ArrowRight size={20} /></div>
            <span className="arrow-label">REST API (JSON)</span>
          </div>

          {/* Auth & Gateway Tier */}
          <div className="arch-tier auth-tier">
            <h3 className="tier-label">Security Tier</h3>
            <div className="arch-box auth-box">
              <Shield size={32} className="mb-2 text-purple-500" />
              <div className="font-bold">Auth Gateway</div>
              <div className="text-xs mt-1">JWT Validation</div>
              <div className="flex justify-center mt-2">
                <Key size={16} className="text-purple-500" />
              </div>
            </div>
            <div className="arch-label">Role-Based Access</div>
          </div>

          <div className="arch-arrow">
            <div className="arrow-line"></div>
            <div className="arrow-head"><ArrowRight size={20} /></div>
            <span className="arrow-label">Authenticated</span>
          </div>

          {/* Server Tier */}
          <div className="arch-tier server-tier">
            <h3 className="tier-label">Application Tier (Backend)</h3>
            <div className="arch-box express-box">
              <Server size={32} className="mb-2 text-green-500" />
              <div className="font-bold">Express.js API</div>
              <div className="text-xs mt-1">Node.js Environment</div>
              
              <div className="microservices mt-3">
                <div className="ms-badge">Goal Engine</div>
                <div className="ms-badge">Reporting</div>
                <div className="ms-badge">Notifications</div>
              </div>
            </div>
            <div className="arch-label">AWS EC2 / App Runner</div>
          </div>

          <div className="arch-arrow">
            <div className="arrow-line"></div>
            <div className="arrow-head"><ArrowRight size={20} /></div>
            <span className="arrow-label">Mongoose ODM</span>
          </div>

          {/* Data Tier */}
          <div className="arch-tier data-tier">
            <h3 className="tier-label">Data Tier</h3>
            <div className="arch-box mongo-box">
              <Database size={32} className="mb-2 text-teal-500" />
              <div className="font-bold">MongoDB Database</div>
              <div className="text-xs mt-1">NoSQL Document Store</div>
              <div className="flex justify-center mt-2">
                <Layers size={16} className="text-teal-500" />
              </div>
            </div>
            <div className="arch-label">MongoDB Atlas</div>
          </div>

        </div>

        {/* Global Cloud wrapper */}
        <div className="cloud-wrapper">
          <Cloud size={24} className="text-secondary" />
          <span className="ml-2 font-bold text-secondary">Cloud Infrastructure (AWS)</span>
        </div>
      </div>
    </div>
  );
};

export default Architecture;
