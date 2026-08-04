import { useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiCheckCircle,
  FiClipboard,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiPlus,
  FiRotateCcw,
  FiUserPlus,
  FiAlertTriangle,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useData } from "../store/DataContext.jsx";
import { money } from "../utils/formatters.js";

const axisTick = { fontSize: 12, fill: "#4A5462", fontFamily: "IBM Plex Mono" };
const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid rgba(20,24,31,.12)",
  fontSize: 13,
};

export default function Dashboard() {
  const { user } = useAuth();
  const { suits, customers, bookings, rentals, isOverdue } = useData();
  const navigate = useNavigate();

  const available = suits.filter((s) => s.status === "Available").length;
  const rented = suits.filter((s) => s.status === "Rented").length;
  const activeRentals = rentals.filter((r) => ["Active", "Pending"].includes(r.status)).length;
  const openBookings = bookings.filter((b) => ["Pending", "Confirmed"].includes(b.status)).length;
  const overdue = rentals.filter(isOverdue).length;
  const revenue = rentals
    .filter((r) => r.payment === "Paid" && r.status !== "Cancelled")
    .reduce((sum, r) => sum + r.amount + (r.lateFee || 0), 0);

  // Charts read the live rentals, so they move as you work.
  const revenueByMonth = Object.values(
    rentals
      .filter((r) => r.status !== "Cancelled")
      .reduce((acc, r) => {
        const month = r.rentalDate.slice(0, 7);
        acc[month] = acc[month] || { month, revenue: 0 };
        acc[month].revenue += r.amount;
        return acc;
      }, {})
  ).sort((a, b) => a.month.localeCompare(b.month));

  const categoryMix = Object.entries(
    rentals.reduce((acc, r) => {
      const suit = suits.find((s) => s.id === r.suitId);
      const key = suit?.category || "Other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: "Total suits", value: suits.length, icon: FiPackage, hint: "in the catalogue" },
    { label: "Available", value: available, icon: FiCheckCircle, hint: "ready to rent" },
    { label: "Out on rent", value: rented, icon: FiClipboard, hint: "with customers" },
    { label: "Customers", value: customers.length, icon: FiUsers, hint: "registered" },
    { label: "Open bookings", value: openBookings, icon: FiCalendar, hint: "reserved ahead" },
    {
      label: "Revenue collected",
      value: money(revenue),
      icon: FiDollarSign,
      hint: "paid in full",
      accent: true,
    },
  ];

  const recent = [...rentals]
    .sort((a, b) => b.rentalDate.localeCompare(a.rentalDate))
    .slice(0, 5);

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Good to see you, ${firstName}`}
        description="Here's where the rail stands today."
        actions={
          <>
            <button className="btn btn-warning" onClick={() => navigate("/rentals")}>
              <FiPlus size={15} className="me-2" />
              New rental
            </button>
            <button className="btn btn-light" onClick={() => navigate("/bookings")}>
              <FiCalendar size={15} className="me-2" />
              New booking
            </button>
            <button className="btn btn-light" onClick={() => navigate("/returns")}>
              <FiRotateCcw size={15} className="me-2" />
              Process return
            </button>
            <button className="btn btn-light" onClick={() => navigate("/customers")}>
              <FiUserPlus size={15} className="me-2" />
              Add customer
            </button>
          </>
        }
      />

      {overdue > 0 && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <FiAlertTriangle size={17} />
          <span className="small mb-0">
            {overdue} {overdue === 1 ? "rental is" : "rentals are"} past the return date.{" "}
            <button
              className="btn btn-link btn-sm p-0 align-baseline"
              onClick={() => navigate("/returns")}
            >
              Open Returns
            </button>
          </span>
        </div>
      )}

      {/* Statistics */}
      <div className="row g-3">
        {stats.map((s) => (
          <div className="col-12 col-sm-6 col-xl-4" key={s.label}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="row g-3 mt-1">
        <div className="col-12 col-lg-7">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-baseline mb-4">
                <div>
                  <h2 className="h5 mb-1">Revenue by month</h2>
                  <p className="small text-secondary mb-0">Booked value of every rental taken.</p>
                </div>
                <span className="label-caps text-brass">USD</span>
              </div>

              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueByMonth} margin={{ left: -18, right: 6, top: 4 }}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B8873B" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#B8873B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#14181F" strokeOpacity={0.08} vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTick} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTick} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [money(v), "Revenue"]} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#B8873B"
                    strokeWidth={2}
                    fill="url(#revFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h5 mb-1">Rentals by category</h2>
              <p className="small text-secondary mb-4">Which part of the rail earns most.</p>

              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categoryMix} layout="vertical" margin={{ left: 24, right: 16 }}>
                  <CartesianGrid stroke="#14181F" strokeOpacity={0.08} horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={axisTick}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={78}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#2A323D" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(184,135,59,.08)" }}
                    contentStyle={tooltipStyle}
                    formatter={(v) => [`${v} rentals`, ""]}
                  />
                  <Bar dataKey="value" fill="#2A323D" radius={[0, 4, 4, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent rentals */}
      <div className="card mt-3">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h2 className="h5 mb-1">Recent rentals</h2>
            <p className="small text-secondary mb-0">The last five bookings taken at the counter.</p>
          </div>
          <button className="btn btn-light btn-sm" onClick={() => navigate("/rentals")}>
            View all
          </button>
        </div>
        <div className="chalk-rule" />
        <div className="table-responsive">
          <table className="table srms-table mb-0">
            <thead>
              <tr>
                <th>Rental</th>
                <th>Customer</th>
                <th>Suit</th>
                <th>Due back</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id}>
                  <td className="mono small">{r.id}</td>
                  <td className="fw-medium">{r.customer}</td>
                  <td className="text-secondary">{r.suit}</td>
                  <td className="mono small">{r.returnDate}</td>
                  <td className="mono">{money(r.amount)}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
