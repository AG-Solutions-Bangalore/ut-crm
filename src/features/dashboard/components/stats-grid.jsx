import {
    DollarCircleOutlined,
    ReconciliationOutlined,
    ShopOutlined,
    TeamOutlined,
    WalletOutlined,
  } from "@ant-design/icons";
import DashboardCard from "./dashboard-card";

  
  const StatsGrid = ({ data, onCardClick }) => {
    const membershipCards = [
      {
        title: "Total Mills",
        count: data?.totalMill || 0,
        icon: <ShopOutlined />,
        gradient: "from-blue-500 to-blue-600",
        bgLight: "bg-blue-50",
        textColor: "text-blue-600",
        path: "/master/mill",
      },
      {
        title: "Total Party",
        count: data?.totalParty || 0,
        icon: <TeamOutlined />,
        gradient: "from-green-500 to-green-600",
        bgLight: "bg-green-50",
        textColor: "text-green-600",
        path: "/master/party",
      },
      {
        title: "Balance Order",
        count: data?.totalbalanceOrder || 0,
        icon: <ReconciliationOutlined />,
        gradient: "from-amber-500 to-amber-600",
        bgLight: "bg-amber-50",
        textColor: "text-amber-600",
        path: "/report/balance-order",
      },
      {
        title: "Pending Payable",
        count: data?.totalbalancePayable || 0,
        icon: <DollarCircleOutlined />,
        gradient: "from-pink-500 to-pink-600",
        bgLight: "bg-pink-50",
        textColor: "text-pink-600",
        path: "/payment",
      },
      {
        title: "Receivables",
        count: data?.totalbalanceReceivables || 0,
        icon: <WalletOutlined />,
        gradient: "from-cyan-500 to-cyan-600",
        bgLight: "bg-cyan-50",
        textColor: "text-cyan-600",
        path: "/payment",
      },
    ];
  
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {membershipCards.map((item, index) => (
          <DashboardCard
            key={index}
            {...item}
            onClick={onCardClick}
          />
        ))}
      </div>
    );
  };
  
  export default StatsGrid;