import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Col, Menu, Row, Tooltip, Typography } from "antd";
import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux/es/exports";
import internalLinks from "../Pages/internalLinks";
import { customColor } from "../utils/customColor";
import { isShowIconsPath } from "../utils/general";
import { triggerReportNavDetailedDownload } from "../utils/reportNavDetailedDownload";

export default function InternalNav({
  // links,
  placeholder,
  menuWidth,
  additional,
}) {
  const { pathname } = useLocation();
  const [linksList, setLinksList] = useState([]);
  const [current, setCurrent] = useState("");
  const navigate = useNavigate();

const shouldShowIcon = useMemo(() => {
  return isShowIconsPath.some((path) => path === pathname);
}, [ pathname]);
  const onClick = (e) => {
    setCurrent(e.key);
  };
  useEffect(() => {
    let key =
      linksList &&
      linksList
        ?.filter((link) => link.routePath == pathname)[0]
        ?.key.toString();

    setCurrent(key);
  }, [linksList]);

  useEffect(() => {
    let arr = [];
    internalLinks.map((group) => {
      if (group.filter((link) => link.routePath == pathname)[0]) {
        arr = group;
      }
    });
    let current = arr.filter((row) => row.routePath === pathname)[0];

    if (current) {
      document.title = "IMS | " + current.routeName;
    } else {
      document.title = "IMS";
    }
    arr = arr?.map((link, index) => {
      return {
        ...link,
        key: index,
      };
    });
    setLinksList(arr);
  }, [navigate]);
  return (
    <div
      className="antMenu"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Menu
        onClick={onClick}
        selectedKeys={[current]}
        size="small"
        mode="horizontal"
        style={{flex:1}}
        items={
          linksList &&
          linksList?.map((link, index) => ({
            key: link.key.toString(),
            label: (
              <Tooltip
                placement="bottomLeft"
                styles={{ root: { fontSize: "0.7rem", color: "white" } }}
                color={customColor.textColor}
                title={link.placeholder && link.placeholder}
              >
                <Link
                  to={link.routePath}
                  style={{ color: customColor.textColor }}
                >
                  <span>{link.routeName}</span>
                  <span style={{ marginLeft: 5 }}>
                    {pathname == link.routePath && link.placeholder}
                  </span>
                </Link>
              </Tooltip>
            ),
          }))
        }
      />

      {shouldShowIcon && (
        <Tooltip title="Download brief report" placement="left">
          <span
            role="button"
            onClick={() => triggerReportNavDetailedDownload()}
       
            style={{
              color: customColor.tertiaryColor,
              cursor: "pointer",
              marginRight: 20,
              width: 60,
            }}
          >
            <img src="/download.png" alt="Download brief report" height="30px" width="30px" />
          </span>
        </Tooltip>
      )}
    </div>
  );
}
