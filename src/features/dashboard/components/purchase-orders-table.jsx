import { ArrowRightOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Empty, Typography } from "antd";
import DataTable from "../../../components/DataTable/DataTable";
import { purchaseOrdersColumns } from "../utils/table-columns.jsx";  

const { Text } = Typography;

const PurchaseOrdersTable = ({ data, onViewAll, isLoading }) => {
  if (isLoading) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 p-2 rounded-xl mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
              <ShoppingOutlined className="text-2xl" />
            </div>
            <div>
              <div className="font-bold text-white text-lg">
                Latest Purchase Orders
              </div>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg">
            <a
              href="#"
              className="!text-white hover:text-blue-100 font-semibold flex items-center gap-2 px-4 py-2 transition-all group"
              onClick={(e) => {
                e.preventDefault();
                onViewAll();
              }}
            >
              View All
              <ArrowRightOutlined className="text-sm group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {data?.latestPurchaseOrders?.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <DataTable
            columns={purchaseOrdersColumns}
            dataSource={data.latestPurchaseOrders}
            rowKey="id"
            scroll={{ x: 1100 }}
            className="custom-purchase-table"
            rowClassName={(record, index) =>
              `hover:bg-blue-50/50 transition-all cursor-pointer ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
              }`
            }
          />
        </div>
      ) : (
        <Empty
          description={
            <span className="text-gray-500">
              No purchase orders available
            </span>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="py-8"
        />
      )}
    </>
  );
};

export default PurchaseOrdersTable;