


import React, { useState, useRef } from 'react';
import { Select, DatePicker, Button, Form, message, Card } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import useToken from '../../../api/usetoken';


const { Option } = Select;

const BalancePayableReport = () => {
  const [form] = Form.useForm();
  const [fromDate, setFromDate] = useState(dayjs().month(3).date(1)); 
  const [toDate, setToDate] = useState(dayjs()); 
  const [selectedMill, setSelectedMill] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const token = useToken();

  const { data: millsData, isLoading: millsLoading } = useQuery({
    queryKey: ['activeMills'],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}activeMills`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    },
    enabled: !!token,
  });

  const { data: partiesData, isLoading: partiesLoading } = useQuery({
    queryKey: ['activeParties'],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}activePartys`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    },
    enabled: !!token,
  });


  const handleGenerateReport = async () => {
    if (!fromDate || !toDate) {
      message.error('Please select both From Date and To Date');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        from_date: fromDate.format('YYYY-MM-DD'),
        to_date: toDate.format('YYYY-MM-DD'),
        mill_id: selectedMill,
        party_id: selectedParty || ''
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}balancePayableReport`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setReportData(response.data.data || []);
      
      if (response.data.data && response.data.data.length > 0) {
        message.success('Report generated successfully');
      } else {
        message.info('No data found for the selected criteria');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setFromDate(dayjs().month(3).date(1)); 
    setToDate(dayjs()); 
    setSelectedMill(null);
    setSelectedParty(null);
    setReportData([]);
  };

  
  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="text-center">
          {!token && (
            <div className="text-red-500 text-sm mt-2">
              Please log in to access this feature
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-2">
          <div className="w-full lg:w-2/6">
            <Card 
              title="Balance Payable Report  Criteria" 
              className="shadow-lg sticky"
              extra={
                <Button 
                  type="link" 
                  onClick={handleReset}
                  size="small"
                >
                  Reset
                </Button>
              }
            >
              <Form form={form} requiredMark={false} layout="vertical" className="p-2">
                <div className="mb-6">
                  <Form.Item
                    label={
                      <span>
                        From Date <span className="text-red-500">*</span>
                      </span>
                    }
                    required
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      value={fromDate}
                      onChange={setFromDate}
                      format="YYYY-MM-DD"
                      placeholder="Select From Date"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    label={
                      <span>
                        To Date <span className="text-red-500">*</span>
                      </span>
                    }
                    required
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      value={toDate}
                      onChange={setToDate}
                      format="YYYY-MM-DD"
                      placeholder="Select To Date"
                    />
                  </Form.Item>
                </div>

                <div className="mb-6">
                  <Form.Item label="Mill">
                    <Select
                      placeholder="Select Mill"
                      loading={millsLoading}
                      onChange={setSelectedMill}
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      value={selectedMill}
                    >
                      {millsData?.data?.map((mill) => (
                        <Option key={mill.id} value={mill.id}>
                          {mill.mill_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <div className="mb-6">
                  <Form.Item label="Party">
                    <Select
                      placeholder="Select Party"
                      loading={partiesLoading}
                      onChange={setSelectedParty}
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      value={selectedParty}
                    >
                      {partiesData?.data?.map((party) => (
                        <Option key={party.id} value={party.id}>
                          {party.party_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button 
                    onClick={handleReset}
                    size="large"
                  >
                    Reset
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={handleGenerateReport}
                    size="large"
                    className="bg-blue-600 hover:bg-blue-700"
                    loading={loading}
                    disabled={!fromDate || !toDate}
                  >
                    Generate Report
                  </Button>
                </div>
              </Form>
            </Card>
          </div>

          <div className="w-full lg:w-4/6">
            <Card 
              title="Balance Payable Report" 
              className="shadow-lg min-h-[800px]"
              extra={
                <div className="text-sm text-gray-500">
                  {reportData.length > 0 ? `${reportData.length} records found` : 'No data to display'}
                </div>
              }
            >
              {reportData.length > 0 ? (
                <div>
                

                  <div ref={containerRef} className="md:overflow-x-auto">
                {JSON.stringify(reportData?.map(item=>item.mill_name))}

                    {/* first group by mill than group by month inside month table will be there and each month has own total and grandtotal */}


                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold mb-2">No Report Data</h3>
                  <p>Please select date range, mill, and optionally a party to generate the report.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalancePayableReport;