import { useGetApiMutation } from "../../../hooks/useGetApiMutation";
import { DASHBOARD } from "../../../api";

export const useDashboardData = () => {
  return useGetApiMutation({
    url: DASHBOARD,
    queryKey: ["dashboarddata"],
  });
};