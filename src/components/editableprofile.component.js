import React from "react";
import config from '../utils/config.util';
import ProfileLinks from "../components/profilelinks.component";
import GenericComponent from "../components/generic.component";
import PDFComponent from "../components/pdf.component";
import LinklistComponent from "../components/linklist.component";
import ReactDragListView from 'react-drag-listview';
import { IoIosAdd } from 'react-icons/io';

import '../pages/profile.css';
import '../index.css';

export default class EditableProfile extends React.Component {
    component = (component, key) => {
        let removeButton = <button onClick={() => this.props.removeComponent(component.type)}>Remove</button>;

        if (component.content === null)
            return <div style={{ display: 'none' }}></div>;

        switch (component.type) {
            case "generic":
                return (
                    <div>
                        <GenericComponent editing={true} title={component.content.title} description={component.content.description} key={key} />
                        {removeButton}
                    </div>
                );
            case "pdf":
                return (
                    <div>
                        <PDFComponent editing={true} fileId={component.content.fileId} key={key} />
                        {removeButton}
                    </div>
                );
            case "linklist":
                return (
                    <div>
                        <LinklistComponent editing={true} links={component.content.links} key={key} />
                        {removeButton}
                    </div>
                );
            default:
                return null;
        }
    }

    selectComponent(key) {
        this.props.selectComponent(key);
    }

    updateOrder = (from, to) => {
        this.props.updateComponentOrder(from, to);
    }

    loadComponents = () => {
        const dragProps = {
            onDragEnd: this.updateOrder,
            nodeSelector: 'li',
            handleSelector: 'div'
        };

        return <ReactDragListView {...dragProps}>
            <ul style={{ listStyle: "none", paddingInlineStart: 0 }}>
                {this.props.user.components.map((component, key) => (
                    <li className={"selectableComponent"} onClick={() => this.selectComponent(key)}>
                        {this.component(component, key)}
                    </li>
                ))}
            </ul>
        </ReactDragListView>
    }

    toggleModal = () => {
        this.props.toggleModal();
    }

    render() {
        return <div className={"content"}>
            <div className="card">
                <div className={"header"}>
                    <div className={"selectableComponent metadata"} onClick={() => this.selectComponent(-2)}>
                        <div className={"banner"} />
                        <img
                            className={"profile-picture"}
                            src={config('HOST') + "/avatar/" + this.props.user.id + ".png?lr=" + this.props.lastReloaded}
                            alt={"Profile picture"}
                        />
                        <h1 className={"p-no-margin-bottom"}>{this.props.user.displayName}</h1>
                        <h3 className={"username p-no-margin-top p-no-margin-bottom"}>@{this.props.user.username}</h3>
                    </div>
                    <div className={"selectableComponent"} onClick={() => this.selectComponent(-1)}>
                        <ProfileLinks editing={true} socials={this.props.user.sociallinks} />
                    </div>
                </div>

                {this.loadComponents()}

                <div className={"component add-component-button-container"}>
                    {this.props.user.components.length >= 3 ? (
                        <></>
                    ) : (
                        <button onClick={() => this.toggleModal()} className={"add-component-button"}>
                            <IoIosAdd size={50} />
                        </button>
                    )}
                </div>
            </div>
        </div>;
    }
}
