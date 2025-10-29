import { Table, Pagination } from "antd";
import React, { useState } from "react";

const SGSTable = ({
  data = [],
  columns = [],
  rowKey = "id",
  pagination = { pageSize: 10 },
  scroll = { x: "max-content" },
  ...rest
}) => {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(pagination.pageSize || 10);

  const handlePageChange = (page, size) => {
    setCurrent(page);
    setPageSize(size);
  };

  const paginatedData = data.slice(
    (current - 1) * pageSize,
    current * pageSize
  );

  return (
    <Table
      size="small"
      bordered
      rowKey={rowKey}
      dataSource={paginatedData}
      columns={columns}
      pagination={false}
      scroll={scroll}
      footer={() => (
        <div className="flex justify-between items-center text-sm text-gray-600 px-3 py-2">
          <span>Total {data.length} items</span>

          <Pagination
            current={current}
            total={data.length}
            pageSize={pageSize}
            showSizeChanger
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
            size="small"
          />
        </div>
      )}
      {...rest}
    />
  );
};

export default SGSTable;
