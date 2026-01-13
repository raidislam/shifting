import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

// Demo region -> service center
const REGION_SERVICE_CENTERS = {
    Dhaka: ["Uttara Center", "Mirpur Center", "Dhanmondi Center"],
    Chattogram: ["Agrabad Center", "Panchlaish Center"],
    Sylhet: ["Zindabazar Center", "Tilagor Center"],
    Khulna: ["Sonadanga Center", "Khalishpur Center"],
};

function calculateCost({ parcelType, pickupCenter, deliveryCenter, weight }) {
    const base = parcelType === "document" ? 60 : 90;

    const centerFactor =
        (pickupCenter?.toLowerCase().includes("uttara") ? 15 : 0) +
        (deliveryCenter?.toLowerCase().includes("uttara") ? 15 : 0);

    const w = Number(weight || 0);
    const weightCharge = parcelType === "non-document" ? Math.ceil(w) * 12 : 0;

    return base + centerFactor + weightCharge;
}

export default function ParcelCreateForm({ currentUserName = "" }) {
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            senderName: currentUserName, // prefill (থাকলে)
            parcelType: "document",
        },
        mode: "onTouched",
    });

    const parcelType = watch("parcelType");
    const senderRegion = watch("senderRegion");
    const receiverRegion = watch("receiverRegion");

    const senderCenters = useMemo(
        () => (senderRegion ? REGION_SERVICE_CENTERS[senderRegion] || [] : []),
        [senderRegion]
    );
    const receiverCenters = useMemo(
        () => (receiverRegion ? REGION_SERVICE_CENTERS[receiverRegion] || [] : []),
        [receiverRegion]
    );

    // Region change হলে center reset (না হলে invalid center থেকে যায়)
    const onSenderRegionChange = (e) => {
        const region = e.target.value;
        setValue("senderRegion", region);
        setValue("senderCenter", "");
    };

    const onReceiverRegionChange = (e) => {
        const region = e.target.value;
        setValue("receiverRegion", region);
        setValue("receiverCenter", "");
    };

    // Submit এ আগে cost দেখিয়ে confirm (toast এর ভিতরে)
    const onSubmit = (data) => {
        const cost = calculateCost({
            parcelType: data.parcelType,
            pickupCenter: data.senderCenter,
            deliveryCenter: data.receiverCenter,
            weight: data.weight,
        });

        // Toast এর ভেতরে custom UI + Confirm button
        toast.custom((t) => (
            <div className="bg-base-100 border border-base-300 shadow rounded-box p-4 w-[320px]">
                <div className="font-semibold">Delivery Cost: ৳{cost}</div>
                <div className="text-sm opacity-70 mt-1">
                    Confirm করলে Parcel DB তে save হবে।
                </div>

                <div className="mt-3 flex justify-end gap-2">
                    <button
                        className="btn btn-sm"
                        onClick={() => toast.dismiss(t.id)}
                        disabled={isSaving}
                    >
                        Cancel
                    </button>

                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                            toast.dismiss(t.id);
                            onConfirmSave({ ...data, cost });
                        }}
                        disabled={isSaving}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        ));
    };

    // Confirm save handler
    const onConfirmSave = async (dataWithCost) => {
        setIsSaving(true);

        const payload = {
            ...dataWithCost,
            creation_date: new Date().toISOString(),
        };

        // Loading toast
        const loadingId = toast.loading("Saving parcel...");

        try {
            const res = await fetch("/api/parcels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Server error");
            }

            toast.success(`Saved ✅ Cost: ৳${dataWithCost.cost}`, { id: loadingId });

            reset({
                senderName: currentUserName,
                parcelType: "document",
            });
        } catch (err) {
            toast.error(`Save failed: ${err.message}`, { id: loadingId });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
            {/* Heading */}
            <div className="card bg-base-100 border border-base-300">
                <div className="card-body">
                    <h2 className="card-title text-xl">Parcel Send Form</h2>
                    <p className="text-sm opacity-70">
                        সব ফিল্ড required (weight ছাড়া)। Submit → cost toast → Confirm → save।
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* ===================== Parcel Info (3 fields) ===================== */}
                <div className="card bg-base-100 border border-base-300">
                    <div className="card-body space-y-3">
                        <h3 className="font-semibold text-lg">Parcel Info</h3>

                        <div className="grid md:grid-cols-3 gap-3">
                            {/* Type */}
                            <div className="form-control">
                                <label className="label"><span className="label-text">Type *</span></label>
                                <select
                                    className={`select select-bordered ${errors.parcelType ? "select-error" : ""}`}
                                    {...register("parcelType", { required: "Type নির্বাচন করা বাধ্যতামূলক" })}
                                >
                                    <option value="document">Document</option>
                                    <option value="non-document">Non-document</option>
                                </select>
                                {errors.parcelType && <p className="text-error text-sm mt-1">{errors.parcelType.message}</p>}
                            </div>

                            {/* Title */}
                            <div className="form-control">
                                <label className="label"><span className="label-text">Title *</span></label>
                                <input
                                    className={`input input-bordered ${errors.title ? "input-error" : ""}`}
                                    {...register("title", { required: "Title বাধ্যতামূলক" })}
                                />
                                {errors.title && <p className="text-error text-sm mt-1">{errors.title.message}</p>}
                            </div>

                            {/* Weight optional */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">
                                        Weight (kg) {parcelType === "non-document" ? "(optional)" : "(not needed)"}
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    disabled={parcelType !== "non-document"}
                                    className={`input input-bordered ${errors.weight ? "input-error" : ""}`}
                                    {...register("weight", {
                                        validate: (val) => {
                                            if (!val) return true;
                                            const n = Number(val);
                                            if (Number.isNaN(n) || n < 0) return "Weight সঠিক সংখ্যা হতে হবে";
                                            return true;
                                        },
                                    })}
                                />
                                {errors.weight && <p className="text-error text-sm mt-1">{errors.weight.message}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===================== Sender + Receiver in 2 columns ===================== */}
                <div className="grid lg:grid-cols-2 gap-4">
                    {/* -------- Sender (6 fields) -------- */}
                    <div className="card bg-base-100 border border-base-300">
                        <div className="card-body space-y-4">
                            <h3 className="font-semibold text-lg">Sender Info</h3>

                            {/* 1) Name */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Name *</span>
                                </label>
                                <input
                                    className={`input input-bordered input-md w-full ${errors.senderName ? "input-error" : ""}`}
                                    {...register("senderName", { required: "Sender নাম বাধ্যতামূলক" })}
                                />
                                {errors.senderName && (
                                    <p className="text-error text-sm mt-1">{errors.senderName.message}</p>
                                )}
                            </div>

                            {/* 2) Contact */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Contact *</span>
                                </label>
                                <input
                                    className={`input input-bordered input-md w-full ${errors.senderContact ? "input-error" : ""}`}
                                    placeholder="01XXXXXXXXX"
                                    {...register("senderContact", {
                                        required: "Contact বাধ্যতামূলক",
                                        minLength: { value: 11, message: "কমপক্ষে ১১ ডিজিট দিন" },
                                    })}
                                />
                                {errors.senderContact && (
                                    <p className="text-error text-sm mt-1">{errors.senderContact.message}</p>
                                )}
                            </div>

                            {/* 3) Pickup Region */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Pickup Region *</span>
                                </label>
                                <select
                                    className={`select select-bordered select-md w-full ${errors.senderRegion ? "select-error" : ""}`}
                                    value={senderRegion || ""}
                                    onChange={onSenderRegionChange}
                                >
                                    <option value="" disabled>
                                        Select region
                                    </option>
                                    {Object.keys(REGION_SERVICE_CENTERS).map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>

                                {/* controlled select হওয়ায় register hidden */}
                                <input
                                    type="hidden"
                                    {...register("senderRegion", { required: "Region বাধ্যতামূলক" })}
                                />

                                {errors.senderRegion && (
                                    <p className="text-error text-sm mt-1">{errors.senderRegion.message}</p>
                                )}
                            </div>

                            {/* 4) Pickup Service Center */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Pickup Service Center *</span>
                                </label>
                                <select
                                    className={`select select-bordered select-md w-full ${errors.senderCenter ? "select-error" : ""}`}
                                    {...register("senderCenter", { required: "Service Center বাধ্যতামূলক" })}
                                    disabled={!senderRegion}
                                    defaultValue=""
                                >
                                    <option value="" disabled>
                                        {senderRegion ? "Select service center" : "Select region first"}
                                    </option>
                                    {senderCenters.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                                {errors.senderCenter && (
                                    <p className="text-error text-sm mt-1">{errors.senderCenter.message}</p>
                                )}
                            </div>

                            {/* 5) Address */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Address *</span>
                                </label>
                                <textarea
                                    className={`textarea textarea-bordered textarea-md w-full min-h-[120px] ${errors.senderAddress ? "textarea-error" : ""}`}
                                    {...register("senderAddress", { required: "Address বাধ্যতামূলক" })}
                                />
                                {errors.senderAddress && (
                                    <p className="text-error text-sm mt-1">{errors.senderAddress.message}</p>
                                )}
                            </div>

                            {/* 6) Pick up Instruction */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Pick up Instruction *</span>
                                </label>
                                <input
                                    className={`input input-bordered input-md w-full ${errors.pickupInstruction ? "input-error" : ""}`}
                                    {...register("pickupInstruction", { required: "Instruction বাধ্যতামূলক" })}
                                />
                                {errors.pickupInstruction && (
                                    <p className="text-error text-sm mt-1">{errors.pickupInstruction.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* -------- Receiver (6 fields) -------- */}
                    <div className="card bg-base-100 border border-base-300">
                        <div className="card-body space-y-4">
                            <h3 className="font-semibold text-lg">Receiver Info</h3>

                            {/* 1) Name */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Name *</span>
                                </label>
                                <input
                                    className={`input input-bordered input-md w-full ${errors.receiverName ? "input-error" : ""}`}
                                    {...register("receiverName", { required: "Receiver নাম বাধ্যতামূলক" })}
                                />
                                {errors.receiverName && (
                                    <p className="text-error text-sm mt-1">{errors.receiverName.message}</p>
                                )}
                            </div>

                            {/* 2) Contact */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Contact *</span>
                                </label>
                                <input
                                    className={`input input-bordered input-md w-full ${errors.receiverContact ? "input-error" : ""}`}
                                    placeholder="01XXXXXXXXX"
                                    {...register("receiverContact", {
                                        required: "Contact বাধ্যতামূলক",
                                        minLength: { value: 11, message: "কমপক্ষে ১১ ডিজিট দিন" },
                                    })}
                                />
                                {errors.receiverContact && (
                                    <p className="text-error text-sm mt-1">{errors.receiverContact.message}</p>
                                )}
                            </div>

                            {/* 3) Delivery Region */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Delivery Region *</span>
                                </label>
                                <select
                                    className={`select select-bordered select-md w-full ${errors.receiverRegion ? "select-error" : ""}`}
                                    value={receiverRegion || ""}
                                    onChange={onReceiverRegionChange}
                                >
                                    <option value="" disabled>
                                        Select region
                                    </option>
                                    {Object.keys(REGION_SERVICE_CENTERS).map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="hidden"
                                    {...register("receiverRegion", { required: "Region বাধ্যতামূলক" })}
                                />

                                {errors.receiverRegion && (
                                    <p className="text-error text-sm mt-1">{errors.receiverRegion.message}</p>
                                )}
                            </div>

                            {/* 4) Delivery Service Center */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Delivery Service Center *</span>
                                </label>
                                <select
                                    className={`select select-bordered select-md w-full ${errors.receiverCenter ? "select-error" : ""}`}
                                    {...register("receiverCenter", { required: "Service Center বাধ্যতামূলক" })}
                                    disabled={!receiverRegion}
                                    defaultValue=""
                                >
                                    <option value="" disabled>
                                        {receiverRegion ? "Select service center" : "Select region first"}
                                    </option>
                                    {receiverCenters.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                                {errors.receiverCenter && (
                                    <p className="text-error text-sm mt-1">{errors.receiverCenter.message}</p>
                                )}
                            </div>

                            {/* 5) Address */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Address *</span>
                                </label>
                                <textarea
                                    className={`textarea textarea-bordered textarea-md w-full min-h-[120px] ${errors.receiverAddress ? "textarea-error" : ""}`}
                                    {...register("receiverAddress", { required: "Address বাধ্যতামূলক" })}
                                />
                                {errors.receiverAddress && (
                                    <p className="text-error text-sm mt-1">{errors.receiverAddress.message}</p>
                                )}
                            </div>

                            {/* 6) Delivery Instruction */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Delivery Instruction *</span>
                                </label>
                                <input
                                    className={`input input-bordered input-md w-full ${errors.deliveryInstruction ? "input-error" : ""}`}
                                    {...register("deliveryInstruction", { required: "Instruction বাধ্যতামূলক" })}
                                />
                                {errors.deliveryInstruction && (
                                    <p className="text-error text-sm mt-1">{errors.deliveryInstruction.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Submit"}
                    </button>
                </div>
            </form>
        </div>
    );
}
