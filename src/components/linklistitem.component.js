import React from "react";

export default class LinkListItemComponent extends React.Component
{
    icon = (icon) =>
    {
        if (icon) return (
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
            <div className={"horizcard"}>
                {this.icon(this.props.icon)}
                <div className={"title"}>
                    <h2>{(this.props.title ? this.props.title : this.props.url)}</h2>
                </div>
            </div>
            :
            <a href={this.props.url}>
                <div className={"horizcard"}>
                    {this.icon(this.props.icon)}
                    <div className={"title"}>
                        <h2>{(this.props.title ? this.props.title : this.props.url)}</h2>
                    </div>
                </div>
            </a>
    }
}
