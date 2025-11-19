import {
  ApartmentOutlined,
  AppstoreOutlined,
  ArrowRightOutlined,
  AuditOutlined,
  BankOutlined,
  BarChartOutlined,
  BookFilled,
  BookOutlined,
  CloseOutlined,
  DollarCircleOutlined,
  FileDoneOutlined,
  FileProtectOutlined,
  FileSearchOutlined,
  HomeOutlined,
  ReconciliationOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  TeamOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Alert, Menu } from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import logo1 from "../assets/logo-1.png";
import { setShowUpdateDialog } from "../store/auth/versionSlice";
import useFinalUserImage from "./common/Logo";

const getMenuItems = (collapsed) => {
  const dashboardItems = [
    { key: "/home", icon: <HomeOutlined />, label: "Dashboard" },
  ];

  const managementChildren = [
    {
      key: "/master/mill",
      icon: <ApartmentOutlined />,
      label: "Mill",
    },
    {
      key: "/master/party",
      icon: <TeamOutlined />,
      label: "Party",
    },
    {
      key: "/master/item",
      icon: <AppstoreOutlined />,
      label: "Item",
    },
    {
      key: "/master/shade",
      icon: <BookOutlined />,
      label: "Shade",
    },
  ];

  const reportChildren = [
    {
      key: "/auth-report",
      icon: <FileProtectOutlined />,
      label: "Auth Letter",
    },
    {
      key: "/report/balance-order",
      icon: <ReconciliationOutlined />,
      label: "Balance Order",
    },

    {
      key: "/report/price-rate",
      icon: <BarChartOutlined />,
      label: "Price Rate",
    },
    {
      key: "/report/sales",
      icon: <ShoppingCartOutlined />,
      label: "Sales",
    },
    {
      key: "/report/mill-wise",
      icon: <BankOutlined />,
      label: "Mill Wise",
    },
    {
      key: "/report/party-wise",
      icon: <SolutionOutlined />,
      label: "Party Wise",
    },
    {
      key: "/report/balance",
      icon: <WalletOutlined />,
      label: "Balance Report",
    },

    {
      key: "/report/ledger-report",
      icon: <BankOutlined />,
      label: "Ledger Report",
    },
  ];

  if (collapsed) {
    return [
      ...dashboardItems,
      {
        key: "sub",
        icon: <AppstoreOutlined />,
        label: "Management",
        children: managementChildren,
      },
      { key: "/purchase", icon: <ShoppingCartOutlined />, label: "Purchase" },
      { key: "/quotation", icon: <FileSearchOutlined />, label: "Quotation" },
      { key: "/billing", icon: <FileDoneOutlined />, label: "Billing" },
      {
        key: "/trade-invoice",
        icon: <AuditOutlined />,
        label: "Trade Invoice",
      },
      {
        key: "/tax-invoice",
        icon: <ReconciliationOutlined />,
        label: "Tax Invoice",
      },
      { key: "/payment", icon: <DollarCircleOutlined />, label: "Payment" },
      {
        key: "sub1",
        icon: <BookFilled />,
        label: "Report",
        children: reportChildren,
        className: "report-section",
      },
    ];
  }

  return [
    { type: "group", label: "Dashboard", children: dashboardItems },
    {
      type: "group",
      label: "Master",
      children: [
        {
          key: "sub",
          icon: <AppstoreOutlined />,
          label: "Master",
          children: managementChildren,
        },
      ],
    },
    { key: "/purchase", icon: <ShoppingCartOutlined />, label: "Purchase" },
    { key: "/quotation", icon: <FileSearchOutlined />, label: "Quotation" },
    { key: "/billing", icon: <FileDoneOutlined />, label: "Billing" },
    { key: "/trade-invoice", icon: <AuditOutlined />, label: "Trade Invoice" },
    {
      key: "/tax-invoice",
      icon: <ReconciliationOutlined />,
      label: "Tax Invoice",
    },
    { key: "/payment", icon: <DollarCircleOutlined />, label: "Payment" },

    {
      type: "group",
      label: "Report",
      children: [
        {
          key: "sub1",
          icon: <BookFilled />,
          label: "Report",
          children: reportChildren,
        },
      ],
    },
  ];
};
export default function Sidebar({ collapsed, isMobile = false, onClose }) {
  const location = useLocation();
  const selectedKeys = [location.pathname];
  const getOpenKeysFromPath = (path) => {
    if (path.startsWith("/report-")) return ["sub2"];
    return [];
  };
  const userType = useSelector((state) => state.auth?.user?.user_type);
  const [openKeys, setOpenKeys] = useState(() =>
    getOpenKeysFromPath(location.pathname)
  );
  const naviagte = useNavigate();
  const items = getMenuItems(collapsed, Number(userType));
  const dispatch = useDispatch();
  const finalUserImage = useFinalUserImage();
  const company = useSelector((state) => state.company.companyDetails);
  const [delayedCollapse, setDelayedCollapse] = useState(collapsed);
  const localVersion = useSelector((state) => state.auth?.version);
  const serverVersion = useSelector((state) => state?.version?.version);
  const showDialog = localVersion !== serverVersion ? true : false;
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDelayedCollapse(collapsed);
    }, 150);

    return () => clearTimeout(timeout);
  }, [collapsed]);

  const handleOpenDialog = () => {
    dispatch(
      setShowUpdateDialog({
        showUpdateDialog: true,
        version: serverVersion,
      })
    );
  };
  const rootSubmenuKeys = ["sub", "sub1", "sub2"];
  useEffect(() => {
    if (openKeys.includes("sub1")) {
      const anchor = document.getElementById("report-scroll-anchor");
      const scrollContainer = document.querySelector(".scrollbar-custom");
      if (anchor && scrollContainer) {
        let offset = 0;
        let el = anchor;

        while (el && el !== scrollContainer) {
          offset += el.offsetTop;
          el = el.offsetParent;
        }

        scrollContainer.scrollTo({
          top: offset - 10,
          behavior: "smooth",
        });
        setTimeout(() => {
          scrollContainer.scrollTo({
            top: offset - 10,
            behavior: "smooth",
          });
        }, 200);
      } else {
        console.warn("⚠️ Could not find anchor or scroll container.");
      }
    }
  }, [openKeys]);

  return (
    <motion.aside
      initial={{ width: collapsed ? 95 : 260 }}
      animate={{ width: collapsed ? 95 : 260 }}
      transition={{ duration: 0.3 }}
      className={`h-full bg-white shadow-xl  overflow-hidden flex flex-col font-[Inter] transition-all duration-300
        ${isMobile ? "fixed z-50 h-screen" : "relative"}`}
    >
      <div className="flex items-center justify-center h-14 px-4 bg-gray-100">
        <motion.img
          src={collapsed ? logo1 : finalUserImage}
          alt="Header Logo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`object-contain transition-all duration-300 ${
            collapsed ? "w-12" : "w-12"
          }`}
        />
        {!collapsed && (
          <span className="font-semibold  ">{company?.company_name}</span>
        )}
        {isMobile && (
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full 
               bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white shadow-md 
               hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <CloseOutlined className="text-lg" />
          </motion.button>
        )}
      </div>

      <div className="flex-1  py-2 scrollbar-custom">
        <Menu
          mode="inline"
          inlineCollapsed={delayedCollapse}
          items={items}
          openKeys={openKeys}
          selectedKeys={selectedKeys}
          onOpenChange={(keys) => {
            const latestOpenKey = keys.find(
              (key) => openKeys.indexOf(key) === -1
            );
            if (rootSubmenuKeys.includes(latestOpenKey)) {
              setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
            } else {
              setOpenKeys(keys);
            }
          }}
          onClick={({ key, keyPath }) => {
            if (isMobile && onClose) {
              onClose();
            }
            if (keyPath.length === 1) {
              setOpenKeys([]);
            }
            naviagte(key);
          }}
          className="custom-menu"
        />
      </div>

      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-gray-500 text-center border-t border-[var(--primary)] bg-white"
        >
          {showDialog ? (
            <div
              className="w-full cursor-pointer animate-pulse"
              onClick={handleOpenDialog}
            >
              <Alert
                message={
                  <div className="flex items-center justify-center text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      New Updated: V{localVersion}
                      <ArrowRightOutlined />V{serverVersion}
                    </span>
                  </div>
                }
                type="warning"
                banner
                showIcon={false}
                className="rounded-md !bg-gray-100 !text-[var(--primary)]  px-4 py-1"
              />
            </div>
          ) : (
            <Alert
              message={
                <div className="flex flex-col items-center text-center text-xs font-semibold">
                  <div className="flex items-center gap-1">
                    <span className="flex items-center gap-1">
                      Version: {localVersion}
                    </span>
                  </div>
                  <div className="text-[11px] font-normal text-gray-500 mt-1">
                    Updated on: 19-11-2025
                  </div>
                </div>
              }
              type="info"
              banner
              showIcon={false}
              className="rounded-md !bg-gray-100 !text-[var(--primary)]  px-4 py-1"
            />
          )}
        </motion.div>
      )}
    </motion.aside>
  );
}
