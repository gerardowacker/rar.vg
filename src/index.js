import React from 'react';
import {createRoot} from 'react-dom/client';
import './styles/index.css';
import {AppError} from './pages/error';
import {RouterProvider} from './router/router';
import {Route} from './router/route';
import Home from './pages/home';
import Profile from './pages/profile';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Register from './pages/register';
import ChangePassword from './pages/changepassword';
import Verify from './pages/verify';
import VerifyPasswordChange from './pages/verifypasswordchange';
import DeleteAccount from './pages/deleteaccount';
import VerifyAccountDeletion from './pages/verifyaccountdeletion';
import Post from './pages/post';
import News from './pages/news';

const host = window.location.host.split('.');

const getParameters = new URLSearchParams(window.location.search);

export const WebRoutes = [
    {path: "/", component: <Home/>},
    {path: "/posts", component: <News/>},
    {path: "/login", component: <Login justRegistered={getParameters.get("jr")}/>},
    {path: "/verify", component: <Verify token={getParameters.get("vt")}/>},
    {path: "/change-password", component: <VerifyPasswordChange token={getParameters.get("t")}/>},
    {path: "/forgot-password", component: <ChangePassword/>},
    {path: "/register", component: <Register/>},
    {path: "/dashboard", component: <Dashboard/>},
    {path: "/delete-account", component: <DeleteAccount/>},
    {path: "/verify-account-deletion", component: <VerifyAccountDeletion token={getParameters.get("t")}/>},
    {path: "/post", component: <Post post={getParameters.get('p')}/>},
    {path: "", component: <AppError/>, status: 404},
];

const AppRoutes = () => (
    <RouterProvider>
        {WebRoutes.map((route, k) => (
            <Route key={k} status={route.status ?? 200} path={route.path}>
                {route.component}
            </Route>
        ))}
    </RouterProvider>
);

const rootContainer = document.getElementById("root");
const root = createRoot(rootContainer);

const renderComponent = () =>
{
    const isBHost = host[1] === "b" || host[0] === "b";
    const isLocalSubdomain =
        ((host.length === 3 && host[2].includes("localhost")) || host.length === 4) && host[0] !== "www";
    const isLocalSubdomainAlt =
        ((host.length === 2 && host[1].includes("localhost")) || host.length === 3) && host[0] !== "www";

    if ((isBHost && isLocalSubdomain) || (!isBHost && isLocalSubdomainAlt))
    {
        const subdomain = host[0];
        return <Profile username={subdomain}/>;
    }
    return <AppRoutes/>;
};

root.render(renderComponent());

export default AppRoutes;
