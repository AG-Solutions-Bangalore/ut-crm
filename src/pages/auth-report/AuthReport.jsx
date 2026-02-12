import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
} from "antd";
import { useMasterData } from "../../hooks";
import AuthInvoice from "../reportformats/AuthInvoice";

const AuthReport = () => {
  const [form] = Form.useForm();

  const { party } = useMasterData({
    party: true,
  });

  const partyOptions =
    party?.data?.data?.map((item) => ({
      label: item.party_short,
      value: item.id,
      fullData: item,
    })) || [];

  const selectedPartyId = Form.useWatch("selectedParty", form);
  const selectedThirdPartyId = Form.useWatch("selectedThirdParty", form);
  const invoiceNo = Form.useWatch("invoiceNo", form);
  const date = Form.useWatch("date", form);
  const amount = Form.useWatch("amount", form);

  const selectedParty =
    partyOptions.find((p) => p.value === selectedPartyId)?.fullData || null;

  const selectedThirdParty =
    partyOptions.find((p) => p.value === selectedThirdPartyId)?.fullData ||
    null;

  const showAuthInvoice =
    selectedParty && selectedThirdParty && invoiceNo && date && amount;

  const handleReset = () => {
    form.resetFields();
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col lg:flex-row gap-2">
          <div className="w-full lg:w-2/6">
            <Card
              title="Authorization Details"
              className="shadow-lg sticky"
              extra={
                <Button type="link" size="small" onClick={handleReset}>
                  Reset
                </Button>
              }
            >
              <p className="mb-4 text-gray-700 text-sm bg-blue-50 border border-blue-200 py-1 px-3 rounded">
                Fill out the details below, and the authorization letter will be
                generated automatically based on the information you provide.
              </p>
              <Form
                form={form}
                layout="vertical"
                requiredMark={false}
                className="p-2"
              >
                <Form.Item
                  name="selectedParty"
                  label={
                    <span>
                      Party Name <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Select Party Name"
                    options={partyOptions}
                    loading={party.loading}
                    showSearch
                    allowClear
                    filterOption={(input, option) =>
                      option?.label
                        ?.toLowerCase()
                        ?.includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                {selectedParty && (
                  <div className="mt-2 text-xs text-gray-600 p-2 bg-gray-50 rounded">
                    <strong>Billing Address:</strong>{" "}
                    {selectedParty.party_billing_address}
                  </div>
                )}

                {/* Third Party Select */}
                <Form.Item
                  name="selectedThirdParty"
                  label={
                    <span>
                      Third Party Name <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Select Third Party"
                    options={partyOptions}
                    loading={party.loading}
                    showSearch
                    allowClear
                    filterOption={(input, option) =>
                      option?.label
                        ?.toLowerCase()
                        ?.includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                {selectedThirdParty && (
                  <div className="mt-2 text-xs text-gray-600 p-2 bg-gray-50 rounded">
                    <strong>Delivery Address:</strong>{" "}
                    {selectedThirdParty.party_delivery_address}
                  </div>
                )}

                <h3 className="text-lg font-semibold mb-4 text-gray-800 mt-6">
                  Invoice Details
                </h3>

                <Form.Item
                  name="invoiceNo"
                  label={
                    <span>
                      Invoice No <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Enter invoice number" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="date"
                      label={
                        <span>
                          Date <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[{ required: true }]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD-MM-YYYY"
                        placeholder="Select Date"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="amount"
                      label={
                        <span>
                          Amount <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        min={1}
                        placeholder="Amount"
                        prefix="₹"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </div>

          {/* RIGHT SIDE - PREVIEW */}
          <div className="w-full lg:w-4/6">
            <Card
              title="Authorization Letter Preview"
              className="shadow-lg min-h-[800px]"
              extra={
                <div className="text-sm text-gray-500">
                  {showAuthInvoice
                    ? "Live Preview"
                    : "Fill the form to see preview"}
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
                        amount,
                      }}
                      showControls={false}
                    />
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-400">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold mb-2">
                      No Preview Available
                    </h3>
                    <p>
                      Please fill in all required fields to generate preview.
                    </p>
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
