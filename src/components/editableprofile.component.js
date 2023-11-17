import React from "react";
import config from '../utils/config.util'
import ProfileLinks from "../components/profilelinks.component";
import GenericComponent from "../components/generic.component";
import PDFComponent from "../components/pdf.component";
import LinklistComponent from "../components/linklist.component";
import ReactDragListView from 'react-drag-listview';
import {IoIosAdd} from 'react-icons/io'
import {FiEdit3} from "react-icons/fi";

import '../pages/profileDesigns/profile1.css'
import '../pages/profileDesigns/profile2.css'
import '../index.css'
import SpotifyComponent from "./spotify.component";
import YouTubeComponent from "./youtube.component";
import {styles} from "../pages/profileDesigns/colour.util";

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
        return <div className={"content"} style={styles(this.props.user.profileDesign.colour || 0)}>
            <div className="card">
                <div className={"header-d" + this.props.user.profileDesign.design}>
                    <div className={(this.props.user.profileDesign.design !== 2 ? "selectableComponent" : "")}
                         onClick={(this.props.user.profileDesign.design !== 2 ? () => this.selectComponent(-2) : () =>
                         {
                         })}>
                        <div className={"banner-d" + this.props.user.profileDesign.design}/>
                        <img
                            className={"profile-picture-d" + this.props.user.profileDesign.design}
                            src={config('HOST') + "/avatar/" + this.props.user.id + ".png"}
                            alt={"Profile picture"} onClick={() => this.selectComponent(-2)}
                        />
                    </div>
                    <div style={{display: "block", marginTop: (this.props.user.profileDesign.design === 2 ? 0 : "20px")}}>
                        <div className={"selectableComponent"}
                             onClick={() => this.selectComponent(-2)}>
                            <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                <h1 className={"p-no-margin-bottom p-no-margin-top"}>{this.props.user.displayName}</h1>
                                <FiEdit3 size={18} style={{marginLeft: "10px", opacity: "70%"}}/>
                            </div>
                            <h3 className={"username p-no-margin-top"}>@{this.props.user.username}</h3>
                        </div>
                        <div className={"selectableComponent"} onClick={() => this.selectComponent(-1)}>
                            <ProfileLinks editing={true} socials={this.props.user.sociallinks}
                                          design={this.props.user.profileDesign.design}/>
                        </div>
                    </div>
                </div>

                {this.loadComponents()}

                <div className={"component add-component-button-container"}>
                    {
                        this.props.user.components.length >= 5 ? <></> :
                            <button onClick={() => this.toggleModal()} className={"add-component-button"}>
                                <IoIosAdd size={50}/>
                            </button>
                    }
                </div>
            </div>
        </div>
    }
}