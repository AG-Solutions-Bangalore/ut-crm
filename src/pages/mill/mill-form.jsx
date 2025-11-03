import { useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Form, Input, Select, Spin, Switch } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MILL_LIST } from "../../api";
import { useApiMutation } from "../../hooks/useApiMutation";

const millTypes = [
  { label: "Mill", value: "Mill" },
  { label: "Direct", value: "Direct" },
];

const MillForm = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState({});
  const queryClient = useQueryClient();

  const resetForm = () => {
    form.resetFields();
  };

  const fetchMill = async () => {
    try {
      const res = await fetchTrigger({
        url: `${MILL_LIST}/${id}`,
      });
      if (res?.data) {
        const formattedData = {
          ...res.data,
          mill_status: res.data.mill_status == "Active",
        };

        setInitialData(formattedData);
        form.setFieldsValue(formattedData);
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
    const payload = isEditMode
      ? {
          ...values,
          mill_status: values?.mill_status ? "Active" : "Inactive",
        }
      : values;
    try {
      const res = await submitTrigger({
        url: isEditMode ? `${MILL_LIST}/${id}` : MILL_LIST,
        method: isEditMode ? "put" : "post",
        data: payload,
      });

      if (res.code == 201) {
        message.success(res.message || "Mill saved successfully!");
        await queryClient.invalidateQueries({
          queryKey: ["milldata"],
          exact: false,
        });
        navigate("/master/mill");
      } else {
        console.log(res);
        message.error(res.message || "Failed to save mill.");
      }
    } catch (error) {
      console.error(error);
      message.error(
        error?.response?.data?.message ||
          "Something went wrong while saving mill."
      );
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
                  className="!mb-0"
                >
                  <Switch />
                </Form.Item>
              )
            }
            variant="borderless"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card
                size="small"
                title={<span className="font-semibold">Mill Details</span>}
                className="!mt-2 bg-gray-50"
              >
                <div className="grid grid-cols-1">
                  <Form.Item
                    name="mill_short"
                    label={
                      <span>
                        Mill Short Name <span className="text-red-500">*</span>
                      </span>
                    }
                    rules={[
                      { required: true, message: "Short name is required" },
                    ]}
                  >
                    <Input
                      maxLength={50}
                      autoFocus
                      placeholder="Enter Mill Short Name"
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span>
                        Mill Name <span className="text-red-500">*</span>
                      </span>
                    }
                    name="mill_name"
                    rules={[
                      { required: true, message: "Mill name is required" },
                    ]}
                  >
                    <Input maxLength={100} placeholder="Enter Mill Name" />
                  </Form.Item>
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
                    <Input.TextArea
                      rows={3}
                      placeholder="Enter Billing Address"
                    />
                  </Form.Item>
                  <Form.Item label="Mill Type" name="mill_type">
                    <Select placeholder="Select Type" options={millTypes} />
                  </Form.Item>

                  <Form.Item
                    label="Shipping Address"
                    name="mill_shipping_address"
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Enter Shipping Address"
                    />
                  </Form.Item>

                  <Form.Item label="State" name="mill_state">
                    <Input placeholder="Enter Enter" />
                  </Form.Item>

                  <Form.Item label="GSTIN" name="mill_gstin">
                    <Input maxLength={15} placeholder="Enter GST" />
                  </Form.Item>

                  <Form.Item label="Email" name="mill_email">
                    <Input
                      type="email"
                      placeholder="Enter Email"
                      maxLength={30}
                    />
                  </Form.Item>
                </div>
              </Card>
              <Card
                size="small"
                title={<span className="font-semibold">Bank Details</span>}
                className="!mt-2 bg-gray-50"
              >
                <div className="grid grid-cols-1">
                  <Form.Item label="Bank Name" name="mill_bank_name">
                    <Input placeholder="Enter Bank Name" maxLength={30} />
                  </Form.Item>

                  <Form.Item label="Account Number" name="mill_bank_ac_no">
                    <Input placeholder="Enter Account Number" maxLength={20} />
                  </Form.Item>

                  <Form.Item label="IFSC Code" name="mill_bank_ifsc">
                    <Input placeholder="Enter IFSC Code" maxLength={50} />
                  </Form.Item>

                  <Form.Item label="Branch Name" name="mill_bank_branch_name">
                    <Input placeholder="Enter Branch Name" maxLength={50} />
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
                    <Input placeholder="Enter commission" maxLength={5} />
                  </Form.Item>
                </div>
              </Card>

              <Card
                size="small"
                title={<span className="font-semibold">Contact Person</span>}
                className="!mt-2 bg-gray-50"
              >
                <div className="grid grid-cols-1">
                  <Form.Item label="Name" name="mill_cp_name">
                    <Input placeholder="Enter Contact Name" />
                  </Form.Item>

                  <Form.Item
                    label="Mobile"
                    name="mill_cp_mobile"
                    rules={[
                      {
                        required: true,
                        message: "Mobile number is required",
                      },
                      {
                        pattern: /^[0-9]+$/,
                        message: "Only digits are allowed",
                      },
                      {
                        len: 10,
                        message: "Mobile number must be exactly 10 digits",
                      },
                    ]}
                  >
                    <Input maxLength={10} placeholder="Enter Mobile Number" />
                  </Form.Item>

                  <Form.Item label="Email" name="mill_cp_email">
                    <Input type="email" placeholder="Enter Email" />
                  </Form.Item>
                </div>
              </Card>
            </div>
            <Form.Item className="text-center !mt-2">
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
