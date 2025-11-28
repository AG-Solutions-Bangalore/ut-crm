import { App, Button, Form, Input, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { ITEM_LIST } from "../../../api";
import { useApiMutation } from "../../../hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

const ItemForm = ({ id, onSuccess }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const isEditMode = Boolean(id);
  const [initialData, setInitialData] = useState({});
  const queryClient = useQueryClient();

  const resetForm = () => form.resetFields();

  const fetchItem = async () => {
    try {
      const res = await fetchTrigger({ url: `${ITEM_LIST}/${id}` });
      if (res?.data) {
        const formattedData = {
          ...res.data,
          bf_status: res.data.bf_status == "Active",
        };
        setInitialData(formattedData);
        form.setFieldsValue(formattedData);
      }
    } catch (err) {
      message.error("Failed to load Item details.");
    }
  };

  useEffect(() => {
    if (id) {
      fetchItem();
    } else {
      resetForm();
    }
  }, [id]);

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      bf_status: values?.bf_status ? "Active" : "Inactive",
    };

    try {
      const res = await submitTrigger({
        url: isEditMode ? `${ITEM_LIST}/${id}` : ITEM_LIST,
        method: isEditMode ? "put" : "post",
        data: payload,
      });

      if (res.code === 201) {
        message.success(res.message || "Item saved successfully!");
        onSuccess?.();
        form.resetFields();
        await queryClient.invalidateQueries({
          queryKey: ["activeitemdata"],
          exact: false,
        });
      } else {
        message.error(res.message || "Failed to save Item.");
      }
    } catch {
      message.error("Something went wrong while saving Item.");
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialData}
      requiredMark={false}
    >
      <Form.Item
        name="bf"
        label={
          <span>
            Item <span className="text-red-500">*</span>
          </span>
        }
        rules={[{ required: true, message: "Item name is required" }]}
      >
        <Input maxLength={50} placeholder="Enter Item" autoFocus />
      </Form.Item>

      {isEditMode && (
        <Form.Item
          name="bf_status"
          label="Status"
          rules={[{ required: true, message: "Please select status" }]}
        >
          <Select
            options={[
              { label: "Active", value: true },
              { label: "Inactive", value: false },
            ]}
            placeholder="Select Status"
          />
        </Form.Item>
      )}

      <div className="text-center mt-3">
        <Button
          type="primary"
          htmlType="submit"
          loading={submitLoading}
          className="w-full"
        >
          {isEditMode ? "Update" : "Create"}
        </Button>
      </div>
    </Form>
  );
};

export default ItemForm;
