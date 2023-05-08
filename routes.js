import React, { Component } from "react";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import Home from "./components/Home";
import JobOrder from "./components/JobOrders";
import Calendar from "./components/Calendar/Calendar";
import ManageCards from "./components/ManageCards";
import ManageCard from "./components/ManageCards/ManageCard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JobOrderDetails from "./components/JobOrders/JobOrderDetails";
import PostLogin from "./components/Authentication/PostLogin";
import AuthenticationService from "./services/authenticationService";
import ErrorPage from "./components/Authentication/error";
import AppraiserLayout from "./container/AppraiserLayout";
import AppraiserProfile from "./components/Profile/";
import SignIn from "./components/Authentication/SignIn";
import ForgetPassword from "./components/Authentication/ForgotPassword";
import ResetPassword from "./components/Authentication/ResetPassword";
import ChangePassword from "./components/ChangePassword/ChangePassword";
import ShortCallLink from "./components/Authentication/shortCallLink";
import FloorScanList from "./components/FloorScanJob/FloorScanList";
import TechnicianJobOrder from "./components/FloorScanJob/FloorScanJobOrders";
import View2DFloorPlan from "./components/FloorScanJob/View2DFloorPlan";
import View3DFloorPlan from "./components/FloorScanJob/View3DFloorPlan";
import JobOrdersManagement from "./components/JobOrders/JobOrdersManagement/JobOrdersManagement";
import { useSelector } from "react-redux";
import { appname, ROLE } from "./constants/appConstant";
// import useFetchProfile from "./Hooks/useFetchProfile";
import localStorage from "./services/storage";
import sessionStorage from "./services/sessionStorage";
import Workspace from "./components/Workspace";
import SwitchTenant from "./components/Workspace/SwitchTenant";
import { getSubDomainFromURL } from "./helpers";
import { isEmpty } from "lodash";
import ReloginPopup from "./components/common/ReloginPopup";
import ViewFloorPlan from "./components/JobOrders/JobOrderDetails/ViewFloorPlan";
import TransactionHistory from "./components/TransactionHistory";
export const PublicRoute = ({
  component: Component,
  isAllowed = true,
  ...rest
}) => {
  const history = useHistory();
  let searchParams = new URLSearchParams(history.location.search);
  let userRole = searchParams.get("userRole");
  if (!userRole) {
    userRole = AuthenticationService.getUserRole();
  } else {
    userRole = Buffer.from(userRole, "base64").toString("ascii");
  }
  if (
    !history.location.pathname.includes("switch-tenant") &&
    (userRole === ROLE.SWITCH_MULTITENANT_APPRAISER ||
      userRole === ROLE.SWITCH_MULTITENANT_TECHNICIAN)
  ) {
    return null;
  }
  const token = AuthenticationService.getToken();
  if (
    token &&
    !(
      userRole === ROLE.APPRAISER ||
      userRole === ROLE.TECHNICIAN ||
      userRole === ROLE.SWITCH_MULTITENANT_APPRAISER ||
      userRole === ROLE.SWITCH_MULTITENANT_TECHNICIAN
    )
  ) {
    localStorage.clearAll();
    sessionStorage.clearAll();
    return <Route {...rest} render={() => <Redirect to="/sign-in" />} />;
  }
  return (
    <Route
      {...rest}
      render={(props) =>
        !token || isAllowed ? <Component {...props} /> : <Redirect to="/" />
      }
    />
  );
};

export const PrivateRoute = ({
  component: Component,
  isAllowed = true,
  ...rest
}) => {
  const token = AuthenticationService.getToken();
  const redirectPath = token ? "/unauthorized" : "/sign-in";
  const userRole = AuthenticationService.getUserRole();
  if (
    token &&
    !(
      userRole === ROLE.APPRAISER ||
      userRole === ROLE.TECHNICIAN ||
      userRole === ROLE.SWITCH_MULTITENANT_APPRAISER ||
      userRole === ROLE.SWITCH_MULTITENANT_TECHNICIAN
    )
  ) {
    localStorage.clearAll();
    sessionStorage.clearAll();
    return <Route {...rest} render={() => <Redirect to="/sign-in" />} />;
  }
  return (
    <Route
      {...rest}
      render={(props) =>
        token && isAllowed ? (
          <Component {...props} />
        ) : (
          <Redirect to={redirectPath} />
        )
      }
    />
  );
};

