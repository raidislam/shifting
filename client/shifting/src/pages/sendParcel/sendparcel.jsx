import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLoaderData } from "react-router";
import Swal from "sweetalert2";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxiosSecure";


function getCostBreakdown({ parcelType, pickupCenter, deliveryCenter, weight }) {
    const withinCity = pickupCenter === deliveryCenter;
    const w = Number(weight || 0);

    // Document
    if (parcelType === "document") {
        const base = withinCity ? 60 : 80;
        return {
            withinCity,
            total: base,
            lines: [
                { label: "Parcel type", value: "Document" },
                { label: "Route", value: withinCity ? "Within City" : "Outside City/District" },
                { label: "Base charge", amount: base },
            ],
        };
    }

    // Non-document
    const base = withinCity ? 110 : 150;

    // up to 3kg
    if (w <= 3) {
        return {
            withinCity,
            total: base,
            lines: [
                { label: "Parcel type", value: "Non-document" },
                { label: "Route", value: withinCity ? "Within City" : "Outside City/District" },
                { label: "Weight", value: `${w || 0} kg (up to 3kg)` },
                { label: "Base charge", amount: base },
            ],
        };
    }

    // more than 3kg
    const extraKg = w - 3;
    const extraCharge = extraKg * 40;
    const outsideExtra = withinCity ? 0 : 40;

    const total = base + extraCharge + outsideExtra;

    return {
        withinCity,
        total,
        lines: [
            { label: "Parcel type", value: "Non-document" },
            { label: "Route", value: withinCity ? "Within City" : "Outside City/District" },
            { label: "Base charge (first 3kg)", amount: base },
            { label: `Extra weight (${extraKg.toFixed(1)} kg × ৳40)`, amount: extraCharge },
            ...(outsideExtra
                ? [{ label: "Outside extra charge", amount: outsideExtra }]
                : []),
        ],
    };
}



