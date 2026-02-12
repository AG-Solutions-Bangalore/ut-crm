import { useState } from "react";
import { Tabs } from "antd";
import BalanceOrderReport from "./BalanceOrderReport";
import BalanceCloseOrderReport from "./BalanceCloseOrderReport";

const BalanceOrderTabs = () => {
  const [activeTab, setActiveTab] = useState("Open");

  return (
    <div className="min-h-screen max-w-full mx-auto">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={[
          { key: "Open", label: "Balance Open Orders" },
          { key: "Close", label: "Balance Closed Orders" },
        ]}
      />

      {activeTab == "Open" && <BalanceOrderReport />}
      {activeTab == "Close" && <BalanceCloseOrderReport />}
    </div>
  );
};

export default BalanceOrderTabs;
