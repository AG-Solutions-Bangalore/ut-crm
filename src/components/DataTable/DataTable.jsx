// import { Pagination, Table } from "antd";

// const DataTable = ({
//   data = [],
//   columns = [],
//   rowKey = "id",
//   fotterdata = {},
//   scroll = { x: "max-content" },
//   ...rest
// }) => {
//   const {
//     current = 1,
//     total = 0,
//     pageSize = 10,
//     onChange = () => {},
//   } = fotterdata;

//   return (
//     <Table
//       size="small"
//       bordered
//       rowKey={rowKey}
//       dataSource={data}
//       columns={columns}
//       pagination={false}
//       scroll={scroll}
//       footer={() => (
//         <div className="flex justify-between items-center text-sm text-gray-600 px-3 py-2">
//           <span>
//             Showing {data.length > 0 ? data.length : 0} of {total} items
//           </span>
//           <Pagination
//             current={current}
//             total={total}
//             pageSize={pageSize}
//             showSizeChanger={false}
//             onChange={onChange}
//             size="small"
//           />
//         </div>
//       )}
//       {...rest}
//     />
//   );
// };

// export default DataTable;
import { Pagination, Table } from "antd";

const DataTable = ({
  data = [],
  columns = [],
  rowKey = "id",
  fotterdata,
  scroll = { x: "max-content" },
  ...rest
}) => {
  const showFooter = fotterdata && fotterdata !== false;

  return (
    <Table
      size="small"
      bordered
      rowKey={rowKey}
      dataSource={data}
      columns={columns}
      pagination={false}
      scroll={scroll}
      footer={
        showFooter
          ? () => {
              const {
                current = 1,
                total = 0,
                pageSize = 10,
                onChange = () => {},
              } = fotterdata;

              return (
                <div className="flex justify-between items-center text-sm text-gray-600 px-3 py-2">
                  <span>
                    Showing {data.length > 0 ? data.length : 0} of {total} items
                  </span>
                  <Pagination
                    current={current}
                    total={total}
                    pageSize={pageSize}
                    showSizeChanger={false}
                    onChange={onChange}
                    size="small"
                  />
                </div>
              );
            }
          : undefined
      }
      {...rest}
    />
  );
};

export default DataTable;
