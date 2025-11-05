import React from "react";
import { Tabs } from "antd";

import PurchaseOrderDuplex from "./PurchaseOrderDuplex";

const { TabPane } = Tabs;

const ReportFormat = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <Tabs defaultActiveKey="1" type="card">
        <TabPane tab="Purchase Order" key="1">
          <PurchaseOrderDuplex />
        </TabPane>

        <TabPane tab="Sales Report" key="2">
          {/* Import your component here */}
          {/* <SalesReport /> */}
          <section className="w-full max-w-7xl mx-auto">
            {/* <FeaturedCarousel /> */}
          </section>
        </TabPane>

        <TabPane tab="Inventory Summary" key="3">
          {/* Import your component here */}
          {/* <InventorySummary /> */}
          <div>Inventory Summary content goes here</div>
        </TabPane>

        <TabPane tab="Expense Report" key="4">
          {/* Import your component here */}
          {/* <ExpenseReport /> */}
          <div>Expense Report content goes here</div>
        </TabPane>
      </Tabs>
      
    </div>
  );
};

export default ReportFormat;
