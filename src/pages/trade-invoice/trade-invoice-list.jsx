import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Empty,
  Input,
  Popconfirm,
  Space,
  Spin,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {  TRADE_INVOICE_LIST } from "../../api";
import { useDebounce } from "../../components/common/useDebounce";
import DataTable from "../../components/DataTable/DataTable";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";

const { Search } = Input;

const TradeInvoiceList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { trigger: deleteTrigger } = useApiMutation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const {
    data: tradeinvoicedata,
    isLoading,
    refetch,
  } = useGetApiMutation({
    url: TRADE_INVOICE_LIST,
    queryKey: ["tradeinvoicedata", debouncedSearch, page],
    params: { search: debouncedSearch, page },
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleDelete = async (subId) => {
    if (!subId) {
      message.error("Invalid Quotation ID.");
      return;
    }

    try {
      const res = await deleteTrigger({
        url: `${TRADE_INVOICE_LIST}/${subId}`,
        method: "delete",
      });

      if (res?.code === 201) {
        message.success(res?.message || "Quotation deleted successfully!");
        refetch();
      } else {
        message.error(res?.message || "Failed to delete Quotation item.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      message.error(error?.message || "Error while deleting Quotation.");
    }
  };
  const columns = [
    {
      title: "Trade Invoice No",
      dataIndex: "trade_invoice_no",
      key: "trade_invoice_no",
      render: (text, record) => (
        <span className="font-medium text-blue-600">
          {record.trade_invoice_no}
        </span>
      ),
    },
    {
      title: "Invoice Date",
      dataIndex: "trade_invoice_date",
      key: "trade_invoice_date",
      render: (_, record) =>
        dayjs(record.trade_invoice_date).format("DD-MM-YYYY"),
    },
    {
      title: "Invoice Ref",
      dataIndex: "trade_invoice_ref",
      key: "trade_invoice_ref",
      render: (text) => <span className="text-gray-800">{text}</span>,
    },
    {
      title: "Party Name",
      dataIndex: "party_short",
      key: "party_short",
      render: (text) => <span className="text-gray-800">{text}</span>,
    },
    {
      title: "Discount",
      dataIndex: "trade_invoice_discount",
      key: "trade_invoice_discount",
      align: "right",
      render: (text) => <span>{Number(text).toFixed(2)}</span>,
    },
    {
      title: "Freight",
      dataIndex: "trade_invoice_freight",
      key: "trade_invoice_freight",
      align: "right",
      render: (text) => <span>{Number(text).toFixed(2)}</span>,
    },
    {
      title: "Insurance",
      dataIndex: "trade_invoice_insurance",
      key: "trade_invoice_insurance",
      align: "right",
      render: (text) => <span>{Number(text).toFixed(2)}</span>,
    },
  
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Trade Invoice">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/trade-invoice/edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="View Trade Invoice">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/trade-invoice/view/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Delete Trade Invoice">
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
  
  const apiData = tradeinvoicedata?.data || {};
  const tableData = apiData.data || [];

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold heading">Trade Invoice List</h2>

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
            onClick={() => navigate("/trade-invoice/create")}
          >
            Add Trade Invoice
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
          <Empty
            description={
              <span className="text-gray-500">
                No Trade-Invoice data available
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="py-8"
          />
        )}
      </div>
    </Card>
  );
};

export default TradeInvoiceList;
