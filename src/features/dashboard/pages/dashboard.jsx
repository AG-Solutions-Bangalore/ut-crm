/* eslint-disable no-unused-vars */
import { Spin, Typography } from "antd";
import { useDashboardData } from "../hooks/use-dashboard-data";  // Fixed import
import { useDashboard } from "../hooks/use-dashboard";           // Fixed import
import StatsGrid from "../components/stats-grid";                // Fixed import
import PurchaseOrdersTable from "../components/purchase-orders-table";  // Fixed import

const Dashboard = () => {
  const { data, isLoading, refetch } = useDashboardData();
  const { handleCardClick, handleViewAll } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <StatsGrid data={data} onCardClick={handleCardClick} />
        <PurchaseOrdersTable 
          data={data} 
          onViewAll={handleViewAll}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Dashboard;