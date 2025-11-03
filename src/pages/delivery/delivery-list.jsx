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
  Tag,
  Tooltip,
} from "antd";
import { useState } from "react";
import { DELIVERY_LIST, UPDATE_STATUS_DELIVERY } from "../../api";
import HighlightText from "../../components/common/HighlightText";
import { useDebounce } from "../../components/common/useDebounce";
import DataTable from "../../components/DataTable/DataTable";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";
import DeliveryForm from "./delivery-form";

const { Search } = Input;

const DeliveryList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { trigger: UpdateStatus } = useApiMutation();
  const { message } = App.useApp();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const {
    data: deliverydata,
    isLoading,
    refetch,
  } = useGetApiMutation({
    url: DELIVERY_LIST,
    queryKey: ["deliverydata", debouncedSearch, page],
    params: { search: debouncedSearch, page },
  });

  const handlePageChange = (newPage) => setPage(newPage);

  const handleToggleStatus = async (user) => {
    try {
      const newStatus =
        user.delivery_status === "Active" || user.delivery_status === true
          ? "Inactive"
          : "Active";

      const res = await UpdateStatus({
        url: `${UPDATE_STATUS_DELIVERY}/${user.id}/status`,
        method: "patch",
        data: { delivery_status: newStatus },
      });

      if (res?.code === 201) {
        message.success(res.message || "Status updated successfully!");
        refetch();
      } else {
        message.error(res.message || "Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error(error.message || "Error updating user status.");
    }
  };

  const columns = [
    {
      title: "Delivery",
      dataIndex: "delivery",
      key: "delivery",
      render: (_, record) => (
        <HighlightText text={record.delivery} match={debouncedSearch} />
      ),
    },
    {
      title: "Status",
      dataIndex: "delivery_status",
      key: "delivery_status",
      render: (_, user) => {
        const isActive =
          user.delivery_status === "Active" || user.delivery_status === true;
        return (
          <div className="flex justify-start">
            <Popconfirm
              title={`Mark delivery as ${isActive ? "Inactive" : "Active"}?`}
              okText="Yes"
              className="cursor-pointer"
              cancelText="No"
              onConfirm={() => handleToggleStatus(user)}
            >
              <Tag
                color={isActive ? "green" : "red"}
                icon={isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              >
                {isActive ? "Active" : "Inactive"}
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
          <Tooltip title="Edit Delivery">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setEditId(record.id);
                setShowForm(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
      width: 130,
    },
  ];

  const apiData = deliverydata?.data || {};
  const tableData = apiData.data || [];

  return (
    <Card>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold heading">Delivery List</h2>

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
            onClick={() => {
              setEditId(null);
              setShowForm(true);
            }}
          >
            Add Delivery
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={showForm ? "lg:col-span-2" : "col-span-3"}>
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
              No Delivery data found.
            </div>
          )}
        </div>

        {showForm && (
          <div className={`border border-gray-200 rounded-md p-4 shadow-sm bg-white ${editId ? "max-h-80" : "max-h-56" }`}>
            <div className="flex justify-between items-center mb-2 bg-[var(--primary)] text-white px-3 py-2 rounded-md">
              <h3 className="text-lg font-semibold">
                {editId ? "Update Delivery" : "Create Delivery"}
              </h3>
              <Button
                size="small"
                danger
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
              >
                Close
              </Button>
            </div>

            <DeliveryForm
              id={editId}
              onSuccess={() => {
                refetch();
                setShowForm(false);
                setEditId(null);
              }}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default DeliveryList;
