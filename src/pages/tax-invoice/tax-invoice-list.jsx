import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
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
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TAX_INVOICE_LIST } from "../../api";
import { useDebounce } from "../../components/common/useDebounce";
import DataTable from "../../components/DataTable/DataTable";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";
import { useApiMutation } from "../../hooks/useApiMutation";

const { Search } = Input;

const TaxInvoiceList = () => {
  const { message } = App.useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const navigate = useNavigate();
  const {
    data: taxinvoicedata,
    isLoading,
    refetch,
  } = useGetApiMutation({
    url: TAX_INVOICE_LIST,
    queryKey: ["taxinvoicedata", debouncedSearch, page],
    params: { search: debouncedSearch, page },
  });
  const { trigger: deleteTrigger } = useApiMutation();

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const handleDelete = async (id) => {
    if (!id) {
      message.error("Invalid sub-item ID.");
      return;
    }

    try {
      const res = await deleteTrigger({
        url: `${TAX_INVOICE_LIST}/${id}`,
        method: "delete",
      });

      if (res?.code === 201) {
        message.success(res?.message || "Item deleted successfully!");
        refetch();
      } else {
        message.error(res?.message || "Failed to delete Item.");
      }
    } catch (error) {
      message.error(error?.message || "Error while deleting sub-item.");
    }
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
          <Tooltip title="Delete Tax Invoice">
            <Popconfirm
              title="Are you sure to delete this bill?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} type="text" danger />
            </Popconfirm>
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
        <h2 className="text-2xl font-semibold">Tax-Invoice List</h2>
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
