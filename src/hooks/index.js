import dayjs from "dayjs";
import { useGetApiMutation } from "./useGetApiMutation";
import {
  ACTIVE_MILL,
  ACTIVE_PARTY,
  PURCHASE_ORDER_REF,
  ACTIVE_SHADE,
  ACTIVE_UNIT,
  ACTIVE_ITEM,
  QUOTATION_REF,
} from "../api/index";

export const useMasterData = () => {
  const formattedDateTime = dayjs().format("YYYY-MM-DD HH:mm:ss");

  const {
    data: MillActiveData,
    isLoading: millLoading,
    refetch: refetchMill,
  } = useGetApiMutation({
    url: ACTIVE_MILL,
    queryKey: ["activemilldata"],
  });

  const {
    data: PartyActiveData,
    isLoading: partyLoading,
    refetch: refetchParty,
  } = useGetApiMutation({
    url: ACTIVE_PARTY,
    queryKey: ["activepartydata"],
  });

  const {
    data: PurchaseOrderRef,
    isLoading: poRefLoading,
    refetch: refetchRefNo,
  } = useGetApiMutation({
    url: PURCHASE_ORDER_REF,
    queryKey: ["purchaseorderrefdata", formattedDateTime],
  });
  const {
    data: QuotationOrderRef,
    isLoading: QuotationRefLoading,
    refetch: refetchQuotationRefNo,
  } = useGetApiMutation({
    url: QUOTATION_REF,
    queryKey: ["quotationrefdata", formattedDateTime],
  });

  const {
    data: ShadeActiveData,
    isLoading: shadeLoading,
    refetch: refetchShade,
  } = useGetApiMutation({
    url: ACTIVE_SHADE,
    queryKey: ["activeshadedata"],
  });

  const {
    data: UnitActiveData,
    isLoading: unitLoading,
    refetch: refetchUnit,
  } = useGetApiMutation({
    url: ACTIVE_UNIT,
    queryKey: ["activeunitdata"],
  });

  const {
    data: ItemActiveData,
    isLoading: itemLoading,
    refetch: refetchItem,
  } = useGetApiMutation({
    url: ACTIVE_ITEM,
    queryKey: ["activeitemdata"],
  });

  return {
    mill: { data: MillActiveData, loading: millLoading, refetch: refetchMill },
    party: {
      data: PartyActiveData,
      loading: partyLoading,
      refetch: refetchParty,
    },
    purchaseRef: {
      data: PurchaseOrderRef,
      loading: poRefLoading,
      refetch: refetchRefNo,
    },
    quotationRef: {
      data: QuotationOrderRef,
      loading: QuotationRefLoading,
      refetch: refetchQuotationRefNo,
    },
    shade: {
      data: ShadeActiveData,
      loading: shadeLoading,
      refetch: refetchShade,
    },
    unit: { data: UnitActiveData, loading: unitLoading, refetch: refetchUnit },
    item: { data: ItemActiveData, loading: itemLoading, refetch: refetchItem },
  };
};
