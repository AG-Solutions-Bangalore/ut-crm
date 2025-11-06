import React from "react";
import { Tabs } from "antd";


import TradeInvoice from "./TradeInvoice";
import Quotation from "./Quotation";

const { TabPane } = Tabs;

const ReportFormat = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <Tabs defaultActiveKey="1" type="card">
        <TabPane tab="Purchase Order" key="1">
<TradeInvoice/>
        </TabPane>

        <TabPane tab="Sales Report" key="2">
        
          {/* <SalesReport /> */}
          <Quotation/>
        </TabPane>


        <TabPane tab="Expense Report" key="4">
      
          {/* <ExpenseReport /> */}
          <div>Expense Report content goes here</div>
        </TabPane>
      </Tabs>
      
    </div>
  );
};

export default ReportFormat;
