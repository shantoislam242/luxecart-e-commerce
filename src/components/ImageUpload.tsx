import React, { useRef, useState, useCallback } from "react";
import { Upload, X, ImageIcon, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext.tsx";

interface Props {
    /** Current image URL(s) — string for single, string[] for multi */
    value: string | string[];
    /** Called when upload succeeds — receives the new URL(s) */
    onChange: (url: string | string[]) => void;
    /** Allow multiple images (up to 5). Default: false */
    multiple?: boolean;
    /** Label shown above the dropzone */
    label?: string;
}

type FileStatus = { file: File; preview: string; status: "pending" | "uploading" | "done" | "error"; url?: string; error?: string };

export default function ImageUpload({ value, onChange, multiple = false, label = "Image" }: Props) {
    const { user } = useAuth();
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [queue, setQueue] = useState<FileStatus[]>([]);

    // ── helpers ──────────────────────────────────────────────────────────────
    const updateQueue = (idx: number, patch: Partial<FileStatus>) =>
        setQueue((q) => q.map((item, i) => (i === idx ? { ...item, ...patch } : item)));

    const uploadFile = useCallback(async (file: File, idx: number) => {
        updateQueue(idx, { status: "uploading" });
        const fd = new FormData();
        fd.append("image", file);
        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${user?.token}` },
                body: fd,
            });
            const data = await res.json();
            if (res.ok && data.url) {
                updateQueue(idx, { status: "done", url: data.url });
                if (!multiple) {
                    onChange(data.url);
                } else {
                    // Collect all done URLs
                    setQueue((q) => {
                        const updated = q.map((item, i) => (i === idx ? { ...item, status: "done" as const, url: data.url } : item));
                        const doneUrls = updated.filter((x) => x.status === "done" && x.url).map((x) => x.url!);
                        onChange(doneUrls);
                        return updated;
                    });
                }
            } else {
                updateQueue(idx, { status: "error", error: data.message || "Upload failed" });
            }
        } catch {
            updateQueue(idx, { status: "error", error: "Network error" });
        }
    }, [user, multiple, onChange]);

    const addFiles = useCallback((files: FileList | File[]) => {
        const arr = Array.from(files).slice(0, multiple ? 5 : 1);
        const newEntries: FileStatus[] = arr.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            status: "pending",
        }));
        setQueue((prev) => {
            const base = multiple ? prev : [];
            const combined = [...base, ...newEntries];
            // Start uploads
            combined.forEach((_, idx) => {
                if (idx >= (multiple ? base.length : 0)) {
                    const realIdx = idx;
                    setTimeout(() => uploadFile(newEntries[idx - (multiple ? base.length : 0)], realIdx), 0);
                }
            });
            return combined;
        });
    }, [multiple, uploadFile]);

    // ── drop zone events ────────────────────────────────────────────────────
    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
    const onDragLeave = () => setDragging(false);
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    };
    const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) addFiles(e.target.files);
        e.target.value = "";
    };

    const removeItem = (idx: number) => {
        setQueue((q) => {
            const next = q.filter((_, i) => i !== idx);
            const doneUrls = next.filter((x) => x.status === "done" && x.url).map((x) => x.url!);
            if (multiple) onChange(doneUrls);
            else onChange("");
            return next;
        });
    };

    // Current URL(s) from parent (already saved images)
    const savedUrls: string[] = multiple
        ? Array.isArray(value) ? value.filter(Boolean) : (value ? [value as string] : [])
        : [];
    const singleUrl = !multiple && typeof value === "string" ? value : "";

    const isUploading = queue.some((x) => x.status === "uploading");

    return (
        <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</label>

            {/* ── Dropzone ── */}
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200 select-none ${dragging
                        ? "border-emerald-400 bg-emerald-50 scale-[1.02]"
                        : "border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/50"
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple={multiple}
                    className="hidden"
                    onChange={onFileInput}
                />
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-emerald-100" : "bg-white border border-slate-200"}`}>
                    {isUploading
                        ? <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        : <Upload className={`w-6 h-6 ${dragging ? "text-emerald-500" : "text-slate-400"}`} />}
                </div>
                <div className="text-center">
                    <p className={`text-sm font-bold ${dragging ? "text-emerald-600" : "text-slate-600"}`}>
                        {dragging ? "Drop to upload" : "Drag & drop image here"}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">or click to browse — JPG, PNG, WebP up to 5MB</p>
                </div>
            </div>

            {/* ── Upload queue / preview ── */}
            <AnimatePresence>
                {queue.map((item, idx) => (
                    <motion.div key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center space-x-3 bg-white border border-slate-200 rounded-2xl p-3"
                    >
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                            <img src={item.preview} alt="" className="w-full h-full object-cover" />
                        </div>

                        {/* Name + bar */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                            <p className="text-xs font-bold text-slate-700 truncate">{item.file.name}</p>
                            {item.status === "uploading" && (
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4" />
                                </div>
                            )}
                            {item.status === "done" && (
                                <p className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1">
                                    <CheckCircle className="w-3 h-3" /><span>Uploaded</span>
                                </p>
                            )}
                            {item.status === "error" && (
                                <p className="text-[10px] font-bold text-red-500 flex items-center space-x-1">
                                    <AlertCircle className="w-3 h-3" /><span>{item.error}</span>
                                </p>
                            )}
                        </div>

                        {/* Remove */}
                        <button type="button" onClick={() => removeItem(idx)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* ── Single image preview (from saved URL) ── */}
            {!multiple && singleUrl && queue.length === 0 && (
                <div className="relative group w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={singleUrl} alt="Current" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => onChange("")}
                            className="flex items-center space-x-1.5 bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-xl"
                        >
                            <X className="w-3.5 h-3.5" /><span>Remove</span>
                        </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" /><span>Current Image</span>
                    </div>
                </div>
            )}

            {/* ── Multi saved thumbnails ── */}
            {multiple && savedUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {savedUrls.map((url, i) => (
                        <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                            <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button type="button"
                                onClick={() => onChange((savedUrls.filter((_, j) => j !== i)))}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
