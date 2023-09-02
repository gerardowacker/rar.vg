import React from 'react'
import {deleteAccount, verifyDeletionToken} from "../utils/session.util";

import '../index.css'
import './form.css'

export default class VerifyAccountDeletion extends React.Component
{
    constructor(props)
    {
        super(props)

        this.state = {
            verified: null,
            sent: null,
            message: null,
        }
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentDidMount()
    {
        const token = this.props.token
        verifyDeletionToken(token).then(response =>
        {
            this.setState({verified: response})
        })
    }

    handleSubmit(event)
    {
        event.preventDefault()
        deleteAccount(this.props.token).then(response =>
        {
            if (!response.success)
                return this.displayMessage({type: 'error', message: response.content})

            window.location.href = '/login?jr=3'
        })
    }

    drawMessage(message)
    {
        if (message) return (
            <div className={"message " + message.type}>
                {message.message}
            </div>
        )
    }

    displayMessage(message)
    {
        this.setState({message: message})
        setTimeout(() => this.setState({message: null}), 10000)
    }

    renderFields = verified =>
    {
        if (verified === null)
            return <div className={"login-form"}><h3 className='mm'>Loading...</h3></div>

        if (verified.success)
            return <form onSubmit={this.handleSubmit} className="login-form">
                {this.drawMessage(this.state.message)}
                <h1 className="l p-no-margin-top">Do you want to confirm account deletion?</h1>
                <h1 className="m p-no-margin-top">This action can't be undone!</h1>
                <button className="mm login-button">Yes, I want to delete my account</button>
            </form>
        else
            return <div className="login-form">
                <h1 className="m p-no-margin-top">{verified.content}</h1>
            </div>
    }

    render()
    {
        return <div className={"animated"} style={{
            background: "linear-gradient(-45deg, #42241a, #460442, #0c300c, #412914)",
            backgroundSize: "400% 400%"
        }}>
            <div className="container">
                <div className="logotype">👋 rar.vg</div>
                {this.renderFields(this.state.verified)}
            </div>
        </div>
    }
}