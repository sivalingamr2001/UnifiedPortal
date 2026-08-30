import type { PesConsolidatedData, PesItemDetailedRow, PesComponentDetails } from "../../api/pesApi";

export interface ItemDetailsPageProps {
  item: PesConsolidatedData;
  itemDetails: PesItemDetailedRow[];
  componentDetails: PesComponentDetails[];
  loading?: boolean;
  error?: string | null;
  onBack: () => void;
}

export interface DetailHeaderProps {
  orderedItem: string;
  description: string;
  isAms1: boolean;
  isConstrained: boolean;
  onBack: () => void;
}

export interface MetricSummaryCardsProps {
  reqQty: number;
  exceptionQty: number;
  isConstrained: boolean;
  viewMode?: "action" | "all";
  variant: "top-compact" | "bottom-summary";
}

export interface SalesOrderBreakupTableProps {
  itemDetails: PesItemDetailedRow[];
  customerCategory: string;
  orderedItem: string;
  itemDescription: string;
  summaryCount: number;
  viewMode: "action" | "all";
  setViewMode: (mode: "action" | "all") => void;
  checkedRows: Set<string>;
  toggleRowChecked: (key: string) => void;
  custodianMonthByRow: Record<string, string>;
  setRowCustodianMonth: (key: string, month: string) => void;
  monthsList: readonly [string, string];
  selectedMonth: string;
  handleRowSubmission: () => void;
  clearSelection: () => void;
  setCombinedComponentDetails: React.Dispatch<React.SetStateAction<PesComponentDetails[]>>;
  setComponentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ComponentPeggingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orderedItem: string;
  LineId: number;
}
