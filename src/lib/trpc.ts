/**
 * Couche de compatibilité tRPC → Supabase
 * Remplace les appels trpc.*.useQuery/useMutation par des appels Supabase directs
 * en utilisant React Query pour la gestion du cache et des états de chargement.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export const trpc = {
  useUtils: () => {
    const qc = useQueryClient();
    return {
      auth: {
        me: {
          setData: (_: unknown, val: unknown) => qc.setQueryData(["auth.me"], val),
          invalidate: () => qc.invalidateQueries({ queryKey: ["auth.me"] }),
        },
      },
      clientPortal: {
        getMyProjects: { invalidate: () => qc.invalidateQueries({ queryKey: ["clientPortal.getMyProjects"] }) },
        getMyContracts: { invalidate: () => qc.invalidateQueries({ queryKey: ["clientPortal.getMyContracts"] }) },
        getMyProfile: { invalidate: () => qc.invalidateQueries({ queryKey: ["clientPortal.getMyProfile"] }) },
        getUpcomingSchedule: { invalidate: () => qc.invalidateQueries({ queryKey: ["clientPortal.getUpcomingSchedule"] }) },
      },
      admin: {
        getClients: { invalidate: () => qc.invalidateQueries({ queryKey: ["admin.getClients"] }) },
        getContracts: { invalidate: () => qc.invalidateQueries({ queryKey: ["admin.getContracts"] }) },
        getQuoteSubmissions: { invalidate: () => qc.invalidateQueries({ queryKey: ["admin.getQuoteSubmissions"] }) },
        getCleaningSchedules: { invalidate: () => qc.invalidateQueries({ queryKey: ["admin.getCleaningSchedules"] }) },
      },
    };
  },

  auth: {
    me: {
      useQuery: (_input?: unknown, opts?: { retry?: boolean; refetchOnWindowFocus?: boolean; enabled?: boolean }) => {
        return useQuery({
          queryKey: ["auth.me"],
          queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return null;
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();
            if (!profile) return null;
            return {
              id: session.user.id,
              email: session.user.email ?? "",
              name: profile.name ?? session.user.email ?? "",
              role: profile.role ?? "client",
              openId: session.user.id,
            };
          },
          retry: opts?.retry ?? false,
          refetchOnWindowFocus: opts?.refetchOnWindowFocus ?? false,
          enabled: opts?.enabled ?? true,
        });
      },
    },
    logout: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        return useMutation({
          mutationFn: async () => { await supabase.auth.signOut(); },
          onSuccess: opts?.onSuccess,
        });
      },
    },
    loginWithPassword: {
      useMutation: (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { email: string; password: string }) => {
            const { error } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password });
            if (error) throw new Error(error.message);
          },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["auth.me"] }); opts?.onSuccess?.(); },
          onError: opts?.onError,
        });
      },
    },
    sendMagicLink: {
      useMutation: (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
        return useMutation({
          mutationFn: async (input: { email: string }) => {
            const { error } = await supabase.auth.signInWithOtp({ email: input.email });
            if (error) throw new Error(error.message);
          },
          onSuccess: opts?.onSuccess,
          onError: opts?.onError,
        });
      },
    },
    resetPassword: {
      useMutation: (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
        return useMutation({
          mutationFn: async (input: { email: string }) => {
            const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
              redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw new Error(error.message);
          },
          onSuccess: opts?.onSuccess,
          onError: opts?.onError,
        });
      },
    },
    updatePassword: {
      useMutation: (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
        return useMutation({
          mutationFn: async (input: { password: string }) => {
            const { error } = await supabase.auth.updateUser({ password: input.password });
            if (error) throw new Error(error.message);
          },
          onSuccess: opts?.onSuccess,
          onError: opts?.onError,
        });
      },
    },
  },

  reviews: {
    getApprovedReviews: {
      useQuery: () => useQuery({
        queryKey: ["reviews.getApprovedReviews"],
        queryFn: async () => {
          const { data } = await supabase.from("reviews").select("*").eq("status", "approved").order("created_at", { ascending: false });
          return data ?? [];
        },
      }),
    },
    getAllReviews: {
      useQuery: (input?: { status?: string }) => useQuery({
        queryKey: ["reviews.getAllReviews", input?.status],
        queryFn: async () => {
          let q = supabase.from("reviews").select("*").order("created_at", { ascending: false });
          if (input?.status && input.status !== "all") q = q.eq("status", input.status);
          const { data } = await q;
          return data ?? [];
        },
      }),
    },
    submitReview: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { name: string; service: string; rating: number; comment: string }) => {
            await supabase.from("reviews").insert({ ...input, status: "pending" });
          },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["reviews.getApprovedReviews"] }); opts?.onSuccess?.(); },
        });
      },
    },
    approveReview: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { id: number }) => { await supabase.from("reviews").update({ status: "approved" }).eq("id", input.id); },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["reviews.getAllReviews"] }); opts?.onSuccess?.(); },
        });
      },
    },
    rejectReview: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { id: number }) => { await supabase.from("reviews").update({ status: "rejected" }).eq("id", input.id); },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["reviews.getAllReviews"] }); opts?.onSuccess?.(); },
        });
      },
    },
    deleteReview: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { id: number }) => { await supabase.from("reviews").delete().eq("id", input.id); },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["reviews.getAllReviews"] }); opts?.onSuccess?.(); },
        });
      },
    },
  },

  contact: {
    submit: {
      useMutation: (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
        return useMutation({
          mutationFn: async (input: { name: string; email: string; phone?: string; serviceType?: string; message: string }) => {
            const { error } = await supabase.from("contact_submissions").insert({
              name: input.name, email: input.email, phone: input.phone ?? null,
              service_type: input.serviceType ?? null, message: input.message, status: "new",
            });
            if (error) throw new Error(error.message);
          },
          onSuccess: opts?.onSuccess,
          onError: opts?.onError,
        });
      },
    },
  },

  clientPortal: {
    getMyProjects: {
      useQuery: (_?: unknown, opts?: { enabled?: boolean }) => useQuery({
        queryKey: ["clientPortal.getMyProjects"],
        queryFn: async () => {
          const uid = await getCurrentUserId();
          if (!uid) return [];
          const { data } = await supabase.from("projects").select("*, project_tasks(*)").eq("client_id", uid).order("created_at", { ascending: false });
          return data ?? [];
        },
        enabled: opts?.enabled ?? true,
      }),
    },
    getProjectWithTasks: {
      useQuery: (input: { projectId: number } | undefined, opts?: { enabled?: boolean }) => useQuery({
        queryKey: ["clientPortal.getProjectWithTasks", input?.projectId],
        queryFn: async () => {
          if (!input?.projectId) return null;
          const { data } = await supabase.from("projects").select("*, project_tasks(*)").eq("id", input.projectId).single();
          return data;
        },
        enabled: (opts?.enabled ?? true) && Boolean(input?.projectId),
      }),
    },
    getUpcomingSchedule: {
      useQuery: (_?: unknown, opts?: { enabled?: boolean }) => useQuery({
        queryKey: ["clientPortal.getUpcomingSchedule"],
        queryFn: async () => {
          const uid = await getCurrentUserId();
          if (!uid) return [];
          const { data } = await supabase.from("schedules").select("*").eq("client_id", uid).gte("scheduled_at", new Date().toISOString()).order("scheduled_at", { ascending: true });
          return data ?? [];
        },
        enabled: opts?.enabled ?? true,
      }),
    },
    getMyContracts: {
      useQuery: (_?: unknown, opts?: { enabled?: boolean }) => useQuery({
        queryKey: ["clientPortal.getMyContracts"],
        queryFn: async () => {
          const uid = await getCurrentUserId();
          if (!uid) return [];
          const { data } = await supabase.from("contracts").select("*").eq("client_id", uid).order("created_at", { ascending: false });
          return data ?? [];
        },
        enabled: opts?.enabled ?? true,
      }),
    },
    signContract: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { contractId: number; signature: string }) => {
            const { error } = await supabase.from("contracts").update({
              client_signature: input.signature, status: "signed", signed_at: new Date().toISOString(),
            }).eq("id", input.contractId);
            if (error) throw new Error(error.message);
          },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["clientPortal.getMyContracts"] }); opts?.onSuccess?.(); },
        });
      },
    },
    getMyProfile: {
      useQuery: (_?: unknown, opts?: { enabled?: boolean }) => useQuery({
        queryKey: ["clientPortal.getMyProfile"],
        queryFn: async () => {
          const uid = await getCurrentUserId();
          if (!uid) return null;
          const { data: authUser } = await supabase.auth.getUser();
          const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", uid).single();
          return { ...profile, email: authUser.user?.email };
        },
        enabled: opts?.enabled ?? true,
      }),
    },
    updateMyProfile: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { name?: string; phone?: string; address?: string; city?: string; postalCode?: string }) => {
            const uid = await getCurrentUserId();
            if (!uid) throw new Error("Non connecté");
            await supabase.from("user_profiles").update({ name: input.name, phone: input.phone, address: input.address, city: input.city, postal_code: input.postalCode }).eq("id", uid);
          },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["clientPortal.getMyProfile"] }); opts?.onSuccess?.(); },
        });
      },
    },
    submitQuoteRequest: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        return useMutation({
          mutationFn: async (input: { serviceType: string; details: string; estimatedPrice?: number }) => {
            const uid = await getCurrentUserId();
            const { data: profile } = await supabase.from("user_profiles").select("name, email").eq("id", uid ?? "").single();
            await supabase.from("client_quote_requests").insert({
              client_id: uid, client_name: profile?.name ?? "", client_email: profile?.email ?? "",
              service_type: input.serviceType, details: input.details, estimated_price: input.estimatedPrice ?? null, status: "new",
            });
          },
          onSuccess: opts?.onSuccess,
        });
      },
    },
  },

  billing: {
    getMyInvoices: {
      useQuery: (_?: unknown, opts?: { enabled?: boolean }) => useQuery({
        queryKey: ["billing.getMyInvoices"],
        queryFn: async () => {
          const uid = await getCurrentUserId();
          if (!uid) return [];
          const { data } = await supabase.from("invoices").select("*").eq("client_id", uid).order("created_at", { ascending: false });
          return data ?? [];
        },
        enabled: opts?.enabled ?? true,
      }),
    },
    generateInvoiceFromContract: {
      useMutation: (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { contractId: number; amount: number; description?: string; dueDate?: string }) => {
            const { data: contract } = await supabase.from("contracts").select("client_id, title").eq("id", input.contractId).single();
            if (!contract) throw new Error("Contrat introuvable");
            await supabase.from("invoices").insert({
              client_id: contract.client_id, contract_id: input.contractId,
              invoice_number: `INV-${Date.now()}`, amount: input.amount,
              tax: Math.round(input.amount * 0.15 * 100) / 100, status: "unpaid",
              description: input.description ?? contract.title, due_date: input.dueDate ?? null,
            });
          },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin.getContracts"] }); opts?.onSuccess?.(); },
          onError: opts?.onError,
        });
      },
    },
    updateInvoiceStatus: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { invoiceId: number; status: string }) => {
            await supabase.from("invoices").update({ status: input.status, paid_at: input.status === "paid" ? new Date().toISOString() : null }).eq("id", input.invoiceId);
          },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["billing.getMyInvoices"] }); qc.invalidateQueries({ queryKey: ["admin.getInvoices"] }); opts?.onSuccess?.(); },
        });
      },
    },
    getAdminInvoices: {
      useQuery: () => useQuery({
        queryKey: ["admin.getInvoices"],
        queryFn: async () => {
          const { data } = await supabase.from("invoices").select("*, user_profiles(name, email)").order("created_at", { ascending: false });
          return data ?? [];
        },
      }),
    },
  },

  admin: {
    getDashboardStats: {
      useQuery: (_?: unknown, opts?: { enabled?: boolean }) => useQuery({
        queryKey: ["admin.getDashboardStats"],
        queryFn: async () => {
          const [clients, quotes, contracts, invoices] = await Promise.all([
            supabase.from("user_profiles").select("id", { count: "exact" }).eq("role", "client"),
            supabase.from("quote_submissions").select("id", { count: "exact" }).eq("status", "new"),
            supabase.from("contracts").select("id", { count: "exact" }).eq("status", "active"),
            supabase.from("invoices").select("amount").eq("status", "unpaid"),
          ]);
          const revenue = (invoices.data ?? []).reduce((s: number, i: { amount: number }) => s + (i.amount ?? 0), 0);
          return { totalClients: clients.count ?? 0, newQuotes: quotes.count ?? 0, activeContracts: contracts.count ?? 0, pendingRevenue: revenue };
        },
        enabled: opts?.enabled ?? true,
      }),
    },
    getClients: {
      useQuery: () => useQuery({
        queryKey: ["admin.getClients"],
        queryFn: async () => {
          const { data } = await supabase.from("user_profiles").select("*").eq("role", "client").order("created_at", { ascending: false });
          return data ?? [];
        },
      }),
    },
    updateClient: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { clientId: string; name?: string; phone?: string; notes?: string; status?: string }) => {
            await supabase.from("user_profiles").update({ name: input.name, phone: input.phone, notes: input.notes, status: input.status }).eq("id", input.clientId);
          },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin.getClients"] }); opts?.onSuccess?.(); },
        });
      },
    },
    getQuoteSubmissions: {
      useQuery: (input?: { status?: string }) => useQuery({
        queryKey: ["admin.getQuoteSubmissions", input?.status],
        queryFn: async () => {
          let q = supabase.from("quote_submissions").select("*").order("created_at", { ascending: false });
          if (input?.status && input.status !== "all") q = q.eq("status", input.status);
          const { data } = await q;
          return data ?? [];
        },
      }),
    },
    updateQuoteStatus: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { id: number; status: string }) => {
            await supabase.from("quote_submissions").update({ status: input.status }).eq("id", input.id);
          },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin.getQuoteSubmissions"] }); opts?.onSuccess?.(); },
        });
      },
    },
    createClientFromQuote: {
      useMutation: (opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { quoteId: number; email: string; name: string; phone?: string }) => {
            await supabase.from("quote_submissions").update({ status: "converted" }).eq("id", input.quoteId);
            const { error } = await supabase.auth.resetPasswordForEmail(input.email, { redirectTo: `${window.location.origin}/reset-password` });
            if (error) throw new Error(error.message);
          },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin.getQuoteSubmissions"] }); qc.invalidateQueries({ queryKey: ["admin.getClients"] }); opts?.onSuccess?.(); },
          onError: opts?.onError,
        });
      },
    },
    getAllClientQuoteRequests: {
      useQuery: () => useQuery({
        queryKey: ["admin.getAllClientQuoteRequests"],
        queryFn: async () => {
          const { data } = await supabase.from("client_quote_requests").select("*, user_profiles(name, email)").order("created_at", { ascending: false });
          return data ?? [];
        },
      }),
    },
    updateClientQuoteRequestStatus: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { id: number; status: string }) => {
            await supabase.from("client_quote_requests").update({ status: input.status }).eq("id", input.id);
          },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin.getAllClientQuoteRequests"] }); opts?.onSuccess?.(); },
        });
      },
    },
    getContracts: {
      useQuery: (_?: unknown) => useQuery({
        queryKey: ["admin.getContracts"],
        queryFn: async () => {
          const { data } = await supabase.from("contracts").select("*, user_profiles(name, email)").order("created_at", { ascending: false });
          return data ?? [];
        },
      }),
    },
    createContract: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { clientId: string; title: string; content: string; serviceType?: string; amount?: number; startDate?: string; endDate?: string }) => {
            const { error } = await supabase.from("contracts").insert({
              client_id: input.clientId, title: input.title, content: input.content,
              service_type: input.serviceType ?? null, amount: input.amount ?? null,
              start_date: input.startDate ?? null, end_date: input.endDate ?? null, status: "draft",
            });
            if (error) throw new Error(error.message);
          },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin.getContracts"] }); opts?.onSuccess?.(); },
        });
      },
    },
    sendContractToClient: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { contractId: number }) => { await supabase.from("contracts").update({ status: "sent" }).eq("id", input.contractId); },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin.getContracts"] }); opts?.onSuccess?.(); },
        });
      },
    },
    adminSignContract: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { contractId: number; signature: string }) => {
            await supabase.from("contracts").update({ admin_signature: input.signature, status: "admin_signed" }).eq("id", input.contractId);
          },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin.getContracts"] }); opts?.onSuccess?.(); },
        });
      },
    },
    cancelContract: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { contractId: number }) => { await supabase.from("contracts").update({ status: "cancelled" }).eq("id", input.contractId); },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin.getContracts"] }); opts?.onSuccess?.(); },
        });
      },
    },
    getCleaningSchedules: {
      useQuery: (input?: { month?: number; year?: number }) => useQuery({
        queryKey: ["admin.getCleaningSchedules", input?.month, input?.year],
        queryFn: async () => {
          let q = supabase.from("schedules").select("*, user_profiles(name, email)").order("scheduled_at", { ascending: true });
          if (input?.month !== undefined && input?.year !== undefined) {
            const start = new Date(input.year, input.month - 1, 1).toISOString();
            const end = new Date(input.year, input.month, 0, 23, 59, 59).toISOString();
            q = q.gte("scheduled_at", start).lte("scheduled_at", end);
          }
          const { data } = await q;
          return data ?? [];
        },
      }),
    },
    createCleaningSchedule: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { clientId: string; title: string; description?: string; scheduledAt: string; durationMinutes?: number }) => {
            await supabase.from("schedules").insert({
              client_id: input.clientId, title: input.title, description: input.description ?? null,
              scheduled_at: input.scheduledAt, duration_minutes: input.durationMinutes ?? 60, status: "scheduled",
            });
          },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin.getCleaningSchedules"] }); opts?.onSuccess?.(); },
        });
      },
    },
    updateCleaningSchedule: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { scheduleId: number; status?: string; scheduledAt?: string }) => {
            await supabase.from("schedules").update({ status: input.status, scheduled_at: input.scheduledAt }).eq("id", input.scheduleId);
          },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin.getCleaningSchedules"] }); opts?.onSuccess?.(); },
        });
      },
    },
    getContactSubmissions: {
      useQuery: () => useQuery({
        queryKey: ["admin.getContactSubmissions"],
        queryFn: async () => {
          const { data } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
          return data ?? [];
        },
      }),
    },
    deleteContactSubmission: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { id: number }) => { await supabase.from("contact_submissions").delete().eq("id", input.id); },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin.getContactSubmissions"] }); opts?.onSuccess?.(); },
        });
      },
    },
  },

  careers: {
    getJobPostings: {
      useQuery: () => useQuery({
        queryKey: ["careers.getJobPostings"],
        queryFn: async () => {
          const { data } = await supabase.from("job_postings").select("*").order("created_at", { ascending: false });
          return data ?? [];
        },
      }),
    },
    getApplications: {
      useQuery: () => useQuery({
        queryKey: ["careers.getApplications"],
        queryFn: async () => {
          const { data } = await supabase.from("job_applications").select("*, job_postings(title)").order("created_at", { ascending: false });
          return data ?? [];
        },
      }),
    },
    createJobPosting: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { title: string; department: string; location: string; type: string; description: string; requirements: string; salary?: string }) => {
            await supabase.from("job_postings").insert({ ...input, is_active: true });
          },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["careers.getJobPostings"] }); opts?.onSuccess?.(); },
        });
      },
    },
    updateJobPosting: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { id: number; isActive?: boolean; title?: string; description?: string }) => {
            await supabase.from("job_postings").update({ is_active: input.isActive, title: input.title, description: input.description }).eq("id", input.id);
          },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["careers.getJobPostings"] }); opts?.onSuccess?.(); },
        });
      },
    },
    deleteJobPosting: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { id: number }) => { await supabase.from("job_postings").delete().eq("id", input.id); },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["careers.getJobPostings"] }); opts?.onSuccess?.(); },
        });
      },
    },
    updateApplicationStatus: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        const qc = useQueryClient();
        return useMutation({
          mutationFn: async (input: { id: number; status: string }) => { await supabase.from("job_applications").update({ status: input.status }).eq("id", input.id); },
          onSuccess: () => { qc.invalidateQueries({ queryKey: ["careers.getApplications"] }); opts?.onSuccess?.(); },
        });
      },
    },
    submitApplication: {
      useMutation: (opts?: { onSuccess?: () => void }) => {
        return useMutation({
          mutationFn: async (input: { jobId: number; name: string; email: string; phone?: string; coverLetter?: string }) => {
            await supabase.from("job_applications").insert({
              job_id: input.jobId, name: input.name, email: input.email,
              phone: input.phone ?? null, cover_letter: input.coverLetter ?? null, status: "new",
            });
          },
          onSuccess: opts?.onSuccess,
        });
      },
    },
  },

  system: {
    notifyOwner: {
      useMutation: () => useMutation({
        mutationFn: async (_input: { title: string; content: string }) => {
          console.log("[notifyOwner]", _input);
        },
      }),
    },
  },
};
