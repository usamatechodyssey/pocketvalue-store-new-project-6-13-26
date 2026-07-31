"use client";

import { useState, useTransition } from "react";
import {
  StaffUser,
  updateStaffRole,
  removeStaffMember,
} from "@/app/features/admin/order-fulfillment/actions/payloadAdminActions";
import {
  UserPlus,
  Shield,
  Edit2,
  Trash2,
  Mail,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import AddStaffModal from "./AddStaffModal";
import UpdateRoleModal from "./UpdateRoleModal";

const getRoleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "manager":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "editor":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
};

export default function StaffListClient({
  initialStaff,
}: {
  initialStaff: StaffUser[];
}) {
  const [staff, setStaff] = useState<StaffUser[]>(initialStaff);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRemove = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${name}?`)) return;
    startTransition(async () => {
      const res = await removeStaffMember(id);
      if (res.success) {
        setStaff((prev) => prev.filter((s) => s.id !== id));
        toast.success(res.message);
      } else toast.error(res.message);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black dark:text-white uppercase tracking-tighter">
          Current Operational Staff
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-brand-primary/20 transition-all"
        >
          <UserPlus size={18} /> Add Staff Member
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-4xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50 dark:bg-white/5 text-gray-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="p-5 text-left">Staff Identity</th>
                <th className="p-5 text-left">Role Access</th>
                <th className="p-5 text-left">Onboarded</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {staff.map((s) => (
                <tr
                  key={s.id}
                  className="group hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black border border-brand-primary/20">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold dark:text-white">{s.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail size={10} /> {s.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getRoleBadge(s.role)}`}
                    >
                      {s.role}
                    </span>
                  </td>
                  <td className="p-5 text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />{" "}
                      {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingStaff(s)}
                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-brand-primary transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleRemove(s.id, s.name)}
                        className="p-2.5 rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={() => window.location.reload()}
      />
      {editingStaff && (
        <UpdateRoleModal
          isOpen={!!editingStaff}
          onClose={() => setEditingStaff(null)}
          staff={editingStaff}
          onUpdated={() => window.location.reload()}
        />
      )}

      {isPending && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10000 flex items-center justify-center">
          <Loader2 className="animate-spin text-brand-primary" size={48} />
        </div>
      )}
    </div>
  );
}
