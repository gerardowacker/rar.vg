import React from "react";
import config from '../utils/config.util'
import ProfileLinks from "../components/profilelinks.component";
import GenericComponent from "../components/generic.component";
import PDFComponent from "../components/pdf.component";
import LinklistComponent from "../components/linklist.component";
import ReactDragListView from 'react-drag-listview';
import {IoIosAdd} from 'react-icons/io'

import '../pages/profile.css'
import '../index.css'
import SpotifyComponent from "./spotify.component";
import YouTubeComponent from "./youtube.component";

export default class EditableProfile extends React.Component
{
    component = (component, key) =>
    {
        if (component.content === null)
            return <div style={{display: 'none'}}></div>
        if (component.type)
            switch (component.type)
            {
                case "generic":
                    return <GenericComponent editing={true} title={component.content.title}
                                             description={component.content.description}
                                             key={key}/>
                case "pdf":
                    return <PDFComponent editing={true} fileId={component.content.fileId} key={key}/>
                case "linklist":
                    return <LinklistComponent editing={true} vertical={component.content.vertical}
                                              links={component.content.links} key={key}/>
                case "spotify":
                    return <SpotifyComponent editing={true} id={component.content} key={key}/>
                case 'youtube':
                    return <YouTubeComponent editing={true} id={component.content} key={key}/>
            }
    }

    selectComponent(key)
    {
        this.props.selectComponent(key)
    }

    updateOrder = (from, to) =>
    {
        this.props.updateComponentOrder(from, to)
    }

    loadComponents = () =>
    {
        const dragProps = {
            onDragEnd: this.updateOrder,
            nodeSelector: 'li',
            handleSelector: 'div'
        };

        return <ReactDragListView {...dragProps}>
            <ul style={{listStyle: "none", paddingInlineStart: 0}}>
                {this.props.user.components.map((component, key) => (
                    <li className={"selectableComponent"}
                        onClick={() => this.selectComponent(key)}>{this.component(component, key)}</li>))}
            </ul>
        </ReactDragListView>
    }

    toggleModal = () =>
    {
        this.props.toggleModal()
    }

    render()
    {
        return <div className={"content"}>
            <div className="card">
                <div className={"header"}>
                    <div className={"selectableComponent metadata"} onClick={() => this.selectComponent(-2)}>
                        <div className={"banner"}/>
                        <img
                            className={"profile-picture"}
                            src={config('HOST') + "/avatar/" + this.props.user.id + ".png?lr=" + this.props.lastReloaded}
                            alt={"Profile picture"}
                        />
                        <h1 className={"p-no-margin-bottom"}>{this.props.user.displayName}</h1>
                        <h3 className={"username p-no-margin-top p-no-margin-bottom"}>@{this.props.user.username}</h3>
                    </div>
                    <div className={"selectableComponent"} onClick={() => this.selectComponent(-1)}>
                        <ProfileLinks editing={true} socials={this.props.user.sociallinks}/>
                    </div>
                </div>

                {this.loadComponents()}

                <div className={"component add-component-button-container"}>
                    {
                        this.props.user.components.length >= 3 ? <></> :
                            <button onClick={() => this.toggleModal()} className={"add-component-button"}>
                                <IoIosAdd size={50}/>
                            </button>
                    }
                </div>
            </div>
        </div>
    }
}