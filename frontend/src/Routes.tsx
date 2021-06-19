import React from "react";
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from "./components/Home/Home";
import Room from "./components/Room/Room";
// import Inventory from "./components/Inventory/Inventory";
// import InventoryContainer from "./components/Inventory/InventoryContainer";
// import Login from './components/Login/Login';

// import { isAuthenticated } from "./services/auth";

// const PrivateRoute = ({ component: Component, ...props }: { component: any, [x: string]: any }) => (
//     <Route
//         {...props}
//         render={props =>
//         isAuthenticated() ? (
//             <Component {...props} />
//         ) : (
//             <Redirect to={{ pathname: "/", state: { from: props.location } }} />
//         )
//         }
//     />
// );

const Routes = () => (
    <BrowserRouter>
        <Switch>
            {/* <Route exact path="/" component={Home} /> */}
            <Route exact path="/" component={Home} />
            <Route exact path="/room" component={Room} />
            {/* <Route exact path="/:token" component={ProviderEdit} /> */}
            {/* <Route path="/signup" component={() => <h1>SignUp</h1>} /> */}
            {/* <PrivateRoute path="/app" component={Home} />
            <PrivateRoute path="/inventory" component={InventoryContainer} /> */}
            <Route path="*" component={() => <h1>Page not found</h1>} />
        </Switch>
    </BrowserRouter>
);

export default Routes;