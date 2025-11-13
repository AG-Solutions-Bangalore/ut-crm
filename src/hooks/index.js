import dayjs from "dayjs";
import {
  ACTIVE_ITEM,
  ACTIVE_MILL,
  ACTIVE_PARTY,
  ACTIVE_SHADE,
  ACTIVE_UNIT,
  PAYMENT_MODE,
  PURCHASE_ORDER_REF,
  QUOTATION_REF,
  TAX_INVOICE_REF,
  TRADE_INVOICE_REF,
} from "../api/index";
import { useGetApiMutation } from "./useGetApiMutation";

export const useMasterData = ({
  mill = false,
  party = false,
  purchaseRef = false,
  quotationRef = false,
  shade = false,
  unit = false,
  item = false,
  taxinvoice = false,
  payment = false,
  tradeinvoiceRef = false,
} = {}) => {
  const formattedDateTime = dayjs().format("YYYY-MM-DD HH:mm:ss");

  const createApi = (condition, url, queryKey) =>
    condition
      ? useGetApiMutation({
          url,
          queryKey,
        })
      : { data: null, isLoading: false, refetch: () => {}, error: null };

  const {
    data: MillActiveData,
    isLoading: millLoading,
    refetch: refetchMill,
    error: millError,
  } = createApi(mill, ACTIVE_MILL, ["activemilldata"]);

  const {
    data: PartyActiveData,
    isLoading: partyLoading,
    refetch: refetchParty,
    error: partyError,
  } = createApi(party, ACTIVE_PARTY, ["activepartydata"]);

  const {
    data: PurchaseOrderRef,
    isLoading: poRefLoading,
    refetch: refetchRefNo,
    error: poRefError,
  } = createApi(purchaseRef, PURCHASE_ORDER_REF, [
    "purchaseorderrefdata",
    formattedDateTime,
  ]);

  const {
    data: QuotationOrderRef,
    isLoading: QuotationRefLoading,
    refetch: refetchQuotationRefNo,
    error: quotationError,
  } = createApi(quotationRef, QUOTATION_REF, [
    "quotationrefdata",
    formattedDateTime,
  ]);
  const {
    data: TradeInvoiceRef,
    isLoading: TradeInvoiceRefLoading,
    refetch: refetchTradeInvoiceRefNo,
    error: TradeInvoiceError,
  } = createApi(tradeinvoiceRef, TAX_INVOICE_REF, [
    "tradeinvoicerefdata",
    formattedDateTime,
  ]);
  const {
    data: TaxInvoiceRef,
    isLoading: TaxInvoiceRefLoading,
    refetch: refetchTaxInvoiceRefNo,
    error: TaxInvoiceError,
  } = createApi(tradeinvoiceRef, TRADE_INVOICE_REF, [
    "taxinvoicerefdata",
    formattedDateTime,
  ]);

  const {
    data: ShadeActiveData,
    isLoading: shadeLoading,
    refetch: refetchShade,
    error: shadeError,
  } = createApi(shade, ACTIVE_SHADE, ["activeshadedata"]);

  const {
    data: UnitActiveData,
    isLoading: unitLoading,
    refetch: refetchUnit,
    error: unitError,
  } = createApi(unit, ACTIVE_UNIT, ["activeunitdata"]);

  const {
    data: ItemActiveData,
    isLoading: itemLoading,
    refetch: refetchItem,
    error: itemError,
  } = createApi(item, ACTIVE_ITEM, ["activeitemdata"]);

  const {
    data: PaymentData,
    isLoading: paymentLoading,
    refetch: refetchPayment,
    error: paymentError,
  } = createApi(payment, PAYMENT_MODE, ["activepaymentdata"]);

  return {
    mill: {
      data: MillActiveData,
      loading: millLoading,
      refetch: refetchMill,
      error: millError,
    },
    party: {
      data: PartyActiveData,
      loading: partyLoading,
      refetch: refetchParty,
      error: partyError,
    },
    purchaseRef: {
      data: PurchaseOrderRef,
      loading: poRefLoading,
      refetch: refetchRefNo,
      error: poRefError,
    },
    quotationRef: {
      data: QuotationOrderRef,
      loading: QuotationRefLoading,
      refetch: refetchQuotationRefNo,
      error: quotationError,
    },
    shade: {
      data: ShadeActiveData,
      loading: shadeLoading,
      refetch: refetchShade,
      error: shadeError,
    },
    unit: {
      data: UnitActiveData,
      loading: unitLoading,
      refetch: refetchUnit,
      error: unitError,
    },
    item: {
      data: ItemActiveData,
      loading: itemLoading,
      refetch: refetchItem,
      error: itemError,
    },
    taxinvoice: {
      data: TaxInvoiceRef,
      loading: TaxInvoiceRefLoading,
      refetch: refetchTaxInvoiceRefNo,
      error: TaxInvoiceError,
    },
    tradeinvoice: {
      data: TradeInvoiceRef,
      loading: TradeInvoiceRefLoading,
      refetch: refetchTradeInvoiceRefNo,
      error: TradeInvoiceError,
    },
    payment: {
      data: PaymentData,
      loading: paymentLoading,
      refetch: refetchPayment,
      error: paymentError,
    },
  };
};
