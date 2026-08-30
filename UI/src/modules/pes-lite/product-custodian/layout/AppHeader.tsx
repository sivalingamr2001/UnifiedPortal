import { PESLOGO } from "@/lib/utils";
import { Box, Clock, House, Layers, RefreshCcw, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AppHeader = () => {
  const navigate = useNavigate();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="flex h-[43px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-2 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          className="flex shrink-0 items-center gap-1 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
          title="Home"
          onClick={() => navigate("/")}
        >
          <House className="h-4 w-4" />
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <div>
            <div className="text-base leading-tight font-black tracking-tight text-blue-700 mt-2">
              <img src={PESLOGO} alt="PESLITE" className="h-8" />
            </div>
          </div>
        </div>
        <div className="mx-1 h-8 w-px bg-slate-200"></div>
        <nav className="flex items-center gap-1">
          <button
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgb(20, 96, 170), rgb(26, 128, 217))",
            }}
          >
            <Layers className="h-4 w-4" />
            Items
          </button>
          <button className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-slate-500 transition-all hover:bg-blue-50 hover:text-blue-600">
            <Users className="h-4 w-4" />
            Customers &amp; Dealers
          </button>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-400 lg:flex">
          <Clock className="h-4 w-4" />
          {currentDate}
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full border border-[#AFF2D7] px-2.5 py-1 text-[10px] font-bold"
          style={{
            background: "#D1FAE5",
          }}
        >
          <Box className="h-4 w-4" />
          Product Custodian
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[#058A62] px-3 py-1.5 text-[11px] font-semibold text-white">
          <Users className="h-4 w-4" />
          Marketing Ops
        </div>
        <button className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
          <RefreshCcw className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
