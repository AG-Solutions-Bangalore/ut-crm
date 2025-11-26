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
  Tag,
  Tooltip,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PARTY_LIST, UPDATE_STATUS_PARTY } from "../../../api";
import HighlightText from "../../../components/common/HighlightText";
import { useDebounce } from "../../../components/common/useDebounce";
import DataTable from "../../../components/DataTable/DataTable";
import { useApiMutation } from "../../../hooks/useApiMutation";
import { useGetApiMutation } from "../../../hooks/useGetApiMutation";

const { Search } = Input;

const PartyList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { trigger: UpdateStatus } = useApiMutation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const {
    data: partydata,
    isLoading,
    refetch,
  } = useGetApiMutation({
    url: PARTY_LIST,
    queryKey: ["partydata", debouncedSearch, page],
    params: { search: debouncedSearch, page },
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const handleToggleStatus = async (user) => {
    try {
      const newStatus =
        user.party_status == "Active" || user.party_status == true
          ? "Inactive"
          : "Active";
      const res = await UpdateStatus({
        url: `${UPDATE_STATUS_PARTY}/${user.id}/status`,
        method: "patch",
        data: { party_status: newStatus },
      });

      if (res?.code === 201) {
        message.success(
          res.message ||
            `User marked as ${newStatus == "active" ? "Active" : "Inactive"}`
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
      dataIndex: "party_short",
      key: "party_short",
      render: (_, record) => (
        <HighlightText text={record.party_short} match={debouncedSearch} />
      ),
    },
    {
      title: "Party Name",
      dataIndex: "party_name",
      key: "party_name",
      render: (_, record) => (
        <HighlightText text={record.party_name} match={debouncedSearch} />
      ),
    },

    {
      title: "State",
      dataIndex: "party_state",
      key: "party_state",
      render: (_, record) => (
        <HighlightText text={record.party_state} match={debouncedSearch} />
      ),
    },
    {
      title: "Due Date",
      dataIndex: "party_due_days",
      key: "party_due_days",
      align: "center",
      render: (_, record) => {
        const days = record.party_due_days ?? 0;
        return (
          <div className="flex justify-center">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                days > 30
                  ? "bg-red-100 text-red-700"
                  : days > 10
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {days} Days
            </span>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "party_status",
      key: "party_status",
      render: (_, user) => {
        const isActive =
          user.party_status === "Active" || user.party_status === true;
        return (
          <div className="flex justify-start">
            <Popconfirm
              title={`Mark party as ${isActive ? "Inactive" : "Active"}?`}
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
          <Tooltip title="Edit Party">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/master/party/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
      width: 130,
    },
  ];

  const apiData = partydata?.data || {};
  const tableData = apiData.data || [];

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold heading">Party List</h2>

        <div className="flex-1 flex gap-4 sm:justify-end">
          <Search
            placeholder="Search"
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-gray-700 mb-1">
              Due Date Color
            </span>
            <div className="flex items-center gap-2">
              <Tooltip title="Due ≤ 10 Days">
                <div className="w-4 h-4 rounded-md bg-green-500 cursor-pointer" />
              </Tooltip>
              <Tooltip title="Due > 10 Days">
                <div className="w-4 h-4 rounded-md bg-yellow-400 cursor-pointer" />
              </Tooltip>
              <Tooltip title="Due > 30 Days">
                <div className="w-4 h-4 rounded-md bg-red-500 cursor-pointer" />
              </Tooltip>
            </div>
          </div>

          <Button
            type="primary"
            onClick={() => navigate("/master/party/report")}
          >
            View Report
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/master/party/create")}
          >
            Add Party
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
              <span className="text-gray-500">No party data available</span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="py-8"
          />
        )}
      </div>
    </Card>
  );
};

export default PartyList;
