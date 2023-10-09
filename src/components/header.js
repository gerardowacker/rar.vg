import React from 'react'
import Link from "../router/link";

import './header.css'

export default class Header extends React.Component
{
    render()
    {
        return <div className={"page-header"}>
            <Link to={"/"}>
                <span className={"mm"}>👋 rar.vg</span>
            </Link>
            <Link to={"/dashboard"}>
                <button className="publish-button">Go to Dashboard</button>
            </Link>
        </div>
    }
}