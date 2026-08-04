import { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiShield, FiUser } from "react-icons/fi";

import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import IconButton from "../components/IconButton.jsx";
import Field from "../components/Field.jsx";
import { useData } from "../store/DataContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

const BLANK = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "employee",
  status: "Active",
};

export default function Users() {
  const { staff, addUser, updateUser, deleteUser, notify } = useData();
  const { user: me } = useAuth();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState(null);

  const openAdd = () => {
    setEditing(null);
    setForm(BLANK);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({ ...user, password: "" });
    setErrors({});
    setFormOpen(true);
  };

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter a name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email.";
    const taken = staff.some(
      (u) => u.email.toLowerCase() === form.email.trim().toLowerCase() && u.id !== editing?.id
    );
    if (taken) next.email = "That email is already used by another account.";
    if (!editing && form.password.length < 6) next.password = "Use at least six characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form, email: form.email.trim().toLowerCase() };
    // Blank password on an edit means "leave it as it was".
    if (editing && !payload.password) payload.password = editing.password;
    if (editing) updateUser(editing.id, payload);
    else addUser(payload);
    setFormOpen(false);
  };

  const removeUser = (user) => {
    if (user.id === me.id) {
      notify("You can't delete the account you're signed in with.", "error");
      return;
    }
    deleteUser(user.id);
  };

  const columns = [
    {
      key: "name",
      header: "User",
      render: (u) => (
        <div className="d-flex align-items-center gap-3">
          <span
            className="avatar-round"
            style={
              u.role === "admin"
                ? { background: "var(--srms-brass)", color: "#fff" }
                : undefined
            }
          >
            {u.role === "admin" ? <FiShield size={15} /> : <FiUser size={15} />}
          </span>
          <div>
            <div className="fw-medium">
              {u.name}
              {u.id === me.id && <span className="label-caps text-brass ms-2">you</span>}
            </div>
            <div className="small text-secondary">{u.email}</div>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Phone", render: (u) => <span className="mono small">{u.phone || "—"}</span> },
    { key: "role", header: "Role", render: (u) => <span className="fw-medium text-capitalize">{u.role}</span> },
    {
      key: "access",
      header: "Access",
      render: (u) => (
        <span className="small text-secondary">
          {u.role === "admin"
            ? "All modules"
            : "Suits, customers, bookings, rentals, returns"}
        </span>
      ),
    },
    { key: "status", header: "Status", render: (u) => <StatusBadge status={u.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-end",
      render: (u) => (
        <div className="d-flex justify-content-end gap-1">
          <IconButton label="Edit" icon={FiEdit2} onClick={() => openEdit(u)} />
          <IconButton label="Delete" icon={FiTrash2} danger onClick={() => setConfirm(u)} />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Admin only"
        title="Users"
        description={`${staff.length} staff accounts. Employees can't open this page.`}
        actions={
          <button className="btn btn-warning" onClick={openAdd}>
            <FiPlus size={15} className="me-2" />
            Add employee
          </button>
        }
      />

      <DataTable
        columns={columns}
        rows={staff}
        searchKeys={["name", "email", "phone", "role"]}
        searchPlaceholder="Search staff"
        emptyTitle="No staff accounts"
        emptyHint="Add an employee so they can work the counter."
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Edit ${editing.name}` : "Add an employee"}
        subtitle={
          editing
            ? "Changing the role changes what they can open."
            : "They can sign in as soon as you save."
        }
        footer={
          <>
            <button className="btn btn-light" onClick={() => setFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="user-form" className="btn btn-primary">
              {editing ? "Save changes" : "Add employee"}
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={save} className="row g-3">
          <div className="col-12">
            <Field label="Full name" required error={errors.name}>
              <input
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                value={form.name}
                onChange={update("name")}
                placeholder="Hodan Cabdi"
              />
            </Field>
          </div>

          <div className="col-sm-6">
            <Field label="Email" required error={errors.email}>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={form.email}
                onChange={update("email")}
                placeholder="name@srms.com"
              />
            </Field>
          </div>

          <div className="col-sm-6">
            <Field label="Phone">
              <input
                className="form-control"
                value={form.phone}
                onChange={update("phone")}
                placeholder="+252 63 4000000"
              />
            </Field>
          </div>

          <div className="col-12">
            <Field
              label={editing ? "New password" : "Password"}
              required={!editing}
              error={errors.password}
              hint={editing ? "Leave empty to keep the current password." : ""}
            >
              <input
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                value={form.password}
                onChange={update("password")}
                placeholder="At least six characters"
              />
            </Field>
          </div>

          <div className="col-sm-6">
            <Field label="Role" hint="Admins can reach Users and delete records.">
              <select className="form-select" value={form.role} onChange={update("role")}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
          </div>

          <div className="col-sm-6">
            <Field label="Status" hint="Inactive accounts can't sign in.">
              <select className="form-select" value={form.status} onChange={update("status")}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </Field>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => removeUser(confirm)}
        title={`Remove ${confirm?.name}?`}
        message="They lose access straight away. Their past work stays in the records."
        confirmLabel="Remove user"
      />
    </>
  );
}
