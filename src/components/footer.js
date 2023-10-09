import React from 'react'

import './footer.css'
import Link from "../router/link";

import wave from '../static/wave.png'

export default class Footer extends React.Component
{
    render()
    {
        return (
            <>
                <svg className="wave" width="100%" height="80px" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                        d="M0,0 C6.83050094,50 15.1638343,75 25,75 C41.4957514,75 62.4956597,0 81.2456597,0 C93.7456597,0 99.9971065,0 100,0 L100,100 L0,100"/>
                </svg>
                <div className="page-footer" style={{marginTop: "-10px"}}>
                    <div style={{minHeight: "auto"}} className="view-model footer-content">
                        <div className="footer-column">
                            <p className={"p-no-margin-bottom p-no-margin-top"}>
                                <img src={wave} draggable="false" alt="Waving hand"
                                     style={{marginLeft: "-8px", width: "70px"}}/>
                            </p>
                            <p style={{marginLeft: "20px"}}>
                                <div style={{marginBottom: "10px"}}><span className="footer-title">About rar.vg:</span>
                                </div>
                                <div style={{marginBottom: "10px", maxWidth: "400px"}}><b>rar.vg</b> is a platform
                                    dedicated to the creation of <b>free</b> personal websites. Offering wide
                                    customisation, and a (very short) subdomain, you can establish your own online
                                    presence!
                                </div>
                                <div style={{maxWidth: "400px"}}><b>Express yourself</b> by creating a universal
                                    showcase for your identity.
                                </div>
                            </p>
                        </div>
                        <div className="footer-column">
                            <p>
                                <ul style={{listStyle: "none", textTransform: "uppercase"}}>
                                    <li style={{marginBottom: "20px", textTransform: "none"}}>Copyright &copy; 2023,
                                        rar.vg
                                    </li>
                                    <li>
                                        <div style={{marginBottom: "10px", textTransform: "none"}}><span
                                            className="footer-title">Useful links</span></div>
                                    </li>
                                    <li><a href={"https://github.com/gerardowacker/rar.vg"}>Source code</a></li>
                                    <li><Link to={"/news"}>Latest news</Link></li>
                                </ul>
                            </p>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}