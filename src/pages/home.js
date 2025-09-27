import React from 'react'

import profileImage from '../static/profile.png'
import customisationImage from '../static/customisation.png'
import mobileImage from '../static/mobile.png'

import './home.css'
import '../index.css'
import Link from "../router/link";
import Button from "../components/button";

export default class Home extends React.Component
{
    render()
    {
        return <div className="container">
            <div className="home-container">
                <div className="left">
                    <div className="section">
                        <div className={"top"}>
                            <p className="m p-no-margin-top">👋 rar.vg</p>
                            <h2 className="xxl p-no-margin-top p-no-margin-bottom">Your place, online.</h2>
                        </div>
                        <div className={"bottom"}>
                            <Link to={"/register"}>
                                <Button className="mm" variant="secondary">Create your page!</Button>
                            </Link>
                            <br/>
                            <div className="link-log-in">
                                <Link to={"/login"}><a className="s">Already have one? Log in!</a></Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="right">
                    <div className={"left-card"}>
                        <div className={"profile-card purple"}>
                            <div className={"top"}>
                                <h2 className={"l p-no-margin-top p-no-margin-bottom"}>Now for mobile</h2><br/>
                                <span className={"s"}>Create and design your own personal page, anywhere you go.</span>
                            </div>
                            <div className={"profile-card-image"}>
                                <img src={mobileImage} className={'home-image-1'} alt={"Mobile dashboard screenshot"}/>
                            </div>
                        </div>
                    </div>
                    <div className={"right-card"}>
                        <div className={"profile-card green"}>
                            <div className={"top"}>
                                <span className={"m"}>Fully customizable</span><br/>
                                <span className={"s"}>Take full control on your own profile.</span>
                            </div>
                            <div className={"profile-card-image"}>
                                <img src={customisationImage} className={'home-image-1'}
                                     alt={"Customisation options, like colour or layout"}/>
                            </div>
                        </div>
                        <div className={"profile-card orange"}>
                            <div className={"top"}>
                                <span className={"m"}>Express yourself</span><br/>
                                <span className={"s"}>Show the world who you are and what you do.</span>
                            </div>
                            <div className={"profile-card-image"}>
                                <img src={profileImage} className={'home-image-1'} alt={"Profile screenshot"}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}