import React from "react";
import config from '../utils/config.util'
import ProfileLinks from "../components/profilelinks.component";
import GenericComponent from "../components/generic.component";
import PDFComponent from "../components/pdf.component";
import LinklistComponent from "../components/linklist.component";
import ReactDragListView from 'react-drag-listview';

import {IoIosAdd} from 'react-icons/io'
import {FiEdit3} from "react-icons/fi";
import {FaArrowUp, FaArrowDown} from "react-icons/fa";


import '../pages/profileDesigns/profile1.css'
import '../pages/profileDesigns/profile2.css'
import '../pages/profileDesigns/profile3.css'
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
            nodeSelector: this.props.reordering ? 'li' : null,
            handleSelector: this.props.reordering ? 'div' : null
        };

        return <ReactDragListView {...dragProps}>
            <ul style={{listStyle: "none", paddingInlineStart: 0}}>
                {this.props.user.components.map((component, key) => (
                    <li key={key} className={"selectableComponent" + (this.props.reordering ? " reordering" : "")}
                        onClick={() => this.selectComponent(key)}>
                        {this.component(component, key)}
                        <div className={'reorder-buttons'}>
                            <button onClick={() => this.updateOrder(key, key - 1)}><FaArrowUp size={20}/></button>
                            <button onClick={() => this.updateOrder(key, key + 1)}><FaArrowDown size={20}/></button>
                        </div>
                    </li>))}
            </ul>
        </ReactDragListView>
    }

    borderRadius = (radius) =>
    {
        return {'--profile-border-radius': (typeof radius === 'number' ? radius : 40) + 'px'};
    }

    toggleModal = () =>
    {
        this.props.toggleModal()
    }

    render()
    {
        const design = this.props.user.profileDesign.design;
        const font = this.props.user.profileDesign.font || 'default';
        let fontFamily = "'Poppins', 'Raleway', Arial, sans-serif";
        if (font === 'serif') fontFamily = "'Merriweather', serif";
        if (font === 'mono') fontFamily = "'Fira Mono', 'Consolas', 'Menlo', monospace";
        const customStyle = {
            ...styles(this.props.user.profileDesign.colour || 0),
            '--profile-border-radius': ((typeof this.props.user.profileDesign.borderRadius === 'number' ? this.props.user.profileDesign.borderRadius : 40) + 'px'),
            '--profile-font-family': fontFamily
        };

        if (design === 3)
        {
            return (
                <div className={"content editableprofile-scroll"}
                     style={customStyle}>
                    <div className="profile-bento-container-spacer"></div>
                    <div className="profile-bento-container">
                        <div className="profile-bento-header">
                            <img
                                className="profile-bento-avatar selectableComponent"
                                src={config('HOST') + "/avatar/" + this.props.user.id + ".png"}
                                alt={"Profile picture"}
                                onClick={() => this.selectComponent(-2)}
                            />
                            <div className="profile-bento-name selectableComponent"
                                 onClick={() => this.selectComponent(-2)}>
                                <div style={{display: "flex", justifyContent: "flex-end", alignItems: "center"}}>
                                    {this.props.user.displayName}
                                    <FiEdit3 size={18} style={{marginLeft: "10px", opacity: "70%"}}/>
                                </div>
                                <div className="username"
                                     style={{fontWeight: 400, fontSize: '1rem'}}>@{this.props.user.username}</div>
                            </div>
                        </div>
                        <div className="profile-bento-socials selectableComponent"
                             onClick={() => this.selectComponent(-1)}>
                            <ProfileLinks editing={true} socials={this.props.user.sociallinks} design={3}/>
                        </div>
                    </div>
                    <div className="card">
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
            );
        }
        return <div className={"content"}
                    style={customStyle}>
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
                    <div style={{
                        display: "block",
                        marginTop: (this.props.user.profileDesign.design === 2 ? 0 : "20px")
                    }}>
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