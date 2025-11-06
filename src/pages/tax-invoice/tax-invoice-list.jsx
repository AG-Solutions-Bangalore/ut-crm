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
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BILLING_LIST, TAX_INVOICE_LIST, UPDATE_STATUS_BILLING_ORDER } from "../../api";
import { useDebounce } from "../../components/common/useDebounce";
import DataTable from "../../components/DataTable/DataTable";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";

const { Search } = Input;

const TaxInvoiceList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Open");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { trigger: UpdateStatus } = useApiMutation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: taxinvoicedata,
    isLoading,
    refetch,
  } = useGetApiMutation({
    url: TAX_INVOICE_LIST,
    queryKey: ["taxinvoicedata", debouncedSearch, page, activeTab],
    params: { search: debouncedSearch, page, type: activeTab },
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
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
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Tax-Invoice">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/tax-invoice/edit/${record.id}`)}
            />
          </Tooltip>
  
        </Space>
      ),
    },
  ];

  const apiData = taxinvoicedata?.data || {};
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
            { key: "Open", label: "Open Tax-Invoice List" },
            { key: "Close", label: "Closed Tax-Invoice List" },
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
            onClick={() => navigate("/tax-invoice/create")}
          >
            Add Tax-Invoice
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
            No Tax-Invoice data found.
          </div>
        )}
      </div>
    </Card>
  );
};

export default TaxInvoiceList;
