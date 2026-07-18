import { useState, useEffect } from "react";
import {
  DndContext, 
  closestCenter, 
  PointerSensor,
  useSensor, 
  useSensors, 
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, 
  useSortable, 
  arrayMove, 
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import JournalCharts from "./JournalCharts";

// ── Card ID definitions ───────────────────────────────────────────────────────
export type CardId =
  | "cumulative-pnl"
  | "net-daily-pnl"
  | "account-balance"
  | "trades"
  | "drawdown"
  | "trade-duration"
  | "calendar";

const CARD_SPANS: Record<CardId, 1 | 2> = {
  "cumulative-pnl": 1,
  "net-daily-pnl": 1,
  "account-balance": 1,
  "trades": 1,
  "drawdown": 1,
  "trade-duration": 1,
  "calendar": 2,
};

const CARD_LABELS: Record<CardId, string> = {
  "cumulative-pnl": "Cumulative P&L",
  "net-daily-pnl": "Net Daily P&L",
  "account-balance": "Account Balance",
  "trades": "Trades",
  "drawdown": "Drawdown",
  "trade-duration": "Duration Performance",
  "calendar": "Trading Calendar",
};

// ── Sortable card shell ───────────────────────────────────────────────────────
function SortableCard({
  id,
  isEditMode,
  children,
}: {
  id: CardId;
  isEditMode: boolean;
  children: React.ReactNode;
}) {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${CARD_SPANS[id]}`,
    gridRow: id === "calendar" ? "span 2" : "span 1",
    opacity: isDragging ? 0.3 : 1,
    position: "relative",
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="h-full group">
      <div 
        className="h-full w-full relative"
        {...(isEditMode ? { ...attributes, ...listeners } : {})}
      >
        {isEditMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full text-[10px] font-bold shadow-lg border border-emerald-400/30 animate-bounce-subtle">
            <GripVertical size={12} />
            {CARD_LABELS[id]}
          </div>
        )}
        
        <div className={`h-full ${isEditMode ? "ring-2 ring-emerald-500/50 ring-offset-2 rounded-[24px] pointer-events-none" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Main grid ─────────────────────────────────────────────────────────────────
export default function JournalGrid({ isEditMode }: { isEditMode: boolean }) {
  const [order, setOrder] = useState<CardId[]>(() => {
    try {
      const saved = localStorage.getItem("fialgo_journal_grid_order");
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [
      "cumulative-pnl",
      "net-daily-pnl",
      "account-balance",
      "drawdown",
      "calendar",
      "trade-duration",
    ];
  });

  useEffect(() => {
    localStorage.setItem("fialgo_journal_grid_order", JSON.stringify(order));
  }, [order]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrder((items) => {
        const oldIndex = items.indexOf(active.id as CardId);
        const newIndex = items.indexOf(over.id as CardId);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={order} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[300px] md:auto-rows-[408px] gap-4 md:gap-6">
          {order.map((id) => (
            <SortableCard key={id} id={id} isEditMode={isEditMode}>
              <JournalCharts cardId={id} />
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

