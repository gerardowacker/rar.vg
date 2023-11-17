import linkH from '../static/linklist-type1.png'
import linkV from '../static/linklist-type2.png'
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
    BsLinkedin,
} from "react-icons/bs";
import "./editpanel.component.css"
import {upload} from "../utils/session.util";
import config from '../utils/config.util'
import Link from "../router/link";
import parseMD from "parse-md";
import {colours} from "../pages/profileDesigns/colour.util";

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
            // Posts
            posts: null,
            // Generic component.
            title: "",
            description: "",
            genericMessage: null,
            // Social links.
            linkField: "",
            selectedLink: null,
            linkList: [],
            // PDF file.
            selectedFile: null,
            fileMessage: null,
            // User metadata.
            displayName: "",
            userMessage: null,
            lastReloaded: Date.now(),
            // Link list
            selectedLinkListItem: null,
            linkItemTitleField: "",
            linkItemURLField: "",
            linkItemSelectedImage: null,
            linkItemMessage: null,
            // Spotify
            spotifyMessage: null,
            spotifyLink: "",
            // YouTube
            youtubeMessage: null,
            youtubeLink: "",
        }

        this.handleTitleChange = this.handleTitleChange.bind(this)
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this)
        this.handleLinkFieldChange = this.handleLinkFieldChange.bind(this)
        this.handleDisplayNameChange = this.handleDisplayNameChange.bind(this)
        this.handleLinkItemURLChange = this.handleLinkItemURLChange.bind(this)
        this.handleLinkItemTitleChange = this.handleLinkItemTitleChange.bind(this)
        this.handleSpotifyLinkChange = this.handleSpotifyLinkChange.bind(this)
        this.handleYouTubeLinkChange = this.handleYouTubeLinkChange.bind(this)
    }

    async componentDidMount()
    {
        if (this.state.posts == null)
        {
            let _posts = await Promise.all(postFiles.map((file) => file.default)
            ).catch((err) => console.error(err));

            let posts = _posts.slice(0, 4)

            this.setState((state) => ({...state, posts}));
        }
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

    latestPosts = (posts) =>
    {
        return <div className={"lp-cont"}>
            <span className={'m'}>Latest news</span>
            {posts != null ? posts.map((post, key) => (
                <a key={key} href={"/post?p=" + parseMD(post).metadata.id}>
                    <div className={"entry"} style={{backgroundImage: `url(${parseMD(post).metadata.banner})`}}>
                        <span className={"mm"}>{parseMD(post).metadata.title}</span><br/>
                    </div>
                </a>
            )) : <></>}
            <a href={"/posts"}>
                <div className={"entry alternative"}>
                    <span className={"mm"}>More news 👉</span>
                </div>
            </a>
        </div>
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
        console.log(component)
        switch (component.type)
        {
            case 'generic':
                this.setState({title: component.content.title, description: component.content.description})
        }
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

    addNewLinkItem = (component) =>
    {
        if (this.state.selectedLinkListItem !== null)
        {
            return this.displayLinkItemMessage({
                type: 'error',
                message: 'You must save your changes before adding another item!'
            })
        }
        if (component.content.length >= 3)
            return
        const content = component.content
        content.links.push({"url": "https://www.rar.vg", "icon": null, "title": "Lorem ipsum dolor sit amet"})
        this.props.updateLocallyWithoutCancelling(content)
        this.selectLinkItem(component, content.links.length - 1)
    }

    updateLinkItem = (component, link) =>
    {
        if (this.state.selectedLinkListItem !== null)
        {
            if (this.state.linkItemURLField === null)
            {
                return this.displayLinkItemMessage({type: 'error', message: 'Link field must not be empty!'})
            }
            const newLink = {
                url: this.state.linkItemURLField || link.url,
                title: this.state.linkItemTitleField || link.title,
                icon: link.icon
            }
            if (this.state.linkItemSelectedImage !== null)
            {
                return this.uploadLinkItemIcon().then(result =>
                    {
                        newLink.icon = config('HOST') + "/uploads/" + result
                        const content = component.content
                        content.links[this.state.selectedLinkListItem] = newLink
                        this.props.updateLocallyWithoutCancelling(content)
                        return this.setState({
                            selectedLinkListItem: null,
                            linkItemTitleField: null,
                            linkItemURLField: null,
                            linkItemSelectedImage: null
                        })
                    }
                )
            }
            const content = component.content
            content.links[this.state.selectedLinkListItem] = newLink
            this.props.updateLocallyWithoutCancelling(content)
            return this.setState({
                selectedLinkListItem: null,
                linkItemTitleField: null,
                linkItemURLField: null,
                linkItemSelectedImage: null
            })
        }
    }

    deleteLinkItem = (key, component) =>
    {
        const content = component.content
        content.links.splice(key, 1)
        this.props.updateLocallyWithoutCancelling(content)
        this.setState({
            selectedLinkListItem: null,
            linkItemTitleField: null,
            linkItemURLField: null
        })
    }

    onItemIconChange = (event) =>
    {
        if (event.target.files && event.target.files[0])
        {
            const allowedFiles = ['jpg', 'jpeg', 'png']
            if (event.target.files && event.target.files[0])
            {
                if (!allowedFiles.includes(event.target.files[0].name.split('.').pop()))
                    return this.displayLinkItemMessage({
                        type: 'error',
                        message: 'The selected file format is not allowed!'
                    })
                if (event.target.files[0].size / 1024 / 1024 > 1)
                    return this.displayLinkItemMessage({type: 'error', message: 'The selected file is too large!'})
                this.setState({linkItemSelectedImage: URL.createObjectURL(event.target.files[0])});
            }
        }
    }

    uploadLinkItemIcon = () =>
    {
        return new Promise(res =>
        {
            fetch(this.state.linkItemSelectedImage).then(r => r.blob()).then(blob =>
            {
                const result = new File([blob], "image.png", {type: 'application/png'})
                upload(result, false).then(result =>
                {
                    if (result.success)
                    {
                        this.uploadingDialog.close()
                        return res(result.content)
                    }
                })
            })
        })
    }

    selectLinkItem = (component, key) =>
    {
        if (this.state.selectedLinkListItem !== null)
        {
            return this.displayLinkItemMessage({
                type: 'error',
                message: 'You must save your changes before selecting another item!'
            })
        }
        return this.setState({
            selectedLinkListItem: key,
            linkItemTitleField: component.content.links[key].title,
            linkItemURLField: component.content.links[key].url
        })
    }

    displayLinkItemMessage = (message) =>
    {
        this.setState({linkItemMessage: message})
        setTimeout(() => this.setState({linkItemMessage: null}), 5000)
    }

    displayPDFMessage = (message) =>
    {
        this.setState({fileMessage: message})
        setTimeout(() => this.setState({fileMessage: null}), 5000)
    }

    displayUserMessage = (message) =>
    {
        this.setState({userMessage: message})
        setTimeout(() => this.setState({userMessage: null}), 5000)
    }

    displayGenericMessage = (message) =>
    {
        this.setState({genericMessage: message})
        setTimeout(() => this.setState({genericMessage: null}), 5000)
    }

    displaySpotifyMessage = (message) =>
    {
        this.setState({spotifyMessage: message})
        setTimeout(() => this.setState({spotifyMessage: null}), 5000)
    }

    displayYouTubeMessage = (message) =>
    {
        this.setState({youtubeMessage: message})
        setTimeout(() => this.setState({youtubeMessage: null}), 5000)
    }

    drawMessage(message)
    {
        if (message) return (
            <div className={"notice " + message.type}>
                {message.message}
            </div>
        )
    }

    linkEditItem = (link, key, selected, component) =>
    {
        if (selected)
            return <div className="special-mock">
                {this.drawMessage(this.state.linkItemMessage)}
                <h2 className="s">Title:</h2>
                <input className="input" onChange={this.handleLinkItemTitleChange}
                       defaultValue={this.state.linkItemTitleField} type="text"
                       placeholder="My awesome link"/>
                <h2 className="s">Link:</h2>
                <input className="input" required onChange={this.handleLinkItemURLChange} type="url"
                       placeholder="https://yourwebsite.com" defaultValue={this.state.linkItemURLField}/>
                <h2 className="s">Icon:</h2>
                <div className={"button-center"}>
                    {this.state.linkItemSelectedImage !== null || link.icon !== null ? (
                        <img className={"icon"} src={this.state.linkItemSelectedImage || link.icon}
                             alt={'Link icon'}/>) : <></>}
                    <label htmlFor="link-icon-button" className="button-label">Upload icon</label>
                    <input type={"file"} onChange={this.onItemIconChange} className="file-button"
                           accept={".jpg,.png,.jpeg"}
                           id="link-icon-button"/>
                </div>
                <div className="link-list-btn-container">
                    <button className="button delete" onClick={() => this.deleteLinkItem(key, component)}>Delete
                    </button>
                    <button className="button" onClick={() => this.updateLinkItem(component, link)}>Done
                    </button>
                </div>
            </div>
        else return <div className={"inner-mock"}>
            <div className={"hero"}>
                {link.icon !== null ? (<img className={"link-icon"} src={link.icon} alt={'Link icon'}/>) :
                    <div className={"bump"}></div>}
            </div>
            <div className={"link-content"}>
                <span>{link.title || link.link}</span>
                <div className={"link-list-btn-container"}>
                    <button className={"icon-button"} onClick={() => this.selectLinkItem(component, key)}>
                        <AiFillEdit/>
                    </button>
                </div>
            </div>
        </div>
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

    uploadPDF = () =>
    {
        this.uploadingDialog.showModal()
        fetch(this.state.selectedFile).then(r => r.blob()).then(blob =>
        {
            const result = new File([blob], "theFile.pdf", {type: 'application/pdf'})
            upload(result, false).then(result =>
            {
                if (result.success)
                {
                    this.uploadingDialog.close()
                    this.saveLocally({
                        fileId: result.content.split('.')[0]
                    })
                }
            })
        })
    }

    handleTitleChange(event)
    {
        this.setState({title: event.target.value})
    }

    handleDescriptionChange(event)
    {
        this.setState({description: event.target.value})
    }

    handleLinkFieldChange(event)
    {
        this.setState({linkField: event.target.value})
    }

    handleDisplayNameChange(event)
    {
        this.setState({displayName: event.target.value})
    }

    handleLinkItemTitleChange(event)
    {
        this.setState({linkItemTitleField: event.target.value})
    }

    handleLinkItemURLChange(event)
    {
        this.setState({linkItemURLField: event.target.value})
    }

    handleSpotifyLinkChange(event)
    {
        this.setState({spotifyLink: event.target.value})
    }

    handleYouTubeLinkChange(event)
    {
        this.setState({youtubeLink: event.target.value})
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

    updateGenericComponent = (title, description) =>
    {
        if (!description)
            return this.displayGenericMessage({type: 'error', message: 'Description should not be empty!'})

        this.saveLocally({title: title, description: description})
    }

    updateSpotifyLink = (link) =>
    {
        const regex = /^(https:\/\/open.spotify.com\/playlist\/|https:\/\/open.spotify.com\/user\/[a-zA-Z0-9]+\/playlist\/|spotify:user:[a-zA-Z0-9]+:playlist:|spotify:playlist:37i9dQZF1DZ06evO2ZpGiQ)([a-zA-Z0-9]+)(.*)$/
        let match = link.match(regex)
        if (!match)
            return this.displaySpotifyMessage({type: 'error', message: 'The provided Spotify link is invalid.'})

        this.props.updateLocallyWithoutCancelling(match[2])
    }

    updateYouTubeLink = (link) =>
    {
        const regex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/
        let match = link.match(regex)
        if (!match)
            return this.displayYouTubeMessage({type: 'error', message: 'The provided YouTube link is invalid.'})

        this.props.updateLocallyWithoutCancelling(match[6])
    }

    setLinkListVertical = (vertical) =>
    {
        let content = this.props.selectedComponent.content
        content.vertical = vertical
        this.props.updateLocallyWithoutCancelling(content)
    }

    saveLocally = (content) =>
    {
        this.props.updateLocally(content)
    }

    cancel = () =>
    {
        this.props.cancelSelection()
    }

    renderFields = (component) =>
    {
        if (!component)
            return <div className={"default"}>
                <div>
                    <span className={"m"}>Start editing</span><br/><br/>
                    <span className={"s"}>Click on a component to begin editing</span><br/>
                    <span className={"s"}>Drag a component to change its position</span>
                </div>
                <div>
                    {this.latestPosts(this.state.posts)}
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
                return <>
                    <h3 className="m p-no-margin-top p-no-margin-bottom">Edit generic component</h3>
                    {this.drawMessage(this.state.genericMessage)}
                    <h2 className="s p-no-margin-bottom p-no-margin-top title">Title:</h2>
                    <input className="input" type="text" placeholder="Title" value={this.state.title}
                           onChange={this.handleTitleChange}/>
                    <h2 className="s p-no-margin-bottom p-no-margin-top description">Description:</h2>
                    <textarea className="description-text-box-size" value={this.state.description}
                              placeholder="Description" onChange={this.handleDescriptionChange}/>
                    <div className={"button-container"}>
                        <button className="button delete-button"
                                onClick={() => this.props.deleteSelectedComponent()}>Delete component
                        </button>
                        <button className="button unraised" onClick={() => this.cancel()}>Cancel</button>
                        <button className="button"
                                onClick={() => this.updateGenericComponent(this.state.title, this.state.description)}>Done
                        </button>
                    </div>
                </>
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
                return <>
                    <dialog ref={ref => this.uploadingDialog = ref} className={"dashboard-modal"}>
                        <span className={"m"}>Uploading...</span>
                    </dialog>
                    <h3 className="m p-no-margin-top p-no-margin-bottom">Edit component</h3>
                    {this.drawMessage(this.state.fileMessage)}
                    <div>
                        <label htmlFor="pdf-button" className="button-label">Upload PDF</label>
                        <input type={"file"} onChange={this.onFileChange} className="file-button" accept={".pdf"}
                               id="pdf-button"/>
                    </div>
                    <p className="s">Only PDF files up to 1MB allowed!</p>
                    <div className="pdf">
                        <object data={this.state.selectedFile}
                                type="application/pdf"></object>
                    </div>
                    <div className="button-container">
                        <button className="button delete-button"
                                onClick={() => this.props.deleteSelectedComponent()}>Delete component
                        </button>
                        <button className="button unraised" onClick={() => this.cancel()}>Cancel</button>
                        <button className="button" onClick={() => this.uploadPDF()}>Upload</button>
                    </div>
                </>
            case 'linklist':
                return <>
                    <dialog ref={ref => this.uploadingDialog = ref} className={"dashboard-modal"}>
                        <span className={"m"}>Uploading...</span>
                    </dialog>
                    <h3 className="m p-no-margin-top p-no-margin-bottom">Edit link list</h3>
                    {(component.content !== null) ? component.content.links.map((link, key) => this.linkEditItem(link, key, this.state.selectedLinkListItem === key, component)) : <></>}
                    {(component.content !== null) ? component.content.links.length >= 5 ? <></> :
                        <button className="inner-mock3" onClick={() => this.addNewLinkItem(component)}>
                            <span className="mm p-no-margin-bottom p-no-margin-top">+</span>
                        </button> : <></>}
                    <p className="mm p-no-margin-top p-no-margin-bottom">Change list design</p>
                    <div className='list-button-container'>
                        <button className="button unraised link-img" type="button"
                                onClick={() => this.setLinkListVertical(false)}>
                            <img src={linkH} alt={'Horizontal'}/>
                        </button>
                        <button style={{marginLeft: "10%"}} className="button unraised link-img"
                                onClick={() => this.setLinkListVertical(true)}>
                            <img src={linkV} alt={'Vertical'}/>
                        </button>
                    </div>
                    <div className={"button-container"}>
                        <button className="button delete-button"
                                onClick={() => this.props.deleteSelectedComponent()}>Delete component
                        </button>
                        <button className="button" onClick={() => this.cancel()}>Done</button>
                    </div>
                </>
            case 'youtube':
                return <>
                    <h3 className="m p-no-margin-top p-no-margin-bottom">Edit YouTube video</h3>
                    {this.drawMessage(this.state.youtubeMessage)}
                    <h2 className="s p-no-margin-bottom p-no-margin-top title">Import a YouTube video link:</h2>
                    <input className="input" type="text" placeholder="https://www.youtube.com/watch?v=DgKpLoz29jo"
                           value={this.state.youtubeLink} onChange={this.handleYouTubeLinkChange}/>
                    <div>
                        <button className="load-button"
                                onClick={() => this.updateYouTubeLink(this.state.youtubeLink)}>Load video
                        </button>
                    </div>
                    <iframe style={{borderRadius: "12px"}}
                            src={"https://www.youtube-nocookie.com/embed/" + component.content}
                            width={"100%"} height={400} frameBorder={"0"} allowFullScreen={true}
                            allow={"autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"}
                            loading={"lazy"}></iframe>
                    <div class="margin-button">
                        <button className="delete-component"
                                onClick={() => this.props.deleteSelectedComponent()}>Delete component
                        </button>
                        <button className="done-button" onClick={() => this.cancel()}>Done</button>
                    </div>
                </>
            case "spotify":
                return <>
                    <h3 className="m p-no-margin-top p-no-margin-bottom">Edit Spotify playlist</h3>
                    {this.drawMessage(this.state.spotifyMessage)}
                    <h2 className="s p-no-margin-bottom p-no-margin-top title">Import a Spotify playlist link:</h2>
                    <input className="input" type="text"
                           placeholder="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=6d5152d5b4454b4f"
                           value={this.state.spotifyLink} onChange={this.handleSpotifyLinkChange}/>
                    <div>
                        <button className="load-button"
                                onClick={() => this.updateSpotifyLink(this.state.spotifyLink)}>Load playlist
                        </button>
                    </div>
                    <iframe style={{borderRadius: "12px"}}
                            src={"https://open.spotify.com/embed/playlist/" + component.content}
                            width={"100%"} frameBorder={0} height={"400"} allowFullScreen={true}
                            allow={"autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"}
                            loading={"lazy"}></iframe>
                    <div className="margin-button">
                        <button className="delete-component"
                                onClick={() => this.props.deleteSelectedComponent()}>Delete component
                        </button>
                        <button className="done-button" onClick={() => this.cancel()}>Done</button>
                    </div>
                </>
        }
    }

    render()
    {
        return <div className="outer-mock">
            {this.renderFields(this.props.selectedComponent)}
        </div>
    }
}