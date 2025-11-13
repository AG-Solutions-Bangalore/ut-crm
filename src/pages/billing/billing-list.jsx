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
  Empty,
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
import { BILLING_LIST, UPDATE_STATUS_BILLING_ORDER } from "../../api";
import { useDebounce } from "../../components/common/useDebounce";
import DataTable from "../../components/DataTable/DataTable";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";

const { Search } = Input;

const BillingList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Open");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { trigger: UpdateStatus } = useApiMutation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: billingdata,
    isLoading,
  } = useGetApiMutation({
    url: BILLING_LIST,
    queryKey: ["billingdata", debouncedSearch, page, activeTab],
    params: { search: debouncedSearch, page, type: activeTab },
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const handleToggleStatus = async (order) => {
    try {
      const newStatus = order.billing_status == "Open" ? "Close" : "Open";

      const res = await UpdateStatus({
        url: `${UPDATE_STATUS_BILLING_ORDER}/${order.id}/status`,
        method: "patch",
        data: { billing_status: newStatus },
      });

      if (res?.code === 200 || res?.code === 201) {
        message.success(
          res.message ||
            `Order marked as ${newStatus === "Open" ? "Open" : "Closed"}`
        );
        console.log(newStatus, "newStatus");
        setActiveTab(newStatus);
        // refetch();
        queryClient.invalidateQueries([
          "billingdata",
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

  const columns = [
    {
      title: "Purchase Ref No",
      dataIndex: "purchase_orders_ref",
      key: "purchase_orders_ref",
      fixed: "left",
      render: (text, record) => (
        <span className="font-medium text-blue-600">
          {record.purchase_orders_ref}
        </span>
      ),
    },
    {
      title: "Date",
      key: "date",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="text-gray-800">
            Purchase:{" "}
            {record.purchase_date
              ? dayjs(record.purchase_date).format("DD-MM-YYYY")
              : "-"}
          </span>
          <span className="text-gray-600">
            Sale:{" "}
            {record.sale_date
              ? dayjs(record.sale_date).format("DD-MM-YYYY")
              : "-"}
          </span>
        </div>
      ),
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
      title: "Purchase Amount",
      dataIndex: "purchase_amount",
      key: "purchase_amount",
      align: "right",
      render: (text) => <span>{Number(text).toFixed(2)}</span>,
    },
    {
      title: "Billing Tones",
      dataIndex: "billing_tones",
      key: "billing_tones",
      align: "right",
      render: (text) => <span>{Number(text).toFixed(2)}</span>,
    },
    {
      title: "Rate",
      key: "rate",
      align: "left",
      render: (_, record) => (
        <div className="flex flex-col items-end">
          <span className="text-green-600">
            Sale: {Number(record.sale_rate).toFixed(2)}
          </span>
          <span className="text-blue-600">
            Purchase: {Number(record.purchase_rate).toFixed(2)}
          </span>
        </div>
      ),
    },

    {
      title: "Billing Type",
      dataIndex: "billing_type",
      key: "billing_type",
      render: (text) => <span className="capitalize">{text}</span>,
    },

    {
      title: "Billing BF",
      dataIndex: "billing_bf",
      key: "billing_bf",
      render: (text) => <span className="text-gray-800">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "billing_status",
      fixed: "right",
      key: "billing_status",
      render: (_, order) => {
        const isOpen = order.billing_status === "Open";
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
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Billing">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/billing/edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="View Billing">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/billing/view/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const apiData = billingdata?.data || {};
  const tableData = apiData.data || [];

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        {/* <h2 className="text-2xl font-bold heading">Billing List</h2> */}
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPage(1);
          }}
          items={[
            { key: "Open", label: "Open Billing List" },
            { key: "Close", label: "Closed Billing List" },
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
            onClick={() => navigate("/billing/create")}
          >
            Add Billing
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
            className="custom-purchase-table"
           
          />
        ) : (
          <Empty
            description={
              <span className="text-gray-500">No billing available</span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="py-8"
          />
        )}
      </div>
    </Card>
  );
};

export default BillingList;
