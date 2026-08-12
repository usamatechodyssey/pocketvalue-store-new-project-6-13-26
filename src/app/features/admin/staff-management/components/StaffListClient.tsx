// 📂 src/app/features/admin/staff-management/components/StaffListClient.tsx (FULLY HARDENED & ROLE NORMALIZED)

"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  StaffUser,
  removeStaffMember,
} from "@/app/features/admin/staff-management/actions/payloadAdminActions";
import {
  UserPlus,
  Edit2,
  Trash2,
  Mail,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import AddStaffModal from "./AddStaffModal";
import UpdateRoleModal from "./UpdateRoleModal";

// ================================================================
// 🔧 HELPER: Normalized Role Badge Styling
// Supports both Payload CMS DB strings and short action strings
// ================================================================
const getRoleBadge = (role: string) => {
  if (!role) return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
  const r = role.toLowerCase().trim();

  if (r === "admin" || r === "super admin") {
    return "bg-red-500/10 text-red-500 border-red-500/20";
  }
  if (r === "manager" || r === "store manager") {
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  }
  if (r === "editor" || r === "content editor") {
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  }
  return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function StaffListClient({
  initialStaff,
}: {
  initialStaff: StaffUser[];
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [staff, setStaff] = useState<StaffUser[]>(initialStaff);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [isPending, startTransition] = useTransition();

  // Register client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRemove = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${name}?`)) return;
    startTransition(async () => {
      const res = await removeStaffMember(id);
      if (res.success) {
        setStaff((prev) => prev.filter((s) => s.id !== id));
        toast.success(res.message);
        router.refresh(); // Soft refresh
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest font-mono">
          Current Operational Staff
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs shadow-brand-primary/10 cursor-pointer"
        >
          <UserPlus size={16} /> Add Staff Member
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800">
              <tr className="text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold text-[10px]">
                <th className="p-5 text-left font-mono">Staff Identity</th>
                <th className="p-5 text-left font-mono">Role Access</th>
                <th className="p-5 text-left font-mono">Onboarded</th>
                <th className="p-5 text-right font-mono">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
              {staff.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black border border-brand-primary/20">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">{s.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                          <Mail size={10} /> {s.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider font-mono ${getRoleBadge(s.role)}`}
                    >
                      {s.role}
                    </span>
                  </td>
                  <td className="p-5 text-zinc-500 dark:text-zinc-400 font-mono text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />{" "}
                      {mounted ? new Date(s.createdAt).toLocaleDateString("en-PK") : "---"}
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingStaff(s)}
                        className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 hover:text-brand-primary transition-all cursor-pointer"
                        title="Edit Permissions"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleRemove(s.id, s.name)}
                        className="p-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Revoke Access"
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
        onAdded={() => router.refresh()}
      />
      {editingStaff && (
        <UpdateRoleModal
          isOpen={!!editingStaff}
          onClose={() => setEditingStaff(null)}
          staff={editingStaff}
          onUpdated={() => router.refresh()}
        />
      )}

      {isPending && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center animate-in fade-in">
          <Loader2 className="animate-spin text-white" size={48} />
        </div>
      )}
    </div>
  );
}