// eslint-disable-next-line import/no-anonymous-default-export
export default function Routes() {
  let tenantName = useSelector((state) => {
    return state?.whiteLabel?.getTenantThemeSuccess?.tenantName;
  });
  document.title = isEmpty(tenantName) ? appname : tenantName;
  let userRole = null;
  const history = useHistory();
  let searchParams = new URLSearchParams(history.location.search);
  if (!userRole) {
    userRole = searchParams.get("userRole");
    let type = searchParams.get("type");
    if (userRole) {
      type && AuthenticationService.setStorageType(type);
      if (userRole === ROLE.SWITCH_MULTITENANT_TECHNICIAN) {
        userRole = ROLE.TECHNICIAN;
      } else if (userRole === ROLE.SWITCH_MULTITENANT_APPRAISER) {
        userRole = ROLE.APPRAISER;
      }
      AuthenticationService.setUserRole(userRole);
      userRole = Buffer.from(userRole, "base64").toString("ascii");
    } else {
      userRole = AuthenticationService.getUserRole();
    }
  }

  const subDomain = getSubDomainFromURL();
  const authenticationLoading = useSelector(
    (state) => state.authentication.authLoading // make authLoading true whenever we are saving the user role
  );
  const reLogin = useSelector((state) => state.errorReducer.reLogin);
  if (authenticationLoading) {
    // need to show loader when we are saving user role
    return (
      <div class="wrapper-loading">
        <div class="loader-spin"></div>
      </div>
    );
  }
  return (
    <div>
      {reLogin ? (
        <ReloginPopup />
      ) : (
        <ToastContainer
          position="top-center"
          hideProgressBar={true}
          draggable={false}
          closeOnClick={false}
          autoClose={6000}
        />
      )}
      <Switch>
        {/* <Route path="/login" component={JobOrder} /> */}
        <Route path="/" auth={true}>
          <Switch>
            <PublicRoute
              path="/sign-in"
              component={SignIn}
              title={"SignIn"}
              exact
              isAllowed={false}
            />
            <PublicRoute
              path="/forgot-password"
              component={ForgetPassword}
              title="Forgot Password"
              exact
              isAllowed={false}
            />
            <PublicRoute
              path="/reset-password/:userId"
              exact
              title="Reset Password"
              component={ResetPassword}
            />
            <PrivateRoute
              path="/"
              exact
              auth={true}
              component={
                userRole === ROLE.APPRAISER ||
                userRole === ROLE.SWITCH_MULTITENANT_APPRAISER
                  ? AppraiserLayout(JobOrder)
                  : AppraiserLayout(TechnicianJobOrder)
              }
            />
            <PrivateRoute
              path="/profile"
              exact
              auth={true}
              component={AppraiserLayout(AppraiserProfile)}
            />

            <PrivateRoute
              path="/my-job-orders/:id"
              exact
              auth={true}
              component={AppraiserLayout(FloorScanList)}
            />
            <PrivateRoute
              path="/profile/change-password"
              exact
              auth={true}
              component={AppraiserLayout(ChangePassword)}
            />
            <PrivateRoute
              path="/view-floorscan/:scanId"
              auth={true}
              exact
              component={
                userRole === ROLE.APPRAISER
                  ? AppraiserLayout(ViewFloorPlan)
                  : AppraiserLayout(View2DFloorPlan)
              }
            />
            <PrivateRoute
              path="/cards"
              exact
              auth={true}
              component={AppraiserLayout(ManageCards)}
              isAllowed={userRole === ROLE.APPRAISER}
            />
            <PrivateRoute
              path="/cards/manage"
              exact
              auth={true}
              component={AppraiserLayout(ManageCard)}
              isAllowed={userRole === ROLE.APPRAISER}
            />
            <PrivateRoute
              path="/calendar"
              exact
              auth={true}
              component={AppraiserLayout(Calendar)}
              isAllowed={userRole === ROLE.APPRAISER}
            />
            <PrivateRoute
              path="/joborder/:id"
              exact
              auth={true}
              component={AppraiserLayout(JobOrderDetails)}
              isAllowed={userRole === ROLE.APPRAISER}
            />
            <PrivateRoute
              path="/job-order"
              exact
              title="Create Job Order"
              component={AppraiserLayout(JobOrdersManagement)}
              isAllowed={userRole === ROLE.APPRAISER}
            />
            <PrivateRoute
              path="/job-order/:jobOrderId"
              exact
              title="Edit Job Order"
              component={AppraiserLayout(JobOrdersManagement)}
              isAllowed={userRole === ROLE.APPRAISER}
            />
            <PrivateRoute
              path="/tenants"
              exact
              auth={true}
              component={Workspace}
              isAllowed={!subDomain}
            />
            <PublicRoute
              path="/switch-tenant/:tenantDomain"
              exact
              auth={true}
              component={SwitchTenant}
            />
            <PrivateRoute
              path="/transaction-history"
              exact
              auth={true}
              component={AppraiserLayout(TransactionHistory)}
              isAllowed={userRole === ROLE.APPRAISER}
            />
            <PublicRoute exact path="/joincall/:id" component={ShortCallLink} />
            <Route path="/signinCallback" exact component={PostLogin} />
            <PublicRoute path="/unauthorized" exact component={ErrorPage} />
            <Route component={ErrorPage} />
          </Switch>
        </Route>
      </Switch>
    </div>
  );
}
