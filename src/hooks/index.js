import dayjs from "dayjs";
import { useGetApiMutation } from "./useGetApiMutation";
import { ACTIVE_MILL, ACTIVE_PARTY, PURCHASE_ORDER_REF } from "../api";
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
    url: `${PURCHASE_ORDER_REF}?date=${formattedDateTime}`,
    queryKey: ["purchaseorderrefdata", formattedDateTime],
  });

  return {
    MillActiveData,
    millLoading,
    refetchMill,
    PartyActiveData,
    partyLoading,
    refetchParty,
    PurchaseOrderRef,
    poRefLoading,
    refetchRefNo,
  };
};
