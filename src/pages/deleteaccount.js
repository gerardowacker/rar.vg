import React from 'react'
import {deletionRequest, hasActiveSession} from "../utils/session.util";
import Button from "../components/button";

import '../index.css'
import './form.css'

export default class DeleteAccount extends React.Component
{
    constructor(props)
    {
        super(props)

        this.state = {
            sent: null,
            passwordField: null,
            message: null,
            requestDone: null,
        }

        this.handlePassChange = this.handlePassChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentDidMount()
    {
        if(!hasActiveSession())
            return window.location.href = "/login"
    }

    handleSubmit(event)
    {
        event.preventDefault()
        if (this.state.passwordField)
        {
            this.setState({requestDone: true})
            deletionRequest(this.state.passwordField).then(response =>
            {
                this.setState({requestDone: false})
                if (!response.success)
                    return this.displayMessage({type: 'error', message: response.content})

                this.setState({sent: true})
            })
        }
        else
        {
            this.displayMessage({type: "error", message: "Please complete every field before registering."})
        }
    }

    handlePassChange(event)
    {
        this.setState({passwordField: event.target.value})
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

    renderFields = sent =>
    {
        return sent ? <div className="login-form">
            <h1 className="mm p-no-margin-top">
                An email with a link has been sent in order to delete your account.
                Please check both your inbox and spam folder.</h1>
            <h1 className="m p-no-margin-bottom">You may close this tab.</h1>
        </div> : <form onSubmit={this.handleSubmit} className="login-form">
            {this.drawMessage(this.state.message)}
            <h1 className="m p-no-margin-top">Insert your password</h1>
            <h3 className="s p-no-margin-top">In order to delete your account, we need to verify that it's you.</h3>
            <input className={"m"} type="password" placeholder="Insert your password"
                   onChange={this.handlePassChange} disabled={this.state.requestDone}/>
            <Button className="mm login-button" variant="primary" disabled={this.state.requestDone}>Send deletion request</Button>
        </form>
    }

    render()
    {
        return <div className={"animated"} style={{
            background: "linear-gradient(-45deg, #381b12, #3b0f38, #02394d, #462506)",
            backgroundSize: "400% 400%"
        }}>
            <div className="container">
                <div className="logotype">👋 rar.vg</div>
                {this.renderFields(this.state.sent)}
            </div>
        </div>
    }
}