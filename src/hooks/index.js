import {
  ACTIVE_DECKLE,
  ACTIVE_DELIVERY,
  ACTIVE_GSM,
  ACTIVE_ITEM,
  ACTIVE_MILL,
  ACTIVE_PARTY,
  ACTIVE_SHADE,
  ACTIVE_SUBJECT,
  ACTIVE_UNIT,
  GET_MONTHS,
  PAYMENT_MODE,
  PURCHASE_ORDER_REF,
  QUOTATION_REF,
  STATE_LIST,
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
  tradeinvoice = false,
  deckle = false,
  subject = false,
  gsm = false,
  delivery = false,
  state = false,
  months = false,
  // purchaseorderref = false,
} = {}) => {
  // const formattedDateTime = dayjs().format("YYYY-MM-DD HH:mm:ss");

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
    // formattedDateTime,
  ]);

  const {
    data: QuotationOrderRef,
    isLoading: QuotationRefLoading,
    refetch: refetchQuotationRefNo,
    error: quotationError,
  } = createApi(quotationRef, QUOTATION_REF, [
    "quotationrefdata",
    // formattedDateTime,
  ]);
  const {
    data: TradeInvoiceRef,
    isLoading: TradeInvoiceRefLoading,
    refetch: refetchTradeInvoiceRefNo,
    error: TradeInvoiceError,
  } = createApi(tradeinvoice, TRADE_INVOICE_REF, [
    "tradeinvoicerefdata",
    // formattedDateTime,
  ]);
  const {
    data: TaxInvoiceRef,
    isLoading: TaxInvoiceRefLoading,
    refetch: refetchTaxInvoiceRefNo,
    error: TaxInvoiceError,
  } = createApi(taxinvoice, TAX_INVOICE_REF, [
    "taxinvoicerefdata",
    // formattedDateTime,
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
  const {
    data: DeckleData,
    isLoading: deckleLoading,
    refetch: refetchDeckle,
    error: deckleError,
  } = createApi(deckle, ACTIVE_DECKLE, ["activedeckledata"]);
  const {
    data: SubjectData,
    isLoading: subjectLoading,
    refetch: refetchSubject,
    error: subjectError,
  } = createApi(subject, ACTIVE_SUBJECT, ["activesubjectdata"]);
  const {
    data: GsmData,
    isLoading: gsmLoading,
    refetch: refetchGsm,
    error: gsmError,
  } = createApi(gsm, ACTIVE_GSM, ["activegsmdata"]);
  const {
    data: DeliveryData,
    isLoading: deliveryLoading,
    refetch: refetchDelivery,
    error: deliveryError,
  } = createApi(delivery, ACTIVE_DELIVERY, ["activedeliverydata"]);
  const {
    data: StateData,
    isLoading: stateLoading,
    refetch: refetchState,
    error: stateError,
  } = createApi(state, STATE_LIST, ["statedata"]);
  const {
    data: MonthData,
    isLoading: MonthLoading,
    refetch: refetchMonth,
    error: stateMonth,
  } = createApi(months, GET_MONTHS, ["months"]);

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
    deckle: {
      data: DeckleData,
      loading: deckleLoading,
      refetch: refetchDeckle,
      error: deckleError,
    },
    subject: {
      data: SubjectData,
      loading: subjectLoading,
      refetch: refetchSubject,
      error: subjectError,
    },
    gsm: {
      data: GsmData,
      loading: gsmLoading,
      refetch: refetchGsm,
      error: gsmError,
    },
    delivery: {
      data: DeliveryData,
      loading: deliveryLoading,
      refetch: refetchDelivery,
      error: deliveryError,
    },

    state: {
      data: StateData,
      loading: stateLoading,
      refetch: refetchState,
      error: stateError,
    },

    months: {
      data: MonthData,
      loading: MonthLoading,
      refetch: refetchMonth,
      error: stateMonth,
    },
    // purchaseorderref: {
    //   data: ActivePurchaseOrderRef,
    //   loading: activepoRefLoading,
    //   refetch: refetchPoRefNo,
    //   error: ActivepoRefError,
    // },
  };
};
