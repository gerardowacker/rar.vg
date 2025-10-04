import React from "react";
import {tryLogout, tryUserLoading, updateProfile} from "../utils/session.util";
import config from '../utils/config.util'

import './dashboard.css'
import EditableProfile from "../components/editableprofile.component";
import EditPanel from "../components/editpanel.component";
import AIChatComponent from "../components/aichat.component";
import {colours} from "./profileDesigns/colour.util";
import Button from "../components/button";

import {IoMdOpen, IoMdAdd, IoIosList, IoMdCloudUpload} from "react-icons/io";
import {BsStars} from "react-icons/bs";

export default class Dashboard extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            user: null,
            component: null,
            unpublished: null,
            showModal: false,
            reordering: false,
            lastReloaded: Date.now(),
            showAIChat: false,

            // Version history
            hist: [],

            // Logout options
            single: "only",

            // Undo/Redo
            history: [],
            redo: [],

            // Toast dinámico
            toast: null,
        }

        this.toastTimer = null; // timer para auto-ocultar toast
        this.editPanel = React.createRef()
        this.handleClickOutside = this.handleClickOutside.bind(this)
        this.changeInputValueRadio = this.changeInputValueRadio.bind(this)
        this.toggleAIChat = this.toggleAIChat.bind(this)
    }

    // =========================
    // UNDO / REDO - CORE
    // =========================
    getSnapshot = () => JSON.parse(JSON.stringify({
        user: this.state.user,
        component: this.state.component,
        reordering: this.state.reordering,
    }));

    pushHistory = () =>
    {
        const MAX = 50;
        this.setState(prev =>
        {
            const nextHistory = [...prev.history, this.getSnapshot()];
            return {
                history: nextHistory.length > MAX ? nextHistory.slice(nextHistory.length - MAX) : nextHistory,
                redo: []
            };
        });
    };

    applySnapshot = (snap) =>
    {
        if (!snap) return;
        this.setState({
            user: snap.user,
            component: snap.component,
            reordering: snap.reordering
        });
        if (snap.component != null && this.editPanel.current)
        {
            this.editPanel.current.clearState?.();
            this.editPanel.current.handleNecessaryUpdates?.(this.getSelectedComponent(snap.component));
        }
    };

    handleUndo = () =>
    {
        const {history, redo} = this.state;
        if (!history.length) return;

        const current = this.getSnapshot();
        const prev = history[history.length - 1];

        this.setState({
            history: history.slice(0, -1),
            redo: [...redo, current],
        }, () =>
        {
            this.applySnapshot(prev);
            this.displayToast("You undid the last change");
        });
    };

    handleRedo = () =>
    {
        const {history, redo} = this.state;
        if (!redo.length) return;

        const current = this.getSnapshot();
        const next = redo[redo.length - 1];

        this.setState({
            history: [...history, current],
            redo: redo.slice(0, -1),
        }, () =>
        {
            this.applySnapshot(next);

            this.displayToast("You redid the last change");
        });
    };

    displayToast = (text, {duration = 4000} = {}) =>
    {
        if (this.toastTimer) clearTimeout(this.toastTimer);

        this.setState({toast: {text}});

        if (duration > 0)
        {
            this.toastTimer = setTimeout(() =>
            {
                this.setState({toast: null});
                this.toastTimer = null;
            }, duration);
        }
    };

    handleClickOutside(event)
    {
        // ref almacenado como elemento (no .current)
        if (this.profOptions && !this.profOptions.contains(event.target))
        {
            this.props.onClickOutside && this.props.onClickOutside();
        }
    };

    onUnload = e =>
    {
        if (this.state.unpublished)
        {
            e.preventDefault();
            e.returnValue = 'You\'ve got unsaved changes! Are your sure you want to close?';
        }
    }

    componentDidMount()
    {
        window.addEventListener("beforeunload", this.onUnload);
        tryUserLoading().then(response =>
        {
            if (!response.success)
                return window.location.href = "/login"

            this.setState({user: response.content.user})
        })
        document.addEventListener('click', this.handleClickOutside, true);
        document.addEventListener('keydown', this.handleKeyDown);

        // Auto-open AI chat once per session on any device (desktop and mobile)
        try
        {
            const hasAutoOpened = sessionStorage.getItem('aiChatAutoOpened') === '1';
            if (!hasAutoOpened)
            {
                this.setState({showAIChat: true});
                sessionStorage.setItem('aiChatAutoOpened', '1');
            }
        } catch (_)
        {
            // no-op if storage is unavailable
        }
    }

    componentWillUnmount()
    {
        window.removeEventListener("beforeunload", this.onUnload);
        document.removeEventListener('click', this.handleClickOutside, true);
        document.removeEventListener('keydown', this.handleKeyDown);
        if (this.toastTimer) clearTimeout(this.toastTimer);
    }

    //función que chequea Ctrl+Z o Ctrl+Y
    handleKeyDown = (e) =>
    {
        const key = e.key.toLowerCase();
        const isCtrlOrCmd = e.ctrlKey || e.metaKey;

        // Undo → Ctrl+Z / Cmd+Z
        if (isCtrlOrCmd && key === 'z' && !e.shiftKey)
        {
            e.preventDefault();
            this.handleUndo();
            return;
        }

        // Redo → Ctrl+Y / Cmd+Y, o Ctrl+Shift+Z / Cmd+Shift+Z
        if ((isCtrlOrCmd && key === 'y') || (isCtrlOrCmd && key === 'z' && e.shiftKey))
        {
            e.preventDefault();
            this.handleRedo();
            return;
        }
    }

    updateProfile = () =>
    {
        updateProfile(this.state.user.displayName, JSON.stringify(this.state.user.components),
            JSON.stringify(this.state.user.sociallinks), JSON.stringify(this.state.user.profileDesign))
            .then(response =>
            {
                if (!response.success)
                {
                    console.error(response.content)
                    this.displayToast("There was an error publishing changes");
                    return;
                }
                this.displayMessage({type: 'success', message: "Changes published successfully!"})
            })
    }

    updateComponentOrder = (from, to) =>
    {
        if (this.state.reordering === false) return

        this.pushHistory(); // snapshot antes de mutar

        const user = JSON.parse(JSON.stringify(this.state.user));
        const f = user.components.splice(from, 1)[0];
        user.components.splice(to, 0, f);

        this.setState({user}, () =>
            this.displayMessage({type: 'important', message: "You've got unsaved changes!"}, true)
        );
    }

    selectComponent = (key) =>
    {
        if (this.state.reordering === true) return
        // guardar selección anterior (para undo/redo de selección)
        this.pushHistory();

        this.editPanel.current?.clearState?.();
        this.setState({component: key}, () =>
        {
            this.editPanel.current?.handleNecessaryUpdates?.(this.getSelectedComponent(key))
        });
    }

    toggleReordering = () =>
    {
        // trackeamos reordering en la historia
        this.pushHistory();
        const oldOrder = !this.state.reordering
        this.editPanel.current?.clearState?.();
        this.setState({reordering: oldOrder})
    }

    cancelSelection = () =>
    {
        // si querés que cancelar selección también sea undoable:
        this.pushHistory();
        this.editPanel.current?.clearState?.();
        this.setState({component: null})
    }

    updateComponentLocally = (content) =>
    {
        this.updateComponentLocallyWithoutCancelling(content)
        this.cancelSelection()
    }

    updateComponentLocallyWithoutCancelling = (content) =>
    {
        this.pushHistory();

        const user = JSON.parse(JSON.stringify(this.state.user));
        user.components[this.state.component].content = content;

        this.setState({user}, () =>
            this.displayMessage({type: 'important', message: "You've got unsaved changes!"}, true)
        );
    }

    updateProfileDesign = (design) =>
    {
        if (design > 0 && design < 9)
        {
            this.pushHistory();

            const user = JSON.parse(JSON.stringify(this.state.user));
            user.profileDesign = {...user.profileDesign, design};

            this.setState({user}, () =>
                this.displayMessage({type: 'important', message: "You've got unsaved changes!"}, true)
            );
        }
    }

    updateProfileColours = (theme) =>
    {
        if (theme >= 0 && theme < colours.length)
        {
            this.pushHistory();

            const user = JSON.parse(JSON.stringify(this.state.user));
            user.profileDesign = {...user.profileDesign, colour: theme};

            this.setState({user}, () =>
                this.displayMessage({type: 'important', message: "You've got unsaved changes!"}, true)
            );
        }
    }

    updateProfileBorderRadius = (borderRadius) =>
    {
        if (borderRadius >= 0 && borderRadius <= 40)
        {
            this.pushHistory();

            const user = JSON.parse(JSON.stringify(this.state.user));
            user.profileDesign = {...user.profileDesign, borderRadius};

            this.setState({user}, () =>
                this.displayMessage({type: 'important', message: "You've got unsaved changes!"}, true)
            );
        }
    }

    updateDisplayName = (displayName) =>
    {
        if (displayName !== "")
        {
            this.pushHistory();

            const user = JSON.parse(JSON.stringify(this.state.user));
            user.displayName = displayName;

            this.setState({user}, () =>
                this.displayMessage({type: 'important', message: "You've got unsaved changes!"}, true)
            );
        }
        this.cancelSelection()
    }
    
    updateProfileFont = (font) =>
    {
        this.pushHistory();

        const user = JSON.parse(JSON.stringify(this.state.user));
        user.profileDesign = {...user.profileDesign, font};

        this.setState({user}, () =>
            this.displayMessage({type: 'important', message: "You've got unsaved changes!"}, true)
        );
    }

    drawMessage(message)
    {
        if (message) return (
            <div className={"notice " + message.type}>
                {message.message}
            </div>
        )
    }

    deleteSelectedComponent = () =>
    {
        this.pushHistory();

        const user = JSON.parse(JSON.stringify(this.state.user));
        user.components.splice(this.state.component, 1);

        this.setState({user}, () =>
        {
            this.displayMessage({type: 'important', message: "You've got unsaved changes!"}, true)
            this.cancelSelection()
            this.toggleRemoveComponentModal()
        });
    }

    addComponent(type)
    {
        this.pushHistory();
        let newComponent = {type: type, content: null}
        switch (type)
        {
            case 'generic':
                newComponent.content = {
                    title: "This is a generic component",
                    description: "You can edit me by filling the fields on the edition panel."
                }
                break
            case 'pdf':
                newComponent.content = {fileId: null}
                break
            case 'linklist':
                newComponent.content = {
                    links: [{
                        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                        "icon": null,
                        "title": "This is a link"
                    }]
                }
                break
            case 'youtube':
                newComponent.content = 'dQw4w9WgXcQ'
                break
            case 'spotify':
                newComponent.content = '37i9dQZF1DXcBWIGoYBM5M'
                break
            default:
                return;
        }

        const user = JSON.parse(JSON.stringify(this.state.user));
        user.components.push(newComponent)

        this.setState({user}, () =>
        {
            this.displayMessage({type: 'important', message: "You've got unsaved changes!"}, true)
            this.toggleModal()
            this.selectComponent(user.components.length - 1)
        });
    }

    updateLinks = (links) =>
    {
        this.pushHistory();

        const user = JSON.parse(JSON.stringify(this.state.user));
        user.sociallinks = links;

        this.setState({user}, () =>
            this.displayMessage({type: 'important', message: "You've got unsaved changes!"}, true)
        );
    }

    displayMessage = (message, persistent) =>
    {
        this.setState({unpublished: message})
        if (!persistent) setTimeout(() => this.setState({unpublished: null}), 5000)
    }

    getSelectedComponent(id)
    {
        switch (id)
        {
            case -2:
                return {type: 'user'}
            case -1:
                return {type: 'sociallinks'}
            default:
                return this.state.user.components[id]
        }
    }

    showProfOptions = () =>
    {
        this.profOptions.open ? this.profOptions.close() : this.profOptions.showModal()
    }

    toggleModal = () =>
    {
        this.dialog.open ? this.dialog.close() : this.dialog.showModal()
    }

    toggleLogOutModal = () =>
    {
        this.logoutConfirmation.open ? this.logoutConfirmation.close() : this.logoutConfirmation.showModal()
    }

    toggleRemoveComponentModal = () =>
    {
        this.removeComponentModal.open ? this.removeComponentModal.close() : this.removeComponentModal.showModal()
    }

    reloadImage = () =>
    {
        this.setState({lastReloaded: Date.now()})
    }

    changeInputValueRadio(event)
    {
        this.setState({single: event.target.value})
    }

    toggleAIChat()
    {
        this.setState(prevState => ({showAIChat: !prevState.showAIChat}))
    }

    handleAcceptDesign = (acceptedDesign) =>
    {
        console.log('Accepting design in Dashboard:', acceptedDesign);

        // Save current state for undo/redo
        this.pushHistory();

        // Update local state with the accepted design
        const updatedUser = {
            ...this.state.user,
            components: acceptedDesign.components || [],
            profileDesign: acceptedDesign.profileDesign || this.state.user.profileDesign
        };

        this.setState({user: updatedUser});

        // Show toast notification for AI design loaded
        this.displayToast("AI design loaded!");

        // Show a persistent message that changes are ready to be saved
        this.displayMessage({type: 'important', message: "You've got unsaved changes."}, true);

        // Cancel any current component selection to show the full updated profile
        this.cancelSelection();
    }

    logout()
    {
        tryLogout(this.state.single === 'only').then(response =>
        {
            window.location.href = '/login?jr=' + (response.content.code || 4)
        })
    }


    render()
    {
        if (!this.state.user) return 'Loading...'
        return <div className="dashboard-container">

            {this.state.toast && (
                <div className="df-toast" role="status" aria-live="polite">
                    <strong>{this.state.toast.text}</strong>
                </div>
            )}

            <dialog className={"remove-component-modal"} ref={ref => this.removeComponentModal = ref}>
                <div className="question-remove">
                    <span className={'m'}>Do you want to delete this component?</span>
                </div>
                <div className="remove-component-modal-buttons-container">
                    <Button className="remove-component-modal-button cancel" variant="gray"
                            onClick={() => this.toggleRemoveComponentModal()}>No, keep it</Button>
                    <Button className="remove-component-modal-button done" variant="primary"
                            onClick={() => this.deleteSelectedComponent()}>Yes, delete</Button>
                </div>
            </dialog>
            <dialog className={"logout-modal"} onClick={() => this.toggleLogOutModal()}
                    ref={ref => this.logoutConfirmation = ref}>
                <div onClick={e => e.stopPropagation()}>
                    <div className="question-logout">
                        <span className={"m"}>Do you want to log out?</span>
                    </div>

                    <div className={"inner-mock2"}>
                        <label className="logout-option">
                            <input onChange={this.changeInputValueRadio} value={"only"}
                                   checked={this.state.single === "only"} type={"radio"} name={"logout-options"}
                                   className="circle-opt"></input>
                            <span className={"s"}>Log out of this device only</span>
                        </label>
                        <label className="logout-option">
                            <input onChange={this.changeInputValueRadio} value={"all"}
                                   checked={this.state.single === "all"}
                                   type={"radio"} name={"logout-options"} className="circle-opt"></input>
                            <span className={"s"}>Log out of all devices (will close all of your sessions!)</span>
                        </label>
                    </div>
                    <div className="logout-modal-buttons-container">
                        <Button className="logout-modal-button cancel" variant="gray"
                                onClick={() => this.toggleLogOutModal()}>Cancel</Button>
                        <Button className="logout-modal-button done" variant="primary"
                                onClick={() => this.logout()}>Done</Button>
                    </div>
                </div>
            </dialog>
            <div className="dash-container">
                <dialog className={"dashboard-modal"} ref={ref => this.dialog = ref}>
                    <span className={"m"}>Select component to add:</span>
                    <div className={"component-types-container"}>
                        <Button onClick={() => this.addComponent('generic')} className={"component-to-select s"}
                                variant="secondary">Generic component</Button>
                        <Button onClick={() => this.addComponent('pdf')} className={"component-to-select s"}
                                variant="secondary">PDF reader</Button>
                        <Button onClick={() => this.addComponent('linklist')} className={"component-to-select s"}
                                variant="secondary">Custom link list</Button>
                        <Button onClick={() => this.addComponent('youtube')} className={"component-to-select s"}
                                variant="secondary">YouTube video player</Button>
                        <Button onClick={() => this.addComponent('spotify')} className={"component-to-select s"}
                                variant="secondary">Spotify playlist player</Button>
                    </div>
                    <Button className={"publish-button"} variant="primary"
                            onClick={() => this.toggleModal()}>Cancel</Button>
                </dialog>
                <div className="left">
                    <span
                        className="mmm p-no-margin-bottom p-no-margin-top welcome">👋 <span className={'welcome-2'}>Welcome back, {this.state.user.displayName}!</span></span>
                    {this.drawMessage(this.state.unpublished)}
                </div>
                <div className="right">
                    <Button className="publish-button" variant="primary"
                            onClick={() => window.open('https://' + this.state.user.username + '.rar.vg', '_blank')}
                            style={{marginRight: "10px"}}><IoMdOpen size={10} style={{marginRight: "5px"}}/>Open profile</Button>
                    <Button className="publish-button" variant="primary"
                            onClick={() => this.updateProfile()}>Publish</Button>
                    <button className="profile-button" onClick={() => this.showProfOptions()}
                            style={{backgroundImage: "url(" + config('HOST') + "/avatar/" + this.state.user.id + ".png?lr=" + this.state.lastReloaded}}>.
                    </button>
                </div>
            </div>
            <div className="dash-container2">
                <dialog className="profile-popup" onClick={() => this.showProfOptions()}
                        ref={ref => this.profOptions = ref}>
                    <div onClick={e => e.stopPropagation()}>
                        <div className="photo-dialog-div">
                            <button className="profile-button-dialog button unraised" onClick={() =>
                            {
                                this.selectComponent(-2)
                                this.profOptions.close()
                            }}
                                    style={{backgroundImage: "url(" + config('HOST') + "/avatar/" + this.state.user.id + ".png?lr=" + this.state.lastReloaded}}>.
                            </button>
                        </div>
                        <br></br>
                        <div className="user-info">
                            <span className="mm">{this.state.user.displayName}</span>
                            <span className="s">@{this.state.user.username}</span>
                            <span className="ss"
                                  style={{color: '#666'}}>{this.state.user.email.length < 25 ? this.state.user.email : this.state.user.email.slice(0, 25)}</span>
                        </div>
                        <hr style={{width: '100%'}}/>
                        <div>
                            <button className="button unraised cancel-button-dialog"
                                    onClick={() => this.toggleLogOutModal()}>Log out
                            </button>
                        </div>
                    </div>
                </dialog>
                <div className={"floating-publish"}>
                    <div className={this.state.reordering === false
                        ? "floating-reordering-default" : "floating-reordering-hidden"}>
                        <button onClick={() => this.toggleReordering()} className={"button no-margin-left"}><IoIosList
                            size={26}/>Reorder
                        </button>
                        <button onClick={() => this.updateProfile()} className={"button"}><IoMdCloudUpload size={26}/>Publish
                        </button>
                        <button onClick={() => this.toggleModal()} className={"button"}><IoMdAdd size={26}/>Add</button>
                        <button onClick={() => this.setState({showAIChat: true})}
                                className={"button no-margin-right special-generate"}><BsStars size={26}/>Pal
                        </button>
                    </div>
                    <div className={this.state.reordering === true
                        ? "floating-reordering-default" : "floating-reordering-hidden"}>
                        <button onClick={() => this.toggleReordering()}
                                className={"button button-reorder button-coloured no-margin-left"}><IoIosList
                            size={26}/>Stop reorder
                        </button>
                        <button onClick={() => this.updateProfile()}
                                className={"button button-reorder no-margin-right"}><IoMdCloudUpload size={26}/>Publish
                        </button>
                    </div>
                </div>
                <div className={"left-component " + (this.state.component != null ? 'lc-active' : '')}>
                    <EditPanel
                        selectComponent={this.selectComponent}
                        toggleModal={this.toggleModal}
                        updateLocally={this.updateComponentLocally}
                        updateLocallyWithoutCancelling={this.updateComponentLocallyWithoutCancelling}
                        cancelSelection={this.cancelSelection}
                        updateLinks={this.updateLinks} displayMessage={this.displayMessage}
                        user={this.state.user} updateDisplayName={this.updateDisplayName}
                        reloadImage={this.reloadImage} ref={this.editPanel}
                        selectedComponent={this.getSelectedComponent(this.state.component)}
                        deleteSelectedComponent={this.toggleRemoveComponentModal}
                        updateProfileDesign={this.updateProfileDesign}
                        updateProfileColours={this.updateProfileColours}
                        updateProfileBorderRadius={this.updateProfileBorderRadius}
                        updateProfileFont={this.updateProfileFont}
                        toggleReordering={this.toggleReordering}
                        reordering={this.state.reordering}
                        onOpenAIChat={() => this.setState({showAIChat: true})}
                    />
                </div>
                <div className="right-component">
                    <div className="profile-container editableprofile-scroll">
                        <EditableProfile reordering={this.state.reordering}
                                         selectComponent={this.selectComponent}
                                         toggleModal={this.toggleModal} user={this.state.user}
                                         lastReloaded={this.state.lastReloaded}
                                         updateComponentOrder={this.updateComponentOrder}/>
                    </div>
                </div>
            </div>
            <AIChatComponent
                isVisible={this.state.showAIChat}
                onClose={this.toggleAIChat}
                user={this.state.user}
                onAcceptDesign={this.handleAcceptDesign}
            />

        </div>

    }
}
