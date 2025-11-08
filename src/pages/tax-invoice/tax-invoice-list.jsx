import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  Input,
  Space,
  Spin,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TAX_INVOICE_LIST } from "../../api";
import { useDebounce } from "../../components/common/useDebounce";
import DataTable from "../../components/DataTable/DataTable";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";

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
      title: "Invoice No",
      dataIndex: "tax_invoice_no",
      key: "tax_invoice_no",
      render: (text) => (
        <span className="font-semibold text-blue-600">{text || "-"}</span>
      ),
    },
    {
      title: "Invoice Ref",
      dataIndex: "tax_invoice_ref",
      key: "tax_invoice_ref",
      render: (text) => <span className="text-gray-800">{text || "-"}</span>,
    },
    {
      title: "Invoice Date",
      dataIndex: "tax_invoice_date",
      key: "tax_invoice_date",
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
      key: "mill_name",
      render: (text) => <span className="text-gray-800">{text || "-"}</span>,
    },
    {
      title: "Type",
      dataIndex: "tax_invoice_type",
      key: "tax_invoice_type",
      render: (text) => (
        <Tag color={text === "COM" ? "green" : "blue"} className="uppercase">
          {text}
        </Tag>
      ),
    },
    {
      title: "Discount",
      dataIndex: "tax_invoice_discount",
      key: "tax_invoice_discount",
      align: "right",
      render: (text) => (
        <span className="font-medium text-gray-700">
          {text ? Number(text).toFixed(2) : "0.00"}
        </span>
      ),
    },
    {
      title: "HSN Code",
      dataIndex: "tax_invoice_hsn_code",
      key: "tax_invoice_hsn_code",
      render: (text) => <span>{text || "-"}</span>,
    },
    {
      title: "Payment Terms",
      dataIndex: "tax_invoice_payment_terms",
      key: "tax_invoice_payment_terms",
      render: (text) => <span>{text || "-"}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Tax Invoice">
            <Button
              icon={<EditOutlined />}
              type="primary"
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
