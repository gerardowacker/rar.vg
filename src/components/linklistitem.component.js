import React from "react";

export default class LinkListItemComponent extends React.Component
{
    icon = (icon) =>
    {
        if (icon || this.props.vertical) return (
            <div
                className={"image"}
                style={{
                    backgroundImage: "url(" + icon + ")"
                }}
            />
        )
    }

    render()
    {
        return this.props.editing ?
            <div className={"llitem " + (this.props.vertical ? "v" : "h") + "item"}>
                {this.icon(this.props.icon)}
                <div className={"title"}>
                    <h2 className={"p-no-margin-bottom p-no-margin-top"}>{(this.props.title ? this.props.title : this.props.url)}</h2>
                </div>
            </div>
            :
            <a href={this.props.url} className={"llitem " + (this.props.vertical ? "v" : "h") + "item"}>
                {this.icon(this.props.icon)}
                <div className={"title"}>
                    <h2 className={"p-no-margin-bottom p-no-margin-top"}>{(this.props.title ? this.props.title : this.props.url)}</h2>
                </div>
            </a>
    }
}
