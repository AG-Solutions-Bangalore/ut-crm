import {
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  MinusCircleOutlined,
  MinusOutlined,
  PlusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
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

const { Search } = Input;

const BillingList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [activeTab, setActiveTab] = useState("Open");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { trigger: UpdateStatus } = useApiMutation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: billingdata, isLoading } = useGetApiMutation({
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
      key: "purchase_orders_ref",
      fixed: "left",
      render: (_, record) => (
        <div className="flex flex-col">
          {record.purchase_orders_ref && (
            <span className="text-black font-bold">
              {record.purchase_orders_ref}
            </span>
          )}
          <span className="text-gray-800">
            {record.billing_payment_type && (
              <span
                className={`inline-flex items-center justify-center w-6 h-6 mr-1 rounded-full text-white font-semibold uppercase ${
                  record.billing_payment_type[0].toLowerCase() === "p"
                    ? "bg-green-400"
                    : "bg-blue-400"
                }`}
              >
                {record.billing_payment_type.charAt(0)}
              </span>
            )}
            B No : {record.billing_no ? record.billing_no : ""}{" "}
          </span>
        </div>
      ),
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
      title: "Total Tones",
      dataIndex: "billing_total_tones",
      key: "billing_total_tones",
      align: "right",
      render: (text) => <span>{Number(text).toFixed(2)}</span>,
    },
    {
      title: "Total Comm",
      dataIndex: "billing_total_commn",
      key: "billing_total_commn",
      align: "right",
      render: (text) => <span>{Number(text).toFixed(2)}</span>,
    },

    {
      title: "Total Amount",
      dataIndex: "billing_total_sale_amount",
      key: "billing_total_sale_amount",
      align: "right",
      render: (text) => <span>{Number(text).toFixed(2)}</span>,
    },

    {
      title: "Billing Type",
      dataIndex: "billing_type",
      key: "billing_type",
      render: (text) => <span className="capitalize">{text}</span>,
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
      width: 80,
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
            expandable={{
              expandedRowKeys,
              onExpand: (expanded, record) =>
                setExpandedRowKeys(expanded ? [record.id] : []),
              expandIcon: ({ expanded, onExpand, record }) => {
                const hasInvoice = !!record.tax_invoice;
                const hasPayments = record.payments?.length > 0;
                const isEmpty = !hasInvoice && !hasPayments;

                const iconStyle = {
                  color: isEmpty ? "#dc2626" : "#16a34a", // red if both empty else green
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
                const invoice = record.tax_invoice;
                const payments = record.payments || [];

                // If both are empty
                if (!invoice && payments.length === 0) {
                  return (
                    <div className="bg-gray-50 rounded-md p-4 text-gray-500 italic text-center">
                      No Tax Invoice or Payments Available
                    </div>
                  );
                }

                return (
                  <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 space-y-4 transition-all duration-300 ease-in-out">
                    {/* ✅ Tax Invoice Section */}
                    {invoice && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">
                          Tax Invoice Details
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center">
                          {[
                            {
                              label: "Date",
                              value: dayjs(invoice.tax_invoice_date).format(
                                "DD-MM-YYYY"
                              ),
                            },
                            {
                              label: "Invoice No",
                              value: invoice.tax_invoice_no,
                            },
                            { label: "Ref No", value: invoice.tax_invoice_ref },
                            { label: "Mill Name", value: invoice.mill_name },
                            { label: "Type", value: invoice.tax_invoice_type },
                            {
                              label: "Discount",
                              value: `${invoice.tax_invoice_discount}%`,
                            },
                            {
                              label: "Total Comm",
                              value: `₹${invoice.total_comm}`,
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

                    {/* ✅ Payments Section */}
                    {payments.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-1">
                          Payments
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm  ">
                            <thead className="bg-gray-100 text-gray-700 font-medium">
                              <tr>
                                <th className="p-2 ">Date</th>
                                <th className="p-2 ">Amount</th>
                                <th className="p-2 ">Type</th>
                                <th className="p-2 ">Transaction</th>
                              </tr>
                            </thead>
                            <tbody>
                              {payments?.map((p) => (
                                <tr
                                  key={p.id}
                                  className="text-center hover:bg-gray-50"
                                >
                                  <td className="p-2 ">
                                    {dayjs(p.payment_date).format("DD-MM-YYYY")}
                                  </td>
                                  <td className="p-2 boder  font-semibold">
                                    ₹{p.payment_amount}
                                  </td>
                                  <td className="p-2 ">{p.payment_type}</td>
                                  <td className="p-2 ">
                                    {p.payment_transaction || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="bg-gray-50 text-center font-semibold">
                                <td colSpan={1} className="p-2 text-right">
                                  Total :
                                </td>
                                <td className="p-2 ">
                                  ₹
                                  {payments
                                    .reduce(
                                      (total, p) =>
                                        total + Number(p.payment_amount || 0),
                                      0
                                    )
                                    .toLocaleString()}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              },
            }}
            rowKey="id" // ✅ Important
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
