import React from "react";
import {AiFillEdit, AiOutlineClose, AiOutlineCheck} from "react-icons/ai"
import {
    FaSteam,
    FaItunesNote,
    FaBitcoin,
    FaEthereum,
    FaDiscord,
    FaTiktok,
} from "react-icons/fa";
import {CgWebsite} from "react-icons/cg";
import {SiCashapp} from "react-icons/si";
import {
    BsSpotify,
    BsInstagram,
    BsTwitter,
    BsFacebook,
    BsGithub,
    BsTwitch,
    BsYoutube,
    BsLinkedin, BsStars,
} from "react-icons/bs";
import "./editpanel.component.css"
import {upload} from "../utils/session.util";
import config from '../utils/config.util'
import Link from "../router/link";
import {colours, styles} from "../pages/profileDesigns/colour.util";
import {IoIosList, IoMdAdd, IoMdCloudUpload} from "react-icons/io";
import GenericPanel from "./panels/generic.panel.component";
import LinkListPanel from "./panels/linklist.panel.component";
import YoutubePanel from "./panels/youtube.panel.component";
import SpotifyPanel from "./panels/spotify.panel.component";
import PDFPanel from "./panels/pdf.panel.component";
import UserPanel from "./panels/user.panel.component";
import SocialLinksPanel from "./panels/sociallinks.panel.component";

const importAll = (r) => r.keys().map(r);
const postFiles = importAll(require.context("../news/", true, /\.md$/))
    .sort()
    .reverse();

export default class EditPanel extends React.Component
{
    toggleModal = () =>
    {
        this.props.toggleModal()
    }

    editProfile = () =>
    {
        this.props.selectComponent(-2)
    }

    clearState = () =>
    {
        this.setState({
            title: "",
            description: "",
            linkField: "",
            selectedLink: null,
            linkList: [],
            selectedFile: null,
            fileMessage: null,
            displayName: "",
            userMessage: null,
            lastReloaded: Date.now(),
            selectedLinkListItem: null,
            linkItemTitleField: "",
            linkItemURLField: "",
            linkItemSelectedImage: null,
            linkItemMessage: null,
            spotifyMessage: null,
            spotifyLink: "",
            youtubeMessage: null,
            youtubeLink: "",
        })
    }

    handleNecessaryUpdates = (component) =>
    {
    }

    drawMessage(message)
    {
        if (message) return (
            <div className={"notice " + message.type}>
                {message.message}
            </div>
        )
    }

    saveLocally = (content) =>
    {
        this.props.updateLocally(content)
    }

    cancel = () =>
    {
        this.props.cancelSelection()
    }

    reorder = () =>
    {
        this.props.toggleReordering()
    }

    renderFields = (component) =>
    {
        if (!component)
            return <div className={"default"}>
                <div className={(this.props.reordering ? "" : " reordering")}>
                    <span className={"m"}>Reorder mode</span><br/><br/>
                    <span className={"s"}>Drag and drop components to change its position</span><br/>
                    <span className={"s"}>Use the arrows to rearrange each component individually</span>
                    <br/><br/>
                    <button className={'entry stop-reorder'} onClick={() => this.reorder()}>
                        <IoIosList size={20}/>
                        <span className={'s'}>Stop reorder</span>
                    </button>
                </div>

                <div className={(this.props.reordering ? " reordering" : "")}>
                    <span className={"m"}>Start editing</span><br/><br/>
                    <span className={"s"}>Click on a component to begin editing</span><br/>
                    <span className={"s"}>Toggle reorder to change a component's position</span>
                </div>

                <div className={"lp-cont" + (this.props.reordering ? " reordering" : "")}>
                    <span className={'m'}>Quick actions</span><br/><br/>
                    <button className={'entry'}
                            style={{
                                color: styles(this.props.user.profileDesign.colour || 0)["--profile-text-accent"],
                                backgroundColor: styles(this.props.user.profileDesign.colour || 0)["--card-background"],
                            }}
                            onClick={() => this.editProfile()}>
                        <span className={'s'}>Change profile design</span>
                    </button>
                    <button className={'entry'} onClick={() => this.reorder()}>
                        <IoIosList size={20}/>
                        <span className={'s'}>Reorder</span>
                    </button>
                    <button className={'entry'} onClick={() => this.toggleModal()}>
                        <IoMdAdd size={20}/>
                        <span className={'s'}>Add</span>
                    </button>
                    <button className={'entry special-generate'} onClick={this.props.onOpenAIChat}>
                        <BsStars size={20}/><span className={'s'}>Design Pal</span>
                    </button>
                </div>
            </div>
        switch (component.type)
        {
            case 'user':
                return <UserPanel component={this.props.selectedComponent}
                                  drawMessage={this.drawMessage}
                                  deleteSelectedComponent={this.props.deleteSelectedComponent}
                                  cancel={this.cancel} saveLocally={this.saveLocally}
                                  updateDisplayName={this.props.updateDisplayName}
                                  reloadImage={this.props.reloadImage}
                                  user={this.props.user}
                                  updateProfileDesign={this.props.updateProfileDesign}
                                  updateProfileColours={this.props.updateProfileColours}
                />
            case 'generic':
                return <GenericPanel component={this.props.selectedComponent}
                                     drawMessage={this.drawMessage}
                                     deleteSelectedComponent={this.props.deleteSelectedComponent}
                                     cancel={this.cancel} saveLocally={this.saveLocally}
                />
            case 'sociallinks':
                return <SocialLinksPanel component={this.props.selectedComponent}
                                         drawMessage={this.drawMessage}
                                         deleteSelectedComponent={this.props.deleteSelectedComponent}
                                         cancel={this.cancel} saveLocally={this.saveLocally}
                                         updateLocallyWithoutCancelling={this.props.updateLocallyWithoutCancelling}
                                         updateLinks={this.props.updateLinks} user={this.props.user}
                                         displayMessage={this.props.displayMessage}
                />
            case 'pdf':
                return <PDFPanel component={this.props.selectedComponent}
                                 drawMessage={this.drawMessage}
                                 deleteSelectedComponent={this.props.deleteSelectedComponent}
                                 cancel={this.cancel} saveLocally={this.saveLocally}
                                 updateLocallyWithoutCancelling={this.props.updateLocallyWithoutCancelling}
                />
            case 'linklist':
                return <LinkListPanel component={this.props.selectedComponent}
                                      drawMessage={this.drawMessage}
                                      deleteSelectedComponent={this.props.deleteSelectedComponent}
                                      cancel={this.cancel} saveLocally={this.saveLocally}
                                      updateLocallyWithoutCancelling={this.props.updateLocallyWithoutCancelling}
                />
            case 'youtube':
                return <YoutubePanel component={this.props.selectedComponent}
                                     drawMessage={this.drawMessage}
                                     deleteSelectedComponent={this.props.deleteSelectedComponent}
                                     cancel={this.cancel} saveLocally={this.saveLocally}
                                     updateLocallyWithoutCancelling={this.props.updateLocallyWithoutCancelling}
                />
            case "spotify":
                return <SpotifyPanel component={this.props.selectedComponent}
                                     drawMessage={this.drawMessage}
                                     deleteSelectedComponent={this.props.deleteSelectedComponent}
                                     cancel={this.cancel} saveLocally={this.saveLocally}
                                     updateLocallyWithoutCancelling={this.props.updateLocallyWithoutCancelling}
                />
        }
    }

    render()
    {
        return <div className="outer-mock">
            {this.renderFields(this.props.selectedComponent)}
        </div>
    }
}
