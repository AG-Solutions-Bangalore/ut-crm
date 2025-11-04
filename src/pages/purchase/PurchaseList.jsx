import {
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Input,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Tooltip,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PURCHASE_ORDER_LIST, UPDATE_STATUS_PURCHASE_ORDER } from "../../api";
import HighlightText from "../../components/common/HighlightText";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useDebounce } from "../../components/common/useDebounce";

const { Search } = Input;

const PurchaseList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { trigger: UpdateStatus } = useApiMutation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const {
    data: partydata,
    isLoading,
    refetch,
  } = useGetApiMutation({
    url: PURCHASE_ORDER_LIST,
    queryKey: ["partydata", debouncedSearch, page],
    params: { search: debouncedSearch, page },
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // refetch();
  };
  const handleToggleStatus = async (order) => {
    try {
      const newStatus =
        order.purchase_orders_status === "Open" ? "Close" : "Open";

      const res = await UpdateStatus({
        url: `${UPDATE_STATUS_PURCHASE_ORDER}/${order.id}/status`,
        method: "patch",
        data: { purchase_orders_status: newStatus },
      });

      if (res?.code === 201) {
        message.success(
          res.message ||
            `Order marked as ${newStatus === "Open" ? "Open" : "Closed"}`
        );
        refetch();
      } else {
        message.error(res.message || "Failed to update order status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error(error.message || "Error updating order status.");
    }
  };
  const columns = [
    {
      title: "Party Name",
      dataIndex: "party_name",
      key: "party_name",
      render: (_, record) => (
        <HighlightText text={record.party_name} match={debouncedSearch} />
      ),
    },
    {
      title: "Short Name",
      dataIndex: "party_short",
      key: "party_short",
      render: (_, record) => (
        <HighlightText text={record.party_short} match={debouncedSearch} />
      ),
    },

    {
      title: "State",
      dataIndex: "party_state",
      key: "party_state",
      render: (_, record) => (
        <HighlightText text={record.party_state} match={debouncedSearch} />
      ),
    },
    {
      title: "Due Date",
      dataIndex: "party_due_days",
      key: "party_due_days",
      align: "center",
      render: (_, record) => {
        const days = record.party_due_days ?? 0;
        return (
          <div className="flex justify-center">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                days > 30
                  ? "bg-red-100 text-red-700"
                  : days > 10
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {days} Days
            </span>
          </div>
        );
      },
    },

    // Column definition
    {
      title: "Status",
      dataIndex: "purchase_orders_status",
      key: "purchase_orders_status",
      render: (_, order) => {
        const isOpen = order.purchase_orders_status === "Open";
        return (
          <div className="flex justify-start">
            <Popconfirm
              title={`Mark this order as ${isOpen ? "Close" : "Open"}?`}
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleToggleStatus(order)}
            >
              <Tag
                color={isOpen ? "green" : "red"}
                icon={isOpen ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                className="cursor-pointer"
              >
                {isOpen ? "Open" : "Closed"}
              </Tag>
            </Popconfirm>
          </div>
        );
      },
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Purchase">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/purchase/edit/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
      width: 130,
    },
  ];

  const apiData = partydata?.data || {};
  const tableData = apiData.data || [];

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold heading">Purchase List</h2>

        <div className="flex-1 flex gap-4 sm:justify-end">
          <Search
            placeholder="Search"
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/purchase/create")}
          >
            Add Purchase
          </Button>
        </div>
      </div>

      <div className="min-h-[26rem]">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : tableData.length > 0 ? (
          <DataTable
            data={tableData}
            columns={columns}
            fotterdata={{
              current: apiData.current_page,
              total: apiData.total,
              pageSize: apiData.per_page,
              onChange: handlePageChange,
            }}
          />
        ) : (
          <div className="text-center text-gray-500 py-20">
            No Purchase data found.
          </div>
        )}
      </div>
    </Card>
  );
};

export default PurchaseList;
