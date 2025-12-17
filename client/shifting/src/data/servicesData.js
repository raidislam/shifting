// src/data/services.js
import {
  FaTruckFast,
  FaRoute,
  FaWarehouse,
  FaBoxOpen,
  FaHeadset,
  FaShieldHalved,
} from "react-icons/fa6";

export const data = [
  {
    id: "same-day",
    title: "Same-Day Delivery",
    desc: "Fast local delivery with real-time tracking and instant proof of delivery.",
    icon: FaTruckFast,
    path: "/services/same-day",
  },
  {
    id: "route-optimization",
    title: "Route Optimization",
    desc: "Smarter routes that cut fuel costs, delays, and missed delivery windows.",
    icon: FaRoute,
    path: "/services/route-optimization",
  },
  {
    id: "warehouse-fulfillment",
    title: "Warehouse Fulfillment",
    desc: "Pick, pack, and dispatch from centralized inventory with fewer errors.",
    icon: FaWarehouse,
    path: "/services/warehouse-fulfillment",
  },
  {
    id: "returns-management",
    title: "Returns Management",
    desc: "Easy reverse logistics with return labels, status updates, and refunds flow.",
    icon: FaBoxOpen,
    path: "/services/returns-management",
  },
  {
    id: "customer-support",
    title: "Customer Support",
    desc: "24/7 delivery helpdesk with ticketing, call logs, and escalation rules.",
    icon: FaHeadset,
    path: "/services/customer-support",
  },
  {
    id: "secure-handling",
    title: "Secure Handling",
    desc: "Tamper checks, insured parcels, and compliant delivery verification.",
    icon: FaShieldHalved,
    path: "/services/secure-handling",
  },
];
