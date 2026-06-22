// src/hooks/useManageMetadata.ts
import { useState, useEffect } from "react";
import { metadataService } from "../../services/metadataService";
import type { VocabularyResponse } from "../../types/vocabulary.types";
import type { PropertyResponse } from "../../types/property.types";

interface ExtendedVocab extends VocabularyResponse {
  isDeleted?: boolean;
}
interface ExtendedProp extends PropertyResponse {
  isDeleted?: boolean;
}

export const useManageMetadata = () => {
  const [vocabularies, setVocabularies] = useState<ExtendedVocab[]>([]);
  const [selectedVocabId, setSelectedVocabId] = useState<number>(0);
  const [properties, setProperties] = useState<ExtendedProp[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Filters
  const [vocabFilterStatus, setVocabFilterStatus] = useState<
    "active" | "deleted" | "all"
  >("active");
  const [propFilterStatus, setPropFilterStatus] = useState<
    "active" | "deleted" | "all"
  >("active");

  const [isProcessingVocab, setIsProcessingVocab] = useState<number | null>(
    null
  );
  const [isProcessingProp, setIsProcessingProp] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      metadataService.getVocabularies(true).then((r) => r.data),
      metadataService.getProperties(true).then((r) => r.data),
    ])
      .then(([vocabsData, propsData]) => {
        setVocabularies(vocabsData);
        setProperties(propsData);
        if (vocabsData.length > 0) setSelectedVocabId(vocabsData[0].id);
      })
      .catch((err) => console.error("Error fetching metadata:", err))
      .finally(() => setLoading(false));
  }, []);

  const selectVocab = (id: number) => {
    if (id === selectedVocabId) return;
    setSelectedVocabId(id);
  };

  const selectedVocab = vocabularies.find((v) => v.id === selectedVocabId);
  const isSelectedVocabDeleted = selectedVocab?.isDeleted;

  // ── VOCABULARY ACTIONS ──
  const handleDeleteVocab = async (id: number) => {
    if (
      !confirm("Are you sure you want to delete this vocabulary? (Soft Delete)")
    )
      return;
    setIsProcessingVocab(id);
    try {
      await metadataService.deleteVocabulary(id);
      setVocabularies((prev) =>
        prev.map((v) => (v.id === id ? { ...v, isDeleted: true } : v))
      );
      if (vocabFilterStatus === "active" && selectedVocabId === id)
        setSelectedVocabId(0);
    } catch (e) {
      console.error(e);
      alert("Failed to delete vocabulary.");
    } finally {
      setIsProcessingVocab(null);
    }
  };

  const handleRestoreVocab = async (id: number) => {
    if (!confirm("Restore this vocabulary?")) return;
    setIsProcessingVocab(id);
    try {
      await metadataService.restoreVocabulary(id);
      setVocabularies((prev) =>
        prev.map((v) => (v.id === id ? { ...v, isDeleted: false } : v))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to restore vocabulary.");
    } finally {
      setIsProcessingVocab(null);
    }
  };

  // ── PROPERTY ACTIONS ──
  const handleDeleteProp = async (id: number) => {
    if (
      !confirm("Are you sure you want to delete this property? (Soft Delete)")
    )
      return;
    setIsProcessingProp(id);
    try {
      await metadataService.deleteProperty(id);
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isDeleted: true } : p))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to delete property.");
    } finally {
      setIsProcessingProp(null);
    }
  };

  const handleRestoreProp = async (id: number) => {
    if (!confirm("Restore this property?")) return;
    setIsProcessingProp(id);
    try {
      await metadataService.restoreProperty(id);
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isDeleted: false } : p))
      );
    } catch (e) {
      console.error(e);
      alert("Failed to restore property.");
    } finally {
      setIsProcessingProp(null);
    }
  };

  // تصفية قواميس الميتاداتا
  const filteredVocabs = vocabularies.filter((v) => {
    if (vocabFilterStatus === "active") return !v.isDeleted;
    if (vocabFilterStatus === "deleted") return v.isDeleted;
    return true;
  });

  // تصفية الخصائص المرتبطة بالقاموس المختار
  const filteredProps = properties.filter((p) => {
    if (p.vocabularyId !== selectedVocabId) return false;
    if (propFilterStatus === "active") return !p.isDeleted;
    if (propFilterStatus === "deleted") return p.isDeleted;
    return true;
  });
  const handleNotImplemented = (action: string) =>
    alert(`"${action}" feature coming soon!`);
  return {
    vocabularies,
    selectedVocabId,
    setSelectedVocabId,
    properties,
    loading,
    vocabFilterStatus,
    setVocabFilterStatus,
    propFilterStatus,
    setPropFilterStatus,
    isProcessingVocab,
    isProcessingProp,
    selectVocab,
    selectedVocab,
    isSelectedVocabDeleted,
    handleDeleteVocab,
    handleRestoreVocab,
    handleDeleteProp,
    handleRestoreProp,
    filteredVocabs,
    filteredProps,
    handleNotImplemented,
  };
};
