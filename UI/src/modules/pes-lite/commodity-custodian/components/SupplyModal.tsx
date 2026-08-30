import { commodityApi, type AllSupplyData, type JobPendingSupplyData, type PendingPOSupplyData, type POInReceivingSupplyData } from '../api/commodityApi';
import { useEffect, useState } from 'react';

interface SupplyModalProps {
  open: boolean;
  organizationId: number | null;
  itemNo: string | null;
  onClose: () => void;
}

export default function SupplyModal({ open, organizationId, itemNo, onClose }: SupplyModalProps) {
  const [allSupply, setAllSupply] = useState<AllSupplyData[] | null>(null);
  const [pendingPO, setPendingPO] = useState<PendingPOSupplyData[] | null>(null);
  const [poInReceiving, setPoInReceiving] = useState<POInReceivingSupplyData[] | null>(null);
  const [jobPending, setJobPending] = useState<JobPendingSupplyData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || organizationId == null || !itemNo) return;
    let mounted = true;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [a, p, r, j] = await Promise.all([
          commodityApi.getAllSupply(organizationId, itemNo),
          commodityApi.getPendingPOSupply(organizationId, itemNo),
          commodityApi.getPOInReceivingSupply(organizationId, itemNo),
          commodityApi.getJobPendingSupply(organizationId, itemNo),
        ]);
        if (!mounted) return;
        setAllSupply(a.data || []);
        setPendingPO(p.data || []);
        setPoInReceiving(r.data || []);
        setJobPending(j.data || []);
      } catch (err) {
        console.error('Error fetching supply data', err);
        if (mounted) setError('Failed to load supply data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAll();
    return () => { mounted = false; };
  }, [open, organizationId, itemNo]);

  if (!open) return null;

  const totals = {
    onhand: (allSupply || []).reduce((s, r) => s + (r.ONHAND || 0), 0),
    po_pending: (allSupply || []).reduce((s, r) => s + (r.PO_PENDING || 0), 0),
    po_in_receiving: (allSupply || []).reduce((s, r) => s + (r.PO_IN_RECEIVING || 0), 0),
    job_pending: (allSupply || []).reduce((s, r) => s + (r.JOB_PENDING || 0), 0),
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4">
      <div className="bg-white w-full max-w-full h-[95vh] overflow-auto rounded-md shadow-lg">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-start flex-col">
            <div className="text-sm font-bold">Supply Details — {itemNo}</div>
            <div className="text-xs text-slate-500">Organization: {organizationId}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-xs px-3 py-1 rounded bg-slate-100" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="p-4">
          {loading && <div className="text-xs text-slate-500">Loading supply information...</div>}
          {error && <div className="text-xs text-red-600">{error}</div>}

          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-white border rounded p-3 text-center">
              <div className="text-xs text-slate-400">On Hand</div>
              <div className="text-lg font-bold">{totals.onhand}</div>
            </div>
            <div className="bg-white border rounded p-3 text-center">
              <div className="text-xs text-slate-400">PO Pending</div>
              <div className="text-lg font-bold">{totals.po_pending}</div>
            </div>
            <div className="bg-white border rounded p-3 text-center">
              <div className="text-xs text-slate-400">PO In Receiving</div>
              <div className="text-lg font-bold">{totals.po_in_receiving}</div>
            </div>
            <div className="bg-white border rounded p-3 text-center">
              <div className="text-xs text-slate-400">Job Pending</div>
              <div className="text-lg font-bold">{totals.job_pending}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm font-semibold mb-2">Pending PO Supply</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="p-2">PONO</th>
                    <th className="p-2">PODT</th>
                    <th className="p-2">Need By</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Supplier</th>
                    <th className="p-2">CFD Open</th>
                  </tr>
                </thead>
                <tbody>
                  {(pendingPO || []).map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{r.PONO}</td>
                      <td className="p-2">{r.PODT}</td>
                      <td className="p-2">{r.NEED_BY_DATE}</td>
                      <td className="p-2">{r.PO_PENDING}</td>
                      <td className="p-2">{r.SUPPLIER}</td>
                      <td className="p-2">{r.CFD_OPEN}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm font-semibold mb-2">PO In Receiving</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="p-2">PONO</th>
                    <th className="p-2">PODT</th>
                    <th className="p-2">Need By</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {(poInReceiving || []).map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{r.PONO}</td>
                      <td className="p-2">{r.PODT}</td>
                      <td className="p-2">{r.NEED_BY_DATE}</td>
                      <td className="p-2">{r.PO_IN_REC_QTY}</td>
                      <td className="p-2">{r.SUPPLIER}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm font-semibold mb-2">Job Pending</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="p-2">JOB NO</th>
                    <th className="p-2">JOB DT</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">PONO</th>
                    {/* <th className="p-2">PODT</th> */}
                    <th className="p-2">Need By</th>
                    <th className="p-2">Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {(jobPending || []).map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{r.JOB_NO}</td>
                      <td className="p-2">{r.JOB_DT}</td>
                      <td className="p-2">{r.JOB_PENDING}</td>
                      <td className="p-2">{r.PONO}</td>
                      <td className="p-2">{r.NEED_BY_DATE}</td>
                      <td className="p-2">{r.SUPPLIER}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
