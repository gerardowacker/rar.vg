import React from "react";

export default class GenericPanel extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            title: "",
            description: "",
            genericMessage: null,
        }
        this.handleTitleChange = this.handleTitleChange.bind(this)
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this)
    }

    componentDidMount()
    {
        this.handleNecessaryUpdates()
    }

    handleNecessaryUpdates = () =>
    {
        this.setState({
            title: this.props.component.content.title,
            description: this.props.component.content.description
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

    updateComponent = (title, description) =>
    {
        if (!description)
            return this.displayMessage({type: 'error', message: 'Description should not be empty!'})

        this.props.saveLocally({title: title, description: description})
    }

    displayMessage = (message) =>
    {
        this.setState({genericMessage: message})
        setTimeout(() => this.setState({genericMessage: null}), 5000)
    }

    render()
    {
        return <>
            <h3 className="m p-no-margin-top p-no-margin-bottom">Edit generic component</h3>
            {this.props.drawMessage(this.state.genericMessage)}
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
                <button className="button unraised" onClick={() => this.props.cancel()}>Cancel</button>
                <button className="button"
                        onClick={() => this.updateComponent(this.state.title, this.state.description)}>Done
                </button>
            </div>
        </>
    }
}