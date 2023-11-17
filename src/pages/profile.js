import React from "react";
import config from '../utils/config.util'
import ProfileLinks from "../components/profilelinks.component";
import GenericComponent from "../components/generic.component";
import PDFComponent from "../components/pdf.component";
import LinklistComponent from "../components/linklist.component";

import './profileDesigns/profile1.css'
import './profileDesigns/profile2.css'
import {colours, styles} from './profileDesigns/colour.util'

import '../index.css'
import SpotifyComponent from "../components/spotify.component";
import YouTubeComponent from "../components/youtube.component";

export default class Profile extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            user: null
        }
    }

    componentDidMount()
    {
        fetch(config('HOST') + '/profile/' + this.props.username)
            .then(r =>
            {
                if (r.status !== 200)
                    window.location.href = "https://www.rar.vg"
                r.json().then(response =>
                {
                    this.setState({user: response})
                })
            })
    }

    component = (component, key) =>
    {
        if (component.type && component.content)
            switch (component.type)
            {
                case "generic":
                    return <GenericComponent title={component.content.title} description={component.content.description}
                                             key={key}/>
                case "pdf":
                    return <PDFComponent fileId={component.content.fileId} key={key}/>
                case "linklist":
                    return <LinklistComponent vertical={component.content.vertical} links={component.content.links}
                                              key={key}/>
                case 'spotify':
                    return <SpotifyComponent id={component.content} key={key}/>
                case 'youtube':
                    return <YouTubeComponent id={component.content} key={key}/>
            }
    }

    render()
    {
        if (!this.state.user)
        {
            return <div>Loading...</div>
        }
        else
            return <div className={"content"} style={styles(this.state.user.profileDesign.colour || 0)}>
                <div className="card">
                    <div className={"header-d" + this.state.user.profileDesign.design}>
                        <div className={"banner-d" + this.state.user.profileDesign.design}/>
                        <img
                            className={"profile-picture-d" + this.state.user.profileDesign.design}
                            src={config('HOST') + "/avatar/" + this.state.user.id + ".png"}
                            alt={"Profile picture"}
                        />
                        <div style={{display: "block"}}>
                            <h1 className={"p-no-margin-bottom"}>{this.state.user.displayName}</h1>
                            <h3 className={"username p-no-margin-top"}>@{this.props.username}</h3>
                            <ProfileLinks socials={this.state.user.sociallinks}
                                          design={this.state.user.profileDesign.design}/>
                        </div>
                    </div>

                    {this.state.user.components.map((component, key) => this.component(component, key))}

                    <div className={"footer"}>
                        <a href={"https://rar.vg"} style={{color: "var(--profile-text-accent)"}}>rar.vg</a> powered 2023
                    </div>
                </div>
            </div>
    }
}