import React from "react";
import { tryUserLoading, updateProfile } from "../utils/session.util";
import config from '../utils/config.util';
import './dashboard.css';
import EditableProfile from "../components/editableprofile.component";
import EditPanel from "../components/editpanel.component";

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
            component: null,
            unpublished: null,
            showModal: false,
            showLogoutModal: false,
            lastReloaded: Date.now(),
            deviceLogoutCircleColor: 'white',
            allDevicesLogoutCircleColor: 'white',
            boldButton: null,
            componentToRemove: null,
        }

        this.editPanel = React.createRef();
    }

    componentDidMount() {
        window.addEventListener("beforeunload", this.onUnload);
        tryUserLoading().then(response => {
            if (!response.success)
                return window.location.href = "/login"

            this.setState({ user: response.content.user })
        })
    }

    componentWillUnmount() {
        window.removeEventListener("beforeunload", this.onUnload);
    }

    onUnload = e => {
        if (this.state.unpublished) {
            e.preventDefault();
            e.returnValue = 'You\'ve got unsaved changes! Are you sure you want to close?';
        }
    }

    handleDeviceLogoutSelect = () => {
        this.setState({ boldButton: 'device' });
    }

    handleAllDevicesLogoutSelect = () => {
        this.setState({ boldButton: 'allDevices' });
    }

    executeLogout = () => {
        if (this.state.selectedLogoutOption === 'device') {
            // Handle logout from this device only
        } else if (this.state.selectedLogoutOption === 'allDevices') {
            // Handle logout from all devices
        }
        this.toggleLogoutModal();
    }

    handleProfileClick = () => {
        this.setState(prevState => ({ showLogoutModal: !prevState.showLogoutModal }));
    }

    handleButtonSelect = (buttonNumber) => {
        this.setState({ selectedButton: buttonNumber });
    }

    toggleDeviceLogoutCircleColor = () => {
        this.setState(prevState => ({
            deviceLogoutCircleColor: prevState.deviceLogoutCircleColor === 'white' ? 'black' : 'white'
        }));
    }

    toggleAllDevicesLogoutCircleColor = () => {
        this.setState(prevState => ({
            allDevicesLogoutCircleColor: prevState.allDevicesLogoutCircleColor === 'white' ? 'black' : 'white'
        }));
    }

    renderLogoutModal = () => {
        if (!this.state.showLogoutModal) return null;

        return (
            <div className="logoutModal">
                <p className="logoutTitle">Do you want to log out?</p>
                <button
                    className={`deviceLogoutButton ${this.state.boldButton === 'device' ? 'bold-text' : ''}`}
                    onClick={this.handleDeviceLogoutSelect}
                >
                    <button
                        className="circleButton"
                        style={{ backgroundColor: this.state.deviceLogoutCircleColor }}
                        onClick={(e) => {
                            e.stopPropagation();
                            this.toggleDeviceLogoutCircleColor();
                        }}
                    ></button>
                    Log out of this device only
                </button>
                <button
                    className={`allDevicesLogoutButton ${this.state.boldButton === 'allDevices' ? 'bold-text' : ''}`}
                    onClick={this.handleAllDevicesLogoutSelect}
                >
                    <button
                        className="circleButton"
                        style={{ backgroundColor: this.state.allDevicesLogoutCircleColor }}
                        onClick={(e) => {
                            e.stopPropagation();
                            this.toggleAllDevicesLogoutCircleColor();
                        }}
                    ></button>
                    Log out of all devices (will close all of your sessions)
                </button>
                <div className="logoutActions">
                    <button className="cancel-btn" onClick={this.toggleLogoutModal}>Cancel</button>
                    <button className="done-btn" onClick={this.handleLogout}>Done</button>
                </div>
            </div>
        );
    }

    updateProfile = () => {
        updateProfile(this.state.user.displayName, JSON.stringify(this.state.user.components), JSON.stringify(this.state.user.sociallinks))
            .then(response => {
                if (!response.success)
                    console.error(response.content)

                this.displayMessage({ type: 'success', message: "Changes published successfully!" })
            })
    }

    updateComponentOrder = (from, to) => {
        const oldUser = this.state.user
        let f = oldUser.components.splice(from, 1)[0];
        oldUser.components.splice(to, 0, f);
        this.setState({
            user: oldUser,
            component: this.state.component === from ? to : this.state.component + 1
        })
        this.displayMessage({ type: 'important', message: "You've got unsaved changes!" }, true)
    }

    selectComponent = (key) => {
        this.editPanel.current.clearState()
        this.setState({ component: key })
        this.editPanel.current.handleNecessaryUpdates(this.getSelectedComponent(key))
    }

    cancelSelection = () => {
        this.editPanel.current.clearState()
        this.setState({ component: null })
    }

    updateComponentLocally = (content) => {
        this.updateComponentLocallyWithoutCancelling(content)
        this.cancelSelection()
    }

    updateComponentLocallyWithoutCancelling = (content) => {
        const oldUser = this.state.user
        oldUser.components[this.state.component].content = null
        this.setState({ user: oldUser })
        oldUser.components[this.state.component].content = content
        this.setState({ user: oldUser })
        this.displayMessage({ type: 'important', message: "You've got unsaved changes!" }, true)
    }

    updateDisplayName = (displayName) => {
        if (displayName !== "") {
            this.setState({ user: { ...this.state.user, displayName: displayName } })
            this.displayMessage({ type: 'important', message: "You've got unsaved changes!" }, true)
        }
        this.cancelSelection()
    }

    drawMessage(message) {
        if (message) return (
            <div className={"notice " + message.type}>
                {message.message}
            </div>
        )
    }

    addComponent(type) {
        let newComponent = { type: type, content: null }
        switch (type) {
            case 'generic':
                newComponent.content = {
                    title: "This is a generic component",
                    description: "You can edit me by filling the fields on the edition panel."
                }
                break;
            case 'pdf':
                newComponent.content = { fileId: null }
                break;
            case 'linklist':
                newComponent.content = {
                    links: [{
                        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                        "icon": null,
                        "title": "This is a link"
                    }]
                }
                break;
            default:
                return;
        }
        const oldUser = this.state.user;
        oldUser.components.push(newComponent)
        this.setState({ user: oldUser })
        this.displayMessage({ type: 'important', message: "You've got unsaved changes!" }, true)
        this.toggleModal()
        this.selectComponent(this.state.user.components.length - 1)
    }

    updateLinks = (links) => {
        const oldUser = this.state.user
        oldUser.sociallinks = links
        this.setState({ user: oldUser })
    }

    displayMessage = (message, persistent) => {
        this.setState({ unpublished: message })
        if (!persistent) setTimeout(() => this.setState({ unpublished: null }), 5000)
    }

    getSelectedComponent(id) {
        switch (id) {
            case -2:
                return { type: 'user' }
            case -1:
                return { type: 'sociallinks' }
            default:
                return this.state.user.components[id]
        }
    }

    toggleModal = () => {
        this.dialog.open ? this.dialog.close() : this.dialog.showModal()
    }

    reloadImage = () => {
        this.setState({ lastReloaded: Date.now() })
    }

    handleLogout = () => {
        // For frontend logout, you can simply redirect to the login page:
        window.location.href = "/login";
    }

    removeComponent = (type) => {
        const oldUser = this.state.user;
        const index = oldUser.components.findIndex(component => component.type === type);
        if (index !== -1) {
            oldUser.components.splice(index, 1);
            this.setState({ user: oldUser });
            this.displayMessage({ type: 'important', message: "You've removed a component!" }, true);
        }
    }

    toggleLogoutModal = () => {
        this.setState(prevState => ({ showLogoutModal: !prevState.showLogoutModal }));
    }

    render() {
        if (!this.state.user) return 'Loading...';

        return (
            <div className="dashboard-container">
                {this.state.showLogoutModal && this.renderLogoutModal()}
                <div className="dash-container">
                    <dialog className={"dashboard-modal"} ref={ref => this.dialog = ref}>
                        <span className={"m"}>Select component to add:</span>
                        <div className={"component-types-container"}>
                            <button onClick={() => this.addComponent('generic')} className={"component-to-select s"}>Generic component</button>
                            <button onClick={() => this.addComponent('pdf')} className={"component-to-select s"}>PDF reader</button>
                            <button onClick={() => this.addComponent('linklist')} className={"component-to-select s"}>Custom link list</button>
                        </div>
                        <button className={"publish-button"} onClick={() => this.toggleModal()}>Cancel</button>
                    </dialog>
                    <div className="left">
                        <span className="mmm p-no-margin-bottom p-no-margin-top welcome" onClick={this.handleProfileClick}>👋 Welcome back, {this.state.user.displayName}!</span>
                        {this.drawMessage(this.state.unpublished)}
                    </div>
                    <div className="right">
                        <button className="publish-button" onClick={() => this.updateProfile()}>Publish</button>
                        <button className="profile-button" onClick={this.handleProfileClick} style={{ backgroundImage: "url(" + config('HOST') + "/avatar/" + this.state.user.id + ".png?lr=" + this.state.lastReloaded }}>.</button>
                    </div>
                </div>
                <div className="dash-container2">
                    <div className="left-component">
                        <EditPanel updateLocally={this.updateComponentLocally}
                            updateLocallyWithoutCancelling={this.updateComponentLocallyWithoutCancelling}
                            cancelSelection={this.cancelSelection}
                            updateLinks={this.updateLinks} displayMessage={this.displayMessage}
                            user={this.state.user} updateDisplayName={this.updateDisplayName}
                            reloadImage={this.reloadImage} ref={this.editPanel}
                            selectedComponent={this.getSelectedComponent(this.state.component)} />
                    </div>
                    <div className="right-component">
                        <div className="profile-container">
                            <EditableProfile
                                selectComponent={this.selectComponent}
                                toggleModal={this.toggleModal}
                                user={this.state.user}
                                lastReloaded={this.state.lastReloaded}
                                updateComponentOrder={this.updateComponentOrder}
                                removeComponent={this.removeComponent}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
