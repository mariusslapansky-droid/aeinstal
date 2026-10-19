import { createContext, useContext, useState, type ReactNode } from "react";
import { Clock3 } from "lucide-react";

const ApprovalContext = createContext({ pending: false, markPending: () => {} });
export function B2BRegistrationProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState(false);
  return <ApprovalContext.Provider value={{ pending, markPending: () => setPending(true) }}>{children}</ApprovalContext.Provider>;
}
export const useB2BApproval = () => useContext(ApprovalContext);
export function PendingApprovalBanner() {
  const { pending } = useB2BApproval();
  if (!pending) return null;
  return <div className="b2b-pending-banner" role="status"><Clock3 /><span>Contul de firmă e în curs de aprobare. Vezi deocamdată prețuri standard.</span></div>;
}