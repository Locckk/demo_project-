import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 text-center px-4">
      <div>
        <div className="label-caps text-brass">Error 404</div>
        <h1 className="display-5 fw-bold mt-3">That page isn't on the rail</h1>
        <p className="text-secondary mx-auto" style={{ maxWidth: 380 }}>
          The address you opened doesn't match any page in the system.
        </p>
        <Link to="/dashboard" className="btn btn-primary mt-3">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
