import React from "react";
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import Home from "./components/Home/Home";
import Room from "./components/Room/Room";
import { useFirebase } from "./Firebase";
// import Inventory from "./components/Inventory/Inventory";
// import InventoryContainer from "./components/Inventory/InventoryContainer";
// import Login from './components/Login/Login';

const PrivateRoute = ({ component: Component, user, ...props }: { component: any, [x: string]: any }) => (
    <Route
        {...props}
        render={props =>
        user ? (
            <Component {...props} />
        ) : (
            <Redirect to={{ pathname: "/", state: { from: props.location } }} />
        )
        }
    />
);

const Routes = () => {
    return (
        <Switch>
            {/* <Route exact path="/" component={Home} /> */}
            <Route exact path="/" component={Home} />
            <Route exact path="/room">
                <Redirect to="/" />
            </Route>
            <Route exact path="/room/:id" component={Room} />
            {/* <Route exact path="/:token" component={ProviderEdit} /> */}
            {/* <Route path="/signup" component={() => <h1>SignUp</h1>} /> */}
            {/* <PrivateRoute path="/app" component={Home} />
            <PrivateRoute path="/inventory" component={InventoryContainer} /> */}
            <Route path="*" component={() => <h1>Page not found</h1>} />
        </Switch>
    );
}

export default Routes;