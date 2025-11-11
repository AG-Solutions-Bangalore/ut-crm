import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined
} from "@ant-design/icons";
import {
    App,
    Button,
    Card,
    Input,
    Popconfirm,
    Space,
    Spin,
    Tooltip
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    QUOTATION_LIST,
    TRADE_INVOICE_LIST
} from "../../api";
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
        url: `${QUOTATION_LIST}/${subId}`,
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
          <div className="text-center text-gray-500 py-20">
            No Trade Invoice data found.
          </div>
        )}
      </div>
    </Card>
  );
};

export default TradeInvoiceList;
