import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
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
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PAYMENT_LIST } from "../../api";
import { useDebounce } from "../../components/common/useDebounce";
import DataTable from "../../components/DataTable/DataTable";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";

const { Search } = Input;

const PaymentList = () => {
  const { message } = App.useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Paybles");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const navigate = useNavigate();
  const { trigger: deleteTrigger } = useApiMutation();
  const { data: payementdata, isLoading } = useGetApiMutation({
    url: PAYMENT_LIST,
    queryKey: ["payementdata", debouncedSearch, page, activeTab],
    params: { search: debouncedSearch, page, type: activeTab },
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const handleDelete = async (id) => {
    if (!id) {
      message.error("Invalid ID.");
      return;
    }

    try {
      const res = await deleteTrigger({
        url: `${PAYMENT_LIST}/${id}`,
        method: "delete",
      });

      if (res?.code === 201) {
        message.success(res?.message || "Payment deleted successfully!");
        refetch();
      } else {
        message.error(res?.message || "Failed to delete Payment.");
      }
    } catch (error) {
      message.error(error?.message || "Error while deleting Payment.");
    }
  };
  const columns = [
    ...(activeTab.includes("Receivable")
      ? [
          {
            title: "Party Name",
            dataIndex: "party_short",
            key: "party_short",
            render: (text, record) => <span>{record.party_short}</span>,
          },
        ]
      : []),
    ...(activeTab.includes("Paybles") || activeTab.includes("Payables")
      ? [
          {
            title: "Mill Name",
            dataIndex: "mill_short",
            key: "mill_shorte",
            render: (text, record) => <span>{record.mill_short}</span>,
          },
        ]
      : []),

 

    {
      title: "Bill No",
      dataIndex: "billing_no",
      key: "billing_no",
      render: (text) => <span className="text-gray-800">{text}</span>,
    },
    {
      title: "Sale Amount",
      dataIndex: "billing_total_sale_amount",
      key: "billing_total_sale_amount",
      render: (text) => <span className="text-gray-800">{text}</span>,
    },

    {
      title: "Payment Date",
      key: "payment_date",
      render: (_, record) => (
        <div className="flex flex-col">
          {record.payment_date
            ? dayjs(record.payment_date).format("DD-MM-YYYY")
            : "-"}
        </div>
      ),
    },
    {
      title: "Payment Amount",
      dataIndex: "payment_amount",
      key: "payment_amount",
      render: (text) => <span className="text-gray-800">{text}</span>,
    },
    {
      title: "Payment Type",
      dataIndex: "payment_type",
      key: "payment_type",
      render: (text) => <span className="text-gray-800">{text}</span>,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (text) => <span className="text-gray-800">{text}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Payment">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/payment/edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Delete Payment">
            <Popconfirm
              title="Are you sure to delete this payment?"
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

  const apiData = payementdata?.data || {};
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
            { key: "Paybles", label: "Paybles" },
            { key: "Receivables", label: "Receivables" },
            { key: "Payables Adjust", label: "Payables Adjust" },
            { key: "Receivables Adjust", label: "Receivables Adjust" },
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

          <div className="flex gap-2">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/payment/create?type=Paybles")}
            >
              Paybles
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/payment/create?type=Receivables")}
            >
              Receivables
            </Button>
          </div>
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
              <span className="text-gray-500">No Payment data available</span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="py-8"
          />
        )}
      </div>
    </Card>
  );
};

export default PaymentList;
