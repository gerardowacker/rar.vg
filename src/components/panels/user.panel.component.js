import React from "react";
import config from "../../utils/config.util";
import {AiFillEdit} from "react-icons/ai";
import prof1 from "../../static/profile-type1.png";
import prof2 from "../../static/profile-type2.png";
import {colours} from "../../pages/profileDesigns/colour.util";
import Link from "../../router/link";
import {upload} from "../../utils/session.util";

export default class UserPanel extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            // User metadata.
            displayName: "",
            userMessage: null,
            lastReloaded: Date.now(),
        }
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

    handleDisplayNameChange(event)
    {
        this.setState({displayName: event.target.value})
    }

    displayUserMessage = (message) =>
    {
        this.setState({userMessage: message})
        setTimeout(() => this.setState({userMessage: null}), 5000)
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

    render()
    {
        return <>
            <dialog ref={ref => this.uploadingDialog = ref} className={"dashboard-modal"}>
                <span className={"m"}>Uploading...</span>
            </dialog>
            <h3 className="m p-no-margin-top p-no-margin-bottom">Edit user metadata</h3>
            <div className="user-top">
                <span className={"s p-no-margin-top"}>Profile picture:</span>
                {this.props.drawMessage(this.state.userMessage)}
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
                    <button className="button unraised" onClick={() => this.props.cancel()}>Cancel</button>
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
    }
}