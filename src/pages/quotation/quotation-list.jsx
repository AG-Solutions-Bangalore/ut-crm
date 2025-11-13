import {
  DeleteOutlined,
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
  Tag,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QUOTATION_LIST, UPDATE_STATUS_QUOTATION_ORDER } from "../../api";
import { useDebounce } from "../../components/common/useDebounce";
import DataTable from "../../components/DataTable/DataTable";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";

const { Search } = Input;

const QuotationList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { trigger: deleteTrigger } = useApiMutation();
  const { trigger: UpdateStatus } = useApiMutation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const {
    data: quotationdata,
    isLoading,
    refetch,
  } = useGetApiMutation({
    url: QUOTATION_LIST,
    queryKey: ["quotationdata", debouncedSearch, page],
    params: { search: debouncedSearch, page },
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const handleToggleStatus = async (order) => {
    try {
      const newStatus = order.quotation_status === "Open" ? "Close" : "Open";

      const res = await UpdateStatus({
        url: `${UPDATE_STATUS_QUOTATION_ORDER}/${order.id}/status`,
        method: "patch",
        data: { quotation_status: newStatus },
      });

      if (res?.code === 200 || res?.code === 201) {
        message.success(
          res.message ||
            `Order marked as ${newStatus === "Open" ? "Open" : "Closed"}`
        );
        refetch();
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
      title: "Status",
      dataIndex: "quotation_status",
      key: "quotation_status",
      render: (_, order) => {
        const isOpen = order.quotation_status == "Open";
        console.log(order, "order");
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
          <Tooltip title="Edit Quotation">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/quotation/edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Delete Quotation">
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
  const apiData = quotationdata?.data || {};
  const tableData = apiData.data || [];

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold heading">Quotation List</h2>

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
            onClick={() => navigate("/quotation/create")}
          >
            Add Quotation
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
              <span className="text-gray-500">No Quotation data available</span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="py-8"
          />
        )}
      </div>
    </Card>
  );
};

export default QuotationList;
