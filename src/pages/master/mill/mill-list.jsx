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
  Empty,
  Input,
  Popconfirm,
  Space,
  Spin,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import { useState } from "react";
import HighlightText from "../../../components/common/HighlightText";
import { useDebounce } from "../../../components/common/useDebounce";
import DataTable from "../../../components/DataTable/DataTable";
import { useApiMutation } from "../../../hooks/useApiMutation";
import { useGetApiMutation } from "../../../hooks/useGetApiMutation";
import { useNavigate } from "react-router-dom";
import { MILL_LIST, UPDATE_STATUS_MILL } from "../../../api";

const { Search } = Input;

const MillList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { trigger: UpdateStatus } = useApiMutation();
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState("Active");
  const navigate = useNavigate();
  const {
    data: mills,
    isLoading,
    refetch,
  } = useGetApiMutation({
    url: MILL_LIST,
    queryKey: ["milldata", debouncedSearch, page, activeTab],
    params: { search: debouncedSearch, page, type: activeTab },
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const handleToggleStatus = async (user) => {
    try {
      const newStatus =
        user.mill_status == "Active" || user.mill_status == true
          ? "Inactive"
          : "Active";
      const res = await UpdateStatus({
        url: `${UPDATE_STATUS_MILL}/${user.id}/status`,
        method: "patch",
        data: { mill_status: newStatus },
      });

      if (res?.code === 201) {
        message.success(
          res.message ||
            `User marked as ${newStatus == "active" ? "Active" : "Inactive"}`,
        );
        refetch();
      } else {
        message.error(res.message || "Failed to update user status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error(error.message || "Error updating user status.");
    }
  };
  const columns = [
    {
      title: "Short Name",
      dataIndex: "mill_short",
      key: "mill_short",
      render: (_, record) => (
        <HighlightText text={record.mill_short} match={debouncedSearch} />
      ),
    },
    {
      title: "Mill Name",
      dataIndex: "mill_name",
      key: "mill_name",
      render: (_, record) => (
        <HighlightText text={record.mill_name} match={debouncedSearch} />
      ),
    },
    {
      title: "Deckle",
      dataIndex: "mill_deckle",
      key: "mill_deckle",
      render: (_, record) => (
        <HighlightText text={record.mill_deckle} match={debouncedSearch} />
      ),
    },

    {
      title: "Type",
      dataIndex: "mill_type",
      key: "mill_type",
      render: (_, record) => (
        <HighlightText text={record.mill_type} match={debouncedSearch} />
      ),
    },
    {
      title: "State",
      dataIndex: "mill_state",
      key: "mill_state",
      render: (_, record) => (
        <HighlightText text={record.mill_state} match={debouncedSearch} />
      ),
    },
    {
      title: "Status",
      dataIndex: "mill_status",
      key: "mill_status",
      render: (_, user) => {
        const isActive =
          user.mill_status === "Active" || user.mill_status === true;
        return (
          <div className="flex justify-start">
            <Popconfirm
              title={`Mark mill as ${isActive ? "Inactive" : "Active"}?`}
              okText="Yes"
              cancelText="No"
              className="cursor-pointer"
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
          <Tooltip title="Edit Mill">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/master/mill/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
      width: 130,
    },
  ];

  const apiData = mills?.data || {};
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
            { key: "Active", label: "Actice Mill" },
            { key: "Inactive", label: "Inactice Mill" },
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
            onClick={() => navigate("/master/mill/report")}
          >
            View Report
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/master/mill/create")}
          >
            Add Mill
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
              <span className="text-gray-500">No mill data available</span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="py-8"
          />
        )}
      </div>
    </Card>
  );
};

export default MillList;
