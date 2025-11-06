import React, { useState } from 'react';
import { Select, Input, Button, Form, message, Row, Col, Card } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useToken from '../../api/usetoken';
import AuthInvoice from '../reportformats/AuthInvoice';

const { Option } = Select;

const AuthReport = () => {
  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedThirdParty, setSelectedThirdParty] = useState(null);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [form] = Form.useForm();

  const token = useToken();

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

  const { data: thirdPartiesData, isLoading: thirdPartiesLoading } = useQuery({
    queryKey: ['thirdParties'],
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

  const [showAuthInvoice, setShowAuthInvoice] = useState(false);

  const handlePartyChange = (value) => {
    const party = partiesData?.data?.find(p => p.id === value);
    setSelectedParty(party);
    updateAuthInvoice();
  };

  const handleThirdPartyChange = (value) => {
    const thirdParty = thirdPartiesData?.data?.find(p => p.id === value);
    setSelectedThirdParty(thirdParty);
    updateAuthInvoice();
  };

  const handleInvoiceNoChange = (e) => {
    setInvoiceNo(e.target.value);
    updateAuthInvoice();
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
    updateAuthInvoice();
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    updateAuthInvoice();
  };

  const updateAuthInvoice = () => {
    if (selectedParty && selectedThirdParty && invoiceNo && date && amount) {
      setShowAuthInvoice(true);
    } else {
      setShowAuthInvoice(false);
    }
  };

  const handleGenerate = () => {
    if (!selectedParty || !selectedThirdParty) {
      message.error('Please select both Party and Third Party');
      return;
    }

    if (!invoiceNo || !date || !amount) {
      message.error('Please fill all invoice fields');
      return;
    }

    setShowAuthInvoice(true);
  };

  const handleReset = () => {
    setSelectedParty(null);
    setSelectedThirdParty(null);
    setInvoiceNo('');
    setDate('');
    setAmount('');
    setShowAuthInvoice(false);
    form.resetFields();
  };

  return (
    <div className="min-h-screen  ">
      <div className="max-w-full mx-auto">
        <div className="text-center ">
        
          {!token && (
            <div className="text-red-500 text-sm mt-2">
              Please log in to access this feature
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-2">
       
          <div className="w-full lg:w-2/6">
            <Card 
              title="Authorization Details" 
              className="shadow-lg sticky "
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
              <Form form={form}  requiredMark={false} layout="vertical" className="p-2">
            
                <div className="mb-6">
                  <Form.Item   label={
                    <span>
                      Party Name <span className="text-red-500">*</span>
                    </span>
                  } required>
                    <Select
                      placeholder="Select Party Name"
                      loading={partiesLoading}
                      onChange={handlePartyChange}
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      value={selectedParty?.id}
                    >
                      {partiesData?.data?.map((party) => (
                        <Option key={party.id} value={party.id}>
                          {party.party_name}
                        </Option>
                      ))}
                    </Select>
                    {selectedParty && (
                      <div className="mt-2 text-xs text-gray-600 p-2 bg-gray-50 rounded">
                        <strong>Billing Address:</strong> {selectedParty.party_billing_address}
                      </div>
                    )}
                  </Form.Item>

                  <Form.Item  label={
                    <span>
                      Third Party Name <span className="text-red-500">*</span>
                    </span>
                  }
                  required>
                    <Select
                      placeholder="Select Third Party Name"
                      loading={thirdPartiesLoading}
                      onChange={handleThirdPartyChange}
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      value={selectedThirdParty?.id}
                    >
                      {thirdPartiesData?.data?.map((party) => (
                        <Option key={party.id} value={party.id}>
                          {party.party_name}
                        </Option>
                      ))}
                    </Select>
                    {selectedThirdParty && (
                      <div className="mt-2 text-xs text-gray-600 p-2 bg-gray-50 rounded">
                        <strong>Delivery Address:</strong> {selectedThirdParty.party_delivery_address}
                      </div>
                    )}
                  </Form.Item>
                </div>

    
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Invoice Details</h3>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item label={
                    <span>
                     Invoice No <span className="text-red-500">*</span>
                    </span>
                  }  required>
                        <Input
                          value={invoiceNo}
                          onChange={handleInvoiceNoChange}
                          placeholder="Enter invoice number"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item  label={
                    <span>
                      Date <span className="text-red-500">*</span>
                    </span>
                  } required>
                        <Input
                          type="date"
                          value={date}
                          onChange={handleDateChange}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label={
                    <span>
                      Amount <span className="text-red-500">*</span>
                    </span>
                  }  required>
                        <Input
                          type="number"
                          value={amount}
                          onChange={handleAmountChange}
                          placeholder="Enter amount"
                          prefix="₹"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
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
                    onClick={handleGenerate}
                    size="large"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!selectedParty || !selectedThirdParty || !invoiceNo || !date || !amount}
                  >
                    Generate Preview
                  </Button>
                </div>
              </Form>
            </Card>
          </div>

        
          <div className="w-full lg:w-4/6">
            <Card 
              title="Authorization Letter Preview" 
              className="shadow-lg min-h-[800px]"
              extra={
                <div className="text-sm text-gray-500">
                  {showAuthInvoice ? 'Live Preview' : 'Fill the form to see preview'}
                </div>
              }
            >
              <div className="flex justify-center">
                {showAuthInvoice ? (
                  <div className="w-full max-w-[210mm]">
                    <AuthInvoice
                      partyData={selectedParty}
                      thirdPartyData={selectedThirdParty}
                      invoiceData={{
                        invoiceNo,
                        date,
                        amount
                      }}
                      onClose={() => {}} 
                      showControls={false} 
                    />
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-400">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold mb-2">No Preview Available</h3>
                    <p>Please fill in all the required fields to generate the authorization letter preview.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthReport;