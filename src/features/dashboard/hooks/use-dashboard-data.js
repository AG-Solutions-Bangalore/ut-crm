import { useGetApiMutation } from "../../../hooks/useGetApiMutation";
import { DASHBOARD } from "../../../api";

/**
 * Custom hook for fetching dashboard data
 * @returns {Object} Dashboard data and loading state
 */
export const useDashboardData = () => {
  const { data, isLoading, isError, error, mutate } = useGetApiMutation({
    url: DASHBOARD,
    queryKey: ["dashboarddata"],
  });

  // Transform data to ensure consistent structure
  const transformedData = {
    totalMill: data?.totalMill || 0,
    totalParty: data?.totalParty || 0,
    totalbalanceOrder: data?.totalbalanceOrder || 0,
    totalbalancePayable: data?.totalbalancePayable || 0,
    totalbalanceReceivables: data?.totalbalanceReceivables || 0,
    latestPurchaseOrders: data?.latestPurchaseOrders || [],
  };

  /**
   * Refetch dashboard data
   */
  const refetch = () => {
    mutate();
  };

  return {
    data: transformedData,
    isLoading,
    isError,
    error,
    refetch,
    isEmpty: !isLoading && !data,
  };
};

export default useDashboardData;