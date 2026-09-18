import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  fetchComplaints, 
  setFilter 
} from '../store/slices/complaintsSlice';
import useDebounce from '../hooks/useDebounce';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Badge from '../components/common/Badge';
import { 
  Search, 
  Filter, 
  Download, 
  PlusCircle, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  FileSpreadsheet,
  Calendar,
  Layers
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'OPEN', label: 'Open' },
  { value: 'UNDER_INVESTIGATION', label: 'Under Investigation' },
  { value: 'CAPA_PENDING', label: 'CAPA Pending' },
  { value: 'CLOSED', label: 'Closed & Verified' }
];

const CRITICALITY_OPTIONS = [
  { value: '', label: 'All Criticalities' },
  { value: 'CRITICAL', label: 'Critical (Class I)' },
  { value: 'MAJOR', label: 'Major (Class II)' },
  { value: 'MINOR', label: 'Minor (Class III)' }
];

const SEVERITY_OPTIONS = [
  { value: '', label: 'All Severities' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' }
];

export default function ComplaintHistoryPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { complaints, totalComplaints, page, limit, filters, loading } = useSelector(
    (state) => state.complaints
  );

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    dispatch(setFilter({ search: debouncedSearch, page: 1 }));
    dispatch(fetchComplaints({ ...filters, search: debouncedSearch, page: 1, limit }));
  }, [debouncedSearch, dispatch, limit]);

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value, page: 1 };
    dispatch(setFilter(updatedFilters));
    dispatch(fetchComplaints(updatedFilters));
  };

  const handlePageChange = (newPage) => {
    const updatedFilters = { ...filters, page: newPage, limit };
    dispatch(setFilter(updatedFilters));
    dispatch(fetchComplaints(updatedFilters));
  };

  const handleExportCSV = () => {
    if (!complaints || complaints.length === 0) return;

    const headers = [
      'Complaint ID',
      'Product Name',
      'Batch Number',
      'Dosage Form',
      'Complaint Type',
      'Criticality',
      'Severity',
      'Status',
      'Created At'
    ];

    const rows = complaints.map((c) => [
      `"${c.complaint_id || ''}"`,
      `"${c.product_name || ''}"`,
      `"${c.batch_number || ''}"`,
      `"${c.dosage_form || ''}"`,
      `"${c.complaint_type || ''}"`,
      `"${c.criticality || ''}"`,
      `"${c.severity || ''}"`,
      `"${c.status || ''}"`,
      `"${c.created_at || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `QMS_Complaints_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil((totalComplaints || complaints.length) / limit) || 1;

  return (
    <PageContainer
      title="Customer Complaint Register"
      subtitle="Complete chronological register of pharmaceutical quality events, investigations, and regulatory status per 21 CFR 211.198."
      badge={
        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
          {totalComplaints || complaints.length} Records
        </span>
      }
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={FileSpreadsheet}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/intake')}
            icon={PlusCircle}
          >
            New Intake
          </Button>
        </div>
      }
    >
      {/* Search & Filter Controls */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search product, batch, or ID..."
              className="pl-9 text-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Status Filter */}
          <div>
            <Select
              options={STATUS_OPTIONS}
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Criticality Filter */}
          <div>
            <Select
              options={CRITICALITY_OPTIONS}
              value={filters.criticality || ''}
              onChange={(e) => handleFilterChange('criticality', e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Severity Filter */}
          <div>
            <Select
              options={SEVERITY_OPTIONS}
              value={filters.severity || ''}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Complaints Table */}
      <Card>
        <div className="overflow-x-auto -mx-6 -my-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Complaint ID</th>
                <th className="py-3 px-4">Product Name & Type</th>
                <th className="py-3 px-4">Batch / Lot</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Risk Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Logged Date</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 rounded-full border-2 border-pharma-200 border-t-pharma-600 animate-spin mx-auto mb-2"></div>
                    <span>Loading QMS records...</span>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No complaints match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-pharma-700">
                      <Link to={`/complaints/${c.id}`} className="hover:underline">
                        {c.complaint_id}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{c.product_name}</div>
                      <div className="text-[11px] text-slate-500">{c.manufacturing_type || 'General Formulation'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {c.batch_number || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {c.complaint_type}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={
                          c.criticality === 'CRITICAL' ? 'danger' :
                          c.criticality === 'MAJOR' ? 'warning' : 'default'
                        }>
                          {c.criticality || 'PENDING'}
                        </Badge>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {c.severity}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={
                        c.status === 'CLOSED' ? 'success' :
                        c.status === 'UNDER_INVESTIGATION' ? 'warning' :
                        c.status === 'CAPA_PENDING' ? 'primary' : 'info'
                      }>
                        {c.status?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/complaints/${c.id}`}
                        className="inline-flex items-center justify-center text-xs font-semibold text-pharma-700 hover:text-pharma-900 bg-pharma-50 hover:bg-pharma-100 border border-pharma-200 px-3 py-1 rounded transition-colors"
                      >
                        Inspect Record
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing Page <span className="font-semibold">{page}</span> of{' '}
            <span className="font-semibold">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              icon={ChevronLeft}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              icon={ChevronRight}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
