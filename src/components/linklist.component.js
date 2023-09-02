import LinkListItemComponent from "./linklistitem.component";
import './linklist.component.css'
import React from "react";

export default class LinklistComponent extends React.Component
{
    constructor(props)
    {
        super(props)
    }

    render()
    {
        return <div className={this.props.editing ? 'component editing' : 'component'}>
            {this.props.links.map((link, key) => <LinkListItemComponent editing={this.props.editing} icon={link.icon} url={link.url}
                                                                        title={link.title} key={key}/>)}
        </div>
    }
}
