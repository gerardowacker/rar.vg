import prof1 from '../static/profile-type1.png'
import prof2 from '../static/profile-type2.png'

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

const importAll = (r) => r.keys().map(r);
const postFiles = importAll(require.context("../news/", true, /\.md$/))
    .sort()
    .reverse();

export default class EditPanel extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            // Social links.
            linkField: "",
            selectedLink: null,
            linkList: [],

            // User metadata.
            displayName: "",
            userMessage: null,
            lastReloaded: Date.now(),


        }

        this.handleLinkFieldChange = this.handleLinkFieldChange.bind(this)
        this.handleDisplayNameChange = this.handleDisplayNameChange.bind(this)

    }

    colourButton = (theme, key) =>
    {
        return <button className={"colour-theme-button"} key={key} style={{
            background: `linear-gradient(135deg, ${theme.background} 50%, ${theme.card} 50%)`
        }} onClick={() => this.props.updateProfileColours(key)}/>
    }

    colourButtons = (themes) =>
    {
        return themes.map((theme, key) => (
            this.colourButton(theme, key)
        ))
    }

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

    icons = {
        steam: {
            icon: <FaSteam/>,
            link: "https://steamcommunity.com/id/",
        },
        itunes: {
            icon: <FaItunesNote/>,
            link: "https://music.apple.com/us/artist/",
        },
        bitcoin: {icon: <FaBitcoin/>, popup: true},
        ethereum: {icon: <FaEthereum/>, popup: true},
        discord: {icon: <FaDiscord/>, popup: true},
        tiktok: {icon: <FaTiktok/>, link: "https://www.tiktok.com/"},
        website: {icon: <CgWebsite/>, link: ""},
        cashapp: {icon: <SiCashapp/>, link: "https://cash.app/"},
        spotify: {
            icon: <BsSpotify/>,
            link: "https://open.spotify.com/artist/",
        },
        instagram: {
            icon: <BsInstagram/>,
            link: "https://instagram.com/",
        },
        twitter: {icon: <BsTwitter/>, link: "https://twitter.com/"},
        facebook: {icon: <BsFacebook/>, link: "https://facebook.com/"},
        github: {icon: <BsGithub/>, link: "https://github.com/"},
        twitch: {icon: <BsTwitch/>, link: "https://twitch.tv/"},
        youtube: {
            icon: <BsYoutube/>,
            link: "https://youtube.com/channel/",
        },
        linkedin: {
            icon: <BsLinkedin/>,
            link: "https://linkedin.com/in/",
        },
    };

    displayMessageInDashboard(message)
    {
        this.props.displayMessage(message)
    }

    socialLinkEditItem = (link, key, selected) =>
    {
        return <div key={key} className="inner-mock">
            <div className="hero">{this.icons[link.name].icon}</div>
            {selected ?
                <div className={"link-content"}><input onChange={this.handleLinkFieldChange} defaultValue={link.content}
                                                       className="input"/>
                    <button className={"icon-button"} onClick={() => this.deselectItem()}><AiOutlineCheck/></button>
                </div> :
                <div className={"link-content"}><span>{link.content}</span>
                    <div className={"button-container"}>
                        <button className={"icon-button"} onClick={() => this.selectNewLink(key)}><AiFillEdit/></button>
                        <button className={"icon-button"} onClick={() => this.deleteItem(key)}><AiOutlineClose/>
                        </button>
                    </div>
                </div>}
        </div>
    }




    displayUserMessage = (message) =>
    {
        this.setState({userMessage: message})
        setTimeout(() => this.setState({userMessage: null}), 5000)
    }





    drawMessage(message)
    {
        if (message) return (
            <div className={"notice " + message.type}>
                {message.message}
            </div>
        )
    }


    deselectItem = () =>
    {
        const oldLinks = this.props.user.sociallinks
        if (this.state.selectedLink !== null)
        {
            oldLinks[this.state.selectedLink].content = this.state.linkField
            this.props.updateLinks(oldLinks)
        }
        this.setState({selectedLink: null})

        this.displayMessageInDashboard({type: 'important', message: "You've got unsaved changes!"}, true)
    }

    deleteItem = (key) =>
    {
        const oldLinks = this.props.user.sociallinks
        oldLinks.splice(key, 1)
        this.props.updateLinks(oldLinks)

        this.displayMessageInDashboard({type: 'important', message: "You've got unsaved changes!"}, true)
    }

    selectNewLink = (key) =>
    {
        const oldLinks = this.props.user.sociallinks
        if (this.state.selectedLink !== null)
        {
            oldLinks[this.state.selectedLink].content = this.state.linkField
            this.props.updateLinks(oldLinks)
        }
        this.setState({linkField: oldLinks[key].content, selectedLink: key})
    }

    addNewItem = (item) =>
    {
        const oldLinks = this.props.user.sociallinks
        if (this.state.selectedLink !== null)
        {
            oldLinks[this.state.selectedLink].content = this.state.linkField
            this.setState({linkField: ''})
        }
        if (this.props.user.sociallinks.length < 8)
        {
            oldLinks.push({name: item, content: ''})
            this.setState({selectedLink: (oldLinks.length - 1)}, () => this.props.updateLinks(oldLinks))
        }
        this.displayMessageInDashboard({type: 'important', message: "You've got unsaved changes!"}, true)
    }

    drawIcons = () =>
    {
        return <div>
            {Object.keys(this.icons).map((item, key) => (
                <button key={key} className="icon-button"
                        onClick={() => this.addNewItem(item)}>{this.icons[item].icon}</button>
            ))}
        </div>
    }

    onFileChange = (event) =>
    {
        if (event.target.files && event.target.files[0])
        {
            if (event.target.files[0].name.split('.').pop() !== 'pdf')
                return this.displayPDFMessage({type: 'error', message: 'The selected file is not a PDF file!'})
            if (event.target.files[0].size / 1024 / 1024 > 1)
                return this.displayPDFMessage({type: 'error', message: 'The selected file is too large!'})
            this.setState({selectedFile: URL.createObjectURL(event.target.files[0])});
        }
    }



    handleLinkFieldChange(event)
    {
        this.setState({linkField: event.target.value})
    }

    handleDisplayNameChange(event)
    {
        this.setState({displayName: event.target.value})
    }

    onProfilePictureChange = (event) =>
    {
        const allowedFiles = ['jpg', 'jpeg', 'png']
        if (event.target.files && event.target.files[0])
        {
            if (!allowedFiles.includes(event.target.files[0].name.split('.').pop()))
                return this.displayUserMessage({type: 'error', message: 'The selected file format is not allowed!'})
            if (event.target.files[0].size / 1024 / 1024 > 1)
                return this.displayUserMessage({type: 'error', message: 'The selected file is too large!'})
            this.uploadingDialog.showModal()
            upload(event.target.files[0], true).then(result =>
            {
                if (result.success)
                {
                    this.props.reloadImage()
                    this.setState({lastReloaded: Date.now()})
                    this.uploadingDialog.close()
                }
            })
        }
    }

    updateDisplayName = (displayName) =>
    {
        if (displayName.length > 64)
            return this.displayUserMessage({
                type: 'error',
                message: 'The display name mustn\'t be longer than 32 characters'
            })

        this.props.updateDisplayName(displayName)
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
                    <button className={'entry special-generate'}>
                        <BsStars size={20}/><span className={'s'}>Generate</span>
                    </button>
                </div>
            </div>
        switch (component.type)
        {
            case 'user':
                return <>
                    <dialog ref={ref => this.uploadingDialog = ref} className={"dashboard-modal"}>
                        <span className={"m"}>Uploading...</span>
                    </dialog>
                    <h3 className="m p-no-margin-top p-no-margin-bottom">Edit user metadata</h3>
                    <div className="user-top">
                        <span className={"s p-no-margin-top"}>Profile picture:</span>
                        {this.drawMessage(this.state.userMessage)}
                        <div className="button-center">
                            <label style={{cursor: "pointer"}} htmlFor={"upload-profile-picture"}>
                                <div className="user-button"
                                     style={{backgroundImage: "url(" + config('HOST') + "/avatar/" + this.props.user.id + ".png?lr=" + this.state.lastReloaded}}/>
                            </label>
                            <label style={{cursor: "pointer"}} htmlFor={"upload-profile-picture"}>
                                <div className={"button unraised"} style={{width: "150px"}}><AiFillEdit size={16}/>Change
                                </div>
                            </label>
                            <input style={{display: "none"}} accept={".jpg,.png,.webp,.jpeg"} type={'file'}
                                   id={'upload-profile-picture'} onChange={this.onProfilePictureChange}/>
                            <p className={"ss"}>Be careful! Profile pictures are published instantly when
                                changed.</p>
                            <p className={"ss"}>Only JPEGs and PNGs smaller than 1MB allowed.</p>
                        </div>
                    </div>
                    <div className="user-bottom">
                        <h2 className="s p-no-margin-top">Display name:</h2>
                        <input className="input" type="text" defaultValue={this.props.user.displayName}
                               onChange={this.handleDisplayNameChange}/>
                        <div className={"button-container"}>
                            <button className="button unraised" onClick={() => this.cancel()}>Cancel</button>
                            <button className="button"
                                    onClick={() => this.updateDisplayName(this.state.displayName)}>Done
                            </button>
                        </div>
                        <h3 style={{marginBottom: "0", paddingBottom: "0"}} className="mm p-no-margin-bottom">Change
                            profile design</h3>
                        <div className='list-button-container'>
                            <button className="button unraised link-img" type="button"
                                    onClick={() => this.props.updateProfileDesign(1)}>
                                <img src={prof1} alt={'Profile type 1'}/>
                            </button>
                            <button style={{marginLeft: "10%"}} className="button unraised link-img"
                                    onClick={() => this.props.updateProfileDesign(2)}>
                                <img src={prof2} alt={'Profile type 2'}/>
                            </button>
                        </div>
                        <div className={"theme-picker-buttons"}>
                            {this.colourButtons(colours)}
                        </div>
                        <h4 className={'mm p-no-margin-bottom'}>Danger zone</h4>
                        <Link to={"/delete-account"}>
                            <button className="button delete-button">Delete account</button>
                        </Link>
                        <br/>
                    </div>
                </>
            case 'generic':
                return <GenericPanel component={this.props.selectedComponent}
                                     drawMessage={this.drawMessage}
                                     deleteSelectedComponent={this.props.deleteSelectedComponent}
                                     cancel={this.cancel} saveLocally={this.saveLocally}
                />
            case 'sociallinks':
                return <>
                <h3 className="m p-no-margin-top p-no-margin-bottom">Edit social links</h3>
                <div className="icon-list-div">{this.drawIcons()}</div>
                <h2 className="s p-no-margin-bottom p-no-margin-top title">Links:</h2>
                {this.props.user.sociallinks.map((link, key) => (
                    <div>{this.socialLinkEditItem(link, key, this.state.selectedLink === key)}</div>))}
                <div className={"button-container"}>
                    <button className="button delete-button"
                            onClick={() => this.props.deleteSelectedComponent()}>Delete component
                    </button>
                    <button className="button" onClick={() => this.cancel()}>Done</button>
                </div>
                </>
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
