


import React from "react";
import { Tabs } from "antd";
import Ledger from "./mill-ledger";
import UnifiedLedger from "./mill-ledger";



const { TabPane } = Tabs;

const LedgerReport = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {/* <Tabs defaultActiveKey="1" type="card">
        <TabPane tab="Payable" key="1">
    */}
      <UnifiedLedger />
        {/* </TabPane>
   
        <TabPane tab="Receivables" key="2">
        

        <Ledger type="Receivables" />
        </TabPane>
        */}

        
      {/* </Tabs> */}
      
    </div>
  );
};

export default LedgerReport;
