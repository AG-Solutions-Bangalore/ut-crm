import { useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Popconfirm,
  Select,
  Spin,
  Switch,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PARTY_LIST } from "../../../api";
import { useApiMutation } from "../../../hooks/useApiMutation";
import { useMasterData } from "../../../hooks";
import {
  DeleteOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
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
        const formattedSubs = Array.isArray(res.data.subs)
          ? res.data.subs.map((item) => ({
              ...item,
              party_status: item.party_status == "Active",
            }))
          : [];

        const formattedData = {
          ...res.data,
          party_status: res.data.party_status === "Active",
          subs: formattedSubs,
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
  const addDeliveryAddress = () => {
    const subs = form.getFieldValue("subs") || [];

    form.setFieldsValue({
      subs: [
        ...subs,
        {
          party_delivery_address: "",
          party_gstin: "",
          party_status: true,
        },
      ],
    });
  };

  const handleSubmit = async (values) => {
    const formattedSubs = (values.subs || []).map((row) => ({
      ...(isEditMode && row.id ? { id: row.id } : {}),
      party_delivery_address: row.party_delivery_address,
      party_gstin: row.party_gstin,
      party_status: row.party_status ? "Active" : "Inactive",
    }));

    const payload = {
      ...values,
      party_status: values.party_status ? "Active" : "Inactive",
      subs: formattedSubs,
    };
    try {
      const res = await submitTrigger({
        url: isEditMode ? `${PARTY_LIST}/${id}` : `${PARTY_LIST}`,
        method: isEditMode ? "put" : "post",
        data: payload,
      });

      if (res.code == 201) {
        message.success(res.message || "Party saved successfully!");
        await queryClient.invalidateQueries({
          queryKey: ["partydata"],
          exact: false,
        });
        await queryClient.invalidateQueries({
          queryKey: ["activepartydata"],
          exact: false,
        });
        navigate("/master/party");
      } else {
        message.error(res.message || "Failed to save Party.");
      }
    } catch (error) {
      console.error(error);
      message.error(
        error?.response?.data?.message ||
          "Something went wrong while saving party.",
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
              <div className="flex gap-4">
                {isEditMode && (
                  <Form.Item
                    name="party_status"
                    valuePropName="checked"
                    className="!mb-0 !mt-2"
                  >
                    <Switch />
                  </Form.Item>
                )}

                <Form.Item className="text-center !mt-2">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitLoading}
                  >
                    {isEditMode ? "Update" : "Create"}
                  </Button>
                </Form.Item>
              </div>
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Form.Item
                  label={
                    <span>
                      GSTIN<span className="text-red-500">*</span>
                    </span>
                  }
                  name="party_gstin"
                  rules={[{ required: true, message: "GST is required" }]}
                >
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
                <Form.Item label="Refered By" name="party_refered_by">
                  <Input placeholder="Enter Refered By" />
                </Form.Item>
                <Form.Item
                  name="party_daily_mail"
                  label="Mail"
                  // rules={[{ required: true, message: "State is required" }]}
                >
                  <Select
                    placeholder="Send Mail"
                    options={[
                      { value: "Yes", label: "Yes" },
                      { value: "No", label: "No" },
                    ]}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    showSearch
                    allowClear
                  />
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
                  label={
                    <span>
                      Delivery Address <span className="text-red-500">*</span>
                    </span>
                  }
                  name="party_delivery_address"
                  rules={[
                    { required: true, message: "Delivery Address is required" },
                  ]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter Delivery Address"
                  />
                </Form.Item>
              </div>
              <div className="flex justify-end mb-2">
                <Button
                  type="dashed"
                  onClick={addDeliveryAddress}
                  icon={<PlusOutlined />}
                >
                  Add Multiple Delivery Address
                </Button>
              </div>
            </Card>
            <Card
              size="small"
              title={<span className="font-semibold">Contact Persons</span>}
              className="!my-2 bg-gray-50"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Form.Item label="Name" name="party_cp_name1">
                  <Input placeholder="Enter Contact Name 1" />
                </Form.Item>

                <Form.Item
                  label="Mobile "
                  name="party_cp_mobile1"
                  rules={[
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
                  <Input maxLength={10} placeholder="Enter Mobile Number 1" />
                </Form.Item>

                <Form.Item label="Email" name="party_cp_email1">
                  <Input type="email" placeholder="Enter Email 1" />
                </Form.Item>
              </div>
            </Card>
            {/* <Card
              size="small"
              title={<span className="font-semibold">Contact Person 1</span>}
              className="!my-2 bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Form.Item label="Name" name="party_cp_name1">
                  <Input placeholder="Enter Contact Name" />
                </Form.Item>

                <Form.Item
                  label="Mobile"
                  name="party_cp_mobile1"
                  rules={[
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

                <Form.Item label="Email" name="party_cp_email1">
                  <Input type="email" placeholder="Enter Email" />
                </Form.Item>
              </div>
            </Card> */}

            <Form.List
              name="subs"
              rules={[
                {
                  validator: async (_, subs) => Promise.resolve(),
                },
              ]}
              validateTrigger={["onSubmit"]}
            >
              {(fields, { add, remove }) => (
                <>
                  {/* <div className="flex justify-between mb-2">
                    <div className="font-semibold text-lg"></div>

                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                    >
                      Add Multiple Delivery Address
                    </Button>
                  </div> */}

                  {fields.length > 0 && (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                      <div
                        className={`grid grid-cols-1 ${
                          isEditMode ? "md:grid-cols-4" : "md:grid-cols-3"
                        } bg-gray-100 text-gray-700 font-semibold text-sm p-2`}
                      >
                        <div className="col-span-2">Delivery Address</div>
                        <div>GST</div>
                        {isEditMode && <div>Status</div>}
                      </div>

                      <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                        {fields.map(({ key, name, ...restField }) => {
                          const subItem = form.getFieldValue(["subs", name]);
                          const hasId = subItem?.id; // existing row or new row?

                          return (
                            <div
                              key={key}
                              className={`grid grid-cols-1 ${
                                isEditMode ? "md:grid-cols-4" : "md:grid-cols-3"
                              } gap-2  p-2 relative`}
                            >
                              {/* Delete button only for new rows */}
                              {fields.length > 1 && !hasId && (
                                <Button
                                  type="text"
                                  danger
                                  icon={<MinusCircleOutlined />}
                                  className="!absolute top-0 right-0 z-10 text-red-500"
                                  onClick={() => remove(name)}
                                />
                              )}

                              {/* Delivery Address */}
                              <div className="md:col-span-2">
                                <Form.Item
                                  {...restField}
                                  name={[name, "party_delivery_address"]}
                                  rules={[
                                    {
                                      validator(_, value) {
                                        const gst = form.getFieldValue([
                                          "subs",
                                          name,
                                          "party_gstin",
                                        ]);

                                        // NEW ROW → always required
                                        if (!hasId) {
                                          if (!value) {
                                            return Promise.reject(
                                              new Error(
                                                "Delivery Address is required.",
                                              ),
                                            );
                                          }
                                        }

                                        // EXISTING ROW → required only if GST filled
                                        if (hasId && !value && gst) {
                                          return Promise.reject(
                                            new Error(
                                              "Delivery Address is required when GST is filled.",
                                            ),
                                          );
                                        }

                                        return Promise.resolve();
                                      },
                                    },
                                  ]}
                                  validateTrigger={["onBlur", "onSubmit"]}
                                >
                                  <Input.TextArea
                                    placeholder="Enter Delivery Address"
                                    rows={2}
                                    size="medium"
                                  />
                                </Form.Item>
                              </div>

                              {/* GST */}
                              <Form.Item
                                {...restField}
                                name={[name, "party_gstin"]}
                                rules={[
                                  {
                                    validator(_, value) {
                                      const address = form.getFieldValue([
                                        "subs",
                                        name,
                                        "party_delivery_address",
                                      ]);

                                      // NEW ROW → always required
                                      if (!hasId) {
                                        if (!value) {
                                          return Promise.reject(
                                            new Error("GST is required."),
                                          );
                                        }
                                      }

                                      // EXISTING ROW → required only if address filled
                                      if (hasId && !value && address) {
                                        return Promise.reject(
                                          new Error(
                                            "GST is required when Delivery Address is filled.",
                                          ),
                                        );
                                      }

                                      return Promise.resolve();
                                    },
                                  },
                                ]}
                                validateTrigger={["onBlur", "onSubmit"]}
                              >
                                <Input
                                  placeholder="Enter GST"
                                  maxLength={15}
                                  size="medium"
                                />
                              </Form.Item>

                              {/* Status Switch (only for edit mode & existing row) */}
                              {isEditMode && hasId && (
                                <Form.Item
                                  {...restField}
                                  name={[name, "party_status"]}
                                  valuePropName="checked"
                                >
                                  <Switch />
                                </Form.Item>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </Form.List>
          </Card>
        </Form>
      )}
    </>
  );
};

export default PartyForm;
