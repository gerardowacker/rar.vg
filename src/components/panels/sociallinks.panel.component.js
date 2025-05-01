import React from "react";
import {FaBitcoin, FaDiscord, FaEthereum, FaItunesNote, FaSteam, FaTiktok} from "react-icons/fa";
import {CgWebsite} from "react-icons/cg";
import {SiCashapp} from "react-icons/si";
import {BsFacebook, BsGithub, BsInstagram, BsLinkedin, BsSpotify, BsTwitch, BsTwitter, BsYoutube} from "react-icons/bs";
import {AiFillEdit, AiOutlineCheck, AiOutlineClose} from "react-icons/ai";

export default class SocialLinksPanel extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            // Social links.
            linkField: "",
            selectedLink: null,
            linkList: [],
        }
        this.handleLinkFieldChange = this.handleLinkFieldChange.bind(this)
    }

    handleLinkFieldChange(event)
    {
        this.setState({linkField: event.target.value})
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

    drawIcons = () =>
    {
        return <div>
            {Object.keys(this.icons).map((item, key) => (
                <button key={key} className="icon-button"
                        onClick={() => this.addNewItem(item)}>{this.icons[item].icon}</button>
            ))}
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

    displayMessageInDashboard(message, persistent)
    {
        this.props.displayMessage(message, persistent)
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

    render()
    {
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
                <button className="button" onClick={() => this.props.cancel()}>Done</button>
            </div>
        </>
    }
}