import { Tag, Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

export const purchaseOrdersColumns = [
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