
import React from 'react';
import LoadingState from '../LoadingState';
import DashboardHeader from './DashboardHeader';
import DashboardTabs from './DashboardTabs';
import { useOwnerDashboard } from '../hooks/useOwnerDashboard';

const OwnerDashboardContainer: React.FC = () => {
  const {
    loading,
    orders,
    setOrders,
    partners,
    setPartners,
    handleRoleAssigned,
  } = useOwnerDashboard();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <DashboardHeader />
      <DashboardTabs 
        orders={orders}
        setOrders={setOrders}
        partners={partners}
        setPartners={setPartners}
        handleRoleAssigned={handleRoleAssigned}
      />
    </div>
  );
};

export default OwnerDashboardContainer;
