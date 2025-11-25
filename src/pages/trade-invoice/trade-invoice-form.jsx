/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import {
  DeleteOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Select,
  Spin,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DELETE_QUOTATION_SUB,
  DELETE_TRADE_INVOICE_SUB,
  PURCHASE_ORDER_LIST,
  TRADE_INVOICE_LIST,
} from "../../api";
import { useMasterData } from "../../hooks";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useSelector } from "react-redux";
import useToken from "../../api/usetoken";
import axiosInstance from "../../api/axios";

const TradeInvoiceForm = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const company = useSelector((state) => state.company.companyDetails);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = useToken();
  const [initialData, setInitialData] = useState({
    trade_invoice_date: "",
    trade_invoice_ref: "",
    trade_invoice_party_id: null,
    trade_invoice_sgst: 0,
    trade_invoice_cgst: 0,
    trade_invoice_igst: 0,
    trade_invoice_discount: 0,
    trade_invoice_freight: 0,
    trade_invoice_insurance: 0,
    trade_invoice_hsn_code: "48043900",
    trade_invoice_ewaybill: "",
    trade_invoice_payment_terms: "",
    trade_invoice_remarks: "",
  });
  const { gsm, shade, unit, party, tradeinvoice, item } = useMasterData({
    party: true,
    item: true,
    gsm: true,
    shade: true,
    unit: true,
    tradeinvoice: true,
  });
  const unitOptions =
    unit?.data?.data?.map((item) => ({
      label: item.unit,
      value: item.unit,
    })) || [];
  const shadeOptions =
    shade?.data?.data?.map((item) => ({
      label: item.shade,
      value: item.shade,
    })) || [];
  const bfOptions =
    item?.data?.data?.map((item) => ({
      label: item.bf,
      value: item.bf,
    })) || [];
  const partyOptions =
    party?.data?.data?.map((item) => ({
      label: item.party_short,
      value: item.id,
      party_delivery_address: item.party_delivery_address,
      party_state: item.party_state,
    })) || [];

  const handlePartyChange = (id) => {
    const selectedParty = partyOptions.find((m) => m.value == id);

    if (!selectedParty) {
      form.setFieldsValue({
        trade_invoice_sgst: 0,
        trade_invoice_cgst: 0,
        trade_invoice_igst: 0,
      });

      return;
    }
    tradeinvoice.refetch();
    form.setFieldValue("trade_invoice_ref", tradeinvoice?.data?.data);

    const partyState = selectedParty.party_state?.toLowerCase() || "";
    const companyState = company?.company_state?.toLowerCase() || "";

    if (partyState === companyState) {
      form.setFieldsValue({
        trade_invoice_sgst: 9,
        trade_invoice_cgst: 9,
        trade_invoice_igst: 0,
      });
    } else {
      form.setFieldsValue({
        trade_invoice_sgst: 0,
        trade_invoice_cgst: 0,
        trade_invoice_igst: 18,
      });
    }
  };

  const fetchWithToken = async (url) => {
    const response = await axiosInstance.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  };


  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const { trigger: deleteTrigger } = useApiMutation();

  const fetchQuotation = async () => {
    try {
      const res = await fetchTrigger({
        url: `${TRADE_INVOICE_LIST}/${id}`,
      });
      if (res?.data) {
        const formattedData = {
          ...res.data,

          trade_invoice_date: res.data.trade_invoice_date
            ? dayjs(res.data.trade_invoice_date)
            : null,
        };
        setInitialData(formattedData);
        form.setFieldsValue(formattedData);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Failed to load tradeinvoice details.");
    }
  };

  useEffect(() => {
    if (id) fetchQuotation();
    else form.resetFields();
  }, [id]);

  const handleSubmit = async (values) => {
    try {
      const refetchResult = await tradeinvoice.refetch();
      const latestRef =
        refetchResult?.data?.data ||
        tradeinvoice?.data?.data ||
        initialData.trade_invoice_ref ||
        "";

      const payload = {
        ...values,
        trade_invoice_ref: latestRef,
        trade_invoice_date: values.trade_invoice_date
          ? dayjs(values.trade_invoice_date).format("YYYY-MM-DD")
          : null,

        subs: (values.subs || []).map((sub) => ({
          id: sub?.id || "",
          trade_invoice_sub_description:
            sub?.trade_invoice_sub_description || "",
          trade_invoice_sub_gsm: sub?.trade_invoice_sub_gsm || "",
          trade_invoice_sub_bf: sub?.trade_invoice_sub_bf || "",
          trade_invoice_sub_size: sub?.trade_invoice_sub_size || "",
          trade_invoice_sub_shade: sub?.trade_invoice_sub_shade || "",
          trade_invoice_sub_unit: sub?.trade_invoice_sub_unit || "",
          trade_invoice_sub_reel: sub?.trade_invoice_sub_reel || "",
          trade_invoice_sub_qnty: sub?.trade_invoice_sub_qnty || "",
          trade_invoice_sub_rate: sub?.trade_invoice_sub_rate || "",
        })),
      };

      const res = await submitTrigger({
        url: isEditMode ? `${TRADE_INVOICE_LIST}/${id}` : TRADE_INVOICE_LIST,
        method: isEditMode ? "put" : "post",
        data: payload,
      });

      if (res.code === 201) {
        message.success(res.message || "Trade invoice saved successfully!");
        await queryClient.invalidateQueries({ queryKey: ["tradeinvoicedata"] });
        navigate("/trade-invoice");
      } else {
        message.error(res.message || "Failed to save trade invoice.");
      }
    } catch (error) {
      console.error(error);
      message.error(error?.message || "Error while saving trade invoice.");
    }
  };

  const handleDelete = async (subId) => {
    if (!subId) {
      message.error("Invalid sub-item ID.");
      return;
    }

    try {
      const res = await deleteTrigger({
        url: `${DELETE_TRADE_INVOICE_SUB}/${subId}`,
        method: "delete",
      });

      if (res?.code === 201) {
        message.success(res?.message || "Sub-item deleted successfully!");
        if (id) fetchQuotation();
      } else {
        message.error(res?.message || "Failed to delete sub-item.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      message.error(error?.message || "Error while deleting sub-item.");
    }
  };

  const loading = fetchLoading || party?.loading;

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
                {" "}
                {isEditMode ? "Update Trade Invoice" : "Create  Trade Invoice"}
              </h2>
            }
            extra={
              <div className="flex items-center">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitLoading}
                >
                  {isEditMode
                    ? "Update Trade Invoice"
                    : "Create  Trade Invoice"}
                </Button>
              </div>
            }
            variant="borderless"
          >
            {/* First Row - Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 ">
              <Form.Item
                label={
                  <span>
                    Party <span className="text-red-500">*</span>
                  </span>
                }
                name="trade_invoice_party_id"
                rules={[{ required: true, message: "Select party" }]}
              >
                <Select
                  placeholder="Select Party"
                  options={partyOptions}
                  onChange={handlePartyChange}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  showSearch
                  allowClear
                />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    Invoice Date <span className="text-red-500">*</span>
                  </span>
                }
                name="trade_invoice_date"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker className="w-full" format="DD-MM-YYYY" />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    Invoice Ref No <span className="text-red-500">*</span>
                  </span>
                }
                name="trade_invoice_ref"
                rules={[{ required: true, message: "Enter reference number" }]}
              >
                <Input placeholder="Auto-generated" readOnly />
              </Form.Item>
              <div className="grid grid-cols-3 gap-0 ">
                <Form.Item label="SGST(%)" name="trade_invoice_sgst">
                  <Input type="number" placeholder="SGST" />
                </Form.Item>

                <Form.Item label="CGST(%)" name="trade_invoice_cgst">
                  <Input type="number" placeholder="CGST" />
                </Form.Item>

                <Form.Item label="IGST(%)" name="trade_invoice_igst">
                  <Input type="number" placeholder="IGST" />
                </Form.Item>
              </div>
            </div>

            {/* Second Row - GST */}

            {/* Third Row - Discount, Freight, Insurance, HSN, E-Way Bill */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Form.Item label="Discount" name="trade_invoice_discount">
                <Input type="number" placeholder="0" />
              </Form.Item>

              <Form.Item label="Freight" name="trade_invoice_freight">
                <Input type="number" placeholder="0" />
              </Form.Item>

              <Form.Item label="Insurance" name="trade_invoice_insurance">
                <Input type="number" placeholder="0" />
              </Form.Item>

              <Form.Item label="HSN Code" name="trade_invoice_hsn_code">
                <Input placeholder="48043900" readOnly />
              </Form.Item>

              <Form.Item label="E-Way Bill" name="trade_invoice_ewaybill">
                <Input placeholder="E-Way Bill" />
              </Form.Item>
            </div>

            {/* Fourth Row - Payment Terms and Remarks */}
            <div className="flex flex-col md:flex-row gap-2 ">
              <div className="flex-1">
                <Form.Item
                  label="Payment Terms"
                  name="trade_invoice_payment_terms"
                >
                  <Input.TextArea placeholder="Payment Terms" rows={2} />
                </Form.Item>
              </div>
              <div className="flex-1">
                <Form.Item label="Remarks" name="trade_invoice_remarks">
                  <Input.TextArea placeholder="Remarks" rows={2} />
                </Form.Item>
              </div>
            </div>

            <Card size="small" className="bg-gray-50 my-4">
              <Form.List
                name="subs"
                initialValue={[{}]}
                rules={[
                  {
                    validator: async (_, subs) => {
                      if (!subs || subs.length < 1)
                        return Promise.reject(
                          new Error("Please add at least one sub item.")
                        );

                      const hasAnyFilledRow = subs.some((row) =>
                        Object.values(row || {}).some(
                          (val) => val !== undefined && val !== ""
                        )
                      );

                      if (!hasAnyFilledRow)
                        return Promise.reject(
                          new Error(
                            "Please fill at least one sub item before submitting."
                          )
                        );

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    <div className="flex justify-between mb-2">
                      <div className="font-semibold text-lg mb-2">
                        Item Details
                      </div>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                      >
                        Add Item
                      </Button>
                    </div>
                    {fields.map(({ key, name, ...restField }) => {
                      const subItem = form.getFieldValue(["subs", name]);
                      const hasId = subItem?.id;
                      return (
                        <div
                          key={key}
                          size="small"
                          className="!mb-3 bg-white  relative"
                        >
                          {fields.length > 1 &&
                            (hasId ? (
                              <Popconfirm
                                title="Are you sure you want to delete this sub-item?"
                                onConfirm={() => handleDelete(subItem?.id)}
                                okText="Yes"
                                cancelText="No"
                              >
                                <button
                                  type="button"
                                  className="absolute z-10 right-2  p-1 rounded-md hover:cursor-pointer bg-red-100"
                                >
                                  <DeleteOutlined className="!text-red-400 " />
                                </button>
                              </Popconfirm>
                            ) : (
                              <button
                                type="button"
                                className="absolute z-10 right-2  p-1 rounded-md hover:cursor-pointer bg-red-100"
                                onClick={() => remove(name)}
                              >
                                <MinusCircleOutlined className="!text-red-400 " />
                              </button>
                            ))}

                          {/* All 9 sub-table fields in one compact row using grid */}
                          <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-9 gap-2 mt-2">
                            <Form.Item
                              {...restField}
                              name={[name, "trade_invoice_sub_description"]}
                              label="Desc"
                              className="mb-0"
                            >
                              <Input placeholder="Description" size="medium" />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "trade_invoice_sub_gsm"]}
                              label="GSM"
                              className="mb-0"
                            >
                              <Select
                                placeholder="GSM"
                                options={gsm?.data?.data?.map((item) => ({
                                  label: item.gsm,
                                  value: item.gsm,
                                }))}
                                size="medium"
                                showSearch
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "trade_invoice_sub_bf"]}
                              label="BF"
                              className="mb-0"
                            >
                              <Select
                                placeholder="BF"
                                options={bfOptions}
                                size="medium"
                                showSearch
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "trade_invoice_sub_size"]}
                              label="Size"
                              className="mb-0"
                            >
                              <Input placeholder="Size" size="medium" />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "trade_invoice_sub_shade"]}
                              label="Shade"
                              className="mb-0"
                            >
                              <Select
                                placeholder="Shade"
                                options={shadeOptions}
                                size="medium"
                                showSearch
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "trade_invoice_sub_unit"]}
                              label="Unit"
                              className="mb-0"
                            >
                              <Select
                                placeholder="Unit"
                                options={unitOptions}
                                size="medium"
                                showSearch
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "trade_invoice_sub_reel"]}
                              label="Reel"
                              className="mb-0"
                            >
                              <Input
                                type="number"
                                placeholder="Reel"
                                size="medium"
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "trade_invoice_sub_qnty"]}
                              label="Qty"
                              className="mb-0"
                            >
                              <Input
                                type="number"
                                placeholder="Qty"
                                size="medium"
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "trade_invoice_sub_rate"]}
                              label="Rate"
                              className="mb-0"
                            >
                              <Input
                                type="number"
                                placeholder="Rate"
                                size="medium"
                              />
                            </Form.Item>
                          </div>
                        </div>
                      );
                    })}
                    {errors.length > 0 && (
                      <div className="text-red-500 text-sm mt-2">
                        {errors[0]}
                      </div>
                    )}
                  </>
                )}
              </Form.List>
            </Card>
          </Card>
        </Form>
      )}
    </>
  );
};

export default TradeInvoiceForm;
