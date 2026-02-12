import { App, Button, Card, Space, Spin, Tooltip } from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { BILLING_LIST } from "../../api";
import DataTable from "../../components/DataTable/DataTable";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";
import { CopyOutlined, EditOutlined } from "@ant-design/icons";
import PurchaseEditModal from "../quotation/quotationpurchase-update";
import { useQueryClient } from "@tanstack/react-query";
const Stat = ({ label, value, variant = "default" }) => {
  const variants = {
    default: "bg-white border-gray-200",
    success: "bg-emerald-50 border-emerald-200",
    danger: "bg-rose-50 border-rose-200",
  };

  const textColors = {
    default: "text-gray-900",
    success: "text-emerald-700",
    danger: "text-rose-700",
  };

  return (
    <div
      className={`${variants[variant]} border rounded-lg px-2.5 py-1.5 hover:shadow-sm transition-shadow`}
    >
      <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className={`text-xs font-bold ${textColors[variant]} break-words`}>
        {value}
      </p>
    </div>
  );
};

const BillingView = () => {
  const { id } = useParams();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
  const handleEditClick = (purchaseId) => {
    setSelectedPurchaseId(purchaseId);
    setEditModalOpen(true);
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedPurchaseId(null);
  };

  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["billingdata", id] });
  };

  const { data: billingdata, isLoading: loading } = useGetApiMutation({
    url: `${BILLING_LIST}/${id}`,
    queryKey: ["billingdata", id],
  });
  const billing = billingdata?.data || [];
  const purchase = billingdata?.purchase || [];
  const subRows = billingdata?.subs || [];

  const profit = useMemo(() => {
    const p =
      Number(billing?.sale_rate || 0) - Number(billing?.purchase_rate || 0);
    return isNaN(p) ? null : p;
  }, [billing]);

  const columns = [
    {
      title: "PO Reference",
      dataIndex: "purchase_orders_ref",
      key: "purchase_orders_ref",
      render: (val) => {
        const handleCopy = () => {
          if (!val) return;
          navigator.clipboard.writeText(val);
          message.success("Copied to clipboard!");
        };

        return (
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 truncate max-w-[180px]">
              {val || "-"}
            </span>
            {val && (
              <Tooltip title="Copy">
                <CopyOutlined
                  onClick={handleCopy}
                  className="text-gray-500 hover:text-blue-600 cursor-pointer ml-2"
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "purchase_orders_date",
      key: "purchase_orders_date",
      render: (date) => (date ? dayjs(date).format("DD MMM YYYY") : "-"),
    },
    {
      title: "Mill",
      dataIndex: "mill_name",
      key: "mill_name",
      ellipsis: true,
    },
    {
      title: "Party",
      dataIndex: "party_name",
      key: "party_name",
      ellipsis: true,
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
      align: "center",
    },
    {
      title: "Note",
      dataIndex: "purchase_orders_note",
      key: "purchase_orders_note",
      width: 200,
      render: (val) => (
        <div
          style={{
            maxWidth: 200,
            whiteSpace: "normal",
            wordWrap: "break-word",
            lineHeight: "1.4em",
          }}
        >
          {val || "-"}
        </div>
      ),
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
              onClick={() => handleEditClick(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading || !billing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  const profitVariant =
    profit === null ? "default" : profit < 0 ? "danger" : "success";
  const dueVariant = billing.billing_due_days < 0 ? "danger" : "default";

  return (
    <div className="max-w-7xl mx-auto px-3 py-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-xl shadow-xl p-3 mb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] text-blue-300 uppercase tracking-widest font-bold mb-1">
              Billing View
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white">
                Bill No : {billing.billing_no}
              </h1>
              <span className="text-blue-400">•</span>
              <span className="text-xs font-semibold text-white/90 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                Type: {billing.billing_type}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right bg-white/10 backdrop-blur-sm px-2 py-1 rounded-lg">
              <p className="text-[8px] text-blue-200 uppercase tracking-wider font-semibold">
                Created
              </p>
              <p className="text-xs font-bold text-white">
                {dayjs(billing.created_at).format("DD MMM YY")}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg ${
                billing.billing_status === "Open"
                  ? "bg-emerald-500 text-white"
                  : "bg-rose-500 text-white"
              }`}
            >
              {billing.billing_status}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2.5 mb-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <Stat
            label="Bill Ref"
            value={billing.billing_ref ? `${billing.billing_ref}` : "-"}
          />
          <Stat
            label="Bill Tones"
            value={
              billing.billing_total_tones
                ? `${billing.billing_total_tones}`
                : "-"
            }
          />

          <Stat
            label="Total Sale Amount"
            value={
              billing.billing_total_sale_amount
                ? `₹${billing.billing_total_sale_amount}`
                : "-"
            }
          />
          <Stat
            label="Total Commission"
            value={
              billing.billing_total_commn
                ? `₹${billing.billing_total_commn}`
                : "-"
            }
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border-l-4 border-l-blue-500 border-t border-r border-b border-gray-200 shadow-sm p-3 my-1">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
            Purchase
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Mill" value={billing.mill_name || "-"} />
          <Stat label="PO Ref" value={billing.purchase_orders_ref || "-"} />
          <Stat label="Party" value={billing.party_name || "-"} />

          <div className="md:col-span-3">
            <Stat label="Note" value={billing.billing_note || "-"} />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm my-2">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-2 bg-gray-100 text-gray-700 font-semibold text-sm p-2">
          <div className="col-span-1">#</div>
          <div className="col-span-1">Pur Date</div>
          <div className="col-span-1">Pur Rate</div>
          <div className="col-span-1">Sale Date</div>
          <div className="col-span-1">Sale Rate</div>
          <div className="col-span-2">Item</div>
          <div className="col-span-1">Tones</div>
          <div className="col-span-1">Comm</div>
          <div className="col-span-1">Sales Amount</div>
          <div className="col-span-1">Rate Diff</div>
          <div className="col-span-1">Due Days</div>
        </div>

        {/* Data Rows */}
        <div className="divide-y divide-gray-100">
          {subRows.map((sub, index) => (
            <div
              key={sub.id || index}
              className="grid grid-cols-12 gap-2 p-2 text-sm text-gray-600 items-center"
            >
              <div className="col-span-1">{index + 1}</div>
              <div className="col-span-1">
                {sub.purchase_date
                  ? dayjs(sub.purchase_date).format("DD-MM-YYYY")
                  : "-"}
              </div>
              <div className="col-span-1">₹{sub.purchase_rate || "-"}</div>
              <div className="col-span-1">
                {sub.sale_date
                  ? dayjs(sub.sale_date).format("DD-MM-YYYY")
                  : "-"}
              </div>
              <div className="col-span-1">₹{sub.sale_rate || "-"}</div>
              <div className="col-span-2">{sub.billing_sub_bf || "-"}</div>
              <div className="col-span-1">{sub.billing_sub_tones || "-"}</div>
              <div className="col-span-1">{sub.billing_commn || "-"}</div>
              <div className="col-span-1">₹{sub.sales_amount || "-"}</div>
              <div className="col-span-1">₹{sub.rate_diff || "-"}</div>
              <div className="col-span-1">{sub.billing_due_days || "-"}</div>
            </div>
          ))}
        </div>
      </div>

      <DataTable data={purchase || []} columns={columns} fotterdata={false} />
      {editModalOpen && (
        <PurchaseEditModal
          open={editModalOpen}
          onClose={handleModalClose}
          purchaseId={selectedPurchaseId}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default BillingView;
