import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
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
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
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
      title: "P/O Ref No",
      dataIndex: "purchase_orders_ref",
      key: "purchase_orders_ref",
      render: (text, record) => (
        <span className="font-medium text-blue-600">
          {record.purchase_orders_ref}
        </span>
      ),
    },
    {
      title: "P/O Date",
      dataIndex: "purchase_orders_date",
      key: "purchase_orders_date",
      render: (_, record) =>
        dayjs(record.purchase_orders_date).format("DD-MM-YYYY"),
    },
    {
      title: "Mill Name",
      dataIndex: "mill_short",
      key: "mill_short",
      render: (text) => <span className="text-gray-800">{text}</span>,
    },
    {
      title: "Party Name",
      dataIndex: "party_short",
      key: "party_short",
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
          {/* Show Edit only if status is NOT Close */}
          {record.purchase_orders_status !== "Close" && (
            <Tooltip title="Edit P/O">
              <Button
                type="primary"
                icon={<EditOutlined />}
                size="small"
                onClick={() => navigate(`/purchase/edit/${record.id}`)}
              />
            </Tooltip>
          )}

          <Tooltip title="View P/O">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/purchase/view/${record.id}`)}
            />
          </Tooltip>

          <Tooltip title="Delete P/O">
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
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPage(1);
          }}
          items={[
            { key: "Open", label: "Open P/O List" },
            { key: "Close", label: "Closed P/O List" },
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
            Add P/O
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
            expandable={{
              expandedRowKeys,
              onExpand: (expanded, record) =>
                setExpandedRowKeys(expanded ? [record.id] : []),
              expandIcon: ({ expanded, onExpand, record }) => {
                const hasInvoice = !!record.billing;
                const isEmpty = !hasInvoice;

                const iconStyle = {
                  color: isEmpty ? "#dc2626" : "#16a34a",
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                };

                return expanded ? (
                  <MinusCircleOutlined
                    onClick={(e) => onExpand(record, e)}
                    style={iconStyle}
                  />
                ) : (
                  <PlusCircleOutlined
                    onClick={(e) => onExpand(record, e)}
                    style={iconStyle}
                  />
                );
              },
              expandedRowRender: (record) => {
                const invoice = record.billing;

                if (!invoice) {
                  return (
                    <div className="bg-gray-50 rounded-md p-4 text-gray-500 italic text-center">
                      No P/O details Available
                    </div>
                  );
                }

                return (
                  <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 space-y-4 transition-all duration-300 ease-in-out">
                    {invoice && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">
                          Billing Details
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center">
                          {[
                            {
                              label: "Bill No",
                              value: invoice.billing_no,
                            },

                            {
                              label: "Tones",
                              value: invoice.billing_total_tones,
                            },

                            {
                              label: "Sale Amount",
                              value: `₹${invoice.billing_total_sale_amount}`,
                            },
                            {
                              label: "Comm",
                              value: `₹${invoice.billing_total_commn}`,
                            },
                            {
                              label: "Bill Type",
                              value: invoice.billing_type,
                            },
                            {
                              label: "Payment Type",
                              value: invoice.billing_payment_type,
                            },
                            {
                              label: "Status",
                              value: invoice.billing_status,
                            },
                          ].map((item) => (
                            <div key={item.label}>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {item.label}
                              </p>
                              <p className="text-sm text-gray-800 font-semibold">
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              },
            }}
          />
        ) : (
          <div className="text-center text-gray-500 py-20">
            No P/O data found.
          </div>
        )}
      </div>
    </Card>
  );
};

export default PurchaseList;
