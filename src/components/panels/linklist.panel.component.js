import {AiFillEdit} from "react-icons/ai";
import React from "react";

import {upload} from "../../utils/session.util";
import config from '../../utils/config.util'
import linkH from "../../static/linklist-type1.png";
import linkV from "../../static/linklist-type2.png";

export default class LinkListPanel extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            // Link list
            selectedLinkListItem: null,
            linkItemTitleField: "",
            linkItemURLField: "",
            linkItemSelectedImage: null,
            linkItemMessage: null,
        }

        this.handleLinkItemURLChange = this.handleLinkItemURLChange.bind(this)
        this.handleLinkItemTitleChange = this.handleLinkItemTitleChange.bind(this)
    }


    handleLinkItemTitleChange(event)
    {
        this.setState({linkItemTitleField: event.target.value})
    }

    handleLinkItemURLChange(event)
    {
        this.setState({linkItemURLField: event.target.value})
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
        this.props.updateLocallyWithoutCancelling(content).then(r =>
            this.selectLinkItem(component, content.links.length - 1))
    }

    setLinkListVertical = (vertical) =>
    {
        let content = this.props.component.content
        content.vertical = vertical
        this.props.updateLocallyWithoutCancelling(content).then(result =>
        {
        })
    }

    checkURLValidity(url)
    {
        let url_;

        try
        {
            url_ = new URL(url);
        } catch (_)
        {
            return false;
        }

        return url_.protocol === "http:" || url_.protocol === "https:";
    }

    updateLinkItem = (component, link) =>
    {
        if (this.state.selectedLinkListItem !== null)
        {
            if (this.state.linkItemURLField === null)
            {
                return this.displayLinkItemMessage({type: 'error', message: 'Link field must not be empty!'})
            }
            if (this.checkURLValidity(this.state.linkItemURLField) === false)
            {
                return this.displayLinkItemMessage({type: 'error', message: 'Use the correct link format!'})
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
                        this.props.updateLocallyWithoutCancelling(content).then(res =>
                        {
                            return this.setState({
                                selectedLinkListItem: null,
                                linkItemTitleField: null,
                                linkItemURLField: null,
                                linkItemSelectedImage: null
                            })
                        })
                    }
                )
            }
            const content = component.content
            content.links[this.state.selectedLinkListItem] = newLink
            this.props.updateLocallyWithoutCancelling(content).then(res =>
            {
                return this.setState({
                    selectedLinkListItem: null,
                    linkItemTitleField: null,
                    linkItemURLField: null,
                    linkItemSelectedImage: null
                })
            })
        }
    }

    deleteLinkItem = (key, component) =>
    {
        const content = component.content
        content.links.splice(key, 1)
        this.props.updateLocallyWithoutCancelling(content).then(res =>
        {
            this.setState({
                selectedLinkListItem: null,
                linkItemTitleField: null,
                linkItemURLField: null
            })
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
                this.uploadingDialog.showModal()
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

    linkEditItem = (link, key, selected, component) =>
    {
        if (selected)
            return <div className="special-mock">
                {this.props.drawMessage(this.state.linkItemMessage)}
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

    render()
    {
        const component = this.props.component
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
                <button className="button" onClick={() => this.props.cancel()}>Done</button>
            </div>
        </>
    }
}