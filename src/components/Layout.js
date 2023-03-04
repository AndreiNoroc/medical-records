import { Outlet, Link } from "react-router-dom";

const Layout = () => {
    return (
      <>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/doctor">Doctor</Link>
            </li>
            <li>
              <Link to="/client">Client</Link>
            </li>
            <li>
              <Link to="/pharmacist">Pharmacist</Link>
            </li>
          </ul>
        </nav>
        <Outlet />
      </>
    )
};

export default Layout;
