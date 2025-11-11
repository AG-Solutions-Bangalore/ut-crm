import {
  ArrowRightOutlined,
  DollarCircleOutlined,
  ReconciliationOutlined,
  ShopOutlined,
  ShoppingOutlined,
  TeamOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Card, Empty, Spin, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DASHBOARD } from "../../api";
import DataTable from "../../components/DataTable/DataTable";
import { useApiMutation } from "../../hooks/useApiMutation";

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const { trigger, loading: isMutating } = useApiMutation();

  const fetchDashboard = async () => {
    const res = await trigger({
      url: DASHBOARD,
    });
    if (res) {
      setData(res);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCardClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  const membershipCards = [
    {
      title: "Total Mills",
      count: data?.totalMill || 0,
      icon: <ShopOutlined />, // Represents a business/mill
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      path: "/master/mill",
    },
    {
      title: "Total Party",
      count: data?.totalParty || 0,
      icon: <TeamOutlined />, // Represents group or clients
      gradient: "from-green-500 to-green-600",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
      path: "/master/party",
    },
    {
      title: "Balance Order",
      count: data?.totalbalanceOrder || 0,
      icon: <ReconciliationOutlined />, // Represents orders
      gradient: "from-amber-500 to-amber-600",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
      path: "/report/balance-order",
    },
    {
      title: "Pending Payable",
      count: data?.totalbalancePayable || 0,
      icon: <DollarCircleOutlined />, // Represents payments/outgoing
      gradient: "from-pink-500 to-pink-600",
      bgLight: "bg-pink-50",
      textColor: "text-pink-600",
      path: "/payment",
    },
    {
      title: "Receivables",
      count: data?.totalbalanceReceivables || 0,
      icon: <WalletOutlined />, // Represents money coming in
      gradient: "from-cyan-500 to-cyan-600",
      bgLight: "bg-cyan-50",
      textColor: "text-cyan-600",
      path: "/payment",
    },
  ];

  const columns = [
    {
      title: "PO Reference",
      dataIndex: "purchase_orders_ref",
      key: "ref",
      width: 120,
      fixed: "left",
      render: (text) => (
        <div className="flex flex-col">
          <Text strong className="text-blue-600 font-mono text-xs">
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: "Date",
      width: 100,
      dataIndex: "purchase_orders_date",
      key: "purchase_orders_date",
      render: (text) =>
        text ? (
          dayjs(text).format("DD-MM-YYYY")
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: "Mill Name",
      dataIndex: "mill_name",
      key: "mill",
      width: 160,
      ellipsis: true,
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <Text className="font-medium text-gray-700 text-sm">{text}</Text>
        </div>
      ),
    },
    {
      title: "Party Name",
      dataIndex: "party_name",
      key: "party",
      width: 160,
      ellipsis: true,
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <Text className="text-gray-600 text-sm">{text}</Text>
        </div>
      ),
    },
    {
      title: "Bill Rate",
      dataIndex: "total_bill_rate",
      key: "bill_rate",
      width: 80,
      align: "right",
      render: (amount) => (
        <div className="flex flex-col items-end">
          <Text strong className="text-green-600 text-sm">
            ₹
            {parseFloat(amount).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </Text>
        </div>
      ),
    },
    {
      title: "Agreed Rate",
      dataIndex: "total_adreed_rate",
      key: "agreed_rate",
      width: 80,
      align: "right",
      render: (amount) => (
        <div className="flex flex-col items-end">
          <Text strong className="text-blue-600 text-sm">
            ₹
            {parseFloat(amount).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "purchase_orders_status",
      key: "status",
      width: 50,
      fixed: "right",
      align: "center",
      render: (status) => (
        <Tag
          color={status === "Open" ? "blue" : "green"}
          className="font-semibold px-3 py-1 rounded-full"
        >
          {status}
        </Tag>
      ),
    },
  ];

  if (isMutating) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {membershipCards.map((item, index) => (
            <Card
              key={index}
              hoverable
              onClick={() => handleCardClick(item.path)}
              className="
    group cursor-pointer overflow-hidden rounded-xl border-0 
    shadow-md hover:shadow-2xl transition-all duration-300 bg-white
  "
              bodyStyle={{ padding: 0 }}
            >
              <div className="relative p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`
          ${item.bgLight} px-4 py-3.5 rounded-xl flex items-center justify-between gap-3
          transition-transform duration-300 group-hover:scale-110 shadow-sm w-full
          max-w-[160px]
        `}
                  >
                    <span className={`text-3xl ${item.textColor}`}>
                      {item.icon}
                    </span>

                    <span
                      className={`text-2xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}
                    >
                      {item.count}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Text className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {item.title}
                  </Text>
                </div>
              </div>

              <div className={`h-1.5 bg-gradient-to-r ${item.gradient}`} />
            </Card>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 p-2 rounded-xl mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                <ShoppingOutlined className="text-2xl" />
              </div>
              <div>
                <div className="font-bold text-white text-lg">
                  Latest Purchase Orders
                </div>
              </div>
            </div>
            <a
              href="#"
              className="text-white hover:text-blue-100 font-semibold flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-all group"
              onClick={(e) => {
                e.preventDefault();
                navigate("/purchase");
              }}
            >
              View All
              <ArrowRightOutlined className="text-sm group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
        <>
          {data?.latestPurchaseOrders?.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <DataTable
                columns={columns}
                dataSource={data.latestPurchaseOrders}
                rowKey="id"
                scroll={{ x: 1100 }}
                className="custom-purchase-table"
                rowClassName={(record, index) =>
                  `hover:bg-blue-50/50 transition-all cursor-pointer ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`
                }
                onRow={(record) => ({
                  onClick: () => {
                    console.log("Order clicked:", record);
                  },
                })}
              />
            </div>
          ) : (
            <Empty
              description={
                <span className="text-gray-500">
                  No purchase orders available
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="py-8"
            />
          )}
        </>
      </div>
    </div>
  );
};

export default Dashboard;
