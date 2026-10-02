import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Memberships from '../../components/Memberships.jsx';

const MemberPricingPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <Link 
        to="/member/membership" 
        className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors mb-2 dark:text-slate-400 dark:hover:text-brand-400"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to My Membership
      </Link>
      <Memberships isDashboardMode={true} />
    </div>
  );
};

export default MemberPricingPage;
