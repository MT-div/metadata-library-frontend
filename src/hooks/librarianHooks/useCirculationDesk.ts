// src/hooks/useCirculationDesk.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { circulationService } from "../../services/circulationService";
import { patronService } from "../../services/patronService";
import { AxiosError } from "axios";

interface Patron {
  id: number;
  fullName: string;
  nationalId: string;
}
interface CirculationRecord {
  id: number;
  copyId: number;
  patronId: number;
  patronName: string;
  itemTitle: string;
  barcode: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: string;
}

export const useCirculationDesk = () => {
  const [activeTab, setActiveTab] = useState<"checkout" | "return">("checkout");
  const [patronId, setPatronId] = useState("");
  const [patronData, setPatronData] = useState<Patron | null>(null);
  const [patronError, setPatronError] = useState(false);
  const [isVerifyingPatron, setIsVerifyingPatron] = useState(false);
  const [checkoutBarcode, setCheckoutBarcode] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [returnBarcode, setReturnBarcode] = useState("");
  const [isReturning, setIsReturning] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);
  const [history, setHistory] = useState<CirculationRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const checkoutBarcodeRef = useRef<HTMLInputElement>(null);
  const returnBarcodeRef = useRef<HTMLInputElement>(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await circulationService.getHistory();
      const sorted = (res.data as CirculationRecord[]).sort(
        (a, b) =>
          new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime()
      );
      setHistory(sorted.slice(0, 10));
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadHistory();
    })();
  }, [loadHistory]);

  const verifyPatron = async () => {
    const inputId = patronId.trim();
    if (!inputId) {
      setPatronData(null);
      setPatronError(false);
      return;
    }
    setIsVerifyingPatron(true);
    setPatronError(false);
    try {
      const res = await patronService.searchPatrons(inputId);
      const exactMatch = res.data.find(
        (p) => p.nationalId.toLowerCase() === inputId.toLowerCase()
      );

      if (exactMatch) {
        setPatronData(exactMatch as Patron);
        setTimeout(() => checkoutBarcodeRef.current?.focus(), 100);
      } else {
        throw new Error("Patron not found");
      }
    } catch (err: unknown) {
      console.error("Patron verification failed:", err);
      setPatronData(null);
      setPatronError(true);
    } finally {
      setIsVerifyingPatron(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patronData || !checkoutBarcode.trim()) return;

    setIsCheckingOut(true);
    setCheckoutSuccess(null);
    try {
      await circulationService.checkout({
        barcode: checkoutBarcode.trim(),
        patronId: patronData.id,
      });

      setCheckoutSuccess(
        `Item ${checkoutBarcode} successfully checked out to ${patronData.fullName}!`
      );
      setCheckoutBarcode("");
      loadHistory();

      setTimeout(() => setCheckoutSuccess(null), 3000);
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      if (err instanceof AxiosError && err.response) {
        const serverMessage =
          err.response.data?.message ||
          err.response.data ||
          "Error processing checkout.";
        alert(`❌ فشل الإعارة:\n${serverMessage}`);
      } else {
        alert("Network error processing checkout.");
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnBarcode.trim()) return;
    setIsReturning(true);
    setReturnSuccess(null);
    try {
      await circulationService.returnItem({
        barcode: returnBarcode.trim(),
      });
      setReturnSuccess(`Item ${returnBarcode} returned successfully!`);
      setReturnBarcode("");
      loadHistory();
      setTimeout(() => setReturnSuccess(null), 3000);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response)
        alert(err.response.data || "Return error.");
      else alert("Network error processing return.");
    } finally {
      setIsReturning(false);
    }
  };

  const handleUndo = async (recordId: number) => {
    alert(
      "Backend note: add POST /api/Circulation/undo/{id} to reverse the operation."
    );
    setHistory((prev) => prev.filter((h) => h.id !== recordId));
  };

  return {
    activeTab,
    setActiveTab,
    patronId,
    setPatronId,
    patronData,
    patronError,
    isVerifyingPatron,
    checkoutBarcode,
    setCheckoutBarcode,
    isCheckingOut,
    checkoutSuccess,
    returnBarcode,
    setReturnBarcode,
    isReturning,
    returnSuccess,
    history,
    loadingHistory,
    checkoutBarcodeRef,
    returnBarcodeRef,
    verifyPatron,
    handleCheckout,
    handleReturn,
    handleUndo,
  };
};
