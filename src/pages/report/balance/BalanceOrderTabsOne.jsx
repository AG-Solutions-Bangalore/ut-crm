import { Tabs } from "antd";
import { useState } from "react";
import BalancePayableReport from "./BalancePayableReport";
import BalanceReceivableReport from "./BalanceReceivableReport";

const BalanceOrderTabsOne = () => {
  const [activeTab, setActiveTab] = useState("Open");

  return (
    <div className="min-h-screen max-w-full mx-auto">
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={[
          { key: "Open", label: "Balance Payable Report" },
          { key: "Close", label: "Balance Receivable Report" },
        ]}
      />

      {activeTab == "Open" && <BalancePayableReport />}
      {activeTab == "Close" && <BalanceReceivableReport />}
    </div>
  );
};

export default BalanceOrderTabsOne;
