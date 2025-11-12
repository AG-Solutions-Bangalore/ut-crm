import { ReloadOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import usetoken from "../api/usetoken";
import useLogout from "../hooks/useLogout";
import { setShowUpdateDialog } from "../store/auth/versionSlice";

const { Text, Title } = Typography;

const VersionCheck = () => {
  const token = usetoken();
  const dispatch = useDispatch();
  const logout = useLogout();

  const [loading, setLoading] = useState(false);
  const [retryPopup, setRetryPopup] = useState(false);

  const isDialogOpen = useSelector((state) => state.version.showUpdateDialog);
  const serverVersion = useSelector((state) => state.version.version);

  const handleCloseDialog = () => {
    dispatch(
      setShowUpdateDialog({
        showUpdateDialog: false,
        version: serverVersion,
      })
    );
  };

  const handleUpdateNow = async () => {
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      await logout();
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (retryPopup) {
      const timeout = setTimeout(() => {
        dispatch(
          setShowUpdateDialog({
            showUpdateDialog: true,
            version: serverVersion,
          })
        );
        setRetryPopup(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [retryPopup]);

  if (!token) return null;

  return (
    <Modal
      open={isDialogOpen}
      footer={null}
      closable={false}
      centered
      maskClosable={false}
      onCancel={handleCloseDialog}
      className="!rounded-2xl !overflow-hidden !p-0"
      styles={{ body: { padding: 0 } }}
    >
      <div className="!flex !flex-col !items-center !py-6 !px-4 !text-center">
        {/* Icon */}
        <div className="!flex !items-center !justify-center !w-16 !h-16 !rounded-full !bg-gradient-to-tr !from-blue-500/10 !to-blue-200/30 !text-blue-600 !mb-4">
          <ReloadOutlined spin className="!text-2xl" />
        </div>

        {/* Title */}
        <Title
          level={4}
          className="!font-semibold !tracking-tight !mb-1 !text-gray-900"
        >
          Update Available
        </Title>

        {/* Description */}
        <Text type="secondary" className="!text-base !text-gray-600">
          A new version of the panel is ready. Update now to version{" "}
          <Text strong className="!text-green-600">
            {serverVersion}
          </Text>
          .
        </Text>

        {/* Buttons */}
        <Space size="middle" className="!mt-6 !flex !justify-center">
          <Button
            onClick={() => {
              handleCloseDialog();
              setRetryPopup(true);
            }}
            disabled={loading}
            className="!rounded-lg !px-5 !py-1.5 !text-gray-700 !border-gray-300 hover:!border-gray-400"
          >
            Do It Later
          </Button>

          <Button
            type="primary"
            shape="round"
            size="middle"
            loading={loading}
            onClick={handleUpdateNow}
            className="!px-5 !py-1.5 !rounded-full !shadow-md !shadow-blue-100 !bg-blue-600 hover:!bg-blue-700"
          >
            {loading ? "Updating..." : "Update Now"}
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default VersionCheck;
