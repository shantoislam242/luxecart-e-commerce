import React, { useRef, useState, useCallback } from "react";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext.tsx";
import { API_BASE } from "../api/api.ts";

interface Props {
    value: string | string[];
    onChange: (url: string | string[]) => void;
    multiple?: boolean;
    label?: string;
}

type FileStatus = {
    file: File;
    preview: string;
    status: "pending" | "uploading" | "done" | "error";
    url?: string;
    error?: string;
};

export default function ImageUpload({ value, onChange, multiple = false, label = "Image" }: Props) {
    const { user } = useAuth();
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [queue, setQueue] = useState<FileStatus[]>([]);

    // ── Upload a single file ──────────────────────────────────────────────
    const uploadFile = useCallback(
        async (file: File, queueRef: FileStatus[], idx: number) => {
            // Mark uploading
            setQueue((prev) =>
                prev.map((item, i) => (i === idx ? { ...item, status: "uploading" } : item))
            );

            const fd = new FormData();
            fd.append("image", file);

            try {
                const res = await fetch(`${API_BASE}/upload`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${user?.token}` },
                    body: fd,
                });
                const data = await res.json();

                if (res.ok && data.url) {
                    setQueue((prev) => {
                        const next = prev.map((item, i) =>
                            i === idx ? { ...item, status: "done" as const, url: data.url } : item
                        );
                        if (multiple) {
                            const doneUrls = next.filter((x) => x.status === "done" && x.url).map((x) => x.url!);
                            onChange(doneUrls);
                        } else {
                            onChange(data.url);
                        }
                        return next;
                    });
                } else {
                    setQueue((prev) =>
                        prev.map((item, i) =>
                            i === idx ? { ...item, status: "error", error: data.message || "Upload failed" } : item
                        )
                    );
                }
            } catch (err) {
                setQueue((prev) =>
                    prev.map((item, i) =>
                        i === idx ? { ...item, status: "error", error: "Network error" } : item
                    )
                );
            }
        },
        [user, multiple, onChange]
    );

    // ── Add files to queue and start uploads ─────────────────────────────
    const addFiles = useCallback(
        (files: FileList | File[]) => {
            const arr = Array.from(files).slice(0, multiple ? 5 : 1);

            setQueue((prev) => {
                const base = multiple ? prev : [];
                const startIdx = base.length;

                const newEntries: FileStatus[] = arr.map((file) => ({
                    file,
                    preview: URL.createObjectURL(file),
                    status: "pending",
                }));

                const combined = [...base, ...newEntries];

                // Start uploads asynchronously after state settles
                newEntries.forEach((entry, i) => {
                    const idx = startIdx + i;
                    setTimeout(() => uploadFile(entry.file, combined, idx), 50);
                });

                return combined;
            });
        },
        [multiple, uploadFile]
    );

    // ── Drag & drop events ───────────────────────────────────────────────
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

    // ── Remove from queue ────────────────────────────────────────────────
    const removeItem = (idx: number) => {
        setQueue((q) => {
            const next = q.filter((_, i) => i !== idx);
            const doneUrls = next.filter((x) => x.status === "done" && x.url).map((x) => x.url!);
            onChange(multiple ? doneUrls : "");
            return next;
        });
    };

    const isUploading = queue.some((x) => x.status === "uploading");

    // Existing saved URL(s)
    const singleUrl = !multiple && typeof value === "string" ? value : "";
    const savedUrls = multiple
        ? Array.isArray(value)
            ? value.filter(Boolean)
            : value
                ? [value as string]
                : []
        : [];

    return (
        <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                {label}
            </label>

            {/* Drop zone */}
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 cursor-pointer select-none transition-all duration-200 ${dragging
                    ? "border-emerald-400 bg-emerald-50 scale-[1.01]"
                    : "border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/40"
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
                <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-emerald-100" : "bg-white border border-slate-200"
                        }`}
                >
                    {isUploading ? (
                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                    ) : (
                        <Upload className={`w-6 h-6 ${dragging ? "text-emerald-500" : "text-slate-400"}`} />
                    )}
                </div>
                <div className="text-center">
                    <p className={`text-sm font-bold ${dragging ? "text-emerald-600" : "text-slate-600"}`}>
                        {dragging ? "Drop to upload" : "Drag & drop image here"}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                        or click to browse — JPG, PNG, WebP up to 10MB
                    </p>
                </div>
            </div>

            {/* Queue items */}
            <AnimatePresence>
                {queue.map((item, idx) => (
                    <motion.div
                        key={`${item.file.name}-${idx}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center space-x-3 bg-white border border-slate-200 rounded-2xl p-3"
                    >
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                            <img src={item.preview} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-xs font-bold text-slate-700 truncate">{item.file.name}</p>
                            {item.status === "uploading" && (
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 rounded-full w-2/3 animate-pulse" />
                                </div>
                            )}
                            {item.status === "done" && (
                                <p className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1">
                                    <CheckCircle className="w-3 h-3" /><span>Uploaded successfully</span>
                                </p>
                            )}
                            {item.status === "error" && (
                                <p className="text-[10px] font-bold text-red-500 flex items-center space-x-1">
                                    <AlertCircle className="w-3 h-3" /><span>{item.error}</span>
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Single saved image preview */}
            {!multiple && singleUrl && queue.length === 0 && (
                <div className="relative group w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100" style={{ aspectRatio: "16/9" }}>
                    <img
                        src={singleUrl}
                        alt="Current"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => onChange("")}
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

            {/* Multi saved thumbnails */}
            {multiple && savedUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {savedUrls.map((url, i) => (
                        <div
                            key={i}
                            className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                        >
                            <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button
                                type="button"
                                onClick={() => onChange(savedUrls.filter((_, j) => j !== i))}
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
