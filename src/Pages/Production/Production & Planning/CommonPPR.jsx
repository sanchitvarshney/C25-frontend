
import { Link, useLocation } from "react-router-dom";

const CommonPPR = () => {
  const { pathname } = useLocation();
  return (
    <>
      <div
        id="sidebar2"
        className="sidebar sidebar-fixed sidebar-hover sidebar-h collapsed-h sidebar-light has-open sidebar-backdrop"
        data-dismiss="true"
        data-backdrop="true"
        data-swipe="true"
      >
        <div className="sidebar-inner align-items-xl-end border-b-1 brc-grey-l2 border-r-0 shadow-none">
          <div className="d-xl-none text-right position-tr" style={{ zIndex: "5" }}>
            <button
              type="button"
              className="btn collapsed btn-light-red radius-0"
              data-toggle-mobile="sidebar"
              data-target="#sidebar2"
              aria-controls="sidebar2"
              aria-expanded="false"
              aria-label="Toggle sidebar"
            >
              <i className="fa fa-times"></i>
            </button>
          </div>
          <nav
            aria-label="Main"
            className="ml-xl-3 flex-grow-1 flex-xl-grow-0 d-xl-flex flex-xl-row ace-scroll"
            data-ace-scroll="{}"
          >
            <ul className="nav w-auto has-active-border active-on-right active-on-top">
              <li className={`nav-item ${pathname == "/production-and-plan/create" && "active"}`}>
                <Link className="nav-link" to="/production-and-plan/create">
                  <span>Create PPR</span>
                </Link>
                <b className="sub-arrow"></b>
              </li>
              <li className={`nav-item ${pathname == "/production-and-plan/pending" && "active"}`}>
                <Link className="nav-link" to="/production-and-plan/pending">
                  <span>Pending PPR</span>
                </Link>
                <b className="sub-arrow"></b>
              </li>
              <li className={`nav-item ${pathname == "/production-and-plan/completed" && "active"}`}>
                <Link className="nav-link" to="/production-and-plan/completed">
                  <span>Completed PPR</span>
                </Link>
                <b className="sub-arrow"></b>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default CommonPPR;