export default function ParcelCreateForm({ currentUserName = "", branches = [], currentUserEmail = "" }) {
    const [isSaving, setIsSaving] = useState(false);
    const serviceCenterList = useLoaderData();
    const { user } = useAuth()
    const axiosSecure = useAxiosSecure();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            senderName: currentUserName, // prefill if available
            parcelType: "document",
        },
        mode: "onTouched",
    });

    const parcelType = watch("parcelType");
    const senderRegion = watch("senderRegion");
    const receiverRegion = watch("receiverRegion");

    const regions = useMemo(() => {
        const set = new Set(
            (serviceCenterList || [])
                .map((b) => String(b.region || "").trim())
                .filter(Boolean)
        );
        return Array.from(set).sort();
    }, [serviceCenterList]);


    const senderCenters = useMemo(() => {
        if (!senderRegion) return [];
        const set = new Set(
            (serviceCenterList || [])
                .filter((b) => b.region === senderRegion)
                .map((b) => String(b.district || "").trim())
                .filter(Boolean)
        );
        return Array.from(set).sort();
    }, [serviceCenterList, senderRegion]);

    const receiverCenters = useMemo(() => {
        if (!receiverRegion) return [];
        const set = new Set(
            (serviceCenterList || [])
                .filter((b) => b.region === receiverRegion)
                .map((b) => String(b.district || "").trim())
                .filter(Boolean)
        );
        return Array.from(set).sort();
    }, [serviceCenterList, receiverRegion]);

    // Reset service center when region changes (to prevent invalid selections)
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

    // On submit: show cost + confirm inside a toast (save happens after confirm)
    const onSubmit = async (data) => {
        // You can still use calculateCost, but breakdown returns total anyway
        const breakdown = getCostBreakdown({
            parcelType: data.parcelType,
            pickupCenter: data.senderCenter,
            deliveryCenter: data.receiverCenter,
            weight: data.weight,
        });

        const breakdownHtml = `
    <div style="text-align:left; font-size:14px; line-height:1.4">
      <div style="margin-bottom:10px">
        <div><b>Pickup:</b> ${data.senderRegion} → ${data.senderCenter}</div>
        <div><b>Delivery:</b> ${data.receiverRegion} → ${data.receiverCenter}</div>
      </div>

      <table style="width:100%; border-collapse:collapse">
        <tbody>
          ${breakdown.lines
                .map((item) => {
                    if (typeof item.amount === "number") {
                        return `
                  <tr>
                    <td style="padding:6px 0; opacity:.85">${item.label}</td>
                    <td style="padding:6px 0; text-align:right"><b>৳${item.amount}</b></td>
                  </tr>
                `;
                    }
                    return `
                <tr>
                  <td style="padding:6px 0; opacity:.85">${item.label}</td>
                  <td style="padding:6px 0; text-align:right">${item.value}</td>
                </tr>
              `;
                })
                .join("")}
        </tbody>
      </table>

      <div style="border-top:1px solid #e5e7eb; margin-top:10px; padding-top:10px; display:flex; justify-content:space-between">
        <span style="font-size:15px"><b>Total</b></span>
        <span style="font-size:16px"><b>৳${breakdown.total}</b></span>
      </div>

      <div style="margin-top:8px; opacity:.75">
        Click <b>Confirm Payment</b> to proceed, or <b>Edit</b> to change details.
      </div>
    </div>
  `;

        const result = await Swal.fire({
            title: "Review & Payment",
            html: breakdownHtml,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Confirm Payment",
            cancelButtonText: "Edit",
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#6b7280",
            reverseButtons: true, // makes Edit appear on left (UX-friendly)
        });

        if (result.isConfirmed) {
            await onConfirmSave({ ...data, cost: breakdown.total });
        }
    };


    // Confirm save handler
    const onConfirmSave = async (dataWithCost) => {
        setIsSaving(true);

        const nowIso = new Date().toISOString();

        const breakdown = getCostBreakdown({
            parcelType: dataWithCost.parcelType,
            pickupCenter: dataWithCost.senderCenter,
            deliveryCenter: dataWithCost.receiverCenter,
            weight: dataWithCost.weight,
        });

        const payload = {
            ...dataWithCost,

            // who created
            created_by: {
                name: user.name,
                email: user.email,
            },

            // time (ISO UTC)
            created_at: nowIso,

            // tracking basics
            tracking_id: crypto.randomUUID(), // later: generate on backend
            delivery_status: "created",
            payment_status: "pending",
            status_history: [
                {
                    delivery_status: "created",
                    payment_status: "pending",
                    at: nowIso,
                    by: user.email || "system",
                    note: "Parcel created",
                },
            ],

            // route
            route_type:
                dataWithCost.senderCenter === dataWithCost.receiverCenter
                    ? "within_city"
                    : "outside_district",

            // pricing breakdown
            charges: {
                lines: breakdown.lines,
                total: breakdown.total,
            },
        };
        console.log(payload);
        try {
            Swal.fire({
                title: "Saving...",
                text: "Please wait while we save your parcel.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const res = await axiosSecure.post("/api/v1/orders/order-parcels", payload)
                .then(res => {
                    console.log(res)
                    if (res.data.ok) {
                        Swal.fire({
                            title: "Redirecting...",
                            text: "Please wait while we redirect you to the payment page.",
                            html: `<p><b>Cost:</b> ৳${dataWithCost.cost}</p>`,
                            icon: "success",
                            confirmButtonText: "OK",
                            timer: 1000,
                            confirmButtonColor: "#16a34a",
                        });
                    }
                })

            if (!res.data.ok) {
                const text = await res.text();
                throw new Error(text || "Server error");
            }



            reset({
                senderName: currentUserName,
                parcelType: "document",
            });
        } catch (err) {
            Swal.fire({
                title: "Save failed",
                text: err.message || "Something went wrong",
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#dc2626",
            });
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
                        All fields are required (except weight). Submit → show cost toast →
                        Confirm → save.
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
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Type *</span>
                                </label>
                                <select
                                    className={`select select-bordered select-md w-full ${errors.parcelType ? "select-error" : ""
                                        }`}
                                    {...register("parcelType", {
                                        required: "Type is required",
                                    })}
                                >
                                    <option value="document">Document</option>
                                    <option value="non-document">Non-document</option>
                                </select>
                                {errors.parcelType && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.parcelType.message}
                                    </p>
                                )}
                            </div>

                            {/* Title */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Title *</span>
                                </label>
                                <input
                                    className={`input input-bordered input-md w-full ${errors.title ? "input-error" : ""
                                        }`}
                                    {...register("title", { required: "Title is required" })}
                                />
                                {errors.title && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.title.message}
                                    </p>
                                )}
                            </div>

                            {/* Weight (optional, only for non-document) */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">
                                        Weight (kg){" "}
                                        {parcelType === "non-document" ? "(optional)" : "(not needed)"}
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    disabled={parcelType !== "non-document"}
                                    className={`input input-bordered input-md w-full ${errors.weight ? "input-error" : ""
                                        }`}
                                    {...register("weight", {
                                        validate: (val) => {
                                            if (!val) return true; // optional
                                            const n = Number(val);
                                            if (Number.isNaN(n) || n < 0)
                                                return "Weight must be a valid number";
                                            return true;
                                        },
                                    })}
                                />
                                {errors.weight && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.weight.message}
                                    </p>
                                )}
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
                                    className={`input input-bordered input-md w-full ${errors.senderName ? "input-error" : ""
                                        }`}
                                    {...register("senderName", { required: "Sender name is required" })}
                                />
                                {errors.senderName && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.senderName.message}
                                    </p>
                                )}
                            </div>

                            {/* 2) Contact */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Contact *</span>
                                </label>
                                <input
                                    className={`input input-bordered input-md w-full ${errors.senderContact ? "input-error" : ""
                                        }`}
                                    placeholder="01XXXXXXXXX"
                                    {...register("senderContact", {
                                        required: "Sender contact is required",
                                        minLength: { value: 11, message: "Must be at least 11 digits" },
                                    })}
                                />
                                {errors.senderContact && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.senderContact.message}
                                    </p>
                                )}
                            </div>

                            {/* 3) Pickup Region */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Pickup Region *</span>
                                </label>
                                <select
                                    className={`select select-bordered select-md w-full ${errors.senderRegion ? "select-error" : ""
                                        }`}
                                    value={senderRegion || ""}
                                    onChange={onSenderRegionChange}
                                >
                                    <option value="" disabled>
                                        Select region
                                    </option>
                                    {regions.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>

                                {/* Register hidden because select is controlled */}
                                <input
                                    type="hidden"
                                    {...register("senderRegion", { required: "Pickup region is required" })}
                                />

                                {errors.senderRegion && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.senderRegion.message}
                                    </p>
                                )}
                            </div>

                            {/* 4) Pickup Service Center */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Pickup Service Center *</span>
                                </label>
                                <select
                                    className={`select select-bordered select-md w-full ${errors.senderCenter ? "select-error" : ""
                                        }`}
                                    {...register("senderCenter", {
                                        required: "Pickup service center is required",
                                    })}
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
                                    <p className="text-error text-sm mt-1">
                                        {errors.senderCenter.message}
                                    </p>
                                )}
                            </div>

                            {/* 5) Address */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Address *</span>
                                </label>
                                <textarea
                                    className={`textarea textarea-bordered textarea-md w-full min-h-[120px] ${errors.senderAddress ? "textarea-error" : ""
                                        }`}
                                    {...register("senderAddress", { required: "Pickup address is required" })}
                                />
                                {errors.senderAddress && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.senderAddress.message}
                                    </p>
                                )}
                            </div>

                            {/* 6) Pick up Instruction */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Pick up Instruction *</span>
                                </label>
                                <input
                                    className={`input input-bordered input-md w-full ${errors.pickupInstruction ? "input-error" : ""
                                        }`}
                                    {...register("pickupInstruction", {
                                        required: "Pickup instruction is required",
                                    })}
                                />
                                {errors.pickupInstruction && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.pickupInstruction.message}
                                    </p>
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
                                    className={`input input-bordered input-md w-full ${errors.receiverName ? "input-error" : ""
                                        }`}
                                    {...register("receiverName", { required: "Receiver name is required" })}
                                />
                                {errors.receiverName && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.receiverName.message}
                                    </p>
                                )}
                            </div>

                            {/* 2) Contact */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Contact *</span>
                                </label>
                                <input
                                    className={`input input-bordered input-md w-full ${errors.receiverContact ? "input-error" : ""
                                        }`}
                                    placeholder="01XXXXXXXXX"
                                    {...register("receiverContact", {
                                        required: "Receiver contact is required",
                                        minLength: { value: 11, message: "Must be at least 11 digits" },
                                    })}
                                />
                                {errors.receiverContact && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.receiverContact.message}
                                    </p>
                                )}
                            </div>

                            {/* 3) Delivery Region */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Delivery Region *</span>
                                </label>
                                <select
                                    className={`select select-bordered select-md w-full ${errors.receiverRegion ? "select-error" : ""
                                        }`}
                                    value={receiverRegion || ""}
                                    onChange={onReceiverRegionChange}
                                >
                                    <option value="" disabled>
                                        Select region
                                    </option>
                                    {regions.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="hidden"
                                    {...register("receiverRegion", {
                                        required: "Delivery region is required",
                                    })}
                                />

                                {errors.receiverRegion && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.receiverRegion.message}
                                    </p>
                                )}
                            </div>

                            {/* 4) Delivery Service Center */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Delivery Service Center *</span>
                                </label>
                                <select
                                    className={`select select-bordered select-md w-full ${errors.receiverCenter ? "select-error" : ""
                                        }`}
                                    {...register("receiverCenter", {
                                        required: "Delivery service center is required",
                                    })}
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
                                    <p className="text-error text-sm mt-1">
                                        {errors.receiverCenter.message}
                                    </p>
                                )}
                            </div>

                            {/* 5) Address */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Address *</span>
                                </label>
                                <textarea
                                    className={`textarea textarea-bordered textarea-md w-full min-h-30 ${errors.receiverAddress ? "textarea-error" : ""
                                        }`}
                                    {...register("receiverAddress", {
                                        required: "Delivery address is required",
                                    })}
                                />
                                {errors.receiverAddress && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.receiverAddress.message}
                                    </p>
                                )}
                            </div>

                            {/* 6) Delivery Instruction */}
                            <div className="form-control w-full">
                                <label className="label py-1">
                                    <span className="label-text">Delivery Instruction *</span>
                                </label>
                                <input
                                    className={`input input-bordered input-md w-full ${errors.deliveryInstruction ? "input-error" : ""
                                        }`}
                                    {...register("deliveryInstruction", {
                                        required: "Delivery instruction is required",
                                    })}
                                />
                                {errors.deliveryInstruction && (
                                    <p className="text-error text-sm mt-1">
                                        {errors.deliveryInstruction.message}
                                    </p>
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
