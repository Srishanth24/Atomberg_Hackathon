import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <ShieldAlert size={48} />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        You do not have the required role or permissions to access this enterprise module. All unauthorized attempts are logged.
      </p>
      <button 
        className="btn btn-primary flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        Go Back Safely
      </button>
    </div>
  );
};

export default Unauthorized;
