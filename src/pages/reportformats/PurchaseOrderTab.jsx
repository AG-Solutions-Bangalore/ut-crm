import React from "react";
import { Tabs } from "antd";
import PurchaseOrderDuplex from "./PurchaseOrderDuplex";
import PurchaseOrderKraft from "./PurchaseOrderKraft";

const { TabPane } = Tabs;
const PurchaseOrderTab = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
    <Tabs defaultActiveKey="1"  type="line"  animated>
      <TabPane tab=" Duplex" key="1">
        <PurchaseOrderDuplex />
      </TabPane>
      <TabPane tab=" Kraft" className="bg-blue" key="2">
        <PurchaseOrderKraft />
      </TabPane>

      
    </Tabs>
    
  </div>
  )
}

export default PurchaseOrderTab