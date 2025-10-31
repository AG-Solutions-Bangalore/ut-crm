import { App, Button, Card, Form, Input, Select, Spin, Switch } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApiMutation } from "../../hooks/useApiMutation";
import { MILL_LIST } from "../../api";

const millTypes = [
  { label: "Mill", value: "Mill" },
  { label: "Sub Mill", value: "Sub Mill" },
];

const MillForm = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [initialData, setInitialData] = useState({});

  const resetForm = () => {
    form.resetFields();
  };

  const fetchMill = async () => {
    try {
      const res = await fetchTrigger({
        url: `${MILL_LIST}/${id}`,
      });
      if (res?.data) {
        setInitialData(res.data);
        form.setFieldsValue(res.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Failed to load mill details.");
    }
  };

  useEffect(() => {
    if (id) fetchMill();
    else resetForm();
  }, [id]);

  const handleSubmit = async (values) => {
    try {
      const res = await submitTrigger({
        url: isEditMode ? `${MILL_LIST}/${id}` : MILL,
        method: isEditMode ? "put" : "post",
        data: values,
      });

      if (res.code === 201 || res.code === 200) {
        message.success(res.message || "Mill saved successfully!");
      } else {
        message.error(res.message || "Failed to save mill.");
      }
    } catch (error) {
      console.error(error);
      message.error("Something went wrong while saving mill.");
    }
  };

  return (
    <>
      {fetchLoading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={initialData}
          className="mt-4"
          requiredMark={false}
        >
          <Card
            title={
              <h2 className="text-2xl font-bold">
                {isEditMode ? "Update Mill" : "Create Mill"}
              </h2>
            }
            extra={
              isEditMode && (
                <Form.Item
                  name="mill_status"
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Switch />
                </Form.Item>
              )
            }
            variant="borderless"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Form.Item
                name="mill_short"
                label={
                  <span>
                    Mill Short Name <span className="text-red-500">*</span>
                  </span>
                }
                rules={[{ required: true, message: "Short name is required" }]}
              >
                <Input maxLength={50} autoFocus />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    Mill Name <span className="text-red-500">*</span>
                  </span>
                }
                name="mill_name"
                rules={[{ required: true, message: "Mill name is required" }]}
              >
                <Input maxLength={100} />
              </Form.Item>

              <Form.Item label="Mill Type" name="mill_type">
                <Select placeholder="Select Type" options={millTypes} />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Form.Item
                label={
                  <span>
                    Billing Address <span className="text-red-500">*</span>
                  </span>
                }
                name="mill_billing_address"
                rules={[
                  { required: true, message: "Billing address required" },
                ]}
              >
                <Input.TextArea rows={3} />
              </Form.Item>

              <Form.Item label="Shipping Address" name="mill_shipping_address">
                <Input.TextArea rows={3} />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Form.Item label="State" name="mill_state">
                <Input />
              </Form.Item>

              <Form.Item label="GSTIN" name="mill_gstin">
                <Input maxLength={15} />
              </Form.Item>

              <Form.Item label="Email" name="mill_email">
                <Input type="email" placeholder="Enter Email" maxLength={30}/>
              </Form.Item>
            </div>

            <Card
              size="small"
              title={<span className="font-semibold">Bank Details</span>}
              className="!mt-2 bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Form.Item label="Bank Name" name="mill_bank_name">
                  <Input placeholder="Enter Bank Name" maxLength={30}/>
                </Form.Item>

                <Form.Item label="Account Number" name="mill_bank_ac_no">
                  <Input placeholder="Enter Account Number" maxLength={20}/>
                </Form.Item>

                <Form.Item label="IFSC Code" name="mill_bank_ifsc">
                  <Input placeholder="Enter IFSC Code" maxLength={50}/>
                </Form.Item>

                <Form.Item label="Branch Name" name="mill_bank_branch_name">
                  <Input placeholder="Enter Branch Name" maxLength={50}/>
                </Form.Item>

                <Form.Item
                  label="Commission %"
                  name="mill_percentage"
                  rules={[
                    {
                      pattern: /^\d+(\.\d{1,2})?$/,
                      message:
                        "Enter a valid percentage (up to 2 decimal places)",
                    },
                  ]}
                >
                  <Input placeholder="Enter commission" maxLength={5}/>
                </Form.Item>
              </div>
            </Card>

            <Card
              size="small"
              title={<span className="font-semibold">Contact Person</span>}
              className="!mt-2 bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Form.Item label="Name" name="mill_cp_name">
                  <Input />
                </Form.Item>

                <Form.Item label="Mobile" name="mill_cp_mobile">
                  <Input maxLength={10} />
                </Form.Item>

                <Form.Item label="Email" name="mill_cp_email">
                  <Input type="email" />
                </Form.Item>
              </div>
            </Card>

            <Form.Item className="text-center mt-6">
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                {isEditMode ? "Update" : "Create"}
              </Button>
            </Form.Item>
          </Card>
        </Form>
      )}
    </>
  );
};

export default MillForm;
