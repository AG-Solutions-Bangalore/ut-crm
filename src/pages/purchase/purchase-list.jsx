import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  Input,
  Popconfirm,
  Space,
  Spin,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PURCHASE_ORDER_LIST, UPDATE_STATUS_PURCHASE_ORDER } from "../../api";
import { useDebounce } from "../../components/common/useDebounce";
import DataTable from "../../components/DataTable/DataTable";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";

const { Search } = Input;

const PurchaseList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Open");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { trigger: deleteTrigger } = useApiMutation();
  const { trigger: UpdateStatus } = useApiMutation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: purchasedata,
    isLoading,
    refetch,
  } = useGetApiMutation({
    url: PURCHASE_ORDER_LIST,
    queryKey: ["purchasedata", debouncedSearch, page, activeTab],
    params: { search: debouncedSearch, page, type: activeTab },
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
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

      if (res?.code === 200 || res?.code === 201) {
        message.success(
          res.message ||
            `Order marked as ${newStatus === "Open" ? "Open" : "Closed"}`
        );
        setActiveTab(newStatus);
        queryClient.invalidateQueries([
          "purchasedata",
          debouncedSearch,
          page,
          newStatus,
        ]);
      } else {
        message.error(res.message || "Failed to update order status.");
      }
    } catch (error) {
      console.error("Error updating status:", error?.response?.data || error);
      message.error(
        error?.response?.data?.message ||
          error.message ||
          "Error updating order status."
      );
    }
  };
  const handleDelete = async (subId) => {
    if (!subId) {
      message.error("Invalid Purchase ID.");
      return;
    }

    try {
      const res = await deleteTrigger({
        url: `${PURCHASE_ORDER_LIST}/${subId}`,
        method: "delete",
      });

      if (res?.code === 201) {
        message.success(res?.message || "Purchase deleted successfully!");
        refetch();
      } else {
        message.error(res?.message || "Failed to delete Purchase item.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      message.error(error?.message || "Error while deleting Purchase.");
    }
  };
  const columns = [
    {
      title: "Purchase Ref No",
      dataIndex: "purchase_orders_ref",
      key: "purchase_orders_ref",
      render: (text, record) => (
        <span className="font-medium text-blue-600">
          {record.purchase_orders_ref}
        </span>
      ),
    },
    {
      title: "Purchase Date",
      dataIndex: "purchase_orders_date",
      key: "purchase_orders_date",
      render: (_, record) =>
        dayjs(record.purchase_orders_date).format("DD-MM-YYYY"),
    },
    {
      title: "Mill Name",
      dataIndex: "mill_name",
      key: "mill_name",
      render: (text) => <span className="text-gray-800">{text}</span>,
    },
    {
      title: "Party Name",
      dataIndex: "party_name",
      key: "party_name",
      render: (text) => <span className="text-gray-800">{text}</span>,
    },
    {
      title: "Total Bill Rate",
      dataIndex: "total_bill_rate",
      key: "total_bill_rate",
      align: "right",
      render: (text) => <span>{Number(text).toFixed(2)}</span>,
    },
    {
      title: "Total Agreed Rate",
      dataIndex: "total_adreed_rate",
      key: "total_adreed_rate",
      align: "right",
      render: (text) => <span>{Number(text).toFixed(2)}</span>,
    },
    {
      title: "Status",
      dataIndex: "purchase_orders_status",
      key: "purchase_orders_status",
      render: (_, order) => {
        const isOpen = order.purchase_orders_status == "Open";
        console.log(order, "order");
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
                {isOpen ? "Open" : "Close"}
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
          <Tooltip title="View Purchase">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/purchase/view/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Delete Purchase">
            <Popconfirm
              title="Are you sure you want to delete this item?"
              onConfirm={() => handleDelete(record?.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
      width: 120,
    },
  ];
  const apiData = purchasedata?.data || {};
  const tableData = apiData.data || [];

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        {/* <h2 className="text-2xl font-bold heading">Purchase List</h2> */}
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPage(1);
          }}
          items={[
            { key: "Open", label: "Open Purchase List" },
            { key: "Close", label: "Closed Purchase List" },
          ]}
        />
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
