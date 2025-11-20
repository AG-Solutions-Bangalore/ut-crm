import { useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Form, Input, Select, Spin, Switch } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PARTY_LIST } from "../../../api";
import { useApiMutation } from "../../../hooks/useApiMutation";
import { useMasterData } from "../../../hooks";

const PartyForm = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState({});
  const queryClient = useQueryClient();
  const { state } = useMasterData({
    state: true,
  });
  const resetForm = () => {
    form.resetFields();
  };

  const fetchParty = async () => {
    try {
      const res = await fetchTrigger({
        url: `${PARTY_LIST}/${id}`,
      });
      if (res?.data) {
        const formattedData = {
          ...res.data,
          party_status: res.data.party_status == "Active",
        };

        setInitialData(formattedData);
        form.setFieldsValue(formattedData);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Failed to load party details.");
    }
  };

  useEffect(() => {
    if (id) fetchParty();
    else resetForm();
  }, [id]);

  const handleSubmit = async (values) => {
    const payload = isEditMode
      ? {
          ...values,
          party_status: values?.party_status ? "Active" : "Inactive",
        }
      : values;
    try {
      const res = await submitTrigger({
        url: isEditMode ? `${PARTY_LIST}/${id}` : PARTY_LIST,
        method: isEditMode ? "put" : "post",
        data: payload,
      });

      if (res.code == 201) {
        message.success(res.message || "Party saved successfully!");
        await queryClient.invalidateQueries({
          queryKey: ["partydata"],
          exact: false,
        });
        navigate("/master/party");
      } else {
        console.log(res);
        message.error(res.message || "Failed to save Party.");
      }
    } catch (error) {
      console.error(error);
      message.error(
        error?.response?.data?.message ||
          "Something went wrong while saving party."
      );
    }
  };
  const loading = fetchLoading || state.loading;

  return (
    <>
      {loading ? (
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
                {isEditMode ? "Update Party" : "Create Party"}
              </h2>
            }
            extra={
              isEditMode && (
                <Form.Item
                  name="party_status"
                  valuePropName="checked"
                  className="!mb-0"
                >
                  <Switch />
                </Form.Item>
              )
            }
            variant="borderless"
          >
            <Card
              size="small"
              title={<span className="font-semibold">Party Details</span>}
              className=" bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Form.Item
                  name="party_short"
                  label={
                    <span>
                      Party Short Name <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[
                    { required: true, message: "Short name is required" },
                  ]}
                >
                  <Input
                    maxLength={50}
                    autoFocus
                    placeholder="Enter Party Short Name"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span>
                      Party Name <span className="text-red-500">*</span>
                    </span>
                  }
                  name="party_name"
                  rules={[
                    { required: true, message: "Party Name is required" },
                  ]}
                >
                  <Input maxLength={100} placeholder="Enter Party Name" />
                </Form.Item>

                <Form.Item
                  name="party_state"
                  label={
                    <span>
                      State<span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: "State is required" }]}
                >
                  {/* <Input placeholder="Enter Enter" /> */}
                  <Select
                    placeholder="Select State"
                    options={state?.data?.data.map((item) => ({
                      value: item.state_name,
                      label: item.state_name,
                    }))}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    showSearch
                    allowClear
                  />
                </Form.Item>
                <Form.Item label="GSTIN" name="party_gstin">
                  <Input maxLength={15} placeholder="Enter GST" />
                </Form.Item>

                <Form.Item
                  label="Due Days"
                  name="party_due_days"
                  rules={[
                    {
                      pattern: /^[0-9]*$/,
                      message: "Only digits are allowed",
                    },
                  ]}
                >
                  <Input placeholder="Enter Due Days" maxLength={3} />
                </Form.Item>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Form.Item
                  label={
                    <span>
                      Billing Address <span className="text-red-500">*</span>
                    </span>
                  }
                  name="party_billing_address"
                  rules={[
                    { required: true, message: "Billing Address  required" },
                  ]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter Billing Address"
                  />
                </Form.Item>

                <Form.Item
                  label="Delivery Address"
                  name="party_delivery_address"
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter Delivery Address"
                  />
                </Form.Item>
              </div>
            </Card>
            <Card
              size="small"
              title={<span className="font-semibold">Contact Person</span>}
              className="!mt-2 bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Form.Item label="Name" name="party_cp_name">
                  <Input placeholder="Enter Contact Name" />
                </Form.Item>

                <Form.Item
                  label="Mobile"
                  name="party_cp_mobile"
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

                <Form.Item label="Email" name="party_cp_email">
                  <Input type="email" placeholder="Enter Email" />
                </Form.Item>
              </div>
            </Card>
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

export default PartyForm;